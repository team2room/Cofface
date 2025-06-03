import pyrealsense2 as rs
import numpy as np
import cv2
import insightface
from insightface.app import FaceAnalysis
import time
import os
import argparse
import pickle
from datetime import datetime

def parse_args():
    parser = argparse.ArgumentParser(description='RealSense 얼굴 라이브니스 및 3D 임베딩')
    parser.add_argument('--save_dir', type=str, default='embeddings', 
                        help='임베딩을 저장할 디렉토리')
    parser.add_argument('--width', type=int, default=640, help='카메라 너비')
    parser.add_argument('--height', type=int, default=480, help='카메라 높이')
    parser.add_argument('--fps', type=int, default=30, help='카메라 FPS')
    parser.add_argument('--show_scores', action='store_true', help='라이브니스 점수 표시')
    parser.add_argument('--show_depth', action='store_true', help='깊이 맵 표시')
    parser.add_argument('--save_embeddings', action='store_true', help='3D 임베딩 저장')
    return parser.parse_args()

class RealSenseFaceLiveness:
    def __init__(self, args):
        self.args = args
        self.width = args.width
        self.height = args.height
        self.fps = args.fps
        self.save_dir = args.save_dir
        self.show_scores = args.show_scores
        self.show_depth = args.show_depth
        self.save_embeddings = args.save_embeddings
        
        # 저장 디렉토리가 없으면 생성
        if self.save_embeddings and not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
        
        # RealSense 파이프라인 초기화
        self.pipeline = rs.pipeline()
        self.config = rs.config()
        
        # 스트림 설정
        self.config.enable_stream(rs.stream.depth, self.width, self.height, rs.format.z16, self.fps)
        self.config.enable_stream(rs.stream.color, self.width, self.height, rs.format.bgr8, self.fps)
        
        # 스트리밍 시작
        self.profile = self.pipeline.start(self.config)
        
        # 깊이 측정을 위한 깊이 스케일 가져오기
        self.depth_sensor = self.profile.get_device().first_depth_sensor()
        self.depth_scale = self.depth_sensor.get_depth_scale()
        
        # 깊이 프레임을 컬러 프레임에 정렬하기 위한 객체 생성
        self.align = rs.align(rs.stream.color)
        
        # Insightface 초기화
        self.face_app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
        self.face_app.prepare(ctx_id=0, det_size=(self.width, self.height))
        
        # FPS 계산 변수
        self.prev_frame_time = 0
        self.curr_frame_time = 0
    
    def check_liveness(self, depth_frame, face_bbox, landmarks, threshold_distance=10.0):
        """
        깊이 정보를 분석하여 얼굴이 실제인지 확인합니다.
        보다 강력한 감지를 위해 여러 방법을 결합합니다.
        
        Args:
            depth_frame: RealSense의 깊이 프레임
            face_bbox: 얼굴 경계 상자 [x1, y1, x2, y2]
            landmarks: 얼굴 랜드마크
            threshold_distance: 얼굴을 "실제"로 간주하는 최소 거리 변화
            
        Returns:
            bool: 얼굴이 실제로 간주되면 True, 그렇지 않으면 False
            dict: 다양한 방법의 상세 점수
        """
        x1, y1, x2, y2 = [int(val) for val in face_bbox]
        
        # 경계 상자가 프레임 경계 내에 있는지 확인
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(depth_frame.shape[1] - 1, x2)
        y2 = min(depth_frame.shape[0] - 1, y2)
        
        if x1 >= x2 or y1 >= y2:
            return False, {"error": "유효하지 않은 경계 상자"}
        
        # 얼굴에 해당하는 깊이 영역 추출
        face_depth = depth_frame[y1:y2, x1:x2].copy().astype(float)
        
        # 깊이 값을 미터로 변환
        face_depth = face_depth * self.depth_scale
        
        # 제로(깊이 데이터 없음)를 NaN으로 대체하여 더 나은 처리
        face_depth[face_depth == 0] = np.nan
        
        # 유효한 깊이 데이터가 충분하지 않으면 False 반환
        valid_depth_percentage = np.sum(~np.isnan(face_depth)) / face_depth.size
        if valid_depth_percentage < 0.5:  # 얼굴의 최소 50%에 유효한 깊이가 있어야 함
            return False, {"valid_depth_percentage": valid_depth_percentage}
        
        # 방법 1: 얼굴 전체의 깊이 변화
        depth_variation = np.nanmax(face_depth) - np.nanmin(face_depth)
        depth_variation_score = depth_variation > threshold_distance / 1000.0  # 미터 단위로 변환
        
        # 방법 2: 코 돌출 검사 (실제 얼굴은 돌출된 코가 있음)
        nose_point = landmarks[2]  # 코 끝 랜드마크
        nose_x, nose_y = int(nose_point[0]), int(nose_point[1])
        
        # 코 주변의 작은 영역 정의
        nose_region_size = 5
        nose_region_x1 = max(0, nose_x - nose_region_size)
        nose_region_y1 = max(0, nose_y - nose_region_size)
        nose_region_x2 = min(depth_frame.shape[1] - 1, nose_x + nose_region_size)
        nose_region_y2 = min(depth_frame.shape[0] - 1, nose_y + nose_region_size)
        
        if nose_region_x1 >= nose_region_x2 or nose_region_y1 >= nose_region_y2:
            nose_prominence_score = False
        else:
            nose_depth = depth_frame[nose_region_y1:nose_region_y2, nose_region_x1:nose_region_x2].copy().astype(float)
            nose_depth = nose_depth * self.depth_scale  # 미터로 변환
            nose_depth[nose_depth == 0] = np.nan
            
            if np.sum(~np.isnan(nose_depth)) > 0:
                # 얼굴 둘레의 평균 깊이 가져오기
                perimeter_depths = []
                
                # 상단 모서리
                if y1 + 5 < depth_frame.shape[0]:
                    top_edge = depth_frame[y1:y1+5, x1:x2].copy().astype(float) * self.depth_scale
                    top_edge[top_edge == 0] = np.nan
                    if np.sum(~np.isnan(top_edge)) > 0:
                        perimeter_depths.append(np.nanmean(top_edge))
                
                # 하단 모서리
                if y2 - 5 >= 0:
                    bottom_edge = depth_frame[y2-5:y2, x1:x2].copy().astype(float) * self.depth_scale
                    bottom_edge[bottom_edge == 0] = np.nan
                    if np.sum(~np.isnan(bottom_edge)) > 0:
                        perimeter_depths.append(np.nanmean(bottom_edge))
                
                # 왼쪽 모서리
                if x1 + 5 < depth_frame.shape[1]:
                    left_edge = depth_frame[y1:y2, x1:x1+5].copy().astype(float) * self.depth_scale
                    left_edge[left_edge == 0] = np.nan
                    if np.sum(~np.isnan(left_edge)) > 0:
                        perimeter_depths.append(np.nanmean(left_edge))
                
                # 오른쪽 모서리
                if x2 - 5 >= 0:
                    right_edge = depth_frame[y1:y2, x2-5:x2].copy().astype(float) * self.depth_scale
                    right_edge[right_edge == 0] = np.nan
                    if np.sum(~np.isnan(right_edge)) > 0:
                        perimeter_depths.append(np.nanmean(right_edge))
                    
                if len(perimeter_depths) > 0:
                    avg_perimeter_depth = np.mean(perimeter_depths)
                    nose_depth_avg = np.nanmean(nose_depth)
                    nose_prominence = avg_perimeter_depth - nose_depth_avg
                    nose_prominence_score = nose_prominence > 0.005  # 5mm (미터 단위)
                else:
                    nose_prominence_score = False
            else:
                nose_prominence_score = False
        
        # 방법 3: 얼굴 곡률 확인 - 실제 얼굴은 평평하지 않음
        if valid_depth_percentage > 0.7:  # 좋은 깊이 커버리지 필요
            # 좌표 그리드 생성
            y_indices, x_indices = np.indices(face_depth.shape)
            x_indices = x_indices.flatten()
            y_indices = y_indices.flatten()
            z_values = face_depth.flatten()
            
            # NaN 값 제거
            valid_mask = ~np.isnan(z_values)
            x_valid = x_indices[valid_mask]
            y_valid = y_indices[valid_mask]
            z_valid = z_values[valid_mask]
            
            if len(z_valid) > 10:  # 평면 피팅에 충분한 포인트 필요
                # 점들에 평면 피팅
                try:
                    A = np.column_stack((x_valid, y_valid, np.ones_like(x_valid)))
                    plane_coeffs, residuals, rank, s = np.linalg.lstsq(A, z_valid, rcond=None)
                    
                    # 평면으로부터의 잔차 계산 (얼굴이 얼마나 평평하지 않은지)
                    fitted_z = A @ plane_coeffs
                    residuals = z_valid - fitted_z
                    curvature_score = np.std(residuals) > 0.003  # 3mm (미터 단위)
                except:
                    curvature_score = False
            else:
                curvature_score = False
        else:
            curvature_score = False
        
        # 점수 결합 (보안을 위해 AND 로직 사용)
        is_live = depth_variation_score and (nose_prominence_score or curvature_score)
        
        # 디버깅을 위한 상세 점수 반환
        scores = {
            "depth_variation": depth_variation * 1000,  # 표시를 위해 mm로 변환
            "depth_variation_score": depth_variation_score,
            "nose_prominence_score": nose_prominence_score,
            "curvature_score": curvature_score,
            "valid_depth_percentage": valid_depth_percentage
        }
        
        return is_live, scores
    
    def get_3d_face_embedding(self, face_embedding, depth_frame, face_bbox, landmarks):
        """
        깊이 특성으로 2D 얼굴 임베딩을 강화하여 "3D 임베딩" 생성
        
        Args:
            face_embedding: Insightface의 원본 2D 얼굴 임베딩
            depth_frame: RealSense의 깊이 프레임
            face_bbox: 얼굴 경계 상자 [x1, y1, x2, y2]
            landmarks: 얼굴 랜드마크
            
        Returns:
            np.ndarray: 강화된 3D 얼굴 임베딩
        """
        x1, y1, x2, y2 = [int(val) for val in face_bbox]
        
        # 경계 상자가 프레임 경계 내에 있는지 확인
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(depth_frame.shape[1] - 1, x2)
        y2 = min(depth_frame.shape[0] - 1, y2)
        
        # 랜드마크 위치에서 깊이 값 가져오기
        landmark_depths = []
        for landmark in landmarks:
            x, y = int(landmark[0]), int(landmark[1])
            if 0 <= x < depth_frame.shape[1] and 0 <= y < depth_frame.shape[0]:
                depth = depth_frame[y, x] * self.depth_scale  # 미터로 변환
                landmark_depths.append(depth)
            else:
                landmark_depths.append(0)
        
        # 얼굴 깊이에서 통계적 특성 추출
        if x1 < x2 and y1 < y2:
            face_depth = depth_frame[y1:y2, x1:x2].copy().astype(float) * self.depth_scale
            face_depth[face_depth == 0] = np.nan
            
            depth_features = []
            if np.sum(~np.isnan(face_depth)) > 0:
                depth_features = [
                    np.nanmean(face_depth),        # 평균 깊이
                    np.nanstd(face_depth),         # 깊이 표준 편차
                    np.nanmax(face_depth) - np.nanmin(face_depth)  # 깊이 범위
                ]
            else:
                depth_features = [0, 0, 0]
        else:
            depth_features = [0, 0, 0]
        
        # 원본 임베딩과 깊이 특성 결합
        depth_features = np.array(landmark_depths + depth_features)
        
        # 깊이 특성 정규화
        if np.std(depth_features) > 0:
            depth_features = (depth_features - np.mean(depth_features)) / (np.std(depth_features) + 1e-6)
        
        # 원본 임베딩과 결합
        enhanced_embedding = np.concatenate([face_embedding, depth_features])
        
        return enhanced_embedding
    
    def save_embedding(self, embedding, liveness, timestamp=None):
        """3D 얼굴 임베딩을 파일에 저장"""
        if timestamp is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        
        filename = os.path.join(self.save_dir, f"face_embedding_{timestamp}.pkl")
        data = {
            "embedding": embedding,
            "liveness": liveness,
            "timestamp": timestamp
        }
        
        with open(filename, "wb") as f:
            pickle.dump(data, f)
        
        return filename
    
    def run(self):
        try:
            while True:
                # FPS 계산
                self.curr_frame_time = time.time()
                fps = 1 / (self.curr_frame_time - self.prev_frame_time) if self.prev_frame_time > 0 else 0
                self.prev_frame_time = self.curr_frame_time
                
                # 깊이 및 컬러 프레임 쌍 대기
                frames = self.pipeline.wait_for_frames()
                
                # 깊이 프레임을 컬러 프레임에 정렬
                aligned_frames = self.align.process(frames)
                depth_frame = aligned_frames.get_depth_frame()
                color_frame = aligned_frames.get_color_frame()
                
                if not depth_frame or not color_frame:
                    continue
                    
                # 이미지를 numpy 배열로 변환
                depth_image = np.asanyarray(depth_frame.get_data())
                color_image = np.asanyarray(color_frame.get_data())
                
                # 깊이 이미지에 컬러맵 적용 (먼저 8비트로 변환)
                depth_colormap = cv2.applyColorMap(cv2.convertScaleAbs(depth_image, alpha=0.03), cv2.COLORMAP_JET)
                
                # 그리기 위한 컬러 이미지 복사본 생성
                display_image = color_image.copy()
                
                # Insightface를 사용한 얼굴 감지 및 임베딩
                faces = self.face_app.get(color_image)
                
                # 각 얼굴 처리
                for i, face in enumerate(faces):
                    bbox = face.bbox
                    landmarks = face.kps
                    embedding = face.embedding  # 512차원 얼굴 임베딩 벡터
                    
                    # 깊이 정보를 사용하여 라이브니스 확인
                    is_live, liveness_scores = self.check_liveness(depth_image, bbox, landmarks)
                    
                    # 2D 임베딩을 깊이 정보로 강화하여 3D 임베딩 생성
                    embedding_3d = self.get_3d_face_embedding(embedding, depth_image, bbox, landmarks)
                    
                    # 옵션이 활성화되고 얼굴이 실제인 경우 임베딩 저장
                    if self.save_embeddings and is_live:
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                        filename = self.save_embedding(embedding_3d, is_live, timestamp)
                        print(f"임베딩을 {filename}에 저장했습니다")
                    
                    # 얼굴 주위에 경계 상자 그리기
                    x1, y1, x2, y2 = [int(val) for val in bbox]
                    cv2.rectangle(display_image, (x1, y1), (x2, y2), (0, 255, 0) if is_live else (0, 0, 255), 2)
                    
                    # 랜드마크 그리기
                    for landmark in landmarks:
                        x, y = int(landmark[0]), int(landmark[1])
                        cv2.circle(display_image, (x, y), 2, (0, 255, 255), -1)
                    
                    # 라이브니스 상태 표시
                    liveness_text = "실제" if is_live else "가짜"
                    cv2.putText(display_image, liveness_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, 
                              (0, 255, 0) if is_live else (0, 0, 255), 2)
                    
                    # 활성화된 경우 라이브니스 점수 표시
                    if self.show_scores:
                        y_offset = y2 + 20
                        for key, value in liveness_scores.items():
                            if isinstance(value, bool):
                                text = f"{key}: {'✓' if value else '✗'}"
                            else:
                                text = f"{key}: {value:.2f}"
                            cv2.putText(display_image, text, (x1, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                            y_offset += 20
                    
                    # 3D 임베딩 정보 표시
                    print(f"얼굴 #{i+1} - 3D 임베딩 형태: {embedding_3d.shape}, 라이브니스: {liveness_text}")
                
                # FPS 표시
                cv2.putText(display_image, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                # 이미지 표시
                if self.show_depth:
                    # 두 이미지를 수평으로 쌓기
                    display_image = np.hstack((display_image, depth_colormap))
                
                cv2.namedWindow('RealSense 얼굴 라이브니스', cv2.WINDOW_AUTOSIZE)
                cv2.imshow('RealSense 얼굴 라이브니스', display_image)
                
                # 키보드 명령
                key = cv2.waitKey(1)
                if key & 0xFF == ord('q'):  # 종료
                    break
                elif key & 0xFF == ord('s'):  # 점수 표시 토글
                    self.show_scores = not self.show_scores
                elif key & 0xFF == ord('d'):  # 깊이 표시 토글
                    self.show_depth = not self.show_depth
                elif key & 0xFF == ord('e'):  # 임베딩 저장 토글
                    self.save_embeddings = not self.save_embeddings
                    print(f"임베딩 저장 {'활성화' if self.save_embeddings else '비활성화'}")
                
        finally:
            # 스트리밍 중지
            self.pipeline.stop()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    args = parse_args()
    app = RealSenseFaceLiveness(args)
    app.run()
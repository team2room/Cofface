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
import pyglet
import threading
import queue
import traceback

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
    parser.add_argument('--fullscreen', action='store_true', help='전체화면 모드')
    parser.add_argument('--gpu_id', type=int, default=0, help='사용할 GPU ID')
    parser.add_argument('--rotation', type=int, default=90, choices=[0, 90, 180, 270], 
                        help='소스 영상 회전 각도 (시계 방향)')
    parser.add_argument('--mirror', action='store_true', help='좌우 반전 적용')
    return parser.parse_args()

class TextureGenerator:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        
    def create_texture_from_numpy(self, img):
        """종횡비를 유지하며 텍스처 생성"""
        # OpenCV는 BGR 순서, pyglet은 RGB 순서
        if img.shape[2] == 3:  # 컬러 이미지
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
        # 텍스처 생성 (RGB 형식)
        try:
            texture = pyglet.image.ImageData(
                img.shape[1], img.shape[0],
                'RGB', img.tobytes(), pitch=img.shape[1] * 3
            ).get_texture()
            
            return texture
        except Exception as e:
            print(f"텍스처 생성 오류: {e}")
            traceback.print_exc()
            return None

def rotate_image(image, angle, mirror=False):
    """이미지를 지정된 각도로 회전합니다 (종횡비 유지)"""
    # 좌우 반전 적용 (필요시)
    if mirror:
        image = cv2.flip(image, 1)  # 1은 좌우 반전, 0은 상하 반전, -1은 상하좌우 반전
        
    if angle == 0:
        return image
    
    # 이미지 크기
    h, w = image.shape[:2]
    
    # 90도/270도 회전 시 너비와 높이 교환
    if angle in [90, 270]:
        target_h, target_w = w, h
    else:
        target_h, target_w = h, w
    
    # 회전 행렬
    if angle == 90:
        # 90도 회전 (시계 방향)
        M = cv2.getRotationMatrix2D((w/2, h/2), -90, 1)
        # 위치 조정
        M[0, 2] += (target_w - w) / 2
        M[1, 2] += (target_h - h) / 2
        return cv2.warpAffine(image, M, (target_w, target_h))
    elif angle == 180:
        # 180도 회전
        return cv2.flip(image, -1)
    elif angle == 270:
        # 270도 회전 (시계 방향)
        M = cv2.getRotationMatrix2D((w/2, h/2), -270, 1)
        # 위치 조정
        M[0, 2] += (target_w - w) / 2
        M[1, 2] += (target_h - h) / 2
        return cv2.warpAffine(image, M, (target_w, target_h))
    else:
        # 일반적인 회전
        M = cv2.getRotationMatrix2D((w/2, h/2), -angle, 1)
        return cv2.warpAffine(image, M, (w, h))

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
        self.gpu_id = args.gpu_id
        self.rotation = args.rotation
        self.mirror = args.mirror  # 좌우 반전 여부
        
        # 저장 디렉토리가 없으면 생성
        if self.save_embeddings and not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
        
        # 소스 회전 각도에 따라 너비와 높이를 교환
        if self.rotation in [90, 270]:
            self.display_width = self.height
            self.display_height = self.width
        else:
            self.display_width = self.width
            self.display_height = self.height
            
        # Pyglet 윈도우 너비 계산 (깊이 표시 여부에 따라)
        self.window_width = self.display_width * 2 if self.show_depth else self.display_width
        self.window_height = self.display_height
        
        # Pyglet 윈도우 생성
        try:
            self.window = pyglet.window.Window(
                width=self.window_width, 
                height=self.window_height,
                caption="RealSense 얼굴 라이브니스",
                fullscreen=args.fullscreen,
                vsync=False  # 더 부드러운 프레임레이트를 위해 vsync 비활성화
            )
        except Exception as e:
            print(f"윈도우 생성 오류: {e}")
            traceback.print_exc()
            self.window = pyglet.window.Window(
                width=self.window_width, 
                height=self.window_height,
                caption="RealSense 얼굴 라이브니스",
            )
            
        # 텍스처 생성기
        self.texture_generator = TextureGenerator(self.width, self.height)
        
        # FPS 디스플레이
        self.fps_display = pyglet.window.FPSDisplay(window=self.window)
        
        # 키 핸들러 설정
        self.key_handler = pyglet.window.key.KeyStateHandler()
        self.window.push_handlers(self.key_handler)
        self.window.push_handlers(on_key_press=self.on_key_press)
        
        # 텍스트 레이블 초기화
        self.labels = []
        self.fps_label = pyglet.text.Label(
            'FPS: 0',
            font_name='Arial',
            font_size=14,
            x=10, y=self.window_height - 20,
            color=(0, 255, 0, 255)
        )
        self.status_label = pyglet.text.Label(
            'Status: 처리 중...',
            font_name='Arial',
            font_size=14,
            x=10, y=10,
            color=(255, 255, 255, 255)
        )
        
        # Sprite 생성
        self.color_sprite = None
        self.depth_sprite = None
        
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
        
        # Insightface 초기화 (별도 스레드에서)
        self.face_app = None
        self.initialization_done = False
        self.initialization_thread = threading.Thread(target=self.initialize_face_app)
        self.initialization_thread.daemon = True
        self.initialization_thread.start()
        
        # 프레임 및 처리 결과를 위한 큐
        self.frame_queue = queue.Queue(maxsize=2)
        self.result_queue = queue.Queue()
        
        # 처리 스레드 생성
        self.processing_thread = threading.Thread(target=self.process_frames)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        
        # 현재 텍스처
        self.color_texture = None
        self.depth_texture = None
        
        # 라이브니스 결과
        self.faces_results = []
        
        # FPS 계산 변수
        self.prev_frame_time = 0
        self.curr_frame_time = 0
        self.fps_value = 0
        self.processing_fps = 0
        
        # 이벤트 설정
        pyglet.clock.schedule_interval(self.update, 1/60.0)
        
        # 윈도우 이벤트 핸들러 설정
        @self.window.event
        def on_draw():
            self.window.clear()
            
            # 스프라이트 기반 렌더링
            # 컬러 이미지 스프라이트 그리기
            if self.color_sprite:
                self.color_sprite.draw()
            
            # 깊이 이미지 스프라이트 그리기
            if self.show_depth and self.depth_sprite:
                self.depth_sprite.draw()
            
            # FPS 및 상태 표시
            self.fps_label.text = f'FPS: {self.fps_value:.1f} | 처리 FPS: {self.processing_fps:.1f}'
            self.fps_label.draw()
            
            status_text = "준비됨" if self.initialization_done else "모델 로딩 중..."
            mirror_status = "켜짐" if self.mirror else "꺼짐"
            self.status_label.text = f'상태: {status_text} | 점수 표시: {"켜짐" if self.show_scores else "꺼짐"} | 깊이: {"켜짐" if self.show_depth else "꺼짐"} | 좌우반전: {mirror_status} | 임베딩 저장: {"켜짐" if self.save_embeddings else "꺼짐"}'
            self.status_label.draw()
            
            # 레이블 렌더링
            for label in self.labels:
                label.draw()
    
    def initialize_face_app(self):
        """별도 스레드에서 Insightface 모델 초기화"""
        try:
            print("Insightface 모델 로딩 중...")
            self.face_app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
            self.face_app.prepare(ctx_id=self.gpu_id, det_size=(self.width, self.height))
            self.initialization_done = True
            print("Insightface 모델 로딩 완료!")
        except Exception as e:
            print(f"Insightface 초기화 오류: {e}")
            traceback.print_exc()
    
    def on_key_press(self, symbol, modifiers):
        """키 입력 처리"""
        if symbol == pyglet.window.key.Q:
            pyglet.app.exit()
        elif symbol == pyglet.window.key.S:
            self.show_scores = not self.show_scores
        elif symbol == pyglet.window.key.D:
            self.show_depth = not self.show_depth
            # 깊이 표시 토글 시 윈도우 크기 조정
            self.window_width = self.display_width * 2 if self.show_depth else self.display_width
            self.window.set_size(self.window_width, self.window_height)
        elif symbol == pyglet.window.key.E:
            self.save_embeddings = not self.save_embeddings
            print(f"임베딩 저장 {'활성화' if self.save_embeddings else '비활성화'}")
        elif symbol == pyglet.window.key.F:
            # 전체화면 토글
            self.window.set_fullscreen(not self.window.fullscreen)
        elif symbol == pyglet.window.key.R:
            # 회전 각도 변경
            old_rotation = self.rotation
            self.rotation = (self.rotation + 90) % 360
            print(f"소스 회전 각도: {self.rotation}도")
            
            # 너비와 높이 조정 (90도 또는 270도 회전 시에만)
            need_swap = (old_rotation in [0, 180]) != (self.rotation in [0, 180])
            if need_swap:
                # 회전 상태가 변경됨 - 너비와 높이 교환
                self.display_width, self.display_height = self.display_height, self.display_width
                self.window_width = self.display_width * 2 if self.show_depth else self.display_width
                self.window.set_size(self.window_width, self.window_height)
        elif symbol == pyglet.window.key.M:
            # 좌우 반전 토글
            self.mirror = not self.mirror
            print(f"좌우 반전 {'활성화' if self.mirror else '비활성화'}")
    
    def update(self, dt):
        """프레임 업데이트 함수"""
        try:
            # FPS 계산
            self.curr_frame_time = time.time()
            self.fps_value = 1 / (self.curr_frame_time - self.prev_frame_time) if self.prev_frame_time > 0 else 0
            self.prev_frame_time = self.curr_frame_time
            
            # 깊이 및 컬러 프레임 쌍 대기
            frames = self.pipeline.wait_for_frames()
            
            # 깊이 프레임을 컬러 프레임에 정렬
            aligned_frames = self.align.process(frames)
            depth_frame = aligned_frames.get_depth_frame()
            color_frame = aligned_frames.get_color_frame()
            
            if not depth_frame or not color_frame:
                return
                
            # 이미지를 numpy 배열로 변환
            depth_image = np.asanyarray(depth_frame.get_data())
            color_image = np.asanyarray(color_frame.get_data())
            
            # 좌우 반전 및 회전 적용
            if self.rotation != 0 or self.mirror:
                color_image = rotate_image(color_image, self.rotation, self.mirror)
                depth_image = rotate_image(depth_image, self.rotation, self.mirror)
            
            # 깊이 이미지에 컬러맵 적용 (먼저 8비트로 변환)
            depth_colormap = cv2.applyColorMap(cv2.convertScaleAbs(depth_image, alpha=0.03), cv2.COLORMAP_JET)
            
            # 깊이 텍스처 업데이트
            self.depth_texture = self.texture_generator.create_texture_from_numpy(depth_colormap)
            
            # 스프라이트 업데이트
            if self.depth_texture:
                # 종횡비 유지 스프라이트 생성
                self.depth_sprite = pyglet.sprite.Sprite(self.depth_texture, x=self.display_width, y=0)
                
                # 회전된 이미지 비율 유지를 위한 크기 조정
                if self.rotation in [90, 270]:
                    scale_factor = min(self.display_width / self.depth_texture.height, 
                                       self.display_height / self.depth_texture.width)
                else:
                    scale_factor = min(self.display_width / self.depth_texture.width, 
                                       self.display_height / self.depth_texture.height)
                
                self.depth_sprite.scale = scale_factor
                # 중앙 정렬
                self.depth_sprite.x = self.display_width + (self.display_width - self.depth_sprite.width) / 2
                self.depth_sprite.y = (self.display_height - self.depth_sprite.height) / 2
            
            # 이미지 처리 큐에 추가 (non-blocking)
            if self.initialization_done:
                try:
                    # 얼굴 검출을 위한 원본 이미지 저장
                    original_color = np.asanyarray(color_frame.get_data())
                    original_depth = np.asanyarray(depth_frame.get_data())
                    
                    # 좌우 반전이 적용된 경우, 원본 이미지도 같은 방식으로 좌우 반전
                    if self.mirror:
                        original_color = cv2.flip(original_color, 1)
                        original_depth = cv2.flip(original_depth, 1)
                    
                    # 회전된 이미지와 원본 이미지 전달
                    self.frame_queue.put_nowait((original_color.copy(), original_depth.copy(), color_image.copy(), depth_image.copy()))
                except queue.Full:
                    pass  # 큐가 가득 차면 프레임 건너뛰기
            
            # 처리 결과 확인 (non-blocking)
            try:
                while True:  # 모든 결과 처리
                    display_image, self.faces_results, self.processing_fps = self.result_queue.get_nowait()
                    self.color_texture = self.texture_generator.create_texture_from_numpy(display_image)
                    
                    # 스프라이트 업데이트
                    if self.color_texture:
                        # 종횡비 유지 스프라이트 생성
                        self.color_sprite = pyglet.sprite.Sprite(self.color_texture, x=0, y=0)
                        
                        # 회전된 이미지 비율 유지를 위한 크기 조정
                        if self.rotation in [90, 270]:
                            scale_factor = min(self.display_width / self.color_texture.height, 
                                             self.display_height / self.color_texture.width)
                        else:
                            scale_factor = min(self.display_width / self.color_texture.width, 
                                             self.display_height / self.color_texture.height)
                        
                        self.color_sprite.scale = scale_factor
                        # 중앙 정렬
                        self.color_sprite.x = (self.display_width - self.color_sprite.width) / 2
                        self.color_sprite.y = (self.display_height - self.color_sprite.height) / 2
                    
                    # 레이블 업데이트
                    self.update_labels()
            except queue.Empty:
                pass
            
            if not self.initialization_done and self.color_texture is None:
                # 초기화 중이면 원본 이미지 표시
                self.color_texture = self.texture_generator.create_texture_from_numpy(color_image)
                
                # 스프라이트 업데이트
                if self.color_texture:
                    # 종횡비 유지 스프라이트 생성
                    self.color_sprite = pyglet.sprite.Sprite(self.color_texture, x=0, y=0)
                    
                    # 회전된 이미지 비율 유지를 위한 크기 조정
                    if self.rotation in [90, 270]:
                        scale_factor = min(self.display_width / self.color_texture.height, 
                                         self.display_height / self.color_texture.width)
                    else:
                        scale_factor = min(self.display_width / self.color_texture.width, 
                                         self.display_height / self.color_texture.height)
                    
                    self.color_sprite.scale = scale_factor
                    # 중앙 정렬
                    self.color_sprite.x = (self.display_width - self.color_sprite.width) / 2
                    self.color_sprite.y = (self.display_height - self.color_sprite.height) / 2
            
        except Exception as e:
            print(f"업데이트 오류: {e}")
            traceback.print_exc()
    
    def update_labels(self):
        """얼굴 레이블 업데이트"""
        self.labels = []
        
        # 스프라이트 오프셋 계산
        offset_x = (self.display_width - self.color_sprite.width) / 2 if self.color_sprite else 0
        offset_y = (self.display_height - self.color_sprite.height) / 2 if self.color_sprite else 0
        
        for i, (face_bbox, is_live, liveness_scores) in enumerate(self.faces_results):
            x1, y1, x2, y2 = [int(val) for val in face_bbox]
            
            # 스프라이트 크기를 고려하여 좌표 조정
            if self.color_sprite:
                scale = self.color_sprite.scale
                x1 = int(x1 * scale + offset_x)
                y1 = int(y1 * scale + offset_y)
                x2 = int(x2 * scale + offset_x)
                y2 = int(y2 * scale + offset_y)
            
            # 라이브니스 상태 레이블
            liveness_text = "실제" if is_live else "가짜"
            self.labels.append(pyglet.text.Label(
                liveness_text,
                font_name='Arial',
                font_size=12,
                x=x1, y=y1 - 10,
                color=(0, 255, 0, 255) if is_live else (255, 0, 0, 255)
            ))
            
            # 활성화된 경우 라이브니스 점수 표시
            if self.show_scores:
                y_offset = y2 + 20
                for key, value in liveness_scores.items():
                    if isinstance(value, bool):
                        text = f"{key}: {'✓' if value else '✗'}"
                    elif isinstance(value, float):
                        text = f"{key}: {value:.2f}"
                    else:
                        text = f"{key}: {value}"
                    
                    self.labels.append(pyglet.text.Label(
                        text,
                        font_name='Arial',
                        font_size=10,
                        x=x1, y=y_offset,
                        color=(255, 255, 255, 255)
                    ))
                    y_offset += 20
    
    def process_frames(self):
        """별도 스레드에서 프레임 처리"""
        process_time = 0
        frame_count = 0
        start_time = time.time()
        
        while True:
            try:
                if not self.initialization_done:
                    time.sleep(0.1)
                    continue
                
                # 프레임 큐에서 가져오기 (최대 0.1초 대기)
                try:
                    original_color, original_depth, rotated_color, rotated_depth = self.frame_queue.get(timeout=0.1)
                except queue.Empty:
                    continue
                
                process_start = time.time()
                
                # 원본 이미지로 얼굴 감지 (회전되지 않은)
                faces = self.face_app.get(original_color)
                
                # 결과는 회전된 이미지에 표시
                display_image = rotated_color.copy()
                faces_results = []
                
                # 각 얼굴 처리
                for i, face in enumerate(faces):
                    bbox = face.bbox
                    landmarks = face.kps
                    embedding = face.embedding  # 512차원 얼굴 임베딩 벡터
                    
                    # 깊이 정보를 사용하여 라이브니스 확인 (원본 좌표계 사용)
                    is_live, liveness_scores = self.check_liveness(original_depth, bbox, landmarks)
                    
                    # 2D 임베딩을 깊이 정보로 강화하여 3D 임베딩 생성 (원본 좌표계 사용)
                    embedding_3d = self.get_3d_face_embedding(embedding, original_depth, bbox, landmarks)
                    
                    # 옵션이 활성화되고 얼굴이 실제인 경우 임베딩 저장
                    if self.save_embeddings and is_live:
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                        filename = self.save_embedding(embedding_3d, is_live, timestamp)
                        print(f"임베딩을 {filename}에 저장했습니다")
                    
                    # 회전된 좌표계로 변환
                    if self.rotation != 0:
                        rotated_bbox, rotated_landmarks = self.rotate_detection_results(
                            bbox, landmarks, original_color.shape, rotated_color.shape
                        )
                    else:
                        rotated_bbox, rotated_landmarks = bbox, landmarks
                    
                    # 회전된 좌표로 얼굴 주위에 경계 상자 그리기
                    x1, y1, x2, y2 = [int(val) for val in rotated_bbox]
                    cv2.rectangle(display_image, (x1, y1), (x2, y2), (0, 255, 0) if is_live else (0, 0, 255), 2)
                    
                    # 회전된 좌표로 랜드마크 그리기
                    for landmark in rotated_landmarks:
                        x, y = int(landmark[0]), int(landmark[1])
                        cv2.circle(display_image, (x, y), 2, (0, 255, 255), -1)
                    
                    # 결과 저장 (회전된 좌표 사용)
                    faces_results.append((rotated_bbox, is_live, liveness_scores))
                    
                    # 콘솔에 3D 임베딩 정보 표시
                    print(f"얼굴 #{i+1} - 3D 임베딩 형태: {embedding_3d.shape}, 라이브니스: {'실제' if is_live else '가짜'}")
                
                # 처리 시간 계산
                process_time += time.time() - process_start
                frame_count += 1
                
                if frame_count >= 10:
                    # 처리 FPS 계산 (10프레임 평균)
                    processing_fps = frame_count / process_time
                    process_time = 0
                    frame_count = 0
                else:
                    processing_fps = frame_count / (time.time() - start_time)
                
                # 결과 큐에 추가
                self.result_queue.put((display_image, faces_results, processing_fps))
                
            except Exception as e:
                print(f"프레임 처리 오류: {e}")
                traceback.print_exc()
                time.sleep(0.1)  # 오류 시 잠시 대기
    
    def rotate_detection_results(self, bbox, landmarks, src_shape, dst_shape):
        """
        회전된 좌표계로 변환
        src_shape: 원본 이미지 크기 (회전되지 않은)
        dst_shape: 대상 이미지 크기 (회전된)
        """
        src_h, src_w = src_shape[:2]
        dst_h, dst_w = dst_shape[:2]
        
        # 박스 좌표
        x1, y1, x2, y2 = bbox
        
        # 회전에 따른 좌표 변환
        if self.rotation == 0:
            # 회전 없음
            rotated_bbox = bbox
            rotated_landmarks = landmarks
        elif self.rotation == 90:
            # 90도 회전 (시계 방향)
            rotated_bbox = [src_h - y2, x1, src_h - y1, x2]
            rotated_landmarks = np.array([[src_h - landmark[1], landmark[0]] for landmark in landmarks])
        elif self.rotation == 180:
            # 180도 회전
            rotated_bbox = [src_w - x2, src_h - y2, src_w - x1, src_h - y1]
            rotated_landmarks = np.array([[src_w - landmark[0], src_h - landmark[1]] for landmark in landmarks])
        elif self.rotation == 270:
            # 270도 회전 (시계 방향)
            rotated_bbox = [y1, src_w - x2, y2, src_w - x1]
            rotated_landmarks = np.array([[landmark[1], src_w - landmark[0]] for landmark in landmarks])
        
        return rotated_bbox, rotated_landmarks
    
    def check_liveness(self, depth_frame, face_bbox, landmarks, threshold_distance=10.0):
        """
        깊이 정보를 분석하여 얼굴이 실제인지 확인합니다.
        보다 강력한 감지를 위해 여러 방법을 결합합니다.
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
        """Pyglet 애플리케이션 실행"""
        try:
            pyglet.app.run()
        except Exception as e:
            print(f"Pyglet 실행 오류: {e}")
            traceback.print_exc()
        finally:
            self.cleanup()
    
    def cleanup(self):
        """리소스 정리"""
        try:
            self.pipeline.stop()
        except:
            pass

if __name__ == "__main__":
    args = parse_args()
    app = RealSenseFaceLiveness(args)
    app.run()
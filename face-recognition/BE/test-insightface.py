import os
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
from insightface.data import get_image as ins_get_image
import time
import glob
from datetime import datetime
import argparse


class FaceRecognitionSystem:
    def __init__(self, gpu=None):
        # GPU 설정 (크로스 플랫폼)
        if gpu is None:
            # GPU 자동 감지
            import torch
            if torch.cuda.is_available():
                gpu = 0  # CUDA 지원
            elif hasattr(torch, 'backends') and hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                print(torch.backends.mps.is_available())
                gpu = -1  # MPS (Metal) 지원
            else:
                print('No GPU available, using CPU instead')
                gpu = -1  # CPU 모드

        self.app = FaceAnalysis(
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider'] if gpu >= 0 else ['CPUExecutionProvider'])
        self.app.prepare(ctx_id=gpu, det_size=(640, 640))

        # 저장 디렉토리 생성
        self.db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'face_db')
        self.img_dir = os.path.join(self.db_dir, 'images')
        os.makedirs(self.db_dir, exist_ok=True)
        os.makedirs(self.img_dir, exist_ok=True)

        # 얼굴 데이터베이스 초기화
        self.face_db = {}
        self.load_face_db()

        # 기본 설정
        self.recognition_threshold = 0.5  # 인식 임계값 (낮을수록 엄격)

    def load_face_db(self):
        """저장된 얼굴 DB를 로드합니다."""
        self.face_db = {}

        # NPZ 파일이 있는지 확인
        npz_path = os.path.join(self.db_dir, 'face_db.npz')
        if os.path.exists(npz_path):
            data = np.load(npz_path, allow_pickle=True)
            self.face_db = data['face_db'].item()
            print(f"얼굴 DB 로드 완료: {len(self.face_db)} 명 등록됨")
        else:
            print("저장된 얼굴 DB가 없습니다.")

    def save_face_db(self):
        """얼굴 DB를 파일로 저장합니다."""
        npz_path = os.path.join(self.db_dir, 'face_db.npz')
        np.savez_compressed(npz_path, face_db=self.face_db)
        print(f"얼굴 DB 저장 완료: {len(self.face_db)} 명")

    def register_face(self, name):
        """카메라를 통해 얼굴을 등록합니다."""
        # 카메라 열기
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("카메라를 열 수 없습니다.")
            return False

        print(f"{name}의 얼굴을 등록하겠습니다. 카메라를 바라봐 주세요.")
        print("5초 후에 얼굴 캡처를 시작합니다...")

        # 카운트다운
        for i in range(5, 0, -1):
            ret, frame = cap.read()
            if not ret:
                print("프레임을 가져올 수 없습니다.")
                cap.release()
                return False

            # 프레임 반전 (거울 모드)
            frame = cv2.flip(frame, 1)

            # 카운트다운 표시
            cv2.putText(frame, f"{i}", (frame.shape[1] // 2 - 50, frame.shape[0] // 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 3, (0, 0, 255), 5)
            cv2.imshow('Face Registration', frame)
            cv2.waitKey(1000)

        # 여러 프레임에서 얼굴 캡처
        embeddings = []
        face_imgs = []
        capture_count = 0
        needed_captures = 5

        print(f"얼굴을 {needed_captures}번 캡처합니다...")

        while capture_count < needed_captures:
            ret, frame = cap.read()
            if not ret:
                print("프레임을 가져올 수 없습니다.")
                continue

            # 프레임 반전 (거울 모드)
            frame = cv2.flip(frame, 1)

            # 얼굴 감지
            faces = self.app.get(frame)

            # 디스플레이용 프레임 복사
            display_frame = frame.copy()

            if len(faces) > 0:
                # 가장 큰 얼굴 선택
                face = max(faces, key=lambda x: x.bbox[2] - x.bbox[0])

                # 얼굴 박스 좌표
                bbox = face.bbox.astype(int)
                x1, y1, x2, y2 = bbox

                # 얼굴 영역 확장 (여유 공간 추가)
                padding = 30
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(frame.shape[1], x2 + padding)
                y2 = min(frame.shape[0], y2 + padding)

                # 얼굴 이미지 추출
                face_img = frame[y1:y2, x1:x2]

                # 얼굴 임베딩 추출
                embedding = face.embedding

                if embedding is not None:
                    embeddings.append(embedding)
                    face_imgs.append(face_img)
                    capture_count += 1

                    # 얼굴 표시
                    cv2.rectangle(display_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(display_frame, f"캡처 {capture_count}/{needed_captures}",
                                (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # 프레임 표시
            cv2.imshow('Face Registration', display_frame)

            # 일정 시간 대기
            if cv2.waitKey(200) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

        if len(embeddings) > 0:
            # 평균 임베딩 계산
            avg_embedding = np.mean(embeddings, axis=0)

            # 데이터베이스에 저장
            self.face_db[name] = avg_embedding

            # 얼굴 이미지 저장 (가장 마지막 이미지)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = os.path.join(self.img_dir, f"{name}_{timestamp}.jpg")
            cv2.imwrite(img_path, face_imgs[-1])

            # DB 저장
            self.save_face_db()

            print(f"{name}의 얼굴이 성공적으로 등록되었습니다.")
            return True
        else:
            print("얼굴을 감지할 수 없었습니다. 다시 시도해주세요.")
            return False

    def recognize_face(self, face):
        """얼굴을 인식하여 가장 유사한 등록자를 찾습니다."""
        if len(self.face_db) == 0:
            return "알 수 없음", 0.0

        # 임베딩 추출
        embedding = face.embedding
        if embedding is None:
            return "알 수 없음", 0.0

        # 가장 유사한 얼굴 찾기
        max_sim = -1
        max_name = "알 수 없음"

        for name, stored_embedding in self.face_db.items():
            # 코사인 유사도 계산
            similarity = np.dot(embedding, stored_embedding) / (
                        np.linalg.norm(embedding) * np.linalg.norm(stored_embedding))
            if similarity > max_sim:
                max_sim = similarity
                max_name = name

        # 임계값 체크
        if max_sim < self.recognition_threshold:
            return "알 수 없음", max_sim

        return max_name, max_sim

    def run_recognition(self):
        """실시간 얼굴 인식을 실행합니다."""
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("카메라를 열 수 없습니다.")
            return

        print("얼굴 인식을 시작합니다. 종료하려면 'q'를 누르세요.")

        # FPS 계산 변수
        prev_frame_time = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                print("프레임을 가져올 수 없습니다.")
                break

            # 프레임 반전 (거울 모드)
            frame = cv2.flip(frame, 1)

            # FPS 계산
            current_frame_time = time.time()
            fps = 1 / (current_frame_time - prev_frame_time) if prev_frame_time > 0 else 0
            prev_frame_time = current_frame_time

            # 얼굴 감지 및 인식
            faces = self.app.get(frame)

            for face in faces:
                # 얼굴 박스 좌표
                bbox = face.bbox.astype(int)
                x1, y1, x2, y2 = bbox

                # 얼굴 인식
                name, confidence = self.recognize_face(face)

                # 결과 표시
                color = (0, 255, 0) if confidence > self.recognition_threshold else (0, 0, 255)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                # 텍스트 배경
                cv2.rectangle(frame, (x1, y1 - 25), (x1 + 200, y1), color, -1)

                # 이름과 신뢰도 표시
                label = f"{name}: {confidence:.2f}"
                cv2.putText(frame, label, (x1 + 5, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            # FPS 표시
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            # 프레임 표시
            cv2.imshow('Face Recognition', frame)

            # 'q'를 누르면 종료
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        cv2.waitKey(1)

    def view_registered_faces(self):
        """등록된 얼굴 목록을 표시합니다."""
        if len(self.face_db) == 0:
            print("등록된 얼굴이 없습니다.")
            return

        print(f"\n===== 등록된 얼굴 목록 ({len(self.face_db)}명) =====")
        for idx, name in enumerate(self.face_db.keys(), 1):
            print(f"{idx}. {name}")

    def delete_face(self, name):
        """등록된 얼굴을 삭제합니다."""
        if name in self.face_db:
            del self.face_db[name]
            self.save_face_db()

            # 관련 이미지 파일 삭제
            for img_path in glob.glob(os.path.join(self.img_dir, f"{name}_*.jpg")):
                os.remove(img_path)

            print(f"{name}의 얼굴 등록이 삭제되었습니다.")
            return True
        else:
            print(f"{name}은(는) 등록되어 있지 않습니다.")
            return False

    def set_threshold(self, value):
        """인식 임계값을 설정합니다."""
        if 0.0 <= value <= 1.0:
            self.recognition_threshold = value
            print(f"인식 임계값이 {value}로 설정되었습니다.")
            return True
        else:
            print("임계값은 0.0과 1.0 사이의 값이어야 합니다.")
            return False


def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description='InsightFace ArcFace 얼굴 인식 시스템')
    parser.add_argument('--gpu', type=int, default=None,
                        help='GPU ID (0 이상: CUDA, -1: CPU, None: 자동)')
    args = parser.parse_args()

    face_system = FaceRecognitionSystem(gpu=args.gpu)

    while True:
        print("\n===== InsightFace ArcFace 얼굴 인식 시스템 =====")
        print("1. 얼굴 등록")
        print("2. 얼굴 인식 시작")
        print("3. 등록된 얼굴 목록 보기")
        print("4. 등록된 얼굴 삭제")
        print("5. 인식 임계값 설정")
        print("6. 종료")

        choice = input("\n선택하세요 (1-6): ")

        if choice == '1':
            name = input("등록할 사람의 이름을 입력하세요: ")
            face_system.register_face(name)
        elif choice == '2':
            if len(face_system.face_db) == 0:
                print("등록된 얼굴이 없습니다. 먼저 얼굴을 등록해주세요.")
            else:
                face_system.run_recognition()
        elif choice == '3':
            face_system.view_registered_faces()
        elif choice == '4':
            face_system.view_registered_faces()
            name = input("삭제할 사람의 이름을 입력하세요: ")
            face_system.delete_face(name)
        elif choice == '5':
            try:
                value = float(input("인식 임계값을 입력하세요 (0.0~1.0, 높을수록 엄격함): "))
                face_system.set_threshold(value)
            except ValueError:
                print("유효한 숫자를 입력해주세요.")
        elif choice == '6':
            print("프로그램을 종료합니다.")
            break
        else:
            print("잘못된 선택입니다. 다시 시도해주세요.")


if __name__ == "__main__":
    main()

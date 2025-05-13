# server.py
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List, Any
import numpy as np
import base64
import cv2
import logging
from datetime import datetime
import json
import asyncio
import os
import uuid
from contextlib import asynccontextmanager
import torch
import insightface
from insightface.app import FaceAnalysis
from insightface.data import get_image as ins_get_image

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("face_verification_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("face_verification_server")


# 데이터 모델
class RegisterRequest(BaseModel):
    user_id: str
    face_images: Dict[str, str]  # 방향별 Base64 인코딩된 이미지


class VerifyRequest(BaseModel):
    rgb_image: str  # Base64 인코딩된 RGB 이미지
    liveness_result: Optional[Dict[str, Any]] = None  # 로컬에서 처리한 라이브니스 결과


# 사용자 DB 경로
USERS_DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users_db")
if not os.path.exists(USERS_DB_DIR):
    os.makedirs(USERS_DB_DIR)


# 웹소켓 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket 연결 생성: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket 연결 종료: {websocket.client}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        await websocket.send_json(message)


# 얼굴 처리 클래스
class FaceProcessor:
    def __init__(self):
        self.face_app = None
        self.face_model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"딥러닝 모델 실행 장치: {self.device}")
        self.init_models()
        self.users_db = self.load_users_db()

    def init_models(self):
        try:
            # InsightFace 얼굴 분석 모델 초기화
            self.face_app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
            self.face_app.prepare(ctx_id=0, det_size=(640, 640))
            logger.info("InsightFace 모델 초기화 완료")
        except Exception as e:
            logger.error(f"InsightFace 모델 초기화 실패: {e}")
            raise

    def load_users_db(self):
        """사용자 DB 로드"""
        users_db = {}
        try:
            # users_db 디렉토리에서 각 사용자 파일 로드
            for user_id in os.listdir(USERS_DB_DIR):
                user_dir = os.path.join(USERS_DB_DIR, user_id)
                if os.path.isdir(user_dir):
                    user_data_path = os.path.join(user_dir, "embeddings.npz")
                    if os.path.exists(user_data_path):
                        data = np.load(user_data_path)
                        users_db[user_id] = {
                            'embeddings': data['embeddings'],
                            'register_time': data['register_time'].item()
                        }
                        logger.info(f"사용자 로드: {user_id}")

            logger.info(f"총 {len(users_db)} 명의 사용자 DB 로드 완료")
            return users_db
        except Exception as e:
            logger.error(f"사용자 DB 로드 오류: {e}")
            return {}

    def save_user_embeddings(self, user_id, embeddings):
        """사용자 얼굴 임베딩 저장"""
        try:
            user_dir = os.path.join(USERS_DB_DIR, user_id)
            if not os.path.exists(user_dir):
                os.makedirs(user_dir)

            # 임베딩과 등록 시간 저장
            user_data_path = os.path.join(user_dir, "embeddings.npz")
            np.savez(
                user_data_path,
                embeddings=embeddings,
                register_time=datetime.now().timestamp()
            )

            # 사용자 DB 업데이트
            self.users_db[user_id] = {
                'embeddings': embeddings,
                'register_time': datetime.now().timestamp()
            }
            logger.info(f"사용자 {user_id} 임베딩 저장 완료")
            return True
        except Exception as e:
            logger.error(f"사용자 임베딩 저장 오류: {e}")
            return False

    def base64_to_image(self, base64_str):
        """Base64 문자열을 OpenCV 이미지로 변환"""
        try:
            # "data:image/jpeg;base64," 프리픽스 제거
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]

            img_bytes = base64.b64decode(base64_str)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            logger.error(f"Base64 디코딩 오류: {e}")
            return None

    def extract_face_embedding(self, image):
        """이미지에서 얼굴 임베딩 추출"""
        try:
            if image is None or image.size == 0:
                return None

            # 얼굴 감지 및 특징 추출
            faces = self.face_app.get(image)

            if not faces:
                logger.warning("이미지에서 얼굴을 찾을 수 없음")
                return None

            # 가장 큰 얼굴 선택 (여러 얼굴이 감지된 경우)
            face = max(faces, key=lambda x: x.bbox[2] - x.bbox[0])
            embedding = face.embedding

            return embedding
        except Exception as e:
            logger.error(f"얼굴 임베딩 추출 오류: {e}")
            return None

    def register_face(self, user_id, face_images):
        """여러 방향의 얼굴 이미지를 등록"""
        try:
            # 필요한 방향 확인
            required_directions = ['front', 'left', 'right', 'up', 'down']
            for direction in required_directions:
                if direction not in face_images:
                    raise ValueError(f"{direction} 방향 이미지가 누락됨")

            # 각 방향별 이미지 처리
            embeddings = []
            for direction, base64_img in face_images.items():
                img = self.base64_to_image(base64_img)
                if img is None:
                    raise ValueError(f"{direction} 방향 이미지 디코딩 실패")

                embedding = self.extract_face_embedding(img)
                if embedding is None:
                    raise ValueError(f"{direction} 방향 얼굴 감지 실패")

                embeddings.append(embedding)

            # 임베딩 배열로 변환하여 저장
            embeddings_array = np.array(embeddings)
            success = self.save_user_embeddings(user_id, embeddings_array)

            if not success:
                raise Exception("사용자 임베딩 저장 실패")

            return {
                "status": "success",
                "message": f"사용자 {user_id} 등록 완료",
                "direction_count": len(embeddings)
            }
        except Exception as e:
            logger.error(f"얼굴 등록 오류: {e}")
            raise

    def verify_face(self, rgb_image, liveness_result=None):
        """얼굴 인증 수행"""
        start_time = datetime.now()
        try:
            # 이미지 디코딩
            img = self.base64_to_image(rgb_image)
            if img is None:
                raise ValueError("이미지 디코딩 실패")

            # 얼굴 임베딩 추출
            query_embedding = self.extract_face_embedding(img)
            if query_embedding is None:
                raise ValueError("이미지에서 얼굴을 찾을 수 없음")

            # 라이브니스 검사 확인 (로컬에서 처리된 결과)
            if liveness_result and not liveness_result.get('is_live', False):
                logger.warning(f"라이브니스 검사 실패: {liveness_result.get('reason')}")
                processing_time = (datetime.now() - start_time).total_seconds()
                return {
                    "status": "failure",
                    "message": f"라이브니스 검사 실패: {liveness_result.get('reason')}",
                    "processing_time": processing_time,
                    "liveness_result": liveness_result
                }

            # 사용자 DB가 비어있는 경우
            if not self.users_db:
                logger.warning("사용자 DB가 비어있음")
                processing_time = (datetime.now() - start_time).total_seconds()
                return {
                    "status": "failure",
                    "message": "등록된 사용자가 없음",
                    "processing_time": processing_time,
                    "liveness_result": liveness_result
                }

            # 각 사용자와 유사도 계산
            best_match = None
            best_similarity = -1
            best_user_id = None

            for user_id, user_data in self.users_db.items():
                user_embeddings = user_data['embeddings']

                # 각 방향의 임베딩과 비교하여 최대 유사도 찾기
                similarities = []
                for embedding in user_embeddings:
                    similarity = np.dot(query_embedding, embedding) / (
                            np.linalg.norm(query_embedding) * np.linalg.norm(embedding)
                    )
                    similarities.append(similarity)

                # 해당 사용자의 최대 유사도
                max_similarity = max(similarities)

                # 전체 최대 유사도 업데이트
                if max_similarity > best_similarity:
                    best_similarity = max_similarity
                    best_user_id = user_id

            # 임계값 설정 (0.5는 테스트 후 조정 필요)
            threshold = 0.5
            processing_time = (datetime.now() - start_time).total_seconds()

            if best_similarity > threshold:
                logger.info(f"인증 성공: 사용자 {best_user_id}, 유사도 {best_similarity:.4f}")
                return {
                    "status": "success",
                    "user_id": best_user_id,
                    "confidence": float(best_similarity),
                    "processing_time": processing_time,
                    "liveness_result": liveness_result
                }
            else:
                logger.info(f"인증 실패: 최대 유사도 {best_similarity:.4f} (임계값: {threshold})")
                return {
                    "status": "failure",
                    "message": "일치하는 얼굴 없음",
                    "confidence": float(best_similarity) if best_similarity > 0 else 0.0,
                    "processing_time": processing_time,
                    "liveness_result": liveness_result
                }

        except Exception as e:
            logger.error(f"얼굴 인증 오류: {e}")
            processing_time = (datetime.now() - start_time).total_seconds()
            return {
                "status": "error",
                "message": f"인증 처리 중 오류 발생: {str(e)}",
                "processing_time": processing_time
            }


# 시스템 인스턴스 생성
face_processor = None
connection_manager = ConnectionManager()


# 시스템 초기화 미들웨어
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 모델 초기화
    global face_processor
    try:
        face_processor = FaceProcessor()
        logger.info("얼굴 인식 모델 초기화 완료")
    except Exception as e:
        logger.error(f"얼굴 인식 모델 초기화 실패: {e}")

    yield

    # 종료 시 처리할 내용이 있으면 여기에 작성


# 앱 초기화
app = FastAPI(title="얼굴 인증 GPU 서버", lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API 엔드포인트: 얼굴 등록
@app.post("/register")
async def register(request: RegisterRequest):
    """여러 방향에서 촬영한 얼굴 이미지를 등록"""
    try:
        if face_processor is None:
            raise HTTPException(status_code=500, detail="얼굴 인식 모델이 초기화되지 않았습니다")

        result = face_processor.register_face(request.user_id, request.face_images)
        return result
    except ValueError as e:
        logger.error(f"등록 값 오류: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"등록 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# API 엔드포인트: 얼굴 인증
@app.post("/verify")
async def verify(request: VerifyRequest):
    """얼굴 이미지로 인증 수행"""
    try:
        if face_processor is None:
            raise HTTPException(status_code=500, detail="얼굴 인식 모델이 초기화되지 않았습니다")

        result = face_processor.verify_face(request.rgb_image, request.liveness_result)
        return result
    except ValueError as e:
        logger.error(f"인증 값 오류: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"인증 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 웹소켓 엔드포인트: 실시간 얼굴 인증
@app.websocket("/ws/verify")
async def websocket_verify(websocket: WebSocket):
    """실시간 얼굴 인증을 위한 웹소켓"""
    await connection_manager.connect(websocket)
    logger.info("얼굴 인증 웹소켓 연결 시작")

    try:
        while True:
            # 클라이언트로부터 메시지 수신
            message_data = await websocket.receive_json()

            if message_data.get('type') == 'verify':
                # 인증 요청 처리
                if face_processor is None:
                    await connection_manager.send_personal_message({
                        "type": "error",
                        "message": "얼굴 인식 모델이 초기화되지 않았습니다"
                    }, websocket)
                    continue

                rgb_image = message_data.get('rgb_image')
                liveness_result = message_data.get('liveness_result')

                if not rgb_image:
                    await connection_manager.send_personal_message({
                        "type": "error",
                        "message": "이미지 데이터가 누락됨"
                    }, websocket)
                    continue

                # 얼굴 인증 수행
                result = face_processor.verify_face(rgb_image, liveness_result)

                # 결과 형식 변환
                if result.get('status') == 'success':
                    await connection_manager.send_personal_message({
                        "type": "success",
                        "user_id": result.get('user_id'),
                        "confidence": result.get('confidence'),
                        "processing_time": result.get('processing_time'),
                        "liveness_result": result.get('liveness_result')
                    }, websocket)
                else:
                    await connection_manager.send_personal_message({
                        "type": "failure",
                        "message": result.get('message'),
                        "confidence": result.get('confidence', 0.0),
                        "processing_time": result.get('processing_time'),
                        "liveness_result": result.get('liveness_result')
                    }, websocket)

            elif message_data.get('type') == 'ping':
                # 연결 유지를 위한 ping-pong
                await connection_manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }, websocket)

    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        logger.info("얼굴 인증 웹소켓 연결 종료")
    except Exception as e:
        logger.error(f"웹소켓 처리 오류: {e}")
        try:
            await connection_manager.send_personal_message({
                "type": "error",
                "message": f"서버 오류: {str(e)}"
            }, websocket)
        except:
            pass
        connection_manager.disconnect(websocket)


# 서버 상태 확인
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "type": "gpu_face_verification_server",
        "models_loaded": face_processor is not None,
        "users_count": len(face_processor.users_db) if face_processor else 0,
        "device": str(face_processor.device) if face_processor else "unknown"
    }


# 메인 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8800, reload=False)
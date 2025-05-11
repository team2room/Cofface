# main.py
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List, Any
import numpy as np
import base64
import cv2, os, torch
import logging
from pathlib import Path
import uuid
from datetime import datetime
import json
import asyncio

from insightface.app import FaceAnalysis
from insightface.model_zoo import get_model
from qdrant_client import QdrantClient
from qdrant_client.http import models
from contextlib import asynccontextmanager

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("face_recognition_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("face_recognition")

# 설정
VECTOR_DIMENSION = 512  # InsightFace 임베딩 차원
COLLECTION_NAME = "face_vectors"
REQUIRED_FACE_DIRECTIONS = ["front", "left", "right", "up", "down"]
SIMILARITY_THRESHOLD = 0.6  # 유사도 임계값


# GPU 설정 (크로스 플랫폼 지원)
def get_gpu_device():
    """GPU 디바이스를 자동으로 감지하고 설정"""
    gpu = None

    if torch.cuda.is_available():
        gpu = 0  # CUDA 지원
        logger.info(f"CUDA 사용 가능: {torch.cuda.get_device_name(0)}")
    elif hasattr(torch, 'backends') and hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        gpu = -1  # MPS (Metal) 지원
        logger.info("MPS (Metal Performance Shaders) 사용 가능")
    else:
        logger.info('GPU를 찾을 수 없음, CPU 사용')
        gpu = -1  # CPU 모드

    return gpu


# 데이터 모델
class FaceRegistrationRequest(BaseModel):
    user_id: str
    face_images: Dict[str, str]  # 방향별 Base64 인코딩된 이미지


class VerificationResponse(BaseModel):
    user_id: Optional[str]
    confidence: float
    matched: bool
    processing_time: float


# 웹소켓 연결 관리를 위한 클래스
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

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


# InsightFace 모델을 관리하는 클래스
class FaceRecognitionSystem:
    def __init__(self):
        self.face_analyzer = None
        self.face_recognizer = None
        self.db_client = None
        self.is_initialized = False
        self.gpu_device = None

        # 모델 디렉토리 설정
        self.THIS_DIR = Path(os.path.dirname(os.path.abspath(__file__)))
        self.models_dir = self.THIS_DIR / "models" / "insightface"

        # 모델 디렉토리 생성
        os.makedirs(self.models_dir, exist_ok=True)

    async def initialize(self):
        if self.is_initialized:
            return

        logger.info("안면인식 시스템 초기화 시작...")

        try:
            # GPU 디바이스 설정
            self.gpu_device = get_gpu_device()

            # InsightFace 모델 초기화 (GPU 사용)
            logger.info(f"모델 디렉토리: {self.models_dir}")
            logger.info(f"GPU 디바이스: {self.gpu_device}")

            # GPU 타입에 따른 Provider 설정
            if self.gpu_device == 0:  # CUDA
                providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
            else:  # MPS, CPU
                providers = ['CPUExecutionProvider']

            self.face_analyzer = FaceAnalysis(
                name="buffalo_l",
                root=str(self.models_dir),
                providers=providers,
                allowed_modules=['detection', 'recognition']
            )

            # face_analyzer 준비 (이 과정에서 모델을 자동으로 다운로드)
            logger.info("FaceAnalysis 모델 준비 중...")
            ctx_id = 0 if self.gpu_device == 0 else -1
            self.face_analyzer.prepare(ctx_id=ctx_id, det_size=(640, 640))
            logger.info("FaceAnalysis 모델 준비 완료")

            # ArcFace 모델 (고정밀 임베딩 추출용)
            logger.info("ArcFace 모델 로드 중...")
            model_path = self.models_dir / "buffalo_l"

            # 모델 디렉토리 확인
            if not os.path.exists(model_path):
                logger.info(f"모델 디렉토리가 존재하지 않습니다: {model_path}")
                logger.info("FaceAnalysis 모델을 통해 모델 다운로드를 시도합니다.")

            # ArcFace 모델 로드 시도
            try:
                self.face_recognizer = get_model("buffalo_l", root=str(self.models_dir))
                self.face_recognizer.prepare(ctx_id=ctx_id)
                logger.info("ArcFace 모델 로드 성공")
            except Exception as e:
                logger.error(f"ArcFace 모델 로드 실패: {e}")
                logger.info("FaceAnalysis의 recognizer를 대체로 사용합니다.")
                # face_analyzer에서 사용하는 recognition 모델을 대체로 사용
                self.face_recognizer = self.face_analyzer

            # Qdrant 벡터 DB 연결
            logger.info("Qdrant 연결 중...")
            self.db_client = QdrantClient(host="localhost", port=6333)

            # 컬렉션 존재 확인 및 생성
            try:
                collections = self.db_client.get_collections().collections
                collection_names = [collection.name for collection in collections]

                if COLLECTION_NAME not in collection_names:
                    self.db_client.create_collection(
                        collection_name=COLLECTION_NAME,
                        vectors_config=models.VectorParams(
                            size=VECTOR_DIMENSION,
                            distance=models.Distance.COSINE,
                        ),
                    )
                    logger.info(f"컬렉션 '{COLLECTION_NAME}' 생성 완료")
                else:
                    logger.info(f"컬렉션 '{COLLECTION_NAME}' 이미 존재함")
            except Exception as e:
                logger.error(f"Qdrant 컬렉션 초기화 중 오류: {e}")
                raise

            self.is_initialized = True
            logger.info("안면인식 시스템 초기화 완료")

        except Exception as e:
            logger.error(f"안면인식 시스템 초기화 중 오류 발생: {e}")
            raise


# 얼굴 임베딩 추출 함수
def extract_face_embedding(image, face_analyzer, face_recognizer):
    """이미지에서 얼굴 임베딩 추출"""
    faces = face_analyzer.get(image)
    if not faces:
        return None

    # 가장 큰 얼굴 선택
    largest_face = max(faces, key=lambda x: x.bbox[2] * x.bbox[3])

    # face_recognizer가 face_analyzer와 동일한 경우 (대체 사용)
    if face_recognizer is face_analyzer:
        # 이미 추출된 얼굴의 임베딩 사용
        embedding = largest_face.embedding
    else:
        # 별도의 face_recognizer 사용
        try:
            embedding = face_recognizer.get(image, largest_face)
        except:
            # 실패 시 대체 임베딩 사용
            embedding = largest_face.embedding

    return embedding


# 여러 각도의 얼굴 임베딩 통합
def merge_embeddings(embeddings_dict):
    """여러 각도의 얼굴 임베딩을 하나로 통합"""
    if not all(angle in embeddings_dict for angle in REQUIRED_FACE_DIRECTIONS):
        missing = [angle for angle in REQUIRED_FACE_DIRECTIONS if angle not in embeddings_dict]
        raise ValueError(f"누락된 얼굴 각도가 있습니다: {missing}")

    # 모든 임베딩을 평균화하여 통합
    all_embeddings = np.array(list(embeddings_dict.values()))
    merged_embedding = np.mean(all_embeddings, axis=0)

    # 정규화
    norm = np.linalg.norm(merged_embedding)
    if norm > 0:
        merged_embedding = merged_embedding / norm

    return merged_embedding


# Base64 디코딩 함수
def base64_to_image(base64_str):
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


# 시스템 인스턴스 생성
face_system = FaceRecognitionSystem()


# 시스템 초기화 미들웨어
@asynccontextmanager
async def lifespan(app: FastAPI):
    await face_system.initialize()
    yield


# 앱 초기화
app = FastAPI(title="안면인식 백엔드 API", lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API 엔드포인트: 얼굴 등록
@app.post("/register", response_model=dict)
async def register_face(registration: FaceRegistrationRequest):
    """여러 각도의 얼굴 이미지를 등록하고 통합된 임베딩을 생성하여 저장"""
    try:
        logger.info(f"사용자 ID {registration.user_id}의 얼굴 등록 시작")

        # 각 각도별 이미지에서 얼굴 임베딩 추출
        embeddings_dict = {}

        for angle, base64_img in registration.face_images.items():
            img = base64_to_image(base64_img)
            if img is None:
                raise HTTPException(status_code=400, detail=f"{angle} 각도의 이미지 디코딩 실패")

            embedding = extract_face_embedding(img, face_system.face_analyzer, face_system.face_recognizer)
            if embedding is None:
                raise HTTPException(status_code=400, detail=f"{angle} 각도에서 얼굴을 찾을 수 없음")

            embeddings_dict[angle] = embedding

        # 임베딩 통합
        try:
            merged_embedding = merge_embeddings(embeddings_dict)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Qdrant에 저장
        face_system.db_client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                models.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=merged_embedding.tolist(),
                    payload={
                        "user_id": registration.user_id,
                        "created_at": datetime.now().isoformat(),
                        "face_angles": list(embeddings_dict.keys())
                    }
                )
            ]
        )

        logger.info(f"사용자 ID {registration.user_id}의 얼굴 등록 완료")
        return {
            "success": True,
            "message": "얼굴 등록 성공",
            "user_id": registration.user_id
        }

    except Exception as e:
        logger.error(f"얼굴 등록 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"얼굴 등록 실패: {str(e)}")


# API 엔드포인트: 얼굴 인증 (REST API)
@app.post("/verify", response_model=VerificationResponse)
async def verify_face(rgb_image: str, depth_image: Optional[str] = None):
    """RGB 이미지와 깊이 이미지를 사용하여 사용자 확인"""
    start_time = datetime.now()
    try:
        # RGB 이미지에서 얼굴 검출 및 임베딩 추출
        rgb_img = base64_to_image(rgb_image)
        if rgb_img is None:
            raise HTTPException(status_code=400, detail="RGB 이미지 디코딩 실패")

        # 얼굴 임베딩 추출
        embedding = extract_face_embedding(rgb_img, face_system.face_analyzer, face_system.face_recognizer)
        if embedding is None:
            raise HTTPException(status_code=400, detail="얼굴을 찾을 수 없음")

        # 깊이 정보가 있으면 추가 분석 (선택사항)
        if depth_image:
            depth_img = base64_to_image(depth_image)
            # 여기서 깊이 정보를 활용한 추가 검증 로직 구현 가능
            # 예: 3D 얼굴 스푸핑 방지, 깊이 기반 마스크 탐지 등

        # 벡터 DB에서 검색
        search_result = face_system.db_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=embedding.tolist(),
            limit=1,
            score_threshold=SIMILARITY_THRESHOLD
        )

        processing_time = (datetime.now() - start_time).total_seconds()

        if search_result and len(search_result) > 0:
            # 매칭 성공
            match = search_result[0]
            user_id = match.payload.get("user_id")
            confidence = 1.0 - match.score  # 코사인 거리를 신뢰도로 변환

            logger.info(f"사용자 확인 성공: {user_id}, 신뢰도: {confidence:.4f}")
            return VerificationResponse(
                user_id=user_id,
                confidence=confidence,
                matched=True,
                processing_time=processing_time
            )
        else:
            # 매칭 실패
            logger.info("사용자 확인 실패: 매칭되는 얼굴 없음")
            return VerificationResponse(
                user_id=None,
                confidence=0.0,
                matched=False,
                processing_time=processing_time
            )

    except Exception as e:
        logger.error(f"얼굴 확인 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"얼굴 확인 실패: {str(e)}")


# 웹소켓 엔드포인트: 실시간 얼굴 인증
@app.websocket("/ws/verify")
async def websocket_verify(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            try:
                # 클라이언트로부터 데이터 수신
                data = await websocket.receive_json()

                # 메시지 타입 확인
                message_type = data.get("type")

                if message_type == "verify":
                    # 얼굴 인증 요청
                    rgb_image = data.get("rgb_image")

                    if not rgb_image:
                        await manager.send_personal_message({
                            "type": "error",
                            "message": "RGB 이미지가 제공되지 않았습니다."
                        }, websocket)
                        continue

                    start_time = datetime.now()

                    try:
                        # RGB 이미지에서 얼굴 검출 및 임베딩 추출
                        rgb_img = base64_to_image(rgb_image)
                        if rgb_img is None:
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "RGB 이미지 디코딩 실패"
                            }, websocket)
                            continue

                        # 얼굴 임베딩 추출
                        embedding = extract_face_embedding(rgb_img, face_system.face_analyzer,
                                                           face_system.face_recognizer)
                        if embedding is None:
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "얼굴을 찾을 수 없음"
                            }, websocket)
                            continue

                        # 벡터 DB에서 검색
                        search_result = face_system.db_client.search(
                            collection_name=COLLECTION_NAME,
                            query_vector=embedding.tolist(),
                            limit=1,
                            score_threshold=SIMILARITY_THRESHOLD
                        )

                        processing_time = (datetime.now() - start_time).total_seconds()

                        if search_result and len(search_result) > 0:
                            # 매칭 성공
                            match = search_result[0]
                            user_id = match.payload.get("user_id")
                            confidence = 1.0 - match.score  # 코사인 거리를 신뢰도로 변환

                            logger.info(f"실시간 사용자 확인 성공: {user_id}, 신뢰도: {confidence:.4f}")
                            await manager.send_personal_message({
                                "type": "success",
                                "user_id": user_id,
                                "confidence": confidence,
                                "matched": True,
                                "processing_time": processing_time
                            }, websocket)
                        else:
                            # 매칭 실패
                            logger.info("실시간 사용자 확인 실패: 매칭되는 얼굴 없음")
                            await manager.send_personal_message({
                                "type": "failure",
                                "user_id": None,
                                "confidence": 0.0,
                                "matched": False,
                                "processing_time": processing_time
                            }, websocket)

                    except Exception as e:
                        logger.error(f"실시간 얼굴 확인 중 오류 발생: {e}")
                        await manager.send_personal_message({
                            "type": "error",
                            "message": f"얼굴 확인 실패: {str(e)}"
                        }, websocket)

                elif message_type == "ping":
                    # 연결 유지를 위한 ping
                    await manager.send_personal_message({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }, websocket)

                else:
                    await manager.send_personal_message({
                        "type": "error",
                        "message": f"알 수 없는 메시지 타입: {message_type}"
                    }, websocket)

            except Exception as e:
                logger.error(f"WebSocket 메시지 처리 중 오류: {e}")
                await manager.send_personal_message({
                    "type": "error",
                    "message": f"메시지 처리 중 오류가 발생했습니다: {str(e)}"
                }, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket 연결이 클라이언트에 의해 종료됨")
    except Exception as e:
        logger.error(f"WebSocket 연결 중 치명적 오류: {e}")
        manager.disconnect(websocket)


# 서버 상태 확인
@app.get("/health")
async def health_check():
    """서버 상태 및 모델 상태 확인"""
    gpu_info = {}

    # GPU 정보 수집
    if hasattr(face_system, 'gpu_device'):
        if face_system.gpu_device == 0:  # CUDA
            gpu_info["gpu_available"] = True
            gpu_info["gpu_type"] = "CUDA"
            if torch.cuda.is_available():
                gpu_info["gpu_name"] = torch.cuda.get_device_name(0)
                gpu_info["gpu_memory_allocated"] = torch.cuda.memory_allocated(0)
                gpu_info["gpu_memory_total"] = torch.cuda.get_device_properties(0).total_memory
        elif hasattr(torch, 'backends') and hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            gpu_info["gpu_available"] = True
            gpu_info["gpu_type"] = "MPS"
            gpu_info["gpu_name"] = "Apple Silicon (Metal)"
        else:
            gpu_info["gpu_available"] = False
            gpu_info["gpu_type"] = "CPU"

    return {
        "status": "healthy",
        "initialized": face_system.is_initialized,
        "timestamp": datetime.now().isoformat(),
        **gpu_info
    }


# 메인 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
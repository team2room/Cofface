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
import pyrealsense2 as rs

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


# RealSense 깊이 카메라 클래스
class RealSenseDepthCamera:
    def __init__(self):
        self.pipeline = None
        self.config = None
        self.is_running = False

    def start(self):
        try:
            logger.info("RealSense 카메라 초기화 시도 중...")

            # RealSense 파이프라인 설정
            self.pipeline = rs.pipeline()
            self.config = rs.config()

            # RGB와 Depth 스트림 설정
            self.config.enable_stream(rs.stream.color, 640, 480, rs.format.bgr8, 30)
            self.config.enable_stream(rs.stream.depth, 640, 480, rs.format.z16, 30)

            # 파이프라인 시작
            self.pipeline.start(self.config)
            self.is_running = True
            logger.info("RealSense 카메라 초기화 완료")

            # 테스트용: 첫 프레임 확인
            frames = self.pipeline.wait_for_frames(timeout_ms=1000)
            if frames:
                logger.info("첫 프레임 획득 성공")
            else:
                logger.warning("첫 프레임 획득 실패")

        except RuntimeError as e:
            logger.error(f"RealSense 런타임 오류: {e}")
            self.is_running = False
            if self.pipeline:
                try:
                    self.pipeline.stop()
                except:
                    pass
        except Exception as e:
            logger.error(f"RealSense 카메라 초기화 실패: {e}")
            logger.error(f"오류 타입: {type(e)}")
            self.is_running = False
            if self.pipeline:
                try:
                    self.pipeline.stop()
                except:
                    pass

    def get_frames(self):
        if not self.is_running:
            logger.debug("RealSense가 실행 중이지 않음")
            return None, None

        try:
            # 프레임 획득 (타임아웃 설정)
            frames = self.pipeline.wait_for_frames(timeout_ms=500)

            # Depth 프레임과 Color 프레임 분리
            depth_frame = frames.get_depth_frame()
            color_frame = frames.get_color_frame()

            if not depth_frame or not color_frame:
                logger.debug("프레임 획득 실패 - 일부 프레임 누락")
                return None, None

            # 이미지로 변환
            depth_image = np.asanyarray(depth_frame.get_data())
            color_image = np.asanyarray(color_frame.get_data())

            logger.debug(f"프레임 획득 성공 - Color: {color_image.shape}, Depth: {depth_image.shape}")
            return color_image, depth_image

        except RuntimeError as e:
            logger.error(f"RealSense 프레임 획득 런타임 오류: {e}")
            self.is_running = False
            return None, None
        except Exception as e:
            logger.error(f"RealSense 프레임 획득 실패: {e}")
            return None, None

    def stop(self):
        if self.pipeline and self.is_running:
            try:
                self.pipeline.stop()
                self.is_running = False
                logger.info("RealSense 카메라 종료")
            except Exception as e:
                logger.error(f"RealSense 종료 중 오류: {e}")


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
            try:
                self.db_client = QdrantClient(host="localhost", port=6333)

                # 컬렉션 존재 확인 및 생성
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
                logger.error(f"Qdrant 연결 중 오류: {e}")
                logger.warning("Qdrant 없이 실행합니다. 얼굴 저장/검색 기능이 제한됩니다.")
                self.db_client = None

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


# 간단한 입체감 측정 함수
def simple_liveness_check(color_image: np.ndarray, depth_image: np.ndarray, face_bbox: tuple) -> dict:
    """
    간단한 입체감 기반 라이브니스 검사
    """
    x1, y1, x2, y2 = face_bbox

    # 얼굴 영역의 깊이 값 추출
    face_depth = depth_image[y1:y2, x1:x2]

    # 유효한 깊이 값만 필터링
    valid_depths = face_depth[face_depth > 0]

    if len(valid_depths) < 100:  # 최소한의 유효 깊이 포인트
        return {
            "is_live": False,
            "reason": "유효한 깊이 데이터가 부족합니다",
            "depth_variation": 0
        }

    # 깊이 값의 범위 계산
    min_depth = np.min(valid_depths)
    max_depth = np.max(valid_depths)
    depth_variation = max_depth - min_depth

    # 입체감 판정 (20mm 이상의 깊이 변화면 3D로 판단)
    DEPTH_THRESHOLD = 20  # mm
    is_live = depth_variation > DEPTH_THRESHOLD

    return {
        "is_live": is_live,
        "depth_variation": int(depth_variation),
        "reason": f"{'실제 얼굴' if is_live else '평면 이미지'}로 판단됨",
        "confidence": min(depth_variation / 50, 1.0)  # 최대 50mm를 100% 신뢰도로 정규화
    }


# 시스템 인스턴스 생성
face_system = FaceRecognitionSystem()
realsense_camera = RealSenseDepthCamera()


# 시스템 초기화 미들웨어
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 얼굴 인식 시스템 초기화
    await face_system.initialize()

    # RealSense 카메라 시작
    try:
        realsense_camera.start()
        logger.info("RealSense 카메라 초기화 완료")
    except Exception as e:
        logger.warning(f"RealSense 카메라 초기화 실패: {e}")

    yield

    # 종료 시 RealSense 정리
    realsense_camera.stop()


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
        if face_system.db_client:
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

        # 벡터 DB에서 검색
        if face_system.db_client:
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
        else:
            raise HTTPException(status_code=500, detail="Qdrant 연결이 없습니다")

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
                # 클라이언트로부터 RGB 이미지만 수신
                data = await websocket.receive_json()

                # 메시지 타입 확인
                message_type = data.get("type")

                if message_type == "verify":
                    # 얼굴 인증 요청
                    rgb_image_base64 = data.get("rgb_image")

                    if not rgb_image_base64:
                        await manager.send_personal_message({
                            "type": "error",
                            "message": "RGB 이미지가 제공되지 않았습니다."
                        }, websocket)
                        continue

                    start_time = datetime.now()

                    try:
                        # 웹에서 받은 RGB 이미지
                        web_rgb_img = base64_to_image(rgb_image_base64)
                        if web_rgb_img is None:
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "RGB 이미지 디코딩 실패"
                            }, websocket)
                            continue

                        # RealSense에서 현재 프레임 획득
                        realsense_color, realsense_depth = realsense_camera.get_frames()

                        # RealSense 사용 가능 여부 확인
                        use_realsense = realsense_color is not None and realsense_depth is not None

                        if not use_realsense:
                            logger.warning("RealSense 데이터를 사용할 수 없습니다. 라이브니스 검사를 생략합니다.")

                        # 얼굴 검출 (웹에서 받은 이미지로)
                        faces = face_system.face_analyzer.get(web_rgb_img)
                        if not faces:
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "얼굴을 찾을 수 없음"
                            }, websocket)
                            continue

                        # 가장 큰 얼굴 선택
                        largest_face = max(faces, key=lambda x: x.bbox[2] * x.bbox[3])
                        face_bbox = (
                            int(largest_face.bbox[0]),
                            int(largest_face.bbox[1]),
                            int(largest_face.bbox[2]),
                            int(largest_face.bbox[3])
                        )

                        # 라이브니스 검사 (RealSense가 사용 가능한 경우에만)
                        liveness_result = {"is_live": True, "confidence": 1.0}  # 기본값

                        if use_realsense:
                            liveness_result = simple_liveness_check(
                                realsense_color,
                                realsense_depth,
                                face_bbox
                            )

                            # 라이브니스 실패 시
                            if not liveness_result["is_live"]:
                                await manager.send_personal_message({
                                    "type": "error",
                                    "message": f"라이브니스 검사 실패: {liveness_result['reason']}",
                                    "liveness_result": liveness_result
                                }, websocket)
                                continue

                        # 얼굴 임베딩 추출
                        if face_system.face_recognizer is face_system.face_analyzer:
                            embedding = largest_face.embedding
                        else:
                            try:
                                embedding = face_system.face_recognizer.get(web_rgb_img, largest_face)
                            except:
                                embedding = largest_face.embedding

                        # 벡터 DB에서 검색
                        if face_system.db_client:
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
                                    "processing_time": processing_time,
                                    "liveness_result": liveness_result
                                }, websocket)
                            else:
                                # 매칭 실패
                                logger.info("실시간 사용자 확인 실패: 매칭되는 얼굴 없음")
                                await manager.send_personal_message({
                                    "type": "failure",
                                    "user_id": None,
                                    "confidence": 0.0,
                                    "matched": False,
                                    "processing_time": processing_time,
                                    "liveness_result": liveness_result
                                }, websocket)
                        else:
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "Qdrant 연결이 없습니다"
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

    # RealSense 상태 확인
    realsense_info = {
        "realsense_available": realsense_camera.is_running,
        "realsense_status": "연결됨" if realsense_camera.is_running else "연결 안됨"
    }

    return {
        "status": "healthy",
        "initialized": face_system.is_initialized,
        "timestamp": datetime.now().isoformat(),
        "db_connected": face_system.db_client is not None,
        **gpu_info,
        **realsense_info
    }


@app.get("/test-realsense")
async def test_realsense():
    """RealSense 테스트 엔드포인트"""
    try:
        if not realsense_camera.is_running:
            return {
                "status": "error",
                "message": "RealSense가 실행 중이지 않습니다",
                "is_running": False
            }

        # 프레임 획득 시도
        color, depth = realsense_camera.get_frames()

        if color is None or depth is None:
            return {
                "status": "error",
                "message": "프레임 획득 실패",
                "is_running": realsense_camera.is_running
            }

        # 기본 통계 정보
        return {
            "status": "success",
            "message": "RealSense 작동 중",
            "is_running": True,
            "color_shape": list(color.shape),
            "depth_shape": list(depth.shape),
            "depth_stats": {
                "min": int(np.min(depth)),
                "max": int(np.max(depth)),
                "mean": int(np.mean(depth))
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"테스트 중 오류: {str(e)}",
            "is_running": realsense_camera.is_running
        }


@app.websocket("/ws/realsense")
async def websocket_realsense(websocket: WebSocket):
    """RealSense 카메라 프레임을 실시간으로 전송"""
    await manager.connect(websocket)

    logger.info("RealSense 웹소켓 연결 시작")

    # RealSense가 제대로 초기화되었는지 확인
    if not realsense_camera.is_running:
        logger.warning("RealSense 카메라가 실행 중이지 않습니다. 시작 시도 중...")
        realsense_camera.start()

    try:
        while True:
            try:
                # RealSense에서 프레임 획득
                color_frame, depth_frame = realsense_camera.get_frames()

                if color_frame is None:
                    await asyncio.sleep(0.1)
                    continue

                # 색상 이미지를 JPEG로 인코딩
                _, buffer = cv2.imencode('.jpg', color_frame)
                img_base64 = base64.b64encode(buffer).decode('utf-8')

                # 깊이 이미지도 시각화하여 전송 (선택사항)
                if depth_frame is not None:
                    depth_colormap = cv2.applyColorMap(
                        cv2.convertScaleAbs(depth_frame, alpha=0.03),
                        cv2.COLORMAP_JET
                    )
                    _, depth_buffer = cv2.imencode('.jpg', depth_colormap)
                    depth_base64 = base64.b64encode(depth_buffer).decode('utf-8')
                else:
                    depth_base64 = None

                # 프레임 전송
                message = {
                    "type": "frame",
                    "rgb_image": f"data:image/jpeg;base64,{img_base64}",
                    "timestamp": datetime.now().isoformat()
                }

                if depth_base64:
                    message["depth_image"] = f"data:image/jpeg;base64,{depth_base64}"

                await manager.send_personal_message(message, websocket)

                # FPS 제한 (15fps - 네트워크 부하 고려)
                await asyncio.sleep(1 / 15)

            except Exception as e:
                logger.error(f"프레임 전송 중 오류: {e}")
                logger.error(f"오류 타입: {type(e)}")
                await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("RealSense 웹소켓 연결 종료")
    except Exception as e:
        logger.error(f"RealSense 웹소켓 치명적 오류: {e}")
        manager.disconnect(websocket)

# 메인 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
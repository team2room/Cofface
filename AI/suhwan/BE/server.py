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
from qdrant_client import QdrantClient
from qdrant_client.http import models

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

# Qdrant 설정
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = "face_embeddings"
VECTOR_SIZE = 512  # InsightFace 임베딩 차원
SIMILARITY_THRESHOLD = 0.7  # 유사도 임계값


# 데이터 모델
class RegisterRequest(BaseModel):
    user_id: str
    face_images: Dict[str, str]  # 방향별 Base64 인코딩된 이미지


class VerifyRequest(BaseModel):
    rgb_image: str  # Base64 인코딩된 RGB 이미지
    liveness_result: Optional[Dict[str, Any]] = None  # 로컬에서 처리한 라이브니스 결과


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
        self.qdrant_client = None
        self.init_qdrant()
        self.init_models()

    def init_qdrant(self):
        """Qdrant 클라이언트 초기화 및 컬렉션 생성"""
        try:
            self.qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

            # 컬렉션이 이미 존재하는지 확인
            collections = self.qdrant_client.get_collections().collections
            collection_names = [collection.name for collection in collections]

            if COLLECTION_NAME not in collection_names:
                # 컬렉션 생성
                self.qdrant_client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=models.VectorParams(
                        size=VECTOR_SIZE,
                        distance=models.Distance.COSINE
                    )
                )
                logger.info(f"Qdrant 컬렉션 '{COLLECTION_NAME}' 생성 완료")
            else:
                logger.info(f"Qdrant 컬렉션 '{COLLECTION_NAME}' 이미 존재함")

        except Exception as e:
            logger.error(f"Qdrant 초기화 실패: {e}")
            raise

    def init_models(self):
        try:
            # InsightFace 얼굴 분석 모델 초기화
            self.face_app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
            self.face_app.prepare(ctx_id=0, det_size=(640, 640))
            logger.info("InsightFace 모델 초기화 완료")
        except Exception as e:
            logger.error(f"InsightFace 모델 초기화 실패: {e}")
            raise

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
            face = max(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]))
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

            # 기존 사용자 데이터가 있으면 삭제
            try:
                # 사용자 ID로 검색하여 삭제
                self.qdrant_client.delete(
                    collection_name=COLLECTION_NAME,
                    points_selector=models.FilterSelector(
                        filter=models.Filter(
                            must=[
                                models.FieldCondition(
                                    key="user_id",
                                    match=models.MatchValue(value=user_id)
                                )
                            ]
                        )
                    )
                )
                logger.info(f"사용자 {user_id}의 기존 임베딩 삭제 완료")
            except Exception as e:
                logger.warning(f"사용자 {user_id}의 기존 데이터 삭제 중 오류 (무시됨): {e}")

            # 각 방향별 이미지 처리
            for direction, base64_img in face_images.items():
                img = self.base64_to_image(base64_img)
                if img is None:
                    raise ValueError(f"{direction} 방향 이미지 디코딩 실패")

                embedding = self.extract_face_embedding(img)
                if embedding is None:
                    raise ValueError(f"{direction} 방향 얼굴 감지 실패")

                # Qdrant에 포인트 저장
                self.qdrant_client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=[
                        models.PointStruct(
                            id=str(uuid.uuid4()),  # UUID 형식으로 생성
                            vector=embedding.tolist(),
                            payload={
                                "user_id": user_id,
                                "direction": direction,
                                "timestamp": datetime.now().timestamp(),
                                "register_time": datetime.now().isoformat()
                            }
                        )
                    ]
                )
                logger.info(f"사용자 {user_id}의 {direction} 방향 임베딩 저장 완료")

            return {
                "status": "success",
                "message": f"사용자 {user_id} 등록 완료",
                "direction_count": len(face_images)
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

            # Qdrant를 사용하여 유사한 얼굴 검색
            search_result = self.qdrant_client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_embedding.tolist(),
                limit=5,  # 상위 5개 결과 조회
                score_threshold=SIMILARITY_THRESHOLD  # 유사도 임계값 (Cosine 거리)
            )

            if not search_result:
                logger.warning("일치하는 얼굴을 찾을 수 없음")
                processing_time = (datetime.now() - start_time).total_seconds()
                return {
                    "status": "failure",
                    "message": "일치하는 얼굴 없음",
                    "confidence": 0.0,
                    "processing_time": processing_time,
                    "liveness_result": liveness_result
                }

            # 사용자별 평균 유사도 계산
            user_scores = {}
            for result in search_result:
                user_id = result.payload.get("user_id")
                score = result.score

                if user_id not in user_scores:
                    user_scores[user_id] = {"count": 0, "total_score": 0.0}

                user_scores[user_id]["count"] += 1
                user_scores[user_id]["total_score"] += score

            # 가장 높은 평균 유사도를 가진 사용자 선택
            best_user_id = None
            best_avg_score = 0.0

            for user_id, data in user_scores.items():
                avg_score = data["total_score"] / data["count"]
                if avg_score > best_avg_score:
                    best_avg_score = avg_score
                    best_user_id = user_id

            processing_time = (datetime.now() - start_time).total_seconds()

            # 일치 결과 처리
            if best_avg_score > SIMILARITY_THRESHOLD:
                logger.info(f"인증 성공: 사용자 {best_user_id}, 유사도 {best_avg_score:.4f}")

                return {
                    "status": "success",
                    "user_id": best_user_id,
                    "confidence": float(best_avg_score),
                    "processing_time": processing_time,
                    "liveness_result": liveness_result
                }
            else:
                logger.info(f"인증 실패: 최대 유사도 {best_avg_score:.4f} (임계값: {SIMILARITY_THRESHOLD})")
                return {
                    "status": "failure",
                    "message": "일치하는 얼굴 없음",
                    "confidence": float(best_avg_score) if best_avg_score > 0 else 0.0,
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
        logger.info("얼굴 인식 모델 및 Qdrant 초기화 완료")
    except Exception as e:
        logger.error(f"얼굴 인식 모델 또는 Qdrant 초기화 실패: {e}")

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


# 등록된 사용자 목록 조회 엔드포인트
@app.get("/users")
async def list_users():
    """등록된 사용자 목록 조회"""
    try:
        if face_processor is None or face_processor.qdrant_client is None:
            raise HTTPException(status_code=500, detail="시스템이 초기화되지 않았습니다")

        # Qdrant에서 사용자 조회
        # 중복 제거를 위해 집합 사용
        user_ids = set()

        # 스크롤 API를 사용하여 모든 사용자 조회
        scroll_result = face_processor.qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            limit=100,
            with_payload=True,
            with_vectors=False
        )

        # 첫 페이지 처리
        points, next_page_offset = scroll_result

        for point in points:
            user_id = point.payload.get("user_id")
            if user_id:
                user_ids.add(user_id)

        # 다음 페이지가 있으면 스크롤 계속
        while next_page_offset:
            scroll_result = face_processor.qdrant_client.scroll(
                collection_name=COLLECTION_NAME,
                limit=100,
                offset=next_page_offset,
                with_payload=True,
                with_vectors=False
            )

            points, next_page_offset = scroll_result

            for point in points:
                user_id = point.payload.get("user_id")
                if user_id:
                    user_ids.add(user_id)

        return {"users": list(user_ids)}
    except Exception as e:
        logger.error(f"사용자 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 서버 상태 확인
@app.get("/health")
async def health_check():
    """서버 상태 및 모델 상태 확인"""
    user_count = 0
    try:
        if face_processor and face_processor.qdrant_client:
            # 사용자 수 조회 (대략적인 추정)
            user_ids = set()

            # 빠른 확인을 위해 최대 1000개만 확인
            scroll_result = face_processor.qdrant_client.scroll(
                collection_name=COLLECTION_NAME,
                limit=1000,
                with_payload=True,
                with_vectors=False
            )

            points, _ = scroll_result

            for point in points:
                user_id = point.payload.get("user_id")
                if user_id:
                    user_ids.add(user_id)

            user_count = len(user_ids)
    except Exception as e:
        logger.warning(f"사용자 수 조회 오류 (무시됨): {e}")

    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "type": "gpu_face_verification_server",
        "models_loaded": face_processor is not None,
        "qdrant_connected": face_processor and face_processor.qdrant_client is not None,
        "users_count": user_count,
        "device": str(face_processor.device) if face_processor else "unknown"
    }


# 메인 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8800, reload=False)
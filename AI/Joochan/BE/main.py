from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List
import numpy as np
import base64
import cv2
import os
import logging
from pathlib import Path
import uuid
from datetime import datetime

from insightface.app import FaceAnalysis
from insightface.model_zoo import get_model
from qdrant_client import QdrantClient
from qdrant_client.http import models

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

# 앱 초기화
app = FastAPI(title="안면인식 백엔드 API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 설정
VECTOR_DIMENSION = 512  # InsightFace 임베딩 차원
COLLECTION_NAME = "face_vectors"
REQUIRED_FACE_DIRECTIONS = ["front", "left", "right", "up", "down"]
SIMILARITY_THRESHOLD = 0.6  # 유사도 임계값

# 데이터 모델
class FaceRegistrationRequest(BaseModel):
    user_id: str
    face_images: Dict[str, str]  # 방향별 Base64 인코딩된 이미지

class VerificationResponse(BaseModel):
    user_id: Optional[str]
    confidence: float
    matched: bool
    processing_time: float

# InsightFace 모델을 관리하는 클래스
class FaceRecognitionSystem:
    def __init__(self):
        self.face_analyzer = None
        self.face_recognizer = None
        self.db_client = None
        self.is_initialized = False
        
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
            # InsightFace 모델 초기화 (GPU 사용)
            logger.info(f"모델 디렉토리: {self.models_dir}")
            self.face_analyzer = FaceAnalysis(
                name="buffalo_l",
                root=str(self.models_dir),
                providers=['CUDAExecutionProvider', 'CPUExecutionProvider'],
                allowed_modules=['detection', 'recognition']
            )
            
            # face_analyzer 준비 (이 과정에서 모델을 자동으로 다운로드)
            logger.info("FaceAnalysis 모델 준비 중...")
            self.face_analyzer.prepare(ctx_id=0, det_size=(640, 640))
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
                self.face_recognizer.prepare(ctx_id=0)
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
    img_bytes = base64.b64decode(base64_str.split(',')[1] if ',' in base64_str else base64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

# 시스템 인스턴스 생성
face_system = FaceRecognitionSystem()

# 시스템 초기화 미들웨어
@app.on_event("startup")
async def startup_event():
    await face_system.initialize()

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

# API 엔드포인트: 얼굴 인증
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

# 서버 상태 확인
@app.get("/health")
async def health_check():
    """서버 상태 및 모델 상태 확인"""
    import torch
    
    return {
        "status": "healthy",
        "initialized": face_system.is_initialized,
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None",
        "timestamp": datetime.now().isoformat()
    }

# 메인 실행
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
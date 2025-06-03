# main.py - 개선된 검색 방식
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from datetime import datetime
import logging, json, os, uuid
from contextlib import asynccontextmanager
from typing import Dict, Optional, List, Any

import cv2
import torch
import base64
import numpy as np

from insightface.app import FaceAnalysis
from insightface.data import get_image as ins_get_image

from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

# AES 암호화를 위한 추가 import
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import secrets

load_dotenv()

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
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "face_embeddings_encript"
VECTOR_SIZE = 512  # InsightFace 임베딩 차원
SIMILARITY_THRESHOLD = 0.7  # 유사도 임계값

# 암호화 설정
ENCRYPTION_PASSWORD = os.getenv("ENCRYPTION_PASSWORD", "CANNOT_FIND_ENV_FILE")


class AESEncryption:
    """AES-256 암호화/복호화 클래스"""
    
    def __init__(self, password: str):
        self.password = password.encode()
    
    def _derive_key(self, salt: bytes) -> bytes:
        """비밀번호와 솔트를 사용하여 AES-256 키 생성"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # AES-256
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(self.password)
    
    def encrypt(self, plaintext: str) -> str:
        """문자열을 AES-256으로 암호화하고 Base64로 인코딩"""
        try:
            # 솔트와 IV 생성
            salt = secrets.token_bytes(16)
            iv = secrets.token_bytes(16)
            
            # 키 생성
            key = self._derive_key(salt)
            
            # 암호화
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
            encryptor = cipher.encryptor()
            
            # 패딩 추가 (PKCS7)
            plaintext_bytes = plaintext.encode('utf-8')
            padding_length = 16 - (len(plaintext_bytes) % 16)
            padded_plaintext = plaintext_bytes + bytes([padding_length] * padding_length)
            
            ciphertext = encryptor.update(padded_plaintext) + encryptor.finalize()
            
            # 솔트 + IV + 암호문을 결합하여 Base64로 인코딩
            encrypted_data = salt + iv + ciphertext
            return base64.b64encode(encrypted_data).decode('utf-8')
            
        except Exception as e:
            logger.error(f"암호화 실패: {e}")
            raise
    
    def decrypt(self, encrypted_data: str) -> str:
        """Base64로 인코딩된 암호문을 복호화"""
        try:
            # Base64 디코딩
            encrypted_bytes = base64.b64decode(encrypted_data.encode('utf-8'))
            
            # 솔트, IV, 암호문 분리
            salt = encrypted_bytes[:16]
            iv = encrypted_bytes[16:32]
            ciphertext = encrypted_bytes[32:]
            
            # 키 생성
            key = self._derive_key(salt)
            
            # 복호화
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
            decryptor = cipher.decryptor()
            
            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            
            # 패딩 제거
            padding_length = padded_plaintext[-1]
            plaintext = padded_plaintext[:-padding_length]
            
            return plaintext.decode('utf-8')
            
        except Exception as e:
            logger.error(f"복호화 실패: {e}")
            raise


# 데이터 모델
class RegisterRequest(BaseModel):
    phone_number: str
    name: str
    face_images: Dict[str, str]  # 방향별 Base64 인코딩된 이미지


class VerifyRequest(BaseModel):
    rgb_image: str  # Base64 인코딩된 RGB 이미지
    rgb_images: Optional[List[str]] = None  # 여러 이미지를 리스트로 받음
    liveness_result: Optional[Dict[str, Any]] = None  # 로컬에서 처리한 라이브니스 결과


class CheckRegistrationRequest(BaseModel):
    phone_number: str
    name: str

class DeleteUserRequest(BaseModel):
    phone_number: str
    name: str


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
        
        # AES 암호화 인스턴스 생성
        self.encryption = AESEncryption(ENCRYPTION_PASSWORD)
        logger.info("AES-256 암호화 모듈 초기화 완료")
        
        self.init_qdrant()
        self.init_models()

    def _find_user_points_by_plaintext(self, phone_number: str, name: str) -> List:
        """평문 전화번호와 이름으로 사용자의 모든 포인트를 찾기 (서버에서 복호화하여 검색)"""
        try:
            # 모든 포인트를 가져와서 복호화하여 비교
            all_points = []
            
            # 스크롤을 사용하여 모든 데이터 조회
            scroll_result = self.qdrant_client.scroll(
                collection_name=COLLECTION_NAME,
                limit=100,
                with_payload=True,
                with_vectors=False
            )
            
            points, next_page_offset = scroll_result
            all_points.extend(points)
            
            # 다음 페이지가 있으면 계속 조회
            while next_page_offset:
                scroll_result = self.qdrant_client.scroll(
                    collection_name=COLLECTION_NAME,
                    limit=100,
                    offset=next_page_offset,
                    with_payload=True,
                    with_vectors=False
                )
                points, next_page_offset = scroll_result
                all_points.extend(points)
            
            # 복호화하여 일치하는 사용자 찾기
            matching_points = []
            for point in all_points:
                try:
                    encrypted_phone = point.payload.get("encrypted_phone_number")
                    encrypted_name = point.payload.get("encrypted_name")
                    
                    if encrypted_phone and encrypted_name:
                        decrypted_phone = self.encryption.decrypt(encrypted_phone)
                        decrypted_name = self.encryption.decrypt(encrypted_name)
                        
                        if decrypted_phone == phone_number and decrypted_name == name:
                            matching_points.append(point)
                except Exception as decrypt_error:
                    # 복호화 실패 시 건너뛰기 (다른 암호화 키로 암호화된 데이터일 수 있음)
                    continue
            
            return matching_points
            
        except Exception as e:
            logger.error(f"사용자 검색 오류: {e}")
            return []

    def init_qdrant(self):
        """Qdrant 클라이언트 초기화 및 컬렉션 생성 (SSL 문제 해결)"""
        try:
            # SSL 문제 해결을 위한 여러 연결 방법 시도
            connection_methods = [
                # 방법 1: HTTP 명시적 사용 (가장 안전)
                {"https": False},
                # 방법 2: HTTPS + SSL 검증 비활성화
                {"https": True, "verify": False},
                # 방법 3: 기본 설정
                {}
            ]
            
            for i, extra_params in enumerate(connection_methods):
                try:
                    logger.info(f"Qdrant 연결 방법 {i+1} 시도 중...")
                    self.qdrant_client = QdrantClient(
                        host=QDRANT_HOST, 
                        port=QDRANT_PORT, 
                        api_key=QDRANT_API_KEY,
                        **extra_params
                    )
                    
                    # 연결 테스트
                    collections = self.qdrant_client.get_collections()
                    logger.info(f"✅ Qdrant 연결 성공 (방법 {i+1})")
                    break
                    
                except Exception as method_error:
                    logger.warning(f"연결 방법 {i+1} 실패: {str(method_error)[:100]}...")
                    if i == len(connection_methods) - 1:  # 마지막 방법도 실패
                        raise method_error
                    continue

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

    def register_face(self, phone_number, name, face_images):
        """여러 방향의 얼굴 이미지를 등록 (평문으로 받아서 서버에서 암호화)"""
        try:
            # 필요한 방향 확인
            required_directions = ['front', 'left', 'right', 'up', 'down']
            for direction in required_directions:
                if direction not in face_images:
                    raise ValueError(f"{direction} 방향 이미지가 누락됨")

            # 기존 사용자 데이터가 있으면 삭제 (평문으로 검색)
            try:
                existing_points = self._find_user_points_by_plaintext(phone_number, name)
                if existing_points:
                    point_ids = [point.id for point in existing_points]
                    self.qdrant_client.delete(
                        collection_name=COLLECTION_NAME,
                        points_selector=models.PointIdsList(points=point_ids)
                    )
                    logger.info(f"사용자 {name}({phone_number})의 기존 임베딩 {len(point_ids)}개 삭제 완료")
            except Exception as e:
                logger.warning(f"사용자 {name}({phone_number})의 기존 데이터 삭제 중 오류 (무시됨): {e}")

            # 사용자 데이터 암호화 (등록 시에만 암호화)
            encrypted_phone = self.encryption.encrypt(phone_number)
            encrypted_name = self.encryption.encrypt(name)

            # 각 방향별 이미지 처리
            for direction, base64_img in face_images.items():
                img = self.base64_to_image(base64_img)
                if img is None:
                    raise ValueError(f"{direction} 방향 이미지 디코딩 실패")

                embedding = self.extract_face_embedding(img)
                if embedding is None:
                    raise ValueError(f"{direction} 방향 얼굴 감지 실패")

                # Qdrant에 포인트 저장 (암호화된 데이터)
                self.qdrant_client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=[
                        models.PointStruct(
                            id=str(uuid.uuid4()),  # UUID 형식으로 생성
                            vector=embedding.tolist(),
                            payload={
                                "encrypted_phone_number": encrypted_phone,
                                "encrypted_name": encrypted_name,
                                "direction": direction,  # 방향은 민감정보가 아니므로 평문 저장
                                "timestamp": datetime.now().timestamp(),
                                "register_time": datetime.now().isoformat()
                            }
                        )
                    ]
                )
                logger.info(f"사용자 {name}({phone_number})의 {direction} 방향 임베딩 저장 완료 (암호화)")

            return {
                "status": "success",
                "message": f"사용자 {name}({phone_number}) 등록 완료",
                "direction_count": len(face_images)
            }
        except Exception as e:
            logger.error(f"얼굴 등록 오류: {e}")
            raise

    def check_registration(self, phone_number, name):
        """사용자 등록 여부 확인 (평문으로 받아서 서버에서 검색)"""
        try:
            # 평문으로 사용자 검색
            matching_points = self._find_user_points_by_plaintext(phone_number, name)
            is_registered = len(matching_points) > 0

            if is_registered:
                logger.info(f"사용자 {name}({phone_number}) 등록 확인: 등록된 사용자")
                
                # 등록된 방향 확인
                all_directions = set()
                for point in matching_points:
                    if "direction" in point.payload:
                        all_directions.add(point.payload["direction"])
                
                return {
                    "status": "success",
                    "is_registered": True,
                    "message": f"사용자 {name}({phone_number})는 등록된 사용자입니다.",
                    "registered_directions": list(all_directions),
                    "registration_time": matching_points[0].payload.get("register_time") if matching_points else None
                }
            else:
                logger.info(f"사용자 {name}({phone_number}) 등록 확인: 미등록 사용자")
                return {
                    "status": "success",
                    "is_registered": False,
                    "message": f"사용자 {name}({phone_number})는 등록되지 않은 사용자입니다."
                }
        except Exception as e:
            logger.error(f"사용자 등록 확인 오류: {e}")
            return {
                "status": "error",
                "message": f"사용자 등록 확인 중 오류 발생: {str(e)}"
            }

    def delete_user(self, phone_number, name):
        """등록된 사용자 데이터 삭제 (평문으로 받아서 서버에서 검색 후 삭제)"""
        try:
            # 사용자가 등록되어 있는지 먼저 확인
            matching_points = self._find_user_points_by_plaintext(phone_number, name)
            
            if not matching_points:
                return {
                    "status": "error",
                    "message": f"사용자 {name}({phone_number})는 등록되어 있지 않습니다."
                }
            
            # 포인트 ID 수집하여 삭제
            point_ids = [point.id for point in matching_points]
            self.qdrant_client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=models.PointIdsList(points=point_ids)
            )
            
            logger.info(f"사용자 {name}({phone_number})의 모든 얼굴 데이터 {len(point_ids)}개 삭제 완료")
            return {
                "status": "success",
                "message": f"사용자 {name}({phone_number})의 얼굴 데이터가 성공적으로 삭제되었습니다."
            }
        except Exception as e:
            logger.error(f"사용자 삭제 오류: {e}")
            return {
                "status": "error",
                "message": f"사용자 삭제 중 오류 발생: {str(e)}"
            }

    def verify_face(self, rgb_image, liveness_result=None):
        """얼굴 인증 수행 (모든 포인트를 복호화하여 검색)"""
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

            # 사용자별 평균 유사도 계산 (복호화 적용)
            user_scores = {}
            for result in search_result:
                encrypted_phone = result.payload.get("encrypted_phone_number")
                encrypted_name = result.payload.get("encrypted_name")
                
                # 복호화
                try:
                    phone_number = self.encryption.decrypt(encrypted_phone)
                    name = self.encryption.decrypt(encrypted_name)
                    user_key = f"{phone_number}_{name}"
                    score = result.score

                    if user_key not in user_scores:
                        user_scores[user_key] = {
                            "count": 0, 
                            "total_score": 0.0, 
                            "phone_number": phone_number, 
                            "name": name
                        }

                    user_scores[user_key]["count"] += 1
                    user_scores[user_key]["total_score"] += score
                except Exception as decrypt_error:
                    logger.error(f"사용자 데이터 복호화 실패: {decrypt_error}")
                    continue

            # 가장 높은 평균 유사도를 가진 사용자 선택
            best_user_key = None
            best_avg_score = 0.0

            for user_key, data in user_scores.items():
                avg_score = data["total_score"] / data["count"]
                if avg_score > best_avg_score:
                    best_avg_score = avg_score
                    best_user_key = user_key

            processing_time = (datetime.now() - start_time).total_seconds()

            # 일치 결과 처리
            if best_avg_score > SIMILARITY_THRESHOLD and best_user_key:
                best_user_data = user_scores[best_user_key]
                phone_number = best_user_data["phone_number"]
                name = best_user_data["name"]
                
                logger.info(f"인증 성공: 사용자 {name}({phone_number}), 유사도 {best_avg_score:.4f}")

                return {
                    "status": "success",
                    "phone_number": phone_number,
                    "name": name,
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
    
    def verify_multiple_faces(self, rgb_images, liveness_result=None):
        """여러 얼굴 이미지를 인증하고 결과를 종합"""
        if not rgb_images or len(rgb_images) == 0:
            return {
                "status": "error",
                "message": "이미지가 제공되지 않았습니다."
            }

        # 이미지 개수 제한 (최대 10개)
        max_images = 10
        if len(rgb_images) > max_images:
            logger.warning(f"요청된 이미지 수가 너무 많습니다. 처음 {max_images}개만 처리합니다.")
            rgb_images = rgb_images[:max_images]

        start_time = datetime.now()
        all_results = []

        # 각 이미지에 대해 개별 인증 수행
        for i, rgb_image in enumerate(rgb_images):
            try:
                # 이미지 디코딩
                img = self.base64_to_image(rgb_image)
                if img is None:
                    logger.warning(f"이미지 {i+1}: 디코딩 실패")
                    continue

                # 얼굴 임베딩 추출
                query_embedding = self.extract_face_embedding(img)
                if query_embedding is None:
                    logger.warning(f"이미지 {i+1}: 얼굴을 찾을 수 없음")
                    continue

                # Qdrant 검색
                search_result = self.qdrant_client.search(
                    collection_name=COLLECTION_NAME,
                    query_vector=query_embedding.tolist(),
                    limit=5,
                    score_threshold=SIMILARITY_THRESHOLD
                )

                if not search_result:
                    logger.warning(f"이미지 {i+1}: 일치하는 얼굴이 없습니다.")
                    continue

                # 사용자별 평균 유사도 계산 (복호화 적용)
                user_scores = {}
                for result in search_result:
                    encrypted_phone = result.payload.get("encrypted_phone_number")
                    encrypted_name = result.payload.get("encrypted_name")
                    
                    try:
                        phone_number = self.encryption.decrypt(encrypted_phone)
                        name = self.encryption.decrypt(encrypted_name)
                        user_key = f"{phone_number}_{name}"
                        score = result.score

                        if user_key not in user_scores:
                            user_scores[user_key] = {
                                "count": 0, 
                                "total_score": 0.0, 
                                "phone_number": phone_number, 
                                "name": name
                            }

                        user_scores[user_key]["count"] += 1
                        user_scores[user_key]["total_score"] += score
                    except Exception as decrypt_error:
                        logger.error(f"이미지 {i+1} 사용자 데이터 복호화 실패: {decrypt_error}")
                        continue

                # 가장 높은 평균 유사도를 가진 사용자 선택
                best_user_key = None
                best_avg_score = 0.0

                for user_key, data in user_scores.items():
                    avg_score = data["total_score"] / data["count"]
                    if avg_score > best_avg_score:
                        best_avg_score = avg_score
                        best_user_key = user_key

                # 일치 결과가 있다면 추가
                if best_user_key and best_avg_score > SIMILARITY_THRESHOLD:
                    best_user_data = user_scores[best_user_key]
                    all_results.append({
                        "phone_number": best_user_data["phone_number"],
                        "name": best_user_data["name"],
                        "confidence": float(best_avg_score),
                        "image_index": i
                    })

            except Exception as e:
                logger.error(f"이미지 {i+1} 처리 중 오류: {e}")
                # 개별 이미지 오류는 건너뛰고 다음 이미지 처리

        # 모든 이미지 처리 완료 후 결과 종합
        processing_time = (datetime.now() - start_time).total_seconds()

        if not all_results:
            return {
                "status": "failure",
                "message": "모든 이미지에서 일치하는 얼굴을 찾을 수 없음",
                "confidence": 0.0,
                "processing_time": processing_time,
                "liveness_result": liveness_result
            }

        # 결과를 사용자별로 그룹화
        user_votes = {}
        for result in all_results:
            user_key = f"{result['phone_number']}_{result['name']}"
            if user_key not in user_votes:
                user_votes[user_key] = {
                    "phone_number": result["phone_number"],
                    "name": result["name"],
                    "votes": 0,
                    "confidences": [],
                    "image_indices": []
                }
            
            user_votes[user_key]["votes"] += 1
            user_votes[user_key]["confidences"].append(result["confidence"])
            user_votes[user_key]["image_indices"].append(result["image_index"])

        # 가장 많은 표를 얻은 사용자 선택
        best_user = None
        max_votes = 0
        for user_data in user_votes.values():
            if user_data["votes"] > max_votes:
                max_votes = user_data["votes"]
                best_user = user_data
            elif user_data["votes"] == max_votes:
                # 표가 같다면 평균 신뢰도로 판단
                current_avg_confidence = sum(best_user["confidences"]) / len(best_user["confidences"])
                new_avg_confidence = sum(user_data["confidences"]) / len(user_data["confidences"])
                if new_avg_confidence > current_avg_confidence:
                    best_user = user_data

        # 최종 결과 구성
        if best_user:
            avg_confidence = sum(best_user["confidences"]) / len(best_user["confidences"])
            logger.info(f"다중 인증 성공: 사용자 {best_user['name']}({best_user['phone_number']}), "
                    f"일치 이미지 수: {best_user['votes']}/{len(rgb_images)}, "
                    f"평균 유사도: {avg_confidence:.4f}")
            
            return {
                "status": "success",
                "phone_number": best_user["phone_number"],
                "name": best_user["name"],
                "confidence": float(avg_confidence),
                "matched_images_count": best_user["votes"],
                "processing_time": processing_time,
                "liveness_result": liveness_result
            }
        else:
            return {
                "status": "failure",
                "message": "일치하는 얼굴을 찾을 수 없음",
                "confidence": 0.0,
                "processing_time": processing_time,
                "liveness_result": liveness_result
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
        logger.info("얼굴 인식 모델, Qdrant 및 AES-256 암호화 초기화 완료")
    except Exception as e:
        logger.error(f"얼굴 인식 모델, Qdrant 또는 암호화 모듈 초기화 실패: {e}")

    yield


# 앱 초기화
app = FastAPI(title="얼굴 인증 GPU 서버 (AES-256 암호화 + 서버측 검색)", lifespan=lifespan)

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
    """여러 방향에서 촬영한 얼굴 이미지를 등록 (평문으로 받아서 서버에서 암호화)"""
    try:
        if face_processor is None:
            raise HTTPException(status_code=500, detail="얼굴 인식 모델이 초기화되지 않았습니다")

        result = face_processor.register_face(request.phone_number, request.name, request.face_images)
        return result
    except ValueError as e:
        logger.error(f"등록 값 오류: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"등록 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# API 엔드포인트: 등록 여부 확인
@app.post("/check-registration")
async def check_registration(request: CheckRegistrationRequest):
    """사용자의 얼굴 등록 여부 확인 (평문으로 받아서 서버에서 검색)"""
    try:
        if face_processor is None:
            raise HTTPException(status_code=500, detail="얼굴 인식 모델이 초기화되지 않았습니다")

        result = face_processor.check_registration(request.phone_number, request.name)
        return result
    except Exception as e:
        logger.error(f"등록 확인 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# API 엔드포인트: 등록된 얼굴 삭제
@app.post("/delete-user", status_code=200)
async def delete_user(request: DeleteUserRequest):
    """등록된 사용자의 얼굴 데이터 삭제 (평문으로 받아서 서버에서 검색 후 삭제)"""
    try:
        if face_processor is None:
            return {
                "status": "error",
                "message": "얼굴 인식 모델이 초기화되지 않았습니다"
            }

        result = face_processor.delete_user(request.phone_number, request.name)
        
        from fastapi import Response
        response_code = 200 if result.get("status") == "success" else 404
        
        return Response(
            content=json.dumps(result),
            media_type="application/json", 
            status_code=response_code
        )
    except Exception as e:
        logger.error(f"사용자 삭제 처리 오류: {e}")
        return {
            "status": "error",
            "message": f"사용자 삭제 중 오류 발생: {str(e)}"
        }


# API 엔드포인트: 얼굴 인증
@app.post("/verify")
async def verify(request: VerifyRequest):
    """단일 또는 다중 얼굴 이미지로 인증 수행"""
    try:
        if face_processor is None:
            raise HTTPException(status_code=500, detail="얼굴 인식 모델이 초기화되지 않았습니다")

        # 다중 이미지 확인
        if request.rgb_images and len(request.rgb_images) > 0:
            result = face_processor.verify_multiple_faces(request.rgb_images, request.liveness_result)
            return result
        # 단일 이미지 처리 (기존 호환성)
        elif request.rgb_image:
            result = face_processor.verify_face(request.rgb_image, request.liveness_result)
            return result
        else:
            raise ValueError("이미지가 제공되지 않았습니다")
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
                
                # 결과 전송
                await connection_manager.send_personal_message(result, websocket)

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
    """등록된 사용자 목록 조회 (복호화 적용)"""
    try:
        if face_processor is None or face_processor.qdrant_client is None:
            raise HTTPException(status_code=500, detail="시스템이 초기화되지 않았습니다")

        # Qdrant에서 사용자 조회
        # 중복 제거를 위해 집합 사용
        users = set()

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
            encrypted_phone = point.payload.get("encrypted_phone_number")
            encrypted_name = point.payload.get("encrypted_name")
            if encrypted_phone and encrypted_name:
                try:
                    # 복호화
                    phone_number = face_processor.encryption.decrypt(encrypted_phone)
                    name = face_processor.encryption.decrypt(encrypted_name)
                    users.add(f"{phone_number}_{name}")
                except Exception as decrypt_error:
                    logger.error(f"사용자 데이터 복호화 실패: {decrypt_error}")
                    continue

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
                encrypted_phone = point.payload.get("encrypted_phone_number")
                encrypted_name = point.payload.get("encrypted_name")
                if encrypted_phone and encrypted_name:
                    try:
                        # 복호화
                        phone_number = face_processor.encryption.decrypt(encrypted_phone)
                        name = face_processor.encryption.decrypt(encrypted_name)
                        users.add(f"{phone_number}_{name}")
                    except Exception as decrypt_error:
                        logger.error(f"사용자 데이터 복호화 실패: {decrypt_error}")
                        continue

        # 사용자 정보 분리 및 응답 형식 작성
        user_list = []
        for user in users:
            phone_number, name = user.split('_', 1)
            user_list.append({
                "phone_number": phone_number,
                "name": name
            })

        return {"users": user_list}
    except Exception as e:
        logger.error(f"사용자 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# 서버 상태 확인
@app.get("/health")
async def health_check():
    """서버 상태 및 모델 상태 확인"""
    return {
        "status": "healthy",
        "initialized": face_processor is not None,
        "encryption_enabled": True,
        "server_side_search": True,
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None",
        "timestamp": datetime.now().isoformat()
    }


# 메인 실행
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
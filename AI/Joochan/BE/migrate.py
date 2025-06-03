# migrate.py
import os
import logging
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv

from qdrant_client import QdrantClient
from qdrant_client.http import models

# AES 암호화를 위한 import
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import secrets
import base64

load_dotenv()

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f"migration_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("migration")


class AESEncryption:
    """AES-256 암호화/복호화 클래스"""
    
    def __init__(self, password: str):
        self.password = password.encode()
    
    def _derive_key(self, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(self.password)
    
    def encrypt(self, plaintext: str) -> str:
        try:
            salt = secrets.token_bytes(16)
            iv = secrets.token_bytes(16)
            key = self._derive_key(salt)
            
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
            encryptor = cipher.encryptor()
            
            plaintext_bytes = plaintext.encode('utf-8')
            padding_length = 16 - (len(plaintext_bytes) % 16)
            padded_plaintext = plaintext_bytes + bytes([padding_length] * padding_length)
            
            ciphertext = encryptor.update(padded_plaintext) + encryptor.finalize()
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


class FixedDataMigrator:
    def __init__(self):
        # 환경 설정
        self.QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
        self.QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
        self.QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
        self.COLLECTION_NAME = "face_embeddings"
        self.ENCRYPTION_PASSWORD = os.getenv("ENCRYPTION_PASSWORD")
        
        if not self.ENCRYPTION_PASSWORD:
            raise ValueError("ENCRYPTION_PASSWORD 환경 변수가 설정되지 않았습니다!")
        
        # 연결 문제 해결된 클라이언트 생성
        self.client = self._create_robust_client()
        self.encryption = AESEncryption(self.ENCRYPTION_PASSWORD)
        
        logger.info("마이그레이션 도구 초기화 완료")

    def _create_robust_client(self):
        """여러 방법을 시도하여 Qdrant 클라이언트 생성"""
        
        connection_methods = [
            # 방법 1: HTTP 명시적 사용
            {
                "name": "HTTP 연결",
                "params": {
                    "host": self.QDRANT_HOST,
                    "port": self.QDRANT_PORT,
                    "api_key": self.QDRANT_API_KEY,
                    "https": False
                }
            },
            # 방법 2: HTTPS, SSL 검증 비활성화
            {
                "name": "HTTPS 연결 (SSL 검증 비활성화)",
                "params": {
                    "host": self.QDRANT_HOST,
                    "port": self.QDRANT_PORT,
                    "api_key": self.QDRANT_API_KEY,
                    "https": True,
                    "verify": False
                }
            },
            # 방법 3: URL 직접 지정 (HTTP)
            {
                "name": "HTTP URL 연결",
                "params": {
                    "url": f"http://{self.QDRANT_HOST}:{self.QDRANT_PORT}",
                    "api_key": self.QDRANT_API_KEY
                }
            },
            # 방법 4: URL 직접 지정 (HTTPS, SSL 검증 비활성화)
            {
                "name": "HTTPS URL 연결 (SSL 검증 비활성화)",
                "params": {
                    "url": f"https://{self.QDRANT_HOST}:{self.QDRANT_PORT}",
                    "api_key": self.QDRANT_API_KEY,
                    "verify": False
                }
            },
            # 방법 5: 기본 설정
            {
                "name": "기본 연결",
                "params": {
                    "host": self.QDRANT_HOST,
                    "port": self.QDRANT_PORT,
                    "api_key": self.QDRANT_API_KEY
                }
            }
        ]
        
        for method in connection_methods:
            try:
                logger.info(f"🔄 {method['name']} 시도 중...")
                client = QdrantClient(**method['params'])
                
                # 연결 테스트
                collections = client.get_collections()
                logger.info(f"✅ {method['name']} 성공!")
                return client
                
            except Exception as e:
                logger.warning(f"❌ {method['name']} 실패: {str(e)[:100]}...")
                continue
        
        raise ConnectionError("모든 연결 방법이 실패했습니다. Qdrant 서버 상태를 확인하세요.")

    def _get_all_points(self) -> List:
        """모든 포인트 조회 (연결 문제 해결)"""
        all_points = []
        
        try:
            logger.info("데이터 조회 시작...")
            
            # 컬렉션 존재 여부 확인
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.COLLECTION_NAME not in collection_names:
                logger.warning(f"컬렉션 '{self.COLLECTION_NAME}'이 존재하지 않습니다.")
                logger.info(f"사용 가능한 컬렉션: {collection_names}")
                return []
            
            # 스크롤을 사용하여 모든 데이터 조회
            scroll_result = self.client.scroll(
                collection_name=self.COLLECTION_NAME,
                limit=100,
                with_payload=True,
                with_vectors=True
            )
            
            points, next_page_offset = scroll_result
            all_points.extend(points)
            logger.info(f"첫 페이지: {len(points)}개 포인트 조회")
            
            # 다음 페이지가 있으면 계속 조회
            page_num = 2
            while next_page_offset:
                scroll_result = self.client.scroll(
                    collection_name=self.COLLECTION_NAME,
                    limit=100,
                    offset=next_page_offset,
                    with_payload=True,
                    with_vectors=True
                )
                points, next_page_offset = scroll_result
                all_points.extend(points)
                logger.info(f"{page_num}페이지: {len(points)}개 포인트 조회")
                page_num += 1
            
            logger.info(f"총 {len(all_points)}개 포인트 조회 완료")
            return all_points
            
        except Exception as e:
            logger.error(f"데이터 조회 실패: {e}")
            raise

    def analyze_data(self) -> Dict[str, Any]:
        """기존 데이터 분석"""
        try:
            all_points = self._get_all_points()
            
            analysis = {
                "total_points": len(all_points),
                "encrypted_points": 0,
                "unencrypted_points": 0,
                "users": set(),
                "sample_payloads": []
            }
            
            for i, point in enumerate(all_points):
                payload = point.payload
                
                # 암호화 여부 확인
                if "encrypted_phone_number" in payload and "encrypted_name" in payload:
                    analysis["encrypted_points"] += 1
                elif "phone_number" in payload and "name" in payload:
                    analysis["unencrypted_points"] += 1
                    # 사용자 정보 수집
                    user_key = f"{payload['phone_number']}_{payload['name']}"
                    analysis["users"].add(user_key)
                
                # 처음 5개 샘플 저장
                if i < 5:
                    analysis["sample_payloads"].append({
                        "id": str(point.id),
                        "payload_keys": list(payload.keys())
                    })
            
            analysis["users"] = list(analysis["users"])
            
            logger.info(f"데이터 분석 완료:")
            logger.info(f"  - 총 포인트: {analysis['total_points']}")
            logger.info(f"  - 암호화된 포인트: {analysis['encrypted_points']}")
            logger.info(f"  - 비암호화된 포인트: {analysis['unencrypted_points']}")
            logger.info(f"  - 고유 사용자: {len(analysis['users'])}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"데이터 분석 실패: {e}")
            raise

    def backup_collection(self) -> str:
        """컬렉션 백업"""
        try:
            backup_name = f"{self.COLLECTION_NAME}_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            all_points = self._get_all_points()
            
            import json
            backup_file = f"{backup_name}.json"
            
            backup_data = {
                "collection_name": self.COLLECTION_NAME,
                "backup_time": datetime.now().isoformat(),
                "total_points": len(all_points),
                "points": []
            }
            
            for point in all_points:
                backup_data["points"].append({
                    "id": str(point.id),
                    "vector": point.vector,
                    "payload": point.payload
                })
            
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"백업 완료: {backup_file} ({len(all_points)}개 포인트)")
            return backup_file
            
        except Exception as e:
            logger.error(f"백업 실패: {e}")
            raise

    def migrate_data(self, dry_run: bool = True) -> Dict[str, Any]:
        """데이터 마이그레이션 실행"""
        try:
            all_points = self._get_all_points()
            
            migration_stats = {
                "processed": 0,
                "migrated": 0,
                "skipped": 0,
                "errors": 0,
                "error_details": []
            }
            
            migrated_points = []
            
            for point in all_points:
                migration_stats["processed"] += 1
                payload = point.payload
                
                try:
                    # 이미 암호화된 데이터인지 확인
                    if "encrypted_phone_number" in payload and "encrypted_name" in payload:
                        logger.debug(f"포인트 {point.id}: 이미 암호화됨, 건너뛰기")
                        migration_stats["skipped"] += 1
                        continue
                    
                    # 비암호화된 데이터인지 확인
                    if "phone_number" not in payload or "name" not in payload:
                        logger.warning(f"포인트 {point.id}: phone_number 또는 name 필드가 없음, 건너뛰기")
                        migration_stats["skipped"] += 1
                        continue
                    
                    # 암호화 수행
                    phone_number = payload["phone_number"]
                    name = payload["name"]
                    
                    encrypted_phone = self.encryption.encrypt(phone_number)
                    encrypted_name = self.encryption.encrypt(name)
                    
                    # 새로운 payload 생성
                    new_payload = payload.copy()
                    new_payload["encrypted_phone_number"] = encrypted_phone
                    new_payload["encrypted_name"] = encrypted_name
                    
                    # 기존 평문 필드 제거
                    del new_payload["phone_number"]
                    del new_payload["name"]
                    
                    # 마이그레이션 시간 추가
                    new_payload["migration_time"] = datetime.now().isoformat()
                    
                    # 마이그레이션된 포인트 생성
                    migrated_point = models.PointStruct(
                        id=point.id,
                        vector=point.vector,
                        payload=new_payload
                    )
                    
                    migrated_points.append(migrated_point)
                    migration_stats["migrated"] += 1
                    
                    logger.debug(f"포인트 {point.id}: {name}({phone_number}) 마이그레이션 준비 완료")
                    
                except Exception as point_error:
                    migration_stats["errors"] += 1
                    error_msg = f"포인트 {point.id} 처리 중 오류: {str(point_error)}"
                    migration_stats["error_details"].append(error_msg)
                    logger.error(error_msg)
                    continue
            
            # Dry run이 아닌 경우에만 실제 업데이트 수행
            if not dry_run and migrated_points:
                logger.info(f"실제 마이그레이션 시작: {len(migrated_points)}개 포인트")
                
                # 배치 단위로 업데이트
                batch_size = 50
                for i in range(0, len(migrated_points), batch_size):
                    batch = migrated_points[i:i + batch_size]
                    
                    try:
                        self.client.upsert(
                            collection_name=self.COLLECTION_NAME,
                            points=batch
                        )
                        logger.info(f"배치 {i//batch_size + 1}: {len(batch)}개 포인트 업데이트 완료")
                    except Exception as batch_error:
                        logger.error(f"배치 {i//batch_size + 1} 업데이트 실패: {batch_error}")
                        migration_stats["errors"] += len(batch)
                
                logger.info("마이그레이션 완료!")
            
            elif dry_run:
                logger.info("DRY RUN 모드: 실제 데이터는 변경되지 않았습니다.")
            
            # 결과 요약
            logger.info("마이그레이션 통계:")
            logger.info(f"  - 처리된 포인트: {migration_stats['processed']}")
            logger.info(f"  - 마이그레이션된 포인트: {migration_stats['migrated']}")
            logger.info(f"  - 건너뛴 포인트: {migration_stats['skipped']}")
            logger.info(f"  - 오류 발생: {migration_stats['errors']}")
            
            return migration_stats
            
        except Exception as e:
            logger.error(f"마이그레이션 실패: {e}")
            raise

    def verify_migration(self) -> Dict[str, Any]:
        """마이그레이션 결과 검증"""
        try:
            all_points = self._get_all_points()
            
            verification = {
                "total_points": len(all_points),
                "encrypted_points": 0,
                "unencrypted_points": 0,
                "migration_successful": True,
                "sample_decryptions": []
            }
            
            for i, point in enumerate(all_points):
                payload = point.payload
                
                if "encrypted_phone_number" in payload and "encrypted_name" in payload:
                    verification["encrypted_points"] += 1
                    
                    # 처음 3개 포인트의 복호화 테스트
                    if i < 3:
                        try:
                            decrypted_phone = self.encryption.decrypt(payload["encrypted_phone_number"])
                            decrypted_name = self.encryption.decrypt(payload["encrypted_name"])
                            
                            verification["sample_decryptions"].append({
                                "point_id": str(point.id),
                                "decrypted_phone": decrypted_phone,
                                "decrypted_name": decrypted_name,
                                "success": True
                            })
                        except Exception as decrypt_error:
                            verification["sample_decryptions"].append({
                                "point_id": str(point.id),
                                "error": str(decrypt_error),
                                "success": False
                            })
                            verification["migration_successful"] = False
                
                elif "phone_number" in payload and "name" in payload:
                    verification["unencrypted_points"] += 1
                    verification["migration_successful"] = False
            
            logger.info("마이그레이션 검증 결과:")
            logger.info(f"  - 총 포인트: {verification['total_points']}")
            logger.info(f"  - 암호화된 포인트: {verification['encrypted_points']}")
            logger.info(f"  - 비암호화된 포인트: {verification['unencrypted_points']}")
            logger.info(f"  - 마이그레이션 성공: {verification['migration_successful']}")
            
            return verification
            
        except Exception as e:
            logger.error(f"검증 실패: {e}")
            raise


def main():
    """마이그레이션 메인 함수 (연결 문제 해결)"""
    try:
        print("🔧 수정된 데이터 마이그레이션 도구")
        print("=" * 50)
        
        # 연결 테스트 먼저 수행
        print("📡 Qdrant 연결 테스트 중...")
        
        migrator = FixedDataMigrator()
        print("✅ Qdrant 연결 성공!")
        
        print("\n=== 데이터 마이그레이션 도구 ===")
        print("1. 데이터 분석")
        print("2. 백업 생성")
        print("3. 마이그레이션 (DRY RUN)")
        print("4. 마이그레이션 (실제 실행)")
        print("5. 검증")
        print("6. 연결 상태 확인")
        print("0. 종료")
        
        while True:
            choice = input("\n선택하세요 (0-6): ").strip()
            
            if choice == "0":
                print("종료합니다.")
                break
            
            elif choice == "1":
                print("\n=== 데이터 분석 ===")
                try:
                    analysis = migrator.analyze_data()
                    print(f"✅ 분석 완료!")
                    print(f"   총 포인트: {analysis['total_points']}")
                    print(f"   암호화된 포인트: {analysis['encrypted_points']}")
                    print(f"   비암호화된 포인트: {analysis['unencrypted_points']}")
                    print(f"   고유 사용자: {len(analysis['users'])}")
                    
                    if analysis['sample_payloads']:
                        print(f"\n샘플 데이터 구조:")
                        for sample in analysis['sample_payloads'][:3]:
                            print(f"   포인트 {sample['id']}: {sample['payload_keys']}")
                            
                except Exception as e:
                    print(f"❌ 분석 실패: {e}")
            
            elif choice == "2":
                print("\n=== 백업 생성 ===")
                try:
                    backup_file = migrator.backup_collection()
                    print(f"✅ 백업 완료: {backup_file}")
                except Exception as e:
                    print(f"❌ 백업 실패: {e}")
            
            elif choice == "3":
                print("\n=== 마이그레이션 (DRY RUN) ===")
                try:
                    stats = migrator.migrate_data(dry_run=True)
                    print(f"✅ DRY RUN 완료!")
                    print(f"   처리된 포인트: {stats['processed']}")
                    print(f"   마이그레이션 대상: {stats['migrated']}")
                    print(f"   건너뛴 포인트: {stats['skipped']}")
                    print(f"   오류 발생: {stats['errors']}")
                    
                    if stats['error_details']:
                        print(f"\n오류 상세:")
                        for error in stats['error_details'][:5]:  # 처음 5개만 표시
                            print(f"   {error}")
                            
                except Exception as e:
                    print(f"❌ DRY RUN 실패: {e}")
            
            elif choice == "4":
                print("\n=== 마이그레이션 (실제 실행) ===")
                print("⚠️  이 작업은 실제 데이터를 변경합니다!")
                print("⚠️  백업을 먼저 생성했는지 확인하세요!")
                
                confirm1 = input("계속하시겠습니까? (yes/no): ").strip().lower()
                if confirm1 != "yes":
                    print("취소되었습니다.")
                    continue
                
                confirm2 = input("정말로 실행하시겠습니까? (YES 입력): ").strip()
                if confirm2 != "YES":
                    print("취소되었습니다.")
                    continue
                
                try:
                    stats = migrator.migrate_data(dry_run=False)
                    print(f"✅ 마이그레이션 완료!")
                    print(f"   처리된 포인트: {stats['processed']}")
                    print(f"   마이그레이션된 포인트: {stats['migrated']}")
                    print(f"   건너뛴 포인트: {stats['skipped']}")
                    print(f"   오류 발생: {stats['errors']}")
                    
                    if stats['errors'] > 0:
                        print(f"⚠️  {stats['errors']}개 포인트에서 오류 발생")
                        print("로그 파일을 확인하세요.")
                        
                except Exception as e:
                    print(f"❌ 마이그레이션 실패: {e}")
            
            elif choice == "5":
                print("\n=== 마이그레이션 검증 ===")
                try:
                    verification = migrator.verify_migration()
                    print(f"✅ 검증 완료!")
                    print(f"   총 포인트: {verification['total_points']}")
                    print(f"   암호화된 포인트: {verification['encrypted_points']}")
                    print(f"   비암호화된 포인트: {verification['unencrypted_points']}")
                    print(f"   마이그레이션 성공: {verification['migration_successful']}")
                    
                    if verification['sample_decryptions']:
                        print(f"\n복호화 테스트 결과:")
                        for test in verification['sample_decryptions']:
                            if test['success']:
                                print(f"   ✅ 포인트 {test['point_id']}: {test['decrypted_name']}({test['decrypted_phone']})")
                            else:
                                print(f"   ❌ 포인트 {test['point_id']}: {test['error']}")
                                
                except Exception as e:
                    print(f"❌ 검증 실패: {e}")
            
            elif choice == "6":
                print("\n=== 연결 상태 확인 ===")
                try:
                    collections = migrator.client.get_collections()
                    print(f"✅ 연결 정상!")
                    print(f"   발견된 컬렉션: {len(collections.collections)}개")
                    for collection in collections.collections:
                        print(f"     - {collection.name}")
                        
                    # 대상 컬렉션 정보
                    if migrator.COLLECTION_NAME in [col.name for col in collections.collections]:
                        info = migrator.client.get_collection(migrator.COLLECTION_NAME)
                        print(f"\n📊 '{migrator.COLLECTION_NAME}' 컬렉션 정보:")
                        print(f"   벡터 수: {info.points_count}")
                        print(f"   벡터 차원: {info.config.params.vectors.size}")
                    else:
                        print(f"\n⚠️  '{migrator.COLLECTION_NAME}' 컬렉션이 존재하지 않습니다.")
                        
                except Exception as e:
                    print(f"❌ 연결 확인 실패: {e}")
            
            else:
                print("❌ 잘못된 선택입니다.")
    
    except Exception as e:
        logger.error(f"프로그램 실행 중 오류: {e}")
        print(f"\n❌ 프로그램 실행 실패: {e}")
        print("\n🔧 문제 해결 방법:")
        print("1. Qdrant 서버가 실행 중인지 확인")
        print("2. .env 파일의 QDRANT_HOST, QDRANT_PORT 확인")
        print("3. 방화벽 설정 확인")
        print("4. SSL/TLS 설정 확인")
        print("5. API 키 설정 확인 (필요한 경우)")


if __name__ == "__main__":
    main()
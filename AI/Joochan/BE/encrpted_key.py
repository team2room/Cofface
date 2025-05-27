# generate_encryption_key.py
"""
AES-256 암호화를 위한 강력한 키 생성 도구
"""

import secrets
import string
import hashlib
import base64
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from datetime import datetime


class EncryptionKeyGenerator:
    """암호화 키 생성 클래스"""
    
    @staticmethod
    def generate_random_password(length: int = 64) -> str:
        """
        암호학적으로 안전한 랜덤 패스워드 생성
        
        Args:
            length: 패스워드 길이 (최소 32자 권장)
        
        Returns:
            강력한 랜덤 패스워드
        """
        if length < 32:
            raise ValueError("보안을 위해 최소 32자 이상 권장합니다")
        
        # 대소문자, 숫자, 특수문자 포함
        characters = string.ascii_letters + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        # 암호학적으로 안전한 랜덤 생성
        password = ''.join(secrets.choice(characters) for _ in range(length))
        
        return password
    
    @staticmethod
    def generate_passphrase(word_count: int = 8) -> str:
        """
        기억하기 쉬운 패스프레이즈 생성
        
        Args:
            word_count: 단어 개수
        
        Returns:
            패스프레이즈
        """
        # 간단한 단어 목록 (실제로는 더 큰 사전 사용 권장)
        words = [
            "apple", "bridge", "castle", "dragon", "engine", "forest", "galaxy", "harbor",
            "island", "jungle", "kitchen", "laptop", "mountain", "network", "ocean", "planet",
            "quantum", "rainbow", "sunset", "tiger", "umbrella", "volcano", "wizard", "xylophone",
            "yellow", "zebra", "coffee", "puzzle", "rocket", "silver", "thunder", "violet"
        ]
        
        selected_words = [secrets.choice(words) for _ in range(word_count)]
        
        # 숫자와 특수문자 추가로 강화
        numbers = ''.join(str(secrets.randbelow(10)) for _ in range(4))
        special = ''.join(secrets.choice("!@#$%") for _ in range(2))
        
        passphrase = "-".join(selected_words) + "-" + numbers + special
        
        return passphrase
    
    @staticmethod
    def generate_base64_key(byte_length: int = 32) -> str:
        """
        Base64 인코딩된 바이너리 키 생성
        
        Args:
            byte_length: 바이트 길이 (32 = 256비트)
        
        Returns:
            Base64 인코딩된 키
        """
        random_bytes = secrets.token_bytes(byte_length)
        return base64.b64encode(random_bytes).decode('utf-8')
    
    @staticmethod
    def generate_hex_key(byte_length: int = 32) -> str:
        """
        16진수 키 생성
        
        Args:
            byte_length: 바이트 길이 (32 = 256비트)
        
        Returns:
            16진수 키
        """
        random_bytes = secrets.token_bytes(byte_length)
        return random_bytes.hex()
    
    @staticmethod
    def derive_key_from_input(user_input: str, salt: str = None) -> str:
        """
        사용자 입력으로부터 강력한 키 유도
        
        Args:
            user_input: 사용자가 입력한 패스워드/패스프레이즈
            salt: 솔트 (None이면 자동 생성)
        
        Returns:
            유도된 강력한 키
        """
        if salt is None:
            salt = secrets.token_bytes(16)
        else:
            salt = salt.encode('utf-8')
        
        # PBKDF2를 사용하여 키 유도
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256비트
            salt=salt,
            iterations=100000,  # 10만 회 반복
        )
        
        derived_key = kdf.derive(user_input.encode('utf-8'))
        
        # Base64로 인코딩하여 반환
        return base64.b64encode(derived_key).decode('utf-8')
    
    @staticmethod
    def test_password_strength(password: str) -> dict:
        """
        패스워드 강도 테스트
        
        Args:
            password: 테스트할 패스워드
        
        Returns:
            강도 분석 결과
        """
        result = {
            "length": len(password),
            "has_uppercase": any(c.isupper() for c in password),
            "has_lowercase": any(c.islower() for c in password),
            "has_digits": any(c.isdigit() for c in password),
            "has_special": any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password),
            "entropy_bits": 0,
            "strength": "매우 약함"
        }
        
        # 엔트로피 계산 (간단한 추정)
        charset_size = 0
        if result["has_lowercase"]:
            charset_size += 26
        if result["has_uppercase"]:
            charset_size += 26
        if result["has_digits"]:
            charset_size += 10
        if result["has_special"]:
            charset_size += 32
        
        if charset_size > 0:
            import math
            result["entropy_bits"] = len(password) * math.log2(charset_size)
        
        # 강도 평가
        if result["entropy_bits"] >= 128:
            result["strength"] = "매우 강함"
        elif result["entropy_bits"] >= 80:
            result["strength"] = "강함"
        elif result["entropy_bits"] >= 60:
            result["strength"] = "보통"
        elif result["entropy_bits"] >= 40:
            result["strength"] = "약함"
        
        return result


def interactive_key_generator():
    """대화형 키 생성 도구"""
    print("🔐 암호화 키 생성 도구")
    print("=" * 50)
    
    while True:
        print("\n선택하세요:")
        print("1. 랜덤 패스워드 생성 (권장)")
        print("2. 기억하기 쉬운 패스프레이즈 생성")
        print("3. Base64 바이너리 키 생성")
        print("4. 16진수 키 생성")
        print("5. 사용자 입력으로부터 키 유도")
        print("6. 패스워드 강도 테스트")
        print("7. .env 파일 생성")
        print("0. 종료")
        
        choice = input("\n선택 (0-7): ").strip()
        
        if choice == "0":
            print("종료합니다.")
            break
        
        elif choice == "1":
            length = input("패스워드 길이 (기본값: 64): ").strip()
            length = int(length) if length.isdigit() else 64
            
            password = EncryptionKeyGenerator.generate_random_password(length)
            print(f"\n생성된 랜덤 패스워드:")
            print(f"🔑 {password}")
            
            # 강도 테스트
            strength = EncryptionKeyGenerator.test_password_strength(password)
            print(f"📊 강도: {strength['strength']} ({strength['entropy_bits']:.1f} bits)")
        
        elif choice == "2":
            word_count = input("단어 개수 (기본값: 8): ").strip()
            word_count = int(word_count) if word_count.isdigit() else 8
            
            passphrase = EncryptionKeyGenerator.generate_passphrase(word_count)
            print(f"\n생성된 패스프레이즈:")
            print(f"🔑 {passphrase}")
            
            # 강도 테스트
            strength = EncryptionKeyGenerator.test_password_strength(passphrase)
            print(f"📊 강도: {strength['strength']} ({strength['entropy_bits']:.1f} bits)")
        
        elif choice == "3":
            key = EncryptionKeyGenerator.generate_base64_key()
            print(f"\n생성된 Base64 키:")
            print(f"🔑 {key}")
        
        elif choice == "4":
            key = EncryptionKeyGenerator.generate_hex_key()
            print(f"\n생성된 16진수 키:")
            print(f"🔑 {key}")
        
        elif choice == "5":
            user_input = input("패스워드/패스프레이즈 입력: ").strip()
            if user_input:
                derived_key = EncryptionKeyGenerator.derive_key_from_input(user_input)
                print(f"\n유도된 키:")
                print(f"🔑 {derived_key}")
            else:
                print("❌ 입력이 비어있습니다.")
        
        elif choice == "6":
            password = input("테스트할 패스워드 입력: ").strip()
            if password:
                strength = EncryptionKeyGenerator.test_password_strength(password)
                print(f"\n📊 패스워드 강도 분석:")
                print(f"   길이: {strength['length']}자")
                print(f"   대문자: {'✅' if strength['has_uppercase'] else '❌'}")
                print(f"   소문자: {'✅' if strength['has_lowercase'] else '❌'}")
                print(f"   숫자: {'✅' if strength['has_digits'] else '❌'}")
                print(f"   특수문자: {'✅' if strength['has_special'] else '❌'}")
                print(f"   엔트로피: {strength['entropy_bits']:.1f} bits")
                print(f"   강도: {strength['strength']}")
                
                if strength['entropy_bits'] < 80:
                    print("⚠️  더 강한 패스워드 사용을 권장합니다.")
            else:
                print("❌ 입력이 비어있습니다.")
        
        elif choice == "7":
            print("\n.env 파일 생성")
            
            # 기존 .env 파일 확인
            if os.path.exists('.env'):
                overwrite = input("기존 .env 파일이 있습니다. 덮어쓰시겠습니까? (y/n): ").strip().lower()
                if overwrite != 'y':
                    print("취소되었습니다.")
                    continue
            
            # 각종 설정값 입력
            qdrant_host = input("Qdrant Host (기본값: localhost): ").strip() or "localhost"
            qdrant_port = input("Qdrant Port (기본값: 6333): ").strip() or "6333"
            qdrant_api_key = input("Qdrant API Key (선택사항): ").strip()
            
            # 암호화 키 생성
            encryption_key = EncryptionKeyGenerator.generate_random_password(64)
            
            # .env 파일 작성
            env_content = f"""# Face Recognition Server Configuration
# Generated at {datetime.now().isoformat()}

# Qdrant Database Settings
QDRANT_HOST={qdrant_host}
QDRANT_PORT={qdrant_port}
"""
            
            if qdrant_api_key:
                env_content += f"QDRANT_API_KEY={qdrant_api_key}\n"
            else:
                env_content += "# QDRANT_API_KEY=your_api_key_here\n"
            
            env_content += f"""
# AES-256 Encryption Settings
# ⚠️ CRITICAL: Keep this key secret and secure!
# ⚠️ If you lose this key, encrypted data cannot be recovered!
ENCRYPTION_PASSWORD={encryption_key}

# Optional: Hash salt for search optimization (Method 2)
# HASH_SALT=your_hash_salt_here
"""
            
            with open('.env', 'w', encoding='utf-8') as f:
                f.write(env_content)
            
            # 파일 권한 설정 (Unix 계열)
            try:
                os.chmod('.env', 0o600)  # 소유자만 읽기/쓰기
                print("✅ .env 파일이 생성되었습니다 (권한: 600)")
            except:
                print("✅ .env 파일이 생성되었습니다")
            
            print(f"🔑 생성된 암호화 키: {encryption_key}")
            print("⚠️  이 키를 안전한 곳에 백업하세요!")
            print("⚠️  키를 분실하면 암호화된 데이터를 복구할 수 없습니다!")
        
        else:
            print("❌ 잘못된 선택입니다.")


def quick_generate():
    """빠른 키 생성 (명령행 실행)"""
    print("🚀 빠른 암호화 키 생성")
    print("=" * 30)
    
    # 여러 타입의 키 생성
    random_password = EncryptionKeyGenerator.generate_random_password(64)
    passphrase = EncryptionKeyGenerator.generate_passphrase(8)
    base64_key = EncryptionKeyGenerator.generate_base64_key()
    hex_key = EncryptionKeyGenerator.generate_hex_key()
    
    print(f"\n1. 랜덤 패스워드 (64자):")
    print(f"   {random_password}")
    
    print(f"\n2. 패스프레이즈:")
    print(f"   {passphrase}")
    
    print(f"\n3. Base64 키:")
    print(f"   {base64_key}")
    
    print(f"\n4. 16진수 키:")
    print(f"   {hex_key}")
    
    print(f"\n💡 권장: 랜덤 패스워드 사용")
    print(f"⚠️  생성된 키를 안전한 곳에 저장하세요!")
    
    return random_password


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--quick":
        # 빠른 생성 모드
        quick_generate()
    else:
        # 대화형 모드
        interactive_key_generator()
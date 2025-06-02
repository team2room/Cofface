# 얼굴인식용 3D 카메라 기술 비교 정리

## ✅ 주요 기술 방식 비교

### 1️⃣ Structured Light (SL)

- **원리**: IR dot projector로 수천 개의 점을 얼굴에 투사 → 왜곡 분석 → 3D 형상 복원
- **대표 제품**: iPhone Face ID, Orbbec Gemini 2, Intel RealSense SR300
- **장점**:
  - 정밀한 3D 얼굴 분석 가능
  - 위조 방지 (사진, 영상에 강함)
  - 고보안 인증에 적합
- **단점**:
  - 햇빛(실외)에 약함
  - 약간 느림
- **적합도**: ⭐⭐⭐⭐ (정밀 인증에 최적)
- **가격대**: 중~고가 (약 30~50만 원)

---

### 2️⃣ Time-of-Flight (ToF)

- **원리**: IR 펄스를 쏘고 반사되어 돌아오는 시간을 측정해 거리(Depth) 계산
- **대표 제품**: Azure Kinect, Intel RealSense L515, Orbbec Femto Mega
- **장점**:
  - 빠른 거리 측정
  - 실외 사용 가능
  - 동작 추적에 유리
- **단점**:
  - SL보다 정밀도는 낮음
  - 위조 방지는 보통 수준
- **적합도**: ⭐⭐⭐ (고속 인증 + 넓은 환경에 적합)
- **가격대**: 중~고가 (약 40~60만 원)

---

### 3️⃣ Stereo Depth (Astra 시리즈)

- **원리**: IR 듀얼 카메라로 좌우 시차를 분석 → 거리 추정
- **대표 제품**: Orbbec Astra, Astra Pro, Astra+
- **장점**:
  - 저렴한 가격
  - OpenNI2 기반 SDK 지원
- **단점**:
  - 조명에 민감
  - 실외 사용 불가
  - 정밀도 낮음 (정확한 인증 불가)
- **적합도**: ⭐⭐ (간단한 얼굴 감지용)
- **가격대**: 저가 (약 15~25만 원)

---

## ✅ 핵심 비교 요약 표

| 항목             | SL (Structured Light)     | ToF (Time-of-Flight)        | Astra (Stereo Depth)        |
|------------------|----------------------------|-----------------------------|-----------------------------|
| 얼굴 정밀도      | ⭐⭐⭐⭐                      | ⭐⭐⭐                         | ⭐⭐                          |
| 위조 방지        | ✅ 매우 강함                | 중간                        | ❌ 약함                     |
| 속도             | ⭐⭐                        | ⭐⭐⭐⭐                        | ⭐⭐⭐                         |
| 실외 사용        | ❌ 약함                    | ✅ 가능                      | ❌ 불가                     |
| 조명 영향        | 적음                       | 없음                         | 민감함                      |
| 설치 난이도      | 중                         | 중                           | 쉬움                        |
| 가격대           | 30~50만 원                 | 40~60만 원                  | 15~25만 원                  |
| 대표 제품        | Orbbec Gemini 2, iPhone X | RealSense L515, Azure Kinect| Orbbec Astra Pro, Astra+    |
| 얼굴 인증 적합도 | 최고                        | 좋음                         | 기본 수준                   |

---

## ✅ 사용 목적별 추천

| 사용 시나리오                          | 추천 방식           | 이유                                   |
|----------------------------------------|----------------------|----------------------------------------|
| 고정형 키오스크 + 정밀 인증            | **Structured Light** | 위조 방지, 정밀 얼굴 윤곽 인식 가능    |
| 실외 환경 포함 or 빠른 인증/동작 추적 | **ToF**              | 밝은 환경에서도 동작, 빠른 처리 가능  |
| 예산 제한, 간단 얼굴 감지              | **Astra (Stereo)**   | 비용 효율적, 실내용 얼굴 감지 적합    |

---

## ✅ 결론 요약

- **정밀 얼굴 인증 + 위조 방지** → 🔥 `Structured Light` (예: Orbbec Gemini 2)
- **속도 + 실외 환경 포함** → ⚡️ `ToF` (예: Azure Kinect, RealSense L515)
- **저가, 실내용 간단 얼굴 detect** → 💡 `Astra` (Stereo Depth 방식)

---

## 참고 도구

https://github.com/yfeng95/PRNet

https://github.com/cleardusk/3DDFA

https://huggingface.co/py-feat/retinaface

https://github.com/yfeng95/DECA

괜찮아보이는 후보 - 그나마 최신임

https://github.com/deepinsight/insightface

https://github.com/serengil/retinaface

https://github.com/LizhenWangT/FaceVerse

https://github.com/orbbec/OrbbecSDK

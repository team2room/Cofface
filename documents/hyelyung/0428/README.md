# 4월 28일 - 피그마 작성 & 카메라 촬영, AR 가이드 정보 서치

## 피그마

#### 앱 - 얼굴 등록, 결제 정보 등록, 설정 페이지 설계 완료

![Image](https://img.notionusercontent.com/s3/prod-files-secure%2F2a4c1533-623b-4615-a3b2-350db1e0024c%2F70b1dcad-341c-40af-b67a-e121821917fb%2Fimage.png/size/w=2000?exp=1745934920&sig=c57UfYojUUK-G9Xxp5YKbyBm1K2m8kLkIXl8j0tZ0Ds&id=1e3c09e2-99c6-8011-8db9-c6b7646b4a22&table=block&userId=dd4579a4-aa23-4dab-90aa-04d9ba1a7c97)

## 카메라 얼굴 촬영 & AR 가이드 정보

### 1. React PWA에서 얼굴 등록 기능 구현 가능 여부 ✅

- **카메라 접근**

  - `navigator.mediaDevices.getUserMedia()` API 활용
  - `{ video: { facingMode: 'user' } }`로 전면 카메라 활성화
  - `<video autoPlay playsInline />`로 실시간 스트리밍

- **UI 가이드라인 구현**

  - CSS 오버레이로 가이드라인, 문구 배치
  - `react-use-face-detection` 등 라이브러리로 실시간 얼굴 감지 가능

- **주의사항**
  - HTTPS 필수 (카메라 권한 문제)
  - 브라우저 호환성 체크 (iOS Safari 제한적)
  - 성능 최적화 (720p 권장)
  - 사용자 권한 관리 및 예외 처리 필요

<br/>

### 2. 2D 얼굴 등록 시 다각도 촬영 및 얼굴 벡터 처리 🎥🧠

- **촬영 각도**

  - 정면 (0°), 좌우 30~45°, 상하 ±15°
  - 각 각도별 3초 동영상 캡처 권장 (30fps 프레임 추출 가능)

- **특징 추출**

  - MTCNN으로 얼굴 정렬
  - MobileNetV3 기반 임베딩 생성 (512차원 벡터)
  - Triplet Loss 학습 모델로 97.3% 정확도

- **데이터 처리**

  - MediaPipe Face Mesh로 468개 랜드마크 추출
  - 조명 보정 및 정규화 투영
  - FAISS 벡터 DB에 임베딩 저장 및 압축

- **3D 매칭 공식**  
  \[
  S*{total} = 0.7 \times S*{2D} + 0.3 \times \frac{1}{n} \sum*{i=1}^n S*{3D}^{(i)}
  \]

  - \(S\_{2D}\): 코사인 유사도
  - \(S\_{3D}\): ICP 정합 점수

- **성능**
  - ND-2006 데이터셋 기준 단일 각도 대비 41% 낮은 FRR
  - 측면 각도 추가 시 오클루전 내성 2.3배 개선

<br/>

### 3. React PWA에서 AR 가이드 구현 가능 여부 & 방법 🚀

- **핵심 기술**

  - WebXR Device API (`navigator.xr.requestSession('immersive-ar')`)
  - three.js와 ARButton으로 3D 렌더링 및 AR 세션 관리

- **얼굴 포즈 감지**

  - MediaPipe Face Mesh 사용 (468 랜드마크)

- **UI 가이드**

  - CSS 3D 변환 및 필터 효과로 실시간 가이드라인 표시
  - Web Worker로 얼굴 인식 연산 분리, 성능 최적화

- **호환성**  
  | 플랫폼 | 지원 여부 | 비고 |
  |-----------------|-----------|------------------------------|
  | Chrome Android | ✅ | WebXR 1.1 이상 필수 |
  | iOS Safari | ⚠️ | WebXR 미지원, 제한적 지원 |
  | 데스크톱 Chrome | ✅ | ARCore 에뮬레이션 필요 |

- **최적화**
  - webxr-polyfill 적용
  - LOD (Level of Detail) 적용
  - WebAssembly(OpenCV.js)로 30fps 이상 처리

<br/>

### 4. Safari에서 AR 가이드 구현 제한점 🍏⚠️

- **WebXR 지원 부족**

  - iOS Safari는 WebXR API 미지원 또는 제한적 지원
  - 일반 Safari에서 WebXR 기반 AR 구현 어려움

- **대안**

  - Apple AR Quick Look (USDZ 3D 모델 뷰어)
  - 단순 3D 모델 배치 가능, 커스텀 인터랙티브 AR 가이드 불가
  - 고성능 AR 가이드는 네이티브 앱(ARKit) 개발 필요

- **결론**
  - iOS Safari에서 React PWA AR 가이드 구현은 매우 어렵거나 불가능
  - Android Chrome 등 WebXR 지원 환경에서만 안정적 구현 가능

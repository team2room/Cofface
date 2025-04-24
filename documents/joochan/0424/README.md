# 2주차

## 25.04.24



## 안면인식

### 1. 3D Depth Camera 공부

#### 3D Depth SDK

1. [OrbbecSDK](https://github.com/orbbec/OrbbecSDK)
2. [pyOrbbecSDK](https://github.com/orbbec/pyorbbecsdk)
3. [Intel RealSense SDK](https://github.com/IntelRealSense/librealsense)
4. [pyRealSense2](https://github.com/IntelRealSense/librealsense/tree/master/wrappers/python)



#### Depth 추정 방식

1. **LDM**
   **Laser Dot Matrix**의 약자로, 적외선(IR) 레이저 패턴을 이용해 3D 깊이 정보를 측정하는 기술

   - 동작 원리:

     - IR 레이저를 통해 수많은 점(dot) 패턴을 대상 물체 위에 투사

     - 카메라는 이 점들이 왜곡된 형태를 캡처

     - 왜곡 정도를 분석해서 깊이**(**depth**)** 정보를 계산

     - Structured Light 방식의 일종이지만, 패턴이 dot 형태인 것이 특징.

   - 장점:

     - 텍스처 없는 표면도 잘 인식 가능 (ex. 흰 벽, 얼굴 등)

     - 정밀도가 높은 편 (근거리에서 유리함)

2. **LDP**
   **Laser Depth Projection** 또는 **Laser Depth Profiling**, 레이저를 사용해 거리(깊이)를 직접 측정하는 방식

   일반적으로 **ToF (Time-of-Flight)** 또는 **Active Stereo** 방식에서 사용

   - 동작 방식:

     - 하나 이상의 레이저 포인트 또는 패턴이 발사됨

     - 수신된 IR 신호의 시간 또는 위상 차이를 분석해 거리 계산

   - 주요 방식과 연관성:

     - ToF (Time-of-Flight) 기반 센서에서 LDP 기술이 사용됨

     - Active Stereo Depth (ASD)에서도 패턴을 통해 거리 보조 측정

   

| 항목               | LDM (Laser Dot Matrix)             | LDP (Laser Depth Projection)           |
| ------------------ | ---------------------------------- | -------------------------------------- |
| **방식**           | Structured Light (dot pattern)     | ToF 또는 Active Stereo 방식            |
| **특징**           | 많은 점을 뿌려서 왜곡 분석         | 거리 또는 위상차 직접 측정             |
| **장점**           | 정밀한 근거리 추적, 안면 인식      | 다양한 거리에서 정확도 좋음            |
| **사용 예**        | iPhone Face ID, SR300, Astra       | Azure Kinect, RealSense L515           |
| **깊이 생성 방식** | IR 패턴 왜곡 분석                  | IR 빛의 시간차 or 위상차 측정          |
| **노이즈**         | 텍스처 적은 곳에 강함, 낮은 노이즈 | 반사면, 먼 거리에서 노이즈 가능성      |
| **속도**           | 보통 비교적 느림                   | 매우 빠름 (ToF는 실시간 프레임에 적합) |
| **반환 형식**      | Depth map, Point cloud 동일        | 동일                                   |





### Anti Spoofing

사용자가 다른 사용자의 사진이나 영상, 3D 마스크 같은거로 위변조 할 가능성이 존재하므로 방지책 필요.

- **스푸핑 공격 유형**
  1. 사진: 종이사진, 휴대폰 화면 등으로 얼굴을 보여주는 방식
  2. 영상: 움직이는 얼굴 영상을 재생
  3. 3D 마스크: 실리콘이나 3D 프린터로 만든 얼굴 복제품
  4. Replay: 이전 인식 성공 시 녹화된 데이터를 그대로 재전송

- **안티 스푸핑 기술 유형**

  1. **Depth 기반 안티스푸핑**

     - 필요 장비: Depth 카메라 (Intel RealSense, Orbbec 등)

     - 원리: 실제 얼굴은 깊이 정보가 입체적으로 분포됨. 평면 사진이나 영상은 깊이 값이 단조로움.

     - 처리 방식: 3D depth map에서 눈, 코, 턱 등의 깊이 분포를 분석하여 평면인지 입체인지 판별

     - 장점: 정밀하고 빠름

     - 단점: Depth 카메라 필요 (비용 있음)

  2. **IR(적외선) 기반 안티스푸핑**

     - 필요 장비: IR 카메라 또는 듀얼 IR+RGB 카메라

     - 원리: 사람 피부는 적외선 반사가 고유한 패턴을 가짐. 화면이나 인쇄물은 다름.

     - 처리 방식: 적외선 스펙트럼 이미지에서 피부 질감, 온도, 반사 특성을 추출하여 분석

     - 장점: 조명에 강하고, 간접 검출 가능

     - 단점: 고화질 IR 센서 필요

  3. **소프트웨어 기반 안티스푸핑 (딥러닝 기반)**

     - 입력: 일반 RGB 카메라 영상

     - 모델: CNN 기반 모델 (e.g. [FacePAD], [SpoofNet], [LivenessNet])

     - 처리: 눈 깜빡임, 입 움직임, 표정 변화 등 생체 반응 검출

     - 장점: 저가 장비 사용 가능

     - 단점: 영상 조작에 취약, CPU 연산 부담 큼



### 로컬 서버...?

3D Depth 카메라에 접근할려면 웹기반으론 접근 불가. Python 또는 C/C++ 사용해야 함.

| 컴포넌트    | 위치      | 역할                                                         |
| ----------- | --------- | ------------------------------------------------------------ |
| 클라이언트  | 키오스크  | 3D Depth 카메라 사용하여 얼굴 인식, 스푸핑 방지,<br /> 인증 요청, 사용자가 메뉴 선택 후 결제 |
| 모바일 웹앱 | 사용자 폰 | 회원가입, 셀피카메라로 얼굴 등록, 결제 정보 등록             |
| 얼굴 등록   | GPU 서버  | 모바일 셀피 → 3D 벡터 변환 (회원가입 시에만)                 |
| Vector DB   | EC2       | 3D 벡터 저장 및 유사도 검색                                  |
| MySQL       | EC2       | 사용자 기본 정보, 결제 로그 등 저장                          |
| 인증        | EC2       | 인증 관리, 정보 등록, 요청 중개                              |
| 결제        | EC2       | 카드사/PG사 API 연동                                         |
| 로그/배치   | EC2       | 유저 개별 로그, 로그 기반 추천 배치 등                       |
| 관리        | EC2       | 관리자 모니터링, 통계, 알림 등                               |
| 상품        | EC2       | 메뉴 선택, 장바구니, 적립 등                                 |

키오스크에서 Electron 써야할 수도...?





### DECA

https://github.com/yfeng95/DECA 클론 받아 테스트

먼저 WSL로 들어가서 pyenv 설치

```bash
# 종속성 설치
sudo apt-get update
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev \
xz-utils tk-dev liblzma-dev
# pyenv 설치
git clone https://github.com/pyenv/pyenv.git ~/.pyenv

# 환경변수 설정 (zsh에선 zshrc)
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init --path)"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```



python 3.7 기반이기 때문에 pyenv로 3.7.4 가상환경 생성.

CUDA는 11.7 사용 (pytorch 버전이 11.7 사용하는 버전)

https://eternallybored.org/misc/wget/ 에서 최신 wget 받아 c:\windows\system32 폴더에 넣기

```bash
# 모델 다운로드
pip install gdown
gdown --id 1rp8kdyLPvErw2dTmqtjISRVvQLj6Yzje -O data/deca_model.tar
```





1. **로컬 키오스크에서 수행해야 하는 일**
   - Depth 카메라로 실시간 얼굴 인식 (3D 벡터 추출)
   - IR + RGB 기반 안티스푸핑 (오프라인 실시간 처리)
   - 인식된 벡터로 벡터 DB에 유사도 질의 → 인증 결과 수신
2. **회원 등록은 웹앱(모바일)에서 수행**
   - 셀피 카메라로 얼굴 이미지 촬영 (2D 이미지)
   - 이 이미지를 GPU 서버에 업로드
   - GPU 서버에서 3D 벡터 추출 후 EC2의 벡터 DB에 저장
   - 사용자 기본 정보는 MySQL에 저장
3. **서버 구성**
   - EC2 상에 인증, 관리, 결제, 알림 등의 기능을 가지는 Spring Boot서버와 MySQL, Qdrant(벡터 DB)
   - GPU 서버는 벡터 추출용 (회원 등록 전용)
   - 키오스크는 로컬 장비이며, 인식 및 검증을 로컬 GPU에서 수행


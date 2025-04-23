# 2주차

## 25.04.23



## 카메라

### 1. 카메라 종류 논의

2D RGB, 2D RGB+IR Dual, 3D Depth 세 종류가 있는데, 

- 2D RGB : 구현 난이도 하, 보안 하, 바로 진행 가능
- 2D RGB+IR Dual : 구현 난이도 중, 보안 중, 국내엔 제품 없어서 해외구매 또는 일반 웹캠+라즈베리파이 IR 카메라 연동 사용
- 3D Depth : 구현 난이도 상, 보안 상, 코스트 가장 크고, 교보재 신청 후 구매까지 최소 1주일 소요, 개발 들어가기까지 최소 2주 소요.



하지만 결제가 주요 플로우이기 때문에 보안이 중요. 하여 최대한 3D Depth로 진행하기로 결정.

#### 3D Depth SDK

1. [OrbbecSDK](https://github.com/orbbec/OrbbecSDK)
2. [Intel RealSense SDK](https://github.com/IntelRealSense/librealsense)

### 2. AI 모델 찾기

#### 1. 2D 이미지/영상으로 3D 얼굴 벡터 추출

회원가입이 키오스크 유저 플로우에 들어 있으면 UX가 떨어지기 때문에 웹앱으로 분리(키오스크에서도 가능은 하게 구현 예정)

하여 웹앱에서 얼굴 정보 등록을 해야하기 때문에, 2D 카메라를 사용할 수 밖에 없게 되어 해당 이미지로 3D 벡터 추출 필요.

| 모델명               | 설명                                     | 라이브러리                                                   |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| **DECA** (2021)      | 표정 + 조명 + 포즈 고려한 3D 메쉬 재구성 | [DECA GitHub](https://github.com/YadiraF/DECA)               |
| **3DDFA-V2**         | 모바일 환경에서도 가능한 빠른 3D 정렬    | [3DDFA GitHub](https://github.com/cleardusk/3DDFA_V2)        |
| **FaceVerse** (2022) | 고해상도 정밀 모델, 최신                 | [FaceVerse GitHub](https://github.com/LizhenWangT/FaceVerse) |



#### 3D Depth 지원

| 목적               | 모델명                                                       | 특징                                |
| ------------------ | ------------------------------------------------------------ | ----------------------------------- |
| **얼굴 검출**      | [**RetinaFace (InsightFace)**](https://github.com/deepinsight/insightface) | Accuracy ↑, landmark 포함           |
|                    | [**YOLOv8-face**](https://github.com/derronqi/yolov8-face)   | 경량, 최신 YOLO 구조                |
| **얼굴 임베딩**    | **ArcFace (InsightFace)**                                    | SOTA 정확도, 등록/인식용            |
|                    | [**Face-Transformer**](https://github.com/zhongyy/Face-Transformer) | ViT 기반, 정확도 높음, 하지만 느림  |
| **나이/성별 추정** | [**SSR-Net (Tiny SSR)**](https://github.com/knowit/SSR.Net)  | 빠름 + 정확도 양호, 리엑트에서 사용 |
|                    | [**FairFace (ResNet34 기반)**](https://github.com/dchen236/FairFace) | 인종+성별+나이 모두 학습됨          |
|                    | **InsightFace 내장 Age/Gender**                              | ArcFace와 함께 쓰기 쉬움            |





### 3. 모델 테스트

##### DECA 모델을 테스트해보기 위한 사전 세팅

1. WSL CUDA 설치
   윈도우에서 테스트 돌려보기 위해서 WSL 사용
   CUDA 11.8 설치

   ```bash
   wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-wsl-ubuntu.pin
   sudo mv cuda-wsl-ubuntu.pin /etc/apt/preferences.d/cuda-repository-pin-600
   wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda-repo-wsl-ubuntu-11-8-local_11.8.0-1_amd64.deb
   sudo dpkg -i cuda-repo-wsl-ubuntu-11-8-local_11.8.0-1_amd64.deb
   sudo cp /var/cuda-repo-wsl-ubuntu-11-8-local/cuda-*-keyring.gpg /usr/share/keyrings/
   sudo apt-get update
   sudo apt-get -y install cuda
   ```

   설치 후 ~/.bashrc(zshrc)에 등록
   ```bash
   # ~/.bashrc 맨 하단에 추가 
   export PATH=/usr/local/cuda/bin:$PATH
   export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
   ```

   설치 검증
   ```bash
   nvcc -V
   ```

   

2. Docker 설치
   ```bash
   sudo apt-get update
   sudo install -m 0755 -d /etc/apt/keyrings
   sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
   sudo chmod a+r /etc/apt/keyrings/docker.asc
   
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
     $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   
   # 일반 사용자 권한 설정
   sudo usermod -aG docker $USERa
   
   # 등록 && 시작
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

   


   ```bash
   # NVIDIA Container Toolkit 설치
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sudo tee /etc/apt/sources.list.d/nvidia-container.list
   
   sudo apt update
   sudo apt install -y nvidia-container-toolkit
   
   # Docker에 NVIDIA 런타임 설정
   sudo nvidia-ctk runtime configure --runtime=docker
   
   # Docker 재시작
   sudo systemctl restart docker
   
   # 설치 확인
   docker info | grep -i runtime
   ```

   ```bash
   # 출력 결과에
   Runtimes: io.containerd.runc.v2 nvidia runc
   Default Runtime: runc
   # 포함되어야 함
   ```

   

   3. pyenv 세팅

      모델 마다 최적화된 pypi 라이브러리들이 다 달라서 그에 맞도록 환경 세팅 필요

      윈도우에서는 pyenv-win 을 사용해야 함. (virtualenv 지원 X 이므로 venv 사용)

      1. git 사용 설치

          ```bash
          # git bash
          cd ~
          git clone https://github.com/pyenv-win/pyenv-win.git .pyenv
          ```

      2. powershell 사용 설치

         ```powershell
         # 스크립트 실행 허용
         Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
         Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win/install-pyenv-win.ps1" -OutFile "./install-pyenv-win.ps1"; &"./install-pyenv-win.ps1"
         ```

      
      이후 환경 변수 등록
      ```powershell
      [System.Environment]::SetEnvironmentVariable('PYENV',$env:USERPROFILE + "\.pyenv\pyenv-win\","User")
      
      [System.Environment]::SetEnvironmentVariable('PYENV_ROOT',$env:USERPROFILE + "\.pyenv\pyenv-win\","User")
      
      [System.Environment]::SetEnvironmentVariable('PYENV_HOME',$env:USERPROFILE + "\.pyenv\pyenv-win\","User")
      
      [System.Environment]::SetEnvironmentVariable('path', $env:USERPROFILE + "\.pyenv\pyenv-win\bin;" + $env:USERPROFILE + "\.pyenv\pyenv-win\shims;" + [System.Environment]::GetEnvironmentVariable('path', "User"),"User")
      
      ```
      
      이후 bash에서 pyenv 세팅
      ```bash
      pyenv install 3.7.4
      # 프로젝트 폴더로 이동 후
      pyenv local 3.7.4
      python -m venv venv
      source venv/Scripts/activate
      pip install -r requirements.txt
      ```
      
      

###### DECA모델 Docker 이미지 실행

```bash
docker load –i nia_docker_image.tar

docker run -it --runtime=nvidia --gpus all --ipc=host docker_nia23:latest
```


# 2주차

## 25.04.25



## 안면인식

### 1. 2D -> 3D

#### DECA 

Windows는 몇몇 종속성이 호환이 안되는 문제가 계속 발생하여 WSL로 구동하는 것으로 변경.

추후에 GPU 서버에서 구동하는 것으로 시도해볼 예정.



1. pyenv 설치
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

2. 환경 세팅
   ```bash
   git clone https://github.com/yfeng95/DECA.git
   cd DECA
   
   pyenv install 3.7.4
   python -m venv wslvenv
   source wslvenv/bin/activate
   # requirements는 환경세팅하면서 개인화된 리스트
   pip install -r requirements.txt
   ```

   ```bash
   beautifulsoup4==4.13.4
   certifi==2025.1.31
   charset-normalizer==3.4.1
   chumpy==0.70
   colorama==0.4.6
   face-alignment==1.4.1
   filelock==3.12.2
   fvcore==0.1.5.post20221221
   gdown==4.7.3
   idna==3.10
   imageio==2.31.2
   importlib-metadata==6.7.0
   iopath==0.1.10
   kornia==0.6.12
   llvmlite==0.39.1
   networkx==2.6.3
   ninja==1.11.1.4
   numba
   numpy
   opencv-python==4.11.0.86
   packaging==24.0
   Pillow==9.5.0
   portalocker==2.7.0
   PySocks==1.7.1
   PyWavelets==1.3.0
   pywin32==308
   PyYAML==5.1.1
   requests==2.31.0
   scikit-image==0.19.3
   scipy==1.7.3
   six==1.17.0
   soupsieve==2.4.1
   tabulate==0.9.0
   termcolor==2.3.0
   tifffile==2021.11.2
   torch==1.13.1+cu117
   torchaudio==0.13.1+cu117
   torchvision==0.14.1+cu117
   tqdm==4.67.1
   typing_extensions==4.7.1
   urllib3==2.0.7
   yacs==0.1.8
   zipp==3.15.0
   ```

3. 데이터 초기화
   ```bash
   # 데이터 다운 전 설치
   sudo apt-get install wget
   pip install gdown
   
   ./fetch_data.sh
   gdown --id 1rp8kdyLPvErw2dTmqtjISRVvQLj6Yzje -O data/deca_model.tar
   cd data
   wget https://github.com/TimoBolkart/BFM_to_FLAME/blob/main/data/BFM_to_FLAME_corr.npz
   cd ..
   ```

   

4. demo 실행
   ```bash
   python demos/demo_reconstruct.py -i TestSamples/examples --saveDepth True --saveObj True
   ```

   

5. 결과
   ![id04657-PPHljWCZ53c-000565_inputs_inputs_vis](./assets/id04657-PPHljWCZ53c-000565_inputs_inputs_vis.jpg)

 					원본  →  랜드마크 추출  →  3D 정렬  →  기본  →  디테일  →  깊이 시각화
 	
 	1. 2D 얼굴 원본 사진에서 얼굴의 랜드마크를 탐지하고 정밀화
 	2. 이를 바탕으로 3D 메쉬를 생성하고, 텍스쳐를 입혀 디테일을 반영
 	3. 깊이 시각화 마스크 생성, 3D 벡터 정보를 추출
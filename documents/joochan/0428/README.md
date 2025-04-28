# 3주차

## 25.04.28



## 1. 안면인식

### 1. 2D -> 3D (3)

#### MICA

WSL2(Ubuntu 22.04)에 세팅

##### 1. conda 설치

```bash
wget https://repo.anaconda.com/archive/Anaconda3-2024.10-1-Linux-x86_64.sh

sh Anaconda3-2024.10-1-Linux-x86_64.sh

# bash(zsh)에 추가
export PATH=/home/ssafy/anaconda3/bin:$PATH

# 적용
source ~/.zshrc

# 설치 확인
conda --version
```

##### 2. MICA 세팅

```bash
git clone https://github.com/Zielon/MICA.git
cd MICA

# 개행문자 CRLF에서 LF로 변경 - Ubuntu에서 할 경우
sudo apt-get install dos2unix
dos2unix ./install.sh
dos2unix data/FLAME2020/FLAME_masks/FLAME_masks.pkl

# 설치
./install.sh

# 가상환경 활성화
conda activate MICA

# onnxruntime gpu사용으로 변경
pip uninstall onnxruntime
pip install onnxruntime-gpu==1.13.1

# 변경 확인
❯ python
>>> import onnxruntime as ort
>>> print(ort.get_available_providers())
['TensorrtExecutionProvider', 'CUDAExecutionProvider', 'CPUExecutionProvider']

# libtinfo.so.6 / libcuda.so 링크하기
nano ~/.bashrc  # .zshrc
```

```bash
export LD_LIBRARY_PATH=/usr/lib/wsl/lib:$LD_LIBRARY_PATH  # wsl에서의 libcuda 위치
export CUDA_HOME=$CONDA_PREFIX
export LD_LIBRARY_PATH=$CONDA_PREFIX/lib:$LD_LIBRARY_PATH
```

```bash
source ~/.bashrc  # .zshrc
```

##### 3. 실행

```bash
python demo.py
```

```bash
2025-04-28 15:25:18.941 | INFO     | models.flame:__init__:54 - [FLAME] creating the FLAME Decoder
2025-04-28 15:25:22.057 | INFO     | models.flame:__init__:54 - [FLAME] creating the FLAME Decoder
2025-04-28 15:25:22.355 | INFO     | micalib.models.mica:load_model:52 - [MICA] Trained model found. Path: /mnt/c/Users/SSAFY/Documents/fee/MICA/data/pretrained/mica.tar | GPU: cuda:0
Applied providers: ['CUDAExecutionProvider', 'CPUExecutionProvider'], with options: {'CPUExecutionProvider': {}, 'CUDAExecutionProvider': {'cudnn_conv_use_max_workspace': '0', 'enable_cuda_graph': '0', 'do_copy_in_default_stream': '1', 'arena_extend_strategy': 'kNextPowerOfTwo', 'cudnn_conv1d_pad_to_nc1d': '0', 'gpu_external_empty_cache': '0', 'gpu_external_free': '0', 'gpu_external_alloc': '0', 'gpu_mem_limit': '18446744073709551615', 'cudnn_conv_algo_search': 'EXHAUSTIVE', 'device_id': '0'}}
find model: /home/ssafy/.insightface/models/antelopev2/1k3d68.onnx landmark_3d_68 ['None', 3, 192, 192] 0.0 1.0
Applied providers: ['CUDAExecutionProvider', 'CPUExecutionProvider'], with options: {'CPUExecutionProvider': {}, 'CUDAExecutionProvider': {'cudnn_conv_use_max_workspace': '0', 'enable_cuda_graph': '0', 'do_copy_in_default_stream': '1', 'arena_extend_strategy': 'kNextPowerOfTwo', 'cudnn_conv1d_pad_to_nc1d': '0', 'gpu_external_empty_cache': '0', 'gpu_external_free': '0', 'gpu_external_alloc': '0', 'gpu_mem_limit': '18446744073709551615', 'cudnn_conv_algo_search': 'EXHAUSTIVE', 'device_id': '0'}}
find model: /home/ssafy/.insightface/models/antelopev2/2d106det.onnx landmark_2d_106 ['None', 3, 192, 192] 0.0 1.0
Applied providers: ['CUDAExecutionProvider', 'CPUExecutionProvider'], with options: {'CPUExecutionProvider': {}, 'CUDAExecutionProvider': {'cudnn_conv_use_max_workspace': '0', 'enable_cuda_graph': '0', 'do_copy_in_default_stream': '1', 'arena_extend_strategy': 'kNextPowerOfTwo', 'cudnn_conv1d_pad_to_nc1d': '0', 'gpu_external_empty_cache': '0', 'gpu_external_free': '0', 'gpu_external_alloc': '0', 'gpu_mem_limit': '18446744073709551615', 'cudnn_conv_algo_search': 'EXHAUSTIVE', 'device_id': '0'}}
find model: /home/ssafy/.insightface/models/antelopev2/genderage.onnx genderage ['None', 3, 96, 96] 0.0 1.0
Applied providers: ['CUDAExecutionProvider', 'CPUExecutionProvider'], with options: {'CPUExecutionProvider': {}, 'CUDAExecutionProvider': {'cudnn_conv_use_max_workspace': '0', 'enable_cuda_graph': '0', 'do_copy_in_default_stream': '1', 'arena_extend_strategy': 'kNextPowerOfTwo', 'cudnn_conv1d_pad_to_nc1d': '0', 'gpu_external_empty_cache': '0', 'gpu_external_free': '0', 'gpu_external_alloc': '0', 'gpu_mem_limit': '18446744073709551615', 'cudnn_conv_algo_search': 'EXHAUSTIVE', 'device_id': '0'}}
find model: /home/ssafy/.insightface/models/antelopev2/glintr100.onnx recognition ['None', 3, 112, 112] 127.5 127.5
Applied providers: ['CUDAExecutionProvider', 'CPUExecutionProvider'], with options: {'CPUExecutionProvider': {}, 'CUDAExecutionProvider': {'cudnn_conv_use_max_workspace': '0', 'enable_cuda_graph': '0', 'do_copy_in_default_stream': '1', 'arena_extend_strategy': 'kNextPowerOfTwo', 'cudnn_conv1d_pad_to_nc1d': '0', 'gpu_external_empty_cache': '0', 'gpu_external_free': '0', 'gpu_external_alloc': '0', 'gpu_mem_limit': '18446744073709551615', 'cudnn_conv_algo_search': 'EXHAUSTIVE', 'device_id': '0'}}
find model: /home/ssafy/.insightface/models/antelopev2/scrfd_10g_bnkps.onnx detection [1, 3, '?', '?'] 127.5 128.0
set det-size: (224, 224)
2025-04-28 15:25:28.769 | INFO     | utils.landmark_detector:__init__:47 - [DETECTOR] Selected RETINAFACE as landmark detector.
2025-04-28 15:25:28.770 | INFO     | __main__:main:119 - Processing has started...
100%|█████████████████████████████████████████████████████████████████████████████████████| 4/4 [00:03<00:00,  1.20it/s]
100%|█████████████████████████████████████████████████████████████████████████████████████| 4/4 [00:00<00:00,  6.49it/s]
2025-04-28 15:25:32.722 | INFO     | __main__:main:142 - Processing finished. Results has been saved in demo/output
```

GPU로 실행되는 것 확인

##### 4. 결과 확인

원본

<img src="./assets/carell.jpg" alt="carell" style="zoom: 33%;" />

```bash
# 결과파일 시각화 하기
pip install open3d
```

```python
# .ply 또는 .obj
import open3d as o3d

# .ply 또는 .obj 파일 읽기
mesh = o3d.io.read_triangle_mesh("경로/mesh.ply")
# mesh = o3d.io.read_triangle_mesh("경로/mesh.obj")

# 간단한 시각화
o3d.visualization.draw_geometries([mesh])
```

<img src="./assets/image-20250428232453005.png" alt="image-20250428232453005" style="zoom:25%;" /><img src="./assets/image-20250428232946147.png" alt="image-20250428232946147" style="zoom:25%;" /><img src="./assets/image-20250428233008622.png" alt="image-20250428233008622" style="zoom:25%;" /><img src="./assets/image-20250428233108683.png" alt="image-20250428233108683" style="zoom:25%;" />

```python
# .npy
import open3d as o3d
import numpy as np

points = np.load("경로/identity.npy")

# 포인트클라우드로 변환
pcd = o3d.geometry.PointCloud()
pcd.points = o3d.utility.Vector3dVector(points)

# 시각화
o3d.visualization.draw_geometries([pcd])
```

<img src="./assets/image-20250428232901780.png" alt="image-20250428232901780" style="zoom: 50%;" />



## 2. EC2 기본 세팅

#### 1. 기본 세팅

```bash
# 서버 시간대 확인
timedatectl

# 서울이 아닐 경우
sudo timedatectl set-timezone Asia/Seoul

git config --global user.name "이름"
git config --global user.email "이메일"
```



#### 2. zsh 설치

```bash
# 1. zsh 설치
sudo apt-get update && sudo apt-get upgrade -y
sudo apt install zsh git fonts-powerline

# 2. oh-my-zsh 설치
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"


# 3. 플러그인 설치
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

git clone https://github.com/zsh-users/zsh-autosuggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# 4. 테마 설치
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k
echo 'source ~/powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc

# 5. 적용
omz plugin enable zsh-syntax-highlighting zsh-autosuggestions
```



#### 3. Zulu 17 설치

```bash
sudo apt install gnupg ca-certificates curl
# 키 등록
curl -s https://repos.azul.com/azul-repo.key | sudo gpg --dearmor -o /usr/share/keyrings/azul.gpg
echo "deb [signed-by=/usr/share/keyrings/azul.gpg] https://repos.azul.com/zulu/deb stable main" | sudo tee /etc/apt/sources.list.d/zulu.list

sudo apt-get update
sudo apt-get install -y zulu17-jdk

# 설치된 자바 폴더 위치 확인 (zulu 단독 설치 시)
sudo update-alternatives --config java
# 나온 경로 복사하여 JAVA HOME 환경변수 설정해주기
# /usr/lib/jvm/zulu17/bin/java

sudo nano /etc/environment
PATH=":/usr/lib/jvm/zulu17/bin" # 기존에 추가
JAVA_HOME="/usr/lib/jvm/zulu17"
# Ctrl + O , Ctrl + X 로 저장 후 나가기

# 변경사항 적용
source /etc/environment
# 적용 확인
echo $JAVA_HOME
```



#### 4. NGINX 설치 및 인증서 등록

```bash
sudo apt-get update && sudo apt-get install nginx -y

sudo systemctl enable nginx
sudo systemctl start nginx

sudo apt-get install -y certbot python3-certbot-nginx
# 적용할 도메인 주소와 이메일 입력해주기
sudo certbot certonly --nginx -d k12e202.p.ssafy.io

# nginx에 키 등록
```

```bash
server {
    listen 443 ssl;
    server_name k12e202.p.ssafy.io;

    client_max_body_size 50M;
    proxy_set_header Connection keep-alive;
    keepalive_timeout 65;

    ssl_certificate /etc/letsencrypt/live/k12e202.p.ssafy.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/k12e202.p.ssafy.io/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:8080/;  # 스프링 부트
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```



#### 5. Docker 설치

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
sudo usermod -aG docker $USER

# 등록 && 시작
sudo systemctl enable docker
sudo systemctl start docker
```



#### 6. MySQL 설치

```bash
# 설치
sudo apt-get update && sudo apt-get install -y mysql-server
# 포트 허용
sudo ufw allow mysql
# 시작 등록 및 시작
sudo systemctl enable mysql
sudo systemctl start mysql

# mysql 접속
sudo mysql

# 루트유저 비밀번호 생성
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '비밀번호';
# 권한 갱신
FLUSH PRIVILEGES;

# 유저 생성
CREATE USER '유저명'@'localhost' IDENTIFIED BY '유저비번';

# 데이터베이스 생성 후 
CREATE DATABASE 새로운데이터베이스;
SHOW DATABASES;

# 데이터베이스 권한 주기
GRANT ALL PRIVILEGES ON 생성한DB.* TO '권한 줄 유저명'@'localhost';
FLUSH PRIVILEGES;  # 권한 갱신

EXIT;
```



#### 7. Redis 설치

```bash
sudo apt-get update
sudo apt-get install -y redis-server

# 서비스 등록 및 실행
sudo systemctl start redis
sudo systemctl enable redis
```



#### 8. ufw 설정

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80  # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw allow 8080  # 아마 스프링서버 포트
sudo ufw enable
```


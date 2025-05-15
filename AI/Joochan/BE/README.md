## Insightface 환경 세팅

#### 0. Windows의 경우 Visual Studio 2019 dev tools 설치해야 c 컴파일러 사용 가능

[VS BuildTools 16.10.4](https://download.visualstudio.microsoft.com/download/pr/acfc792d-506b-4868-9924-aeedc61ae654/72ae7ec0c234bbe0e655dc4776110c23178c8fbb7bbcf9b5b96a683b95e8d755/vs_BuildTools.exe)

#### 1. pip 설치

```bash
pip install qdrant-client fastapi uvicorn numpy==1.24.4 pillow pycryptodome boto3 apscheduler Cython cmake Websockets gdown
pip install opencv-python opencv-contrib-python
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install insightface
pip install onnxruntime-gpu
```

#### 2. Qdrant 설치

wsl에서 불러오기 or EC2에서 불러오고 포트 열어서 테스트

```bash
# Docker 사용하여 Qdrant 설치
docker run -d --name qdrant -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
# python 클라이언트 설치
pip install qdrant-client
```

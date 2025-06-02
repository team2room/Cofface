# insightface

`nvidia-smi` 해서 cuda가 나온다고 설치된 것이 아님. `nvcc -V` 로 버전을 확인해봐야 함.

```bash
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\bin
C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\libnvvp
C:\Program Files\NVIDIA\CUDNN\v9.1\bin
```

## 호환되는 버전

python 3.8 ~ 3.12

cuda 11.8 / 12.1 / 12.4(불안정)

cudnn 9.1

onnxruntime-gpu 1.15.1

pytorch 2.4.0

numpy 1.24.4

```bash
pip uninstall onnxruntime-gpu

python -m pip install onnxruntime-gpu --pre --extra-index-url=https://aiinfra.pkgs.visualstudio.com/PublicPackages/_packaging/ORT-Nightly/pypi/simple/

# insightface, opencv 설치
pip install insightface opencv-python

# numpy 설치
pip install numpy==1.24.4
```


![Screenshot_at_Apr_29_21-25-47](/uploads/d5bf8f97a64aca55f7ac2c71bfe5ff79/Screenshot_at_Apr_29_21-25-47.png)


https://github.com/microsoft/onnxruntime/issues/22019

https://github.com/deepinsight/insightface/issues/2394

https://github.com/deepinsight/insightface/tree/master/python-package

https://github.com/cubiq/ComfyUI_IPAdapter_plus/issues/238

https://onnxruntime.ai/docs/execution-providers/CUDA-ExecutionProvider.html#requirements

## 테스트코드

```jsx
from insightface.app import FaceAnalysis
from pathlib import Path

THIS_DIR = Path(__file__).parent
inface_models = THIS_DIR / "ComfyUI/models/insightface"
model = FaceAnalysis(name="buffalo_l", root=str(inface_models), providers=['CUDAExecutionProvider',])
model.prepare(ctx_id=0, det_size=(640, 640))
```

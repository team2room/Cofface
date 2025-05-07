from insightface.app import FaceAnalysis
from pathlib import Path

THIS_DIR = Path(__file__).parent
inface_models = THIS_DIR / "ComfyUI/models/insightface"
model = FaceAnalysis(name="buffalo_l", root=str(inface_models), providers=['CUDAExecutionProvider',])
model.prepare(ctx_id=0, det_size=(640, 640))

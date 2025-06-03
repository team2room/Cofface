from insightface.app import FaceAnalysis
from pathlib import Path

THIS_DIR = Path(__file__).parent
inface_models = THIS_DIR / "insightface"
model = FaceAnalysis(name="buffalo_l", root=str(inface_models), allowed_modules=['detection', 'recognition', 'genderage'], providers=['CUDAExecutionProvider',])
model.prepare(ctx_id=0, det_size=(640, 640))

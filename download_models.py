# download_models.py
import os
import argparse
import insightface
from insightface.app import FaceAnalysis
from insightface.utils import download_onnx

def download_insightface_models(dest_dir="models"):
    # 모델 저장 디렉토리 생성
    os.makedirs(dest_dir, exist_ok=True)
    buffalo_dir = os.path.join(dest_dir, "buffalo_l")
    os.makedirs(buffalo_dir, exist_ok=True)
    
    # FaceAnalysis를 사용하여 기본 모델 다운로드
    app = FaceAnalysis(name="buffalo_l", root=dest_dir)
    app.prepare(ctx_id=0, det_size=(640, 640))
    
    # 저장된 모델 경로 출력
    print(f"Models downloaded to {buffalo_dir}")
    files = os.listdir(buffalo_dir)
    print(f"Downloaded files: {files}")
    
    # genderage.onnx 모델 경로 확인
    genderage_path = os.path.join(buffalo_dir, "genderage.onnx")
    if os.path.exists(genderage_path):
        print(f"genderage.onnx found at {genderage_path}")
    else:
        print("genderage.onnx not found. Trying manual download...")
        url = "https://github.com/deepinsight/insightface/tree/master/model_zoo/genderage.onnx"
        download_onnx(url, genderage_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download InsightFace models")
    parser.add_argument("--dest", type=str, default="models", 
                      help="Destination directory for models")
    args = parser.parse_args()
    
    download_insightface_models(args.dest)
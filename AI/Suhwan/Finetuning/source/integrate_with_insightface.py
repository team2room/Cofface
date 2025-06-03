# integrate_with_insightface.py
import os
import argparse
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import shutil

def integrate_finetuned_model(finetuned_model_path, insightface_dir):
    """파인튜닝된 모델을 InsightFace 디렉토리에 통합"""
    # 대상 경로 설정
    target_path = os.path.join(insightface_dir, "genderage.onnx")
    
    # 원본 모델 백업
    if os.path.exists(target_path):
        backup_path = os.path.join(insightface_dir, "genderage.onnx.backup")
        shutil.copy2(target_path, backup_path)
        print(f"Original model backed up to {backup_path}")
    
    # 파인튜닝된 모델 복사
    shutil.copy2(finetuned_model_path, target_path)
    print(f"Finetuned model integrated at {target_path}")
    
    return target_path

def test_integrated_model(test_image):
    """통합된 모델 테스트"""
    # InsightFace 초기화
    app = FaceAnalysis(allowed_modules=['detection', 'genderage'])
    app.prepare(ctx_id=0, det_size=(640, 640))
    
    # 이미지 로드
    img = cv2.imread(test_image)
    if img is None:
        print(f"Cannot load image from {test_image}")
        return
    
    # 얼굴 분석
    faces = app.get(img)
    
    if not faces:
        print("No face detected")
        return
    
    # 결과 표시
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    for i, face in enumerate(faces):
        bbox = face.bbox.astype(int)
        gender = "Male" if face.gender == 1 else "Female"
        age = face.age
        
        # 바운딩 박스 그리기
        cv2.rectangle(img, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        
        # 정보 표시
        text = f"Age: {age:.1f}, Gender: {gender}"
        cv2.putText(img, text, (bbox[0], bbox[1] - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        print(f"Face #{i+1} - Age: {age:.1f}, Gender: {gender}")
    
    # 결과 이미지 표시
    cv2.imshow("Result", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    # 결과 이미지 저장
    cv2.imwrite("result.jpg", img)
    print("Result saved to result.jpg")

def main():
    parser = argparse.ArgumentParser(description="Integrate finetuned model with InsightFace")
    parser.add_argument("--model", type=str, required=True, 
                        help="Path to finetuned ONNX model")
    parser.add_argument("--insightface_dir", type=str, default="models/buffalo_l",
                        help="Path to InsightFace model directory")
    parser.add_argument("--test_image", type=str,
                        help="Path to test image (optional)")
    
    args = parser.parse_args()
    
    # 모델 통합
    target_path = integrate_finetuned_model(args.model, args.insightface_dir)
    
    # 테스트 이미지가 제공된 경우 테스트 실행
    if args.test_image:
        print(f"Testing integrated model with {args.test_image}")
        test_integrated_model(args.test_image)

if __name__ == "__main__":
    main()
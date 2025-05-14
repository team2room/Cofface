import os
import argparse
import torch
import numpy as np
from src.model import GenderAgeModel, save_model_to_onnx
from src.dataset import get_dataloaders
from src.train import train_model
from verify_model_compatibility import verify_and_fix_model

def main():
    parser = argparse.ArgumentParser(description="InsightFace genderage 모델 파인튜닝")
    parser.add_argument("--utk_dir", type=str, required=True, 
                      help="UTKFace 데이터셋 경로")
    parser.add_argument("--insightface_dir", type=str, default="./models/buffalo_l", 
                      help="InsightFace 모델 디렉토리")
    parser.add_argument("--output_dir", type=str, default="./models/finetuned", 
                      help="파인튜닝된 모델 저장 디렉토리")
    parser.add_argument("--batch_size", type=int, default=64, 
                      help="배치 크기")
    parser.add_argument("--epochs", type=int, default=20, 
                      help="학습 에포크 수")
    parser.add_argument("--lr", type=float, default=0.001, 
                      help="학습률")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu", 
                      help="학습 장치 (cuda/cpu)")
    
    args = parser.parse_args()
    
    # 출력 디렉토리 생성
    os.makedirs(args.output_dir, exist_ok=True)
    
    # 기존 InsightFace 모델 경로 확인
    original_model_path = os.path.join(args.insightface_dir, "genderage.onnx")
    if not os.path.exists(original_model_path):
        print(f"원본 모델을 찾을 수 없음: {original_model_path}")
        return
    
    # 장치 설정
    device = torch.device(args.device)
    print(f"학습 장치: {device}")
    
    # 데이터 로더 생성
    print("데이터 로더 초기화...")
    train_loader, val_loader = get_dataloaders(
        args.utk_dir,
        batch_size=args.batch_size,
        num_workers=4
    )
    
    # 모델 생성
    print("모델 초기화...")
    model = GenderAgeModel()
    model = model.to(device)
    
    # 모델 학습
    print("학습 시작...")
    model, history = train_model(
        model,
        train_loader,
        val_loader,
        device,
        epochs=args.epochs,
        lr=args.lr,
        save_dir=args.output_dir
    )
    
    # 최종 모델 저장
    model_path = os.path.join(args.output_dir, "final_genderage_model.pth")
    torch.save(model.state_dict(), model_path)
    print(f"파인튜닝된 모델 저장: {model_path}")
    
    # ONNX로 변환
    print("ONNX 변환 중...")
    onnx_path = os.path.join(args.output_dir, "genderage_finetuned.onnx")
    save_model_to_onnx(model, save_path=onnx_path)
    
    # 호환성 검증 및 수정
    print("InsightFace 호환성 확인 및 수정...")
    fixed_onnx_path = os.path.join(args.output_dir, "genderage_insightface_compatible.onnx")
    verify_and_fix_model(onnx_path, fixed_onnx_path)
    
    print(f"완료! 최종 모델: {fixed_onnx_path}")
    print(f"이 모델을 InsightFace의 genderage.onnx 대신 사용하실 수 있습니다.")

if __name__ == "__main__":
    main()
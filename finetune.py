# finetune.py
import os
import argparse
import torch
import time
from src.dataset import get_dataloaders
from src.model import create_finetune_model, save_model_to_onnx
from src.train import train_model
from src.utils import plot_training_history

def main():
    parser = argparse.ArgumentParser(description="Fine-tune InsightFace genderage model")
    parser.add_argument("--utk_dir", type=str, required=True, 
                      help="Path to UTKFace dataset")
    parser.add_argument("--model_dir", type=str, default="models/buffalo_l",
                      help="Path to InsightFace model directory")
    parser.add_argument("--output_dir", type=str, default="models/finetuned",
                      help="Directory to save fine-tuned models")
    parser.add_argument("--batch_size", type=int, default=64,
                      help="Batch size for training")
    parser.add_argument("--epochs", type=int, default=20,
                      help="Number of training epochs")
    parser.add_argument("--lr", type=float, default=0.001,
                      help="Learning rate")
    parser.add_argument("--num_workers", type=int, default=4,
                      help="Number of data loader workers")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu",
                      help="Device to use for training (cuda/cpu)")
    
    args = parser.parse_args()
    
    # 출력 디렉토리 생성
    os.makedirs(args.output_dir, exist_ok=True)
    
    # ONNX 모델 경로
    onnx_path = os.path.join(args.model_dir, "genderage.onnx")
    if not os.path.exists(onnx_path):
        print(f"Model not found at {onnx_path}")
        print("Please run download_models.py first")
        return
    
    # 장치 설정
    device = torch.device(args.device)
    print(f"Using device: {device}")
    
    # 데이터 로더 생성
    print("Creating data loaders...")
    train_loader, val_loader = get_dataloaders(
        args.utk_dir,
        batch_size=args.batch_size,
        num_workers=args.num_workers
    )
    
    # 모델 생성
    print(f"Creating model from {onnx_path}...")
    model = create_finetune_model(onnx_path)
    model = model.to(device)
    
    # 모델 학습
    print("Starting training...")
    start_time = time.time()
    model, history = train_model(
        model,
        train_loader,
        val_loader,
        device,
        epochs=args.epochs,
        lr=args.lr,
        save_dir=args.output_dir
    )
    training_time = time.time() - start_time
    print(f"Training completed in {training_time:.2f} seconds")
    
    # 학습 이력 시각화
    plot_training_history(
        history,
        save_path=os.path.join(args.output_dir, "training_history.png")
    )
    
    # 최종 모델 저장
    torch.save(model.state_dict(), 
              os.path.join(args.output_dir, "final_genderage_model.pth"))
    
    # ONNX 변환 및 저장
    print("Converting model to ONNX format...")
    save_model_to_onnx(
        model,
        save_path=os.path.join(args.output_dir, "genderage_finetuned.onnx")
    )
    
    print("Fine-tuning process completed successfully!")

if __name__ == "__main__":
    main()
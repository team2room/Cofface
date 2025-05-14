# finetune.py - 수정된 버전
import os
import argparse
import torch
import time
import numpy as np
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import random
import matplotlib.pyplot as plt
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import accuracy_score, mean_absolute_error
from tqdm import tqdm

# 모델 정의
class SimpleGenderAgeModel(nn.Module):
    """성별 및 나이 예측 모델"""
    def __init__(self):
        super().__init__()
        
        # CNN 특징 추출기
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(32),
            
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(64),
            
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(128),
            
            nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(256),
            
            nn.AdaptiveAvgPool2d(1)
        )
        
        # 특징 평탄화
        self.flatten = nn.Flatten()
        
        # 연령 예측기
        self.age_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1),
            nn.Sigmoid()  # 0-1 범위로 출력
        )
        
        # 성별 예측기
        self.gender_head = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 1)  # 로짓 출력 (시그모이드 적용 전)
        )
    
    def forward(self, x):
        # 특징 추출
        features = self.features(x)
        features = self.flatten(features)
        
        # 나이 예측
        age_pred = self.age_head(features)
        
        # 성별 예측
        gender_logits = self.gender_head(features)
        
        return age_pred, gender_logits

# 데이터셋 클래스
class UTKFaceDataset(Dataset):
    def __init__(self, root_dir, transform=None, split='train', split_ratio=0.8, seed=42):
        """
        UTKFace 데이터셋 로드 및 전처리
        
        Args:
            root_dir: UTKFace 데이터셋 디렉토리 경로
            transform: 이미지 변환 파이프라인
            split: 'train' 또는 'val'
            split_ratio: 학습/검증 분할 비율
            seed: 랜덤 시드
        """
        self.root_dir = root_dir
        self.transform = transform
        
        # 이미지 파일 목록 구성
        self.files = []
        for filename in os.listdir(root_dir):
            if filename.endswith('.jpg') or filename.endswith('.png'):
                try:
                    # 파일 이름에서 라벨 추출 (나이_성별_인종_시간.jpg)
                    # UTKFace 데이터셋: 0(남성), 1(여성)
                    parts = filename.split('_')
                    if len(parts) >= 3:
                        age = int(parts[0])
                        gender = int(parts[1])  # 0=남성, 1=여성 (원래 정의대로)
                        # gender_normalized = gender  # 모델 출력은 0(여성), 1(남성)으로 나오므로 변환 필요
                        self.files.append((filename, age, gender))
                except:
                    continue
        
        # 훈련/검증 세트 분할
        random.seed(seed)
        random.shuffle(self.files)
        
        split_idx = int(len(self.files) * split_ratio)
        if split == 'train':
            self.files = self.files[:split_idx]
        else:
            self.files = self.files[split_idx:]
        
        print(f"{split} 세트에 {len(self.files)}개 이미지 로드됨")
    
    def __len__(self):
        return len(self.files)
    
    def __getitem__(self, idx):
        filename, age, gender = self.files[idx]
        img_path = os.path.join(self.root_dir, filename)
        
        # 이미지 로드 및 전처리
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        # 나이를 0-100 범위로 정규화
        age = min(100, max(0, age)) / 100.0
        
        return image, torch.tensor([age, gender], dtype=torch.float32)

def get_dataloaders(utk_dir, batch_size=32, num_workers=4):
    """훈련 및 검증용 데이터 로더 생성"""
    # 이미지 전처리 파이프라인
    train_transform = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((112, 112)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    # 데이터셋 및 데이터 로더 생성
    train_dataset = UTKFaceDataset(utk_dir, transform=train_transform, split='train')
    val_dataset = UTKFaceDataset(utk_dir, transform=val_transform, split='val')
    
    train_loader = DataLoader(
        train_dataset, 
        batch_size=batch_size, 
        shuffle=True, 
        num_workers=num_workers,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset, 
        batch_size=batch_size, 
        shuffle=False, 
        num_workers=num_workers,
        pin_memory=True
    )
    
    return train_loader, val_loader

def train_model(model, train_loader, val_loader, device, epochs=20, 
               lr=0.001, weight_decay=1e-5, save_dir="models/finetuned"):
    """모델 학습 함수"""
    # 손실 함수 정의
    gender_criterion = nn.BCEWithLogitsLoss()  # 성별: 이진 분류
    age_criterion = nn.L1Loss()                # 나이: 평균 절대 오차 (MAE)
    
    # 옵티마이저 설정
    optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    
    # 학습률 스케줄러
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    # 모델 저장 디렉토리 생성
    os.makedirs(save_dir, exist_ok=True)
    
    # 학습 이력 저장
    history = {
        "train_loss": [], "val_loss": [],
        "gender_acc": [], "age_mae": []
    }
    
    best_val_loss = float('inf')
    
    # 학습 루프
    for epoch in range(epochs):
        print(f"\nEpoch {epoch+1}/{epochs}")
        model.train()
        train_loss = 0.0
        
        # 학습 배치 처리
        progress_bar = tqdm(train_loader, desc="학습")
        for images, targets in progress_bar:
            images = images.to(device)
            
            # 타겟 분리 (나이, 성별)
            age_targets = targets[:, 0].unsqueeze(1).to(device)
            gender_targets = targets[:, 1].unsqueeze(1).to(device)
            
            # 순전파
            optimizer.zero_grad()
            age_preds, gender_logits = model(images)
            
            # 손실 계산
            age_loss = age_criterion(age_preds, age_targets)
            gender_loss = gender_criterion(gender_logits, gender_targets)
            
            # 전체 손실 = 나이 손실 + 성별 손실
            loss = age_loss + gender_loss
            
            # 역전파 및 최적화
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            progress_bar.set_postfix({"loss": loss.item()})
        
        train_loss /= len(train_loader)
        history["train_loss"].append(train_loss)
        
        # 검증
        val_loss, gender_acc, age_mae = validate_model(
            model, val_loader, device, gender_criterion, age_criterion
        )
        
        # 학습률 스케줄러 업데이트
        scheduler.step(val_loss)
        
        # 이력 저장
        history["val_loss"].append(val_loss)
        history["gender_acc"].append(gender_acc)
        history["age_mae"].append(age_mae)
        
        print(f"Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}, "
              f"Gender Acc: {gender_acc:.4f}, Age MAE: {age_mae:.4f}")
        
        # 최고 모델 저장
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), os.path.join(save_dir, "best_genderage_model.pth"))
            print(f"최고 모델 저장됨 (val_loss: {val_loss:.4f})")
        
        # 주기적으로 모델 저장
        if (epoch + 1) % 5 == 0:
            torch.save(model.state_dict(), 
                      os.path.join(save_dir, f"genderage_model_epoch_{epoch+1}.pth"))
    
    return model, history

def validate_model(model, val_loader, device, gender_criterion, age_criterion):
    """모델 검증 함수"""
    model.eval()
    val_loss = 0.0
    gender_preds_all = []
    gender_targets_all = []
    age_preds_all = []
    age_targets_all = []
    
    with torch.no_grad():
        for images, targets in val_loader:
            images = images.to(device)
            
            # 타겟 분리 (나이, 성별)
            age_targets = targets[:, 0].unsqueeze(1).to(device)
            gender_targets = targets[:, 1].unsqueeze(1).to(device)
            
            # 순전파
            age_preds, gender_logits = model(images)
            
            # 손실 계산
            age_loss = age_criterion(age_preds, age_targets)
            gender_loss = gender_criterion(gender_logits, gender_targets)
            loss = age_loss + gender_loss
            
            val_loss += loss.item()
            
            # 성별 예측 저장 (시그모이드 활성화 후 0.5 임계값 적용)
            gender_probs = torch.sigmoid(gender_logits)
            gender_preds = (gender_probs > 0.5).float()
            
            # 예측값 수집
            gender_preds_all.extend(gender_preds.cpu().numpy())
            gender_targets_all.extend(gender_targets.cpu().numpy())
            age_preds_all.extend((age_preds * 100).cpu().numpy())  # 0-1 → 0-100 변환
            age_targets_all.extend((age_targets * 100).cpu().numpy())
    
    # 평균 손실 계산
    val_loss /= len(val_loader)
    
    # 성별 정확도 계산
    gender_acc = accuracy_score(gender_targets_all, gender_preds_all)
    
    # 나이 MAE 계산
    age_mae = mean_absolute_error(age_targets_all, age_preds_all)
    
    return val_loss, gender_acc, age_mae

def plot_training_history(history, save_path=None):
    """학습 이력 시각화"""
    plt.figure(figsize=(16, 12))
    
    # 손실 그래프
    plt.subplot(2, 2, 1)
    plt.plot(history['train_loss'], label='학습 손실')
    plt.plot(history['val_loss'], label='검증 손실')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.title('손실 곡선')
    plt.legend()
    plt.grid(True)
    
    # 성별 정확도 그래프
    plt.subplot(2, 2, 2)
    plt.plot(history['gender_acc'], label='성별 정확도')
    plt.xlabel('Epoch')
    plt.ylabel('정확도')
    plt.title('성별 정확도')
    plt.grid(True)
    
    # 나이 MAE 그래프
    plt.subplot(2, 2, 3)
    plt.plot(history['age_mae'], label='나이 MAE')
    plt.xlabel('Epoch')
    plt.ylabel('MAE')
    plt.title('나이 평균 절대 오차')
    plt.grid(True)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path)
        print(f"학습 이력 그래프가 {save_path}에 저장되었습니다.")
    
    plt.show()

def main():
    parser = argparse.ArgumentParser(description="InsightFace genderage 모델 파인튜닝")
    parser.add_argument("--utk_dir", type=str, required=True, 
                      help="UTKFace 데이터셋 경로")
    parser.add_argument("--output_dir", type=str, default="models/finetuned",
                      help="파인튜닝된 모델 저장 디렉토리")
    parser.add_argument("--batch_size", type=int, default=64,
                      help="학습 배치 크기")
    parser.add_argument("--epochs", type=int, default=20,
                      help="학습 에폭 수")
    parser.add_argument("--lr", type=float, default=0.001,
                      help="학습률")
    parser.add_argument("--num_workers", type=int, default=4,
                      help="데이터 로더 워커 수")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu",
                      help="학습에 사용할 장치 (cuda/cpu)")
    
    args = parser.parse_args()
    
    # 출력 디렉토리 생성
    os.makedirs(args.output_dir, exist_ok=True)
    
    # 장치 설정
    device = torch.device(args.device)
    print(f"학습에 사용할 장치: {device}")
    
    # 데이터 로더 생성
    print("데이터 로더 생성 중...")
    train_loader, val_loader = get_dataloaders(
        args.utk_dir,
        batch_size=args.batch_size,
        num_workers=args.num_workers
    )
    
    # 모델 생성
    print("모델 생성 중...")
    model = SimpleGenderAgeModel()
    model = model.to(device)
    
    # 모델 학습
    print("학습 시작...")
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
    print(f"학습 완료 ({training_time:.2f} 초)")
    
    # 학습 이력 시각화
    plot_training_history(
        history,
        save_path=os.path.join(args.output_dir, "training_history.png")
    )
    
    # 최종 모델 저장
    torch.save(model.state_dict(), 
              os.path.join(args.output_dir, "final_genderage_model.pth"))
    
    print("파인튜닝 프로세스가 성공적으로 완료되었습니다!")

if __name__ == "__main__":
    main()
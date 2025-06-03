# src/train.py
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from tqdm import tqdm
import time
import os
from sklearn.metrics import accuracy_score, mean_absolute_error

def train_model(model, train_loader, val_loader, device, epochs=20, 
                lr=0.001, weight_decay=1e-5, save_dir="models"):
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
        progress_bar = tqdm(train_loader, desc="Training")
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
            print(f"Best model saved with val_loss: {val_loss:.4f}")
        
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
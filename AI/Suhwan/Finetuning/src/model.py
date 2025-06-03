# src/model.py 간소화된 접근법

import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleGenderAgeModel(nn.Module):
    """간소화된 성별 및 나이 예측 모델"""
    def __init__(self):
        super().__init__()
        
        # 간단한 CNN 특징 추출기
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
            nn.Linear(64, 1)  # 로짓 출력
        )
    
    def forward(self, x):
        """순전파"""
        # 특징 추출
        features = self.features(x)
        features = self.flatten(features)
        
        # 나이 예측
        age_pred = self.age_head(features)
        
        # 성별 예측
        gender_logits = self.gender_head(features)
        
        return age_pred, gender_logits

def create_finetune_model(onnx_model_path=None, feature_dim=None):
    """간소화된 모델 생성 함수"""
    print("Using simplified GenderAge model...")
    return SimpleGenderAgeModel()

def save_model_to_onnx(model, input_size=(1, 3, 112, 112), save_path="models/genderage_finetuned.onnx"):
    """파인튜닝된 PyTorch 모델을 ONNX로 변환하여 저장"""
    # 모델을 평가 모드로 설정
    model.eval()
    
    # 모델 디바이스 확인
    device = next(model.parameters()).device
    
    # 더미 입력 생성 (모델과 동일한 디바이스에)
    dummy_input = torch.randn(input_size, requires_grad=True, device=device)
    
    # 모델 내보내기
    torch.onnx.export(
        model,                          # 모델
        dummy_input,                    # 모델 입력
        save_path,                      # 저장 경로
        export_params=True,             # 모델 파라미터 저장
        opset_version=11,               # ONNX 버전
        do_constant_folding=True,       # 상수 폴딩 최적화
        input_names=['input'],          # 입력 이름
        output_names=['age', 'gender'], # 출력 이름
        dynamic_axes={                  # 동적 축 지정
            'input': {0: 'batch_size'},
            'age': {0: 'batch_size'},
            'gender': {0: 'batch_size'}
        }
    )
    
    print(f"Model saved to {save_path}")
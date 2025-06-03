# evaluate_finetuned_model.py
import os
import argparse
import numpy as np
import cv2
import torch
import torch.nn as nn
from tqdm import tqdm
from sklearn.metrics import accuracy_score, mean_absolute_error
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

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
            nn.Linear(64, 1)  # 로짓 출력
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

def preprocess_image(img, target_size=(112, 112)):
    """이미지 전처리 함수"""
    # 크기 조정
    if img.shape[0] != target_size[0] or img.shape[1] != target_size[1]:
        img = cv2.resize(img, target_size)
    
    # BGR -> RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 정규화 [0, 255] -> [-1, 1]
    img = img.astype(np.float32) / 255.0
    img = (img - 0.5) * 2.0
    
    # 차원 변환 (H, W, C) -> (C, H, W)
    img = np.transpose(img, (2, 0, 1))
    
    return img

def evaluate_finetuned_model(model_path, utk_dir, batch_size=0, device='cuda'):
    """파인튜닝된 모델 평가"""
    # 장치 설정
    device = torch.device(device if torch.cuda.is_available() else 'cpu')
    print(f"평가에 사용할 장치: {device}")
    
    # 모델 로드
    model = SimpleGenderAgeModel()
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
    print(f"모델 로드 완료: {model_path}")
    
    # 결과 저장용 리스트
    age_preds = []
    age_targets = []
    gender_preds = []
    gender_targets = []
    
    # 테스트할 이미지 파일 목록 구성
    test_files = []
    for filename in os.listdir(utk_dir):
        if filename.endswith('.jpg') or filename.endswith('.png'):
            try:
                # 파일 이름에서 라벨 추출 (나이_성별_인종_시간.jpg)
                # UTKFace 데이터셋: 0(남성), 1(여성)
                parts = filename.split('_')
                if len(parts) >= 3:
                    age = int(parts[0])
                    gender = int(parts[1])  # 0=남성, 1=여성
                    test_files.append((os.path.join(utk_dir, filename), age, gender))
            except:
                continue
    
    print(f"테스트할 이미지 수: {len(test_files)}개")
    
    # 평가할 이미지 수 제한
    if batch_size > 0:
        test_files = test_files[:batch_size]
        print(f"평가에 사용할 이미지 수: {len(test_files)}개")
    
    # 평가 진행
    failed_images = 0
    processed_images = 0
    
    for img_path, true_age, true_gender in tqdm(test_files, desc="평가 중"):
        try:
            # 이미지 로드
            img = cv2.imread(img_path)
            if img is None:
                failed_images += 1
                continue
            
            # 이미지 전처리
            processed_img = preprocess_image(img)
            
            # 텐서로 변환 및 모델 입력
            input_tensor = torch.tensor(processed_img, dtype=torch.float32).unsqueeze(0).to(device)
            
            # 예측
            with torch.no_grad():
                age_pred, gender_logit = model(input_tensor)
                
                # 결과 변환
                pred_age = age_pred.item() * 100  # 0-1 -> 0-100 변환
                pred_gender = 1 if torch.sigmoid(gender_logit).item() > 0.5 else 0  # 임계값 0.5
            
            # 결과 저장
            age_preds.append(pred_age)
            age_targets.append(true_age)
            gender_preds.append(pred_gender)
            gender_targets.append(true_gender)
            
            processed_images += 1
            
        except Exception as e:
            print(f"이미지 처리 중 오류 발생 {img_path}: {e}")
            failed_images += 1
    
    if not age_preds:
        print("유효한 예측 결과가 없습니다.")
        return None
    
    # 성능 지표 계산
    age_mae = mean_absolute_error(age_targets, age_preds)
    gender_acc = accuracy_score(gender_targets, gender_preds)
    
    print(f"\n결과 (처리된 이미지: {processed_images}개):")
    print(f"처리 실패한 이미지: {failed_images}개")
    print(f"나이 MAE: {age_mae:.4f}")
    print(f"성별 정확도: {gender_acc:.4f}")
    
    # 연령대별 MAE 계산
    age_groups = [(0, 10), (11, 20), (21, 30), (31, 40), 
                 (41, 50), (51, 60), (61, 70), (71, 100)]
    
    age_group_results = []
    print("\n연령대별 세부 결과:")
    for start, end in age_groups:
        # 해당 연령대 인덱스 찾기
        indices = [i for i, age in enumerate(age_targets) if start <= age <= end]
        if indices:
            group_targets = [age_targets[i] for i in indices]
            group_preds = [age_preds[i] for i in indices]
            group_mae = mean_absolute_error(group_targets, group_preds)
            print(f"  {start}-{end}세: MAE = {group_mae:.2f} (표본수={len(indices)})")
            
            age_group_results.append({
                'Age Group': f"{start}-{end}",
                'MAE': group_mae,
                'Samples': len(indices)
            })
    
    # 시각화
    plot_results(age_targets, age_preds, gender_targets, gender_preds, age_group_results)
    
    return {
        "age_mae": age_mae,
        "gender_accuracy": gender_acc,
        "processed_images": processed_images,
        "failed_images": failed_images,
        "age_group_results": age_group_results
    }

def plot_results(age_targets, age_preds, gender_targets, gender_preds, age_group_results):
    """결과 시각화"""
    plt.figure(figsize=(15, 10))
    
    # 1. 성별 혼동 행렬
    plt.subplot(2, 2, 1)
    cm = np.zeros((2, 2), dtype=int)
    for i in range(len(gender_targets)):
        cm[gender_targets[i], gender_preds[i]] += 1
    
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['남성', '여성'], yticklabels=['남성', '여성'])
    plt.xlabel('예측')
    plt.ylabel('실제')
    plt.title('성별 혼동 행렬')
    
    # 2. 연령대별 MAE
    plt.subplot(2, 2, 2)
    age_group_df = pd.DataFrame(age_group_results)
    sns.barplot(x='Age Group', y='MAE', data=age_group_df)
    plt.xlabel('연령대')
    plt.ylabel('MAE (년)')
    plt.title('연령대별 MAE')
    plt.xticks(rotation=45)
    
    # 3. 예측 vs 실제 나이 산점도
    plt.subplot(2, 2, 3)
    plt.scatter(age_targets, age_preds, alpha=0.3)
    plt.plot([0, 100], [0, 100], 'r--')
    plt.xlabel('실제 나이')
    plt.ylabel('예측 나이')
    plt.title('나이 예측 산점도')
    plt.xlim(0, 100)
    plt.ylim(0, 100)
    
    # evaluate_finetuned_model.py (이어서)
    # 4. 예측 오차 히스토그램
    plt.subplot(2, 2, 4)
    age_errors = np.array(age_preds) - np.array(age_targets)
    plt.hist(age_errors, bins=50, alpha=0.75)
    plt.xlabel('예측 오차 (년)')
    plt.ylabel('빈도')
    plt.title('나이 예측 오차 분포')
    
    plt.tight_layout()
    plt.savefig('finetuned_evaluation_results.png')
    print("평가 결과 그래프가 'finetuned_evaluation_results.png'에 저장되었습니다.")

def main():
    parser = argparse.ArgumentParser(description="파인튜닝된 InsightFace 모델 평가")
    parser.add_argument("--model", type=str, required=True,
                        help="파인튜닝된 모델 경로 (.pth)")
    parser.add_argument("--utk_dir", type=str, required=True,
                        help="UTKFace 데이터셋 경로")
    parser.add_argument("--batch_size", type=int, default=1000,
                        help="평가할 이미지 수 (0=전체)")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu",
                        help="평가에 사용할 디바이스 (cuda/cpu)")
    
    args = parser.parse_args()
    
    # 파인튜닝 모델 평가
    print("파인튜닝된 InsightFace GenderAge 모델 평가 중...")
    results = evaluate_finetuned_model(
        args.model, 
        args.utk_dir, 
        args.batch_size, 
        args.device
    )
    
    if results:
        print("\n요약:")
        print(f"나이 MAE: {results['age_mae']:.4f}")
        print(f"성별 정확도: {results['gender_accuracy']:.4f}")
        print(f"처리된 이미지: {results['processed_images']}개")
        print(f"실패한 이미지: {results['failed_images']}개")
        
        # 결과를 CSV로 저장
        age_group_df = pd.DataFrame(results['age_group_results'])
        age_group_df.to_csv('finetuned_age_group_results.csv', index=False)
        
        summary = {
            '나이 MAE': results['age_mae'],
            '성별 정확도': results['gender_accuracy'],
            '처리된 이미지': results['processed_images'],
            '실패 이미지': results['failed_images']
        }
        pd.DataFrame([summary]).to_csv('finetuned_evaluation_summary.csv', index=False)
        print("평가 결과가 CSV 파일로 저장되었습니다.")

if __name__ == "__main__":
    main()
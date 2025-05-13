# evaluate_finetuned.py
import os
import argparse
import torch
import numpy as np
from tqdm import tqdm
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import confusion_matrix, mean_absolute_error, accuracy_score
import seaborn as sns
from src.dataset import get_dataloaders
from src.model import GenderAgeModel

def evaluate_model(model_path, utk_dir, batch_size=64, num_workers=4,
                  device="cuda" if torch.cuda.is_available() else "cpu"):
    """파인튜닝된 모델 평가"""
    # 데이터 로더 생성 (검증 세트만 사용)
    _, val_loader = get_dataloaders(
        utk_dir,
        batch_size=batch_size,
        num_workers=num_workers
    )
    
    # 모델 로드
    model = GenderAgeModel(feature_dim=512)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
    
    # 예측값과 타겟값 저장할 리스트
    age_preds = []
    age_targets = []
    gender_preds = []
    gender_targets = []
    
    # 예측 수행
    with torch.no_grad():
        for images, targets in tqdm(val_loader, desc="Evaluating"):
            images = images.to(device)
            
            # 타겟 분리 (나이, 성별)
            age_target = targets[:, 0].unsqueeze(1).cpu().numpy() * 100  # 0-1 → 0-100 변환
            gender_target = targets[:, 1].unsqueeze(1).cpu().numpy()
            
            # 예측
            age_pred, gender_logit = model(images)
            
            # 결과 변환
            age_pred = age_pred.cpu().numpy() * 100  # 0-1 → 0-100 변환
            gender_pred = (torch.sigmoid(gender_logit) > 0.5).float().cpu().numpy()
            
            # 결과 저장
            age_preds.append(age_pred)
            age_targets.append(age_target)
            gender_preds.append(gender_pred)
            gender_targets.append(gender_target)
    
    # 배열 합치기
    age_preds = np.vstack(age_preds)
    age_targets = np.vstack(age_targets)
    gender_preds = np.vstack(gender_preds)
    gender_targets = np.vstack(gender_targets)
    
    # 평가 지표 계산
    age_mae = mean_absolute_error(age_targets, age_preds)
    gender_acc = accuracy_score(gender_targets, gender_preds)
    
    print(f"Age MAE: {age_mae:.2f} years")
    print(f"Gender Accuracy: {gender_acc:.4f}")
    
    # 연령대별 MAE 계산
    age_groups = [(0, 10), (11, 20), (21, 30), (31, 40), 
                 (41, 50), (51, 60), (61, 70), (71, 100)]
    
    age_group_results = []
    
    for start, end in age_groups:
        mask = (age_targets >= start) & (age_targets <= end)
        if np.sum(mask) > 0:
            group_mae = mean_absolute_error(age_targets[mask], age_preds[mask])
            group_samples = np.sum(mask)
            age_group_results.append({
                'Age Group': f"{start}-{end}",
                'MAE': group_mae,
                'Samples': group_samples
            })
    
    # 결과 표시
    age_group_df = pd.DataFrame(age_group_results)
    print("\nAge Group MAE:")
    print(age_group_df)
    
    # 성별 혼동 행렬
    cm = confusion_matrix(gender_targets, gender_preds)
    class_names = ['Female', 'Male']
    
    # 결과 시각화
    plt.figure(figsize=(15, 10))
    
    # 1. 성별 혼동 행렬
    plt.subplot(2, 2, 1)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Gender Confusion Matrix')
    
    # 2. 연령대별 MAE
    plt.subplot(2, 2, 2)
    sns.barplot(x='Age Group', y='MAE', data=age_group_df)
    plt.xlabel('Age Group')
    plt.ylabel('MAE (years)')
    plt.title('MAE by Age Group')
    plt.xticks(rotation=45)
    
    # 3. 예측 vs 실제 나이 산점도
    plt.subplot(2, 2, 3)
    plt.scatter(age_targets, age_preds, alpha=0.1)
    plt.plot([0, 100], [0, 100], 'r--')
    plt.xlabel('True Age')
    plt.ylabel('Predicted Age')
    plt.title('Age Prediction Scatter Plot')
    plt.xlim(0, 100)
    plt.ylim(0, 100)
    
    # 4. 예측 오차 히스토그램
    plt.subplot(2, 2, 4)
    age_errors = age_preds - age_targets
    plt.hist(age_errors, bins=50, alpha=0.75)
    plt.xlabel('Prediction Error (years)')
    plt.ylabel('Frequency')
    plt.title('Age Prediction Error Distribution')
    
    plt.tight_layout()
    plt.savefig('evaluation_results.png')
    plt.show()
    
    return {
        'age_mae': age_mae,
        'gender_accuracy': gender_acc,
        'age_group_results': age_group_df
    }

def main():
    parser = argparse.ArgumentParser(description="Evaluate finetuned InsightFace genderage model")
    parser.add_argument("--model", type=str, required=True, 
                        help="Path to finetuned PyTorch model (.pth)")
    parser.add_argument("--utk_dir", type=str, required=True,
                        help="Path to UTKFace dataset")
    parser.add_argument("--batch_size", type=int, default=64,
                        help="Batch size for evaluation")
    parser.add_argument("--device", type=str, 
                        default="cuda" if torch.cuda.is_available() else "cpu",
                        help="Device to use for evaluation (cuda/cpu)")
    
    args = parser.parse_args()
    
    # 모델 평가
    results = evaluate_model(
        args.model,
        args.utk_dir,
        batch_size=args.batch_size,
        device=args.device
    )
    
    # 결과를 CSV로 저장
    age_group_df = results['age_group_results']
    age_group_df.to_csv('age_group_results.csv', index=False)
    
    # 요약 결과 저장
    summary = {
        'Age MAE': results['age_mae'],
        'Gender Accuracy': results['gender_accuracy']
    }
    pd.DataFrame([summary]).to_csv('evaluation_summary.csv', index=False)
    
    print("Evaluation completed and results saved.")

if __name__ == "__main__":
    main()
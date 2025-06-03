# src/utils.py
import os
import torch
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
import cv2

def plot_training_history(history, save_path=None):
    """학습 이력 시각화"""
    plt.figure(figsize=(16, 12))
    
    # 손실 그래프
    plt.subplot(2, 2, 1)
    plt.plot(history['train_loss'], label='Train Loss')
    plt.plot(history['val_loss'], label='Val Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.title('Loss Curve')
    plt.legend()
    plt.grid(True)
    
    # 성별 정확도 그래프
    plt.subplot(2, 2, 2)
    plt.plot(history['gender_acc'], label='Gender Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.title('Gender Accuracy')
    plt.grid(True)
    
    # 나이 MAE 그래프
    plt.subplot(2, 2, 3)
    plt.plot(history['age_mae'], label='Age MAE')
    plt.xlabel('Epoch')
    plt.ylabel('MAE')
    plt.title('Age Mean Absolute Error')
    plt.grid(True)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path)
        print(f"Training history plot saved to {save_path}")
    
    plt.show()

def preprocess_image(image_path, size=(112, 112)):
    """이미지 전처리"""
    image = Image.open(image_path).convert('RGB')
    image = image.resize(size)
    image = np.array(image).astype(np.float32)
    
    # 정규화
    image = (image - 127.5) / 127.5
    
    # 채널 순서 변경 (HWC → CHW)
    image = np.transpose(image, (2, 0, 1))
    
    return torch.tensor(image).unsqueeze(0)

def align_face(image_path, size=(112, 112)):
    """얼굴 정렬 및 추출"""
    try:
        import insightface
        from insightface.app import FaceAnalysis
        
        # InsightFace 모델 로드
        app = FaceAnalysis(name="buffalo_l")
        app.prepare(ctx_id=0, det_size=(640, 640))
        
        # 이미지 로드
        img = cv2.imread(image_path)
        if img is None:
            print(f"Cannot load image from {image_path}")
            return None
            
        # 얼굴 검출
        faces = app.get(img)
        if not faces:
            print(f"No face detected in {image_path}")
            return None
            
        # 가장 큰 얼굴 선택
        face = sorted(faces, key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]), reverse=True)[0]
        
        # 얼굴 영역 추출
        bbox = face.bbox.astype(int)
        x1, y1, x2, y2 = bbox
        face_img = img[y1:y2, x1:x2]
        
        # 크기 조정
        face_img = cv2.resize(face_img, size)
        
        return face_img
    except Exception as e:
        print(f"Error aligning face: {e}")
        return None
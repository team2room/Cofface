# src/dataset.py
import os
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import random

class UTKFaceDataset(Dataset):
    def __init__(self, root_dir, transform=None, split='train', split_ratio=0.8, seed=42):
        """UTKFace 데이터셋 로드 및 전처리
        
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
                    parts = filename.split('_')
                    if len(parts) >= 3:
                        age = int(parts[0])
                        gender = int(parts[1])
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
        
        print(f"Loaded {len(self.files)} images for {split} set")
    
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
    # InsightFace 모델에 맞는 이미지 전처리 파이프라인
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
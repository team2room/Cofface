# evaluate_insightface_direct.py
import os
import argparse
import numpy as np
import cv2
import onnxruntime
from tqdm import tqdm
from sklearn.metrics import accuracy_score, mean_absolute_error
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

def preprocess_image(img, target_size=(112, 112)):
    """이미지 전처리"""
    # 크기 조정
    if img.shape[0] != target_size[0] or img.shape[1] != target_size[1]:
        img = cv2.resize(img, target_size)
    
    # BGR -> RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 정규화 [0, 255] -> [0, 1]
    img = img.astype(np.float32) / 255.0
    
    # 차원 변환 (H, W, C) -> (C, H, W)
    img = np.transpose(img, (2, 0, 1))
    
    # 배치 차원 추가
    img = np.expand_dims(img, axis=0)
    
    return img

def detect_face(image, face_detector):
    """OpenCV DNN 얼굴 검출기를 사용하여 얼굴 검출"""
    h, w = image.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, (300, 300), (104, 117, 123))
    face_detector.setInput(blob)
    detections = face_detector.forward()
    
    # 가장 신뢰도 높은 얼굴 찾기
    max_confidence = 0
    max_box = None
    
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.5:  # 임계값 0.5
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (x1, y1, x2, y2) = box.astype("int")
            
            # 이미지 경계 확인
            if x1 < 0: x1 = 0
            if y1 < 0: y1 = 0
            if x2 > w: x2 = w
            if y2 > h: y2 = h
            
            # 얼굴 영역 크기 확인 (최소 크기)
            if (x2-x1) < 20 or (y2-y1) < 20:
                continue
                
            if confidence > max_confidence:
                max_confidence = confidence
                max_box = (x1, y1, x2, y2)
    
    return max_box

def evaluate_insightface_direct(utk_dir, model_path, batch_size=0):
    """직접 InsightFace genderage.onnx 모델을 로드하여 평가"""
    print(f"모델 경로: {model_path}")
    
    # 얼굴 검출기 로드
    print("얼굴 검출기 로드 중...")
    face_detector_prototxt = "deploy.prototxt"
    face_detector_model = "res10_300x300_ssd_iter_140000.caffemodel"
    
    # 모델 파일 존재 확인
    if not os.path.exists(face_detector_prototxt) or not os.path.exists(face_detector_model):
        print(f"얼굴 검출 모델 파일이 없습니다: {face_detector_prototxt}, {face_detector_model}")
        print("모델 파일을 다운로드하거나 경로를 확인하세요.")
        return None
    
    face_detector = cv2.dnn.readNetFromCaffe(face_detector_prototxt, face_detector_model)
    
    # ONNX 런타임 세션 생성
    print("InsightFace genderage 모델 로드 중...")
    try:
        # CPU 제공자로 설정
        providers = ['CPUExecutionProvider']
        session = onnxruntime.InferenceSession(model_path, providers=providers)
        print("모델 로드 완료")
        
        # 모델 입력/출력 정보 출력
        inputs = session.get_inputs()
        outputs = session.get_outputs()
        print(f"모델 입력: {[x.name for x in inputs]}")
        print(f"모델 출력: {[x.name for x in outputs]}")
        
        input_name = inputs[0].name
        output_names = [x.name for x in outputs]
        
    except Exception as e:
        print(f"모델 로드 실패: {e}")
        return None
    
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
    
    # 결과 저장용 리스트
    age_preds = []
    age_targets = []
    gender_preds = []
    gender_targets = []
    
    # 평가 진행
    failed_images = 0
    processed_images = 0
    face_detector_failed = 0
    
    for img_path, true_age, true_gender in tqdm(test_files, desc="평가 중"):
        try:
            # 이미지 로드
            img = cv2.imread(img_path)
            if img is None:
                failed_images += 1
                continue
            
            # 얼굴 검출
            face_box = detect_face(img, face_detector)
            
            if face_box is None:
                face_detector_failed += 1
                continue
                
            # 얼굴 영역 추출
            x1, y1, x2, y2 = face_box
            face_img = img[y1:y2, x1:x2]
            
            # 전처리 및 모델 입력 준비
            processed_img = preprocess_image(face_img)
            
            # 모델 추론
            try:
                ort_inputs = {input_name: processed_img}
                ort_outputs = session.run(output_names, ort_inputs)
                
                # 출력 결과 처리
                if len(output_names) == 1:
                    # 단일 출력인 경우
                    output = ort_outputs[0]
                    if output.shape[1] == 2:  # [batch, 2]
                        # 출력이 [age, gender] 형태인 경우
                        pred_age = float(output[0, 0]) * 100  # 0-1 -> 0-100
                        pred_gender = 1 if output[0, 1] > 0.5 else 0  # 임계값 0.5
                    else:
                        # 출력 형식을 모르는 경우
                        print(f"알 수 없는 출력 형식: {output.shape}")
                        failed_images += 1
                        continue
                elif len(output_names) == 2:
                    # 별도의 age와 gender 출력이 있는 경우
                    age_output = ort_outputs[0]
                    gender_output = ort_outputs[1]
                    
                    pred_age = float(age_output[0]) * 100
                    pred_gender = 1 if gender_output[0] > 0.5 else 0
                else:
                    # 출력 형식을 모르는 경우
                    print(f"알 수 없는 출력 개수: {len(output_names)}")
                    print(f"출력 형태: {[x.shape for x in ort_outputs]}")
                    
                    # 예상: 첫 번째 출력이 나이, 두 번째 출력이 성별
                    pred_age = float(ort_outputs[0][0]) * 100
                    pred_gender = 1 if float(ort_outputs[1][0]) > 0.5 else 0
            
                # 성별 변환 (모델에 따라 다를 수 있음)
                # InsightFace: 1=남성, 0=여성 -> UTK: 0=남성, 1=여성
                # pred_gender = 0 if pred_gender == 1 else 1  # (필요시 변환)
                
                # 결과 저장
                age_preds.append(pred_age)
                age_targets.append(true_age)
                gender_preds.append(pred_gender)
                gender_targets.append(true_gender)
                
                processed_images += 1
                
            except Exception as e:
                print(f"\n모델 추론 오류: {img_path}, {e}")
                failed_images += 1
                
            # 진행 상황 출력
            if processed_images % 100 == 0:
                print(f"\n진행 중: {processed_images}개 처리, {failed_images}개 실패, {face_detector_failed}개 얼굴 미검출")
            
        except Exception as e:
            print(f"\n이미지 처리 중 오류: {img_path}, {e}")
            failed_images += 1
    
    if not age_preds:
        print("유효한 예측 결과가 없습니다.")
        return None
    
    # 성능 지표 계산
    age_mae = mean_absolute_error(age_targets, age_preds)
    gender_acc = accuracy_score(gender_targets, gender_preds)
    
    print(f"\n결과 (처리된 이미지: {processed_images}개):")
    print(f"처리 실패한 이미지: {failed_images}개")
    print(f"얼굴 미검출 이미지: {face_detector_failed}개")
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
        "face_detector_failed": face_detector_failed,
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
    
    # 4. 예측 오차 히스토그램
    plt.subplot(2, 2, 4)
    age_errors = np.array(age_preds) - np.array(age_targets)
    plt.hist(age_errors, bins=50, alpha=0.75)
    plt.xlabel('예측 오차 (년)')
    plt.ylabel('빈도')
    plt.title('나이 예측 오차 분포')
    
    plt.tight_layout()
    plt.savefig('insightface_direct_evaluation_results.png')
    print("평가 결과 그래프가 'insightface_direct_evaluation_results.png'에 저장되었습니다.")

def download_opencv_models():
    """OpenCV DNN 얼굴 검출 모델 다운로드"""
    import urllib.request
    
    # 모델 파일 다운로드 URL
    model_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
    weights_url = "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20180205_fp16/res10_300x300_ssd_iter_140000_fp16.caffemodel"
    
    # 대체 URL (GitHub에서 다운로드가 안될 경우)
    alt_weights_url = "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20180220_uint8/res10_300x300_ssd_iter_140000.caffemodel"
    
    # 파일 다운로드
    print("OpenCV 얼굴 검출 모델 다운로드 중...")
    
    # prototxt 파일 다운로드
    if not os.path.exists("deploy.prototxt"):
        print("deploy.prototxt 파일 다운로드 중...")
        try:
            urllib.request.urlretrieve(model_url, "deploy.prototxt")
            print("deploy.prototxt 다운로드 완료")
        except Exception as e:
            print(f"다운로드 실패: {e}")
            return False
    else:
        print("deploy.prototxt 파일이 이미 존재합니다.")
    
    # caffemodel 파일 다운로드
    if not os.path.exists("res10_300x300_ssd_iter_140000.caffemodel"):
        print("res10_300x300_ssd_iter_140000.caffemodel 파일 다운로드 중...")
        try:
            # 첫 번째 URL 시도
            try:
                urllib.request.urlretrieve(weights_url, "res10_300x300_ssd_iter_140000.caffemodel")
            except:
                # 첫 번째 URL 실패 시 대체 URL 시도
                urllib.request.urlretrieve(alt_weights_url, "res10_300x300_ssd_iter_140000.caffemodel")
            print("res10_300x300_ssd_iter_140000.caffemodel 다운로드 완료")
        except Exception as e:
            print(f"다운로드 실패: {e}")
            return False
    else:
        print("res10_300x300_ssd_iter_140000.caffemodel 파일이 이미 존재합니다.")
    
    return True

def main():
    parser = argparse.ArgumentParser(description="직접 InsightFace genderage 모델을 사용한 UTKFace 데이터셋 평가")
    parser.add_argument("--utk_dir", type=str, required=True,
                      help="UTKFace 데이터셋 경로")
    parser.add_argument("--model_path", type=str, default="/home/j-k12e202/.insightface/models/buffalo_l/genderage.onnx",
                      help="genderage.onnx 모델 경로")
    parser.add_argument("--batch_size", type=int, default=1000,
                      help="평가할 이미지 수 (0=전체)")
    parser.add_argument("--download_models", action="store_true",
                      help="OpenCV 얼굴 검출 모델 다운로드만 수행")
    
    args = parser.parse_args()
    
    # 모델 다운로드 옵션
    if args.download_models:
        download_opencv_models()
        return
    
    # 필요한 모델 파일 확인 및 다운로드
    if not os.path.exists("deploy.prototxt") or not os.path.exists("res10_300x300_ssd_iter_140000.caffemodel"):
        print("필요한 얼굴 검출 모델 파일을 다운로드합니다.")
        if not download_opencv_models():
            print("모델 다운로드 실패. 프로그램을 종료합니다.")
            return
    
    # genderage.onnx 파일 확인
    if not os.path.exists(args.model_path):
        print(f"genderage.onnx 파일이 존재하지 않습니다: {args.model_path}")
        print("모델 경로를 확인하세요.")
        return
    
    # InsightFace genderage 모델 직접 평가
    results = evaluate_insightface_direct(args.utk_dir, args.model_path, args.batch_size)
    
    if results:
        # 결과를 CSV로 저장
        summary = {
            '나이 MAE': results['age_mae'],
            '성별 정확도': results['gender_accuracy'],
            '처리된 이미지': results['processed_images'],
            '실패 이미지': results['failed_images'],
            '얼굴 미검출 이미지': results['face_detector_failed']
        }
        pd.DataFrame([summary]).to_csv('insightface_direct_evaluation_summary.csv', index=False)
        
        age_group_df = pd.DataFrame(results['age_group_results'])
        age_group_df.to_csv('insightface_direct_age_group_results.csv', index=False)
        
        print("평가 결과가 CSV 파일로 저장되었습니다.")

if __name__ == "__main__":
    main()
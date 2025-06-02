import insightface
from insightface.app import FaceAnalysis
import cv2
import matplotlib.pyplot as plt

# 모델 로딩
app = FaceAnalysis(providers=['CUDAExecutionProvider'])  # Colab은 CUDA GPU 사용
app.prepare(ctx_id=0)  # 0번 GPU 사용

# 이미지 읽기
img = cv2.imread('test_face.jpg')
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

# 얼굴 인식
faces = app.get(img)

# 결과 출력
for face in faces:
    print("Bounding box:", face.bbox)
    print("Landmarks:", face.landmark_3d_68)

# 이미지에 얼굴 박스 그리기
for face in faces:
    box = face.bbox.astype(int)
    cv2.rectangle(img, (box[0], box[1]), (box[2], box[3]), (0,255,0), 2)

plt.figure(figsize=(10,10))
plt.imshow(img)
plt.axis('off')
plt.show()

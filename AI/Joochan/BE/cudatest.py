import onnxruntime as ort
import insightface
import torch
import numpy as np
import time

def check_gpu_usage():
    # ONNX Runtime에서 사용 가능한 프로바이더 확인
    providers = ort.get_available_providers()
    print(f"사용 가능한 ONNX Runtime 프로바이더: {providers}")
    
    # CUDA가 사용 가능한지 확인
    has_cuda = 'CUDAExecutionProvider' in providers
    print(f"CUDA 사용 가능: {has_cuda}")
    
    # PyTorch CUDA 확인
    if torch.cuda.is_available():
        print(f"PyTorch CUDA 사용 가능: {torch.cuda.is_available()}")
        print(f"CUDA 장치 이름: {torch.cuda.get_device_name(0)}")
        print(f"현재 CUDA 장치: {torch.cuda.current_device()}")
        print(f"CUDA 장치 수: {torch.cuda.device_count()}")
    else:
        print("PyTorch CUDA 사용 불가")
    
    # Insightface 모델 로드 및 성능 테스트
    print("\nInsightface 모델 로드 속도 테스트:")
    
    # CUDA 프로바이더로 테스트
    if has_cuda:
        start_time = time.time()
        app_cuda = insightface.app.FaceAnalysis(providers=['CUDAExecutionProvider'])
        app_cuda.prepare(ctx_id=0, det_size=(640, 480))
        cuda_time = time.time() - start_time
        print(f"CUDA 프로바이더로 로드 시간: {cuda_time:.2f}초")
    
    # CPU 프로바이더로 테스트
    start_time = time.time()
    app_cpu = insightface.app.FaceAnalysis(providers=['CPUExecutionProvider'])
    app_cpu.prepare(ctx_id=0, det_size=(640, 480))
    cpu_time = time.time() - start_time
    print(f"CPU 프로바이더로 로드 시간: {cpu_time:.2f}초")
    
    # 더미 이미지로 추론 속도 테스트
    dummy_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    
    print("\n추론 속도 테스트:")
    
    # CUDA 추론 테스트
    if has_cuda:
        # 워밍업
        app_cuda.get(dummy_image)
        
        start_time = time.time()
        iterations = 10
        for _ in range(iterations):
            faces_cuda = app_cuda.get(dummy_image)
        cuda_inference_time = (time.time() - start_time) / iterations
        print(f"CUDA 평균 추론 시간 (10회): {cuda_inference_time:.4f}초")
    
    # CPU 추론 테스트
    # 워밍업
    app_cpu.get(dummy_image)
    
    start_time = time.time()
    iterations = 10
    for _ in range(iterations):
        faces_cpu = app_cpu.get(dummy_image)
    cpu_inference_time = (time.time() - start_time) / iterations
    print(f"CPU 평균 추론 시간 (10회): {cpu_inference_time:.4f}초")
    
    if has_cuda:
        speedup = cpu_inference_time / cuda_inference_time
        print(f"\nCUDA 속도 향상: CPU 대비 {speedup:.2f}배 빠름")
        if speedup < 1.5:
            print("경고: CUDA 가속이 예상보다 낮습니다. GPU 설정을 확인하세요.")

if __name__ == "__main__":
    check_gpu_usage()

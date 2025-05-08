import { useState, useRef } from 'react';
import { FaceDetectionState, CapturedImage } from '../types';

export const useFaceCapture = (moveToNextState: () => void) => {
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const lastFrameRef = useRef<ImageData | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 현재 프레임 저장 (캡처용)
  const saveCurrentFrame = (imageData: ImageData): void => {
    lastFrameRef.current = imageData;
  };

  // 얼굴 캡처
  const captureFace = (currentState: FaceDetectionState): void => {
    console.log(
      'captureFace 함수 시작, 현재 상태:',
      FaceDetectionState[currentState]
    );

    if (!lastFrameRef.current) return;

    // 캡처용 캔버스 생성
    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas');
      hiddenCanvasRef.current.width = 640;
      hiddenCanvasRef.current.height = 480;
    }

    const canvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 이미지 데이터를 캔버스에 그리기
    const imgData = lastFrameRef.current;
    ctx.putImageData(imgData, 0, 0);

    // 캡처된 이미지 저장
    const capturedImage: CapturedImage = {
      state: currentState,
      imageData: canvas.toDataURL('image/jpeg'),
    };

    // 이미지 배열에 추가
    setCapturedImages((prev) => [...prev, capturedImage]);

    console.log('캡처 완료, 다음 상태로 이동 호출');

    // 다음 상태로 이동
    moveToNextState();
  };

  // 이미지 초기화
  const resetCapturedImages = (): void => {
    setCapturedImages([]);
  };

  return {
    capturedImages,
    saveCurrentFrame,
    captureFace,
    resetCapturedImages
  };
};
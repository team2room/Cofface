import { useState, useEffect, useRef } from 'react';
import * as mp from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';

export const useFaceMesh = (videoRef: React.RefObject<HTMLVideoElement>, onResults: (results: mp.Results) => void) => {
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const faceMeshRef = useRef<mp.FaceMesh | null>(null);
  const cameraRef = useRef<cam.Camera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // MediaPipe FaceMesh 모델 로드
  useEffect(() => {
    const loadMediaPipeModels = async (): Promise<void> => {
      try {
        // MediaPipe FaceMesh 초기화
        const faceMesh = new mp.FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        // 설정
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // 결과 처리 콜백 설정
        faceMesh.onResults(onResults);

        // 참조 저장
        faceMeshRef.current = faceMesh;

        console.log('MediaPipe 모델 로딩 완료');
        setModelsLoaded(true);
      } catch (error) {
        console.error('MediaPipe 모델 로딩 오류:', error);
        setLoadingError(
          `모델 로딩 오류: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    loadMediaPipeModels();

    return () => {
      stopCamera();
    };
  }, [onResults]);

  // 카메라 시작 함수
  const startCamera = async (): Promise<void> => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      console.warn('모델이나 비디오 엘리먼트가 준비되지 않았습니다');
      return Promise.reject('모델 또는 비디오 준비 안됨');
    }

    try {
      // MediaPipe 카메라 설정
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
        facingMode: 'user',
      });

      // 카메라 시작
      await cameraRef.current.start();
      console.log('카메라 초기화 완료');

      return Promise.resolve();
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      setLoadingError(
        `카메라 접근 오류: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return Promise.reject(error);
    }
  };

  // 카메라 중지 함수
  const stopCamera = (): void => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
    }
  };

  return {
    modelsLoaded,
    loadingError,
    startCamera,
    stopCamera,
  };
};
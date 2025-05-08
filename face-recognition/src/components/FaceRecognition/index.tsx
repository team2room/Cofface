import React, { useRef, useEffect } from 'react';
import * as mp from '@mediapipe/face_mesh';
import { calculateFaceRotation, checkFaceInCircle, isCorrectOrientation } from './utils/faceOrientation';
import { BORDER_COLORS, STATE_MESSAGES, STATE_SUB_MESSAGES } from './utils/constants';
import { useFaceMesh } from './hooks/useFaceMesh';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useTimer } from './hooks/useTimer';
import { useFaceCapture } from './hooks/useFaceCapture';
import { CameraView } from './components/CameraView';
import { DebugPanel } from './components/DebugPanel';
import { ColorGuide } from './components/ColorGuide';
import { StageInfo } from './components/StageInfo';
import { CapturedImagesGrid } from './components/CapturedImagesGrid';
import { ProgressSteps } from './components/ProgressSteps';
import {
  Container,
  ContentWrapper,
  CameraColumn,
  InfoColumn,
  BackButton,
  Message,
  SubMessage,
  Button,
} from './styles';
import { FaceDetectionState } from './types';

const FaceRecognition: React.FC = () => {
  // 레퍼런스
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameRef = useRef<ImageData | null>(null);

  // 커스텀 훅 사용
  const {
    detectionState, 
    setDetectionState,
    faceDetected, 
    setFaceDetected,
    faceWithinBounds, 
    setFaceWithinBounds,
    stateStable,
    borderColor, 
    setBorderColor,
    rotation, 
    setRotation,
    currentStateRef,
    moveToNextState
  } = useFaceDetection();

  const { capturedImages, saveCurrentFrame, captureFace, resetCapturedImages } = useFaceCapture(moveToNextState);

  const { 
    processing,
    stateTimer,
    timerProgress,
    timerActiveRef,
    timerInProgressRef,
    startTimer,
    resetTimer,
    stopTimer
  } = useTimer({
    onTimerComplete: () => captureFace(currentStateRef.current)
  });

  // MediaPipe 결과 처리 함수
  const onResults = (results: mp.Results): void => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    if (!canvasCtx) return;

    // 최근 프레임 저장 (캡처용)
    if (results.image) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = results.image.width;
      tempCanvas.height = results.image.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(
          results.image,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        const imageData = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        lastFrameRef.current = imageData;
        saveCurrentFrame(imageData);
      }
    }

    // 캔버스 지우기 및 비디오 그리기
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // 얼굴이 감지되었는지 확인
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      // 얼굴 감지 상태 업데이트
      setFaceDetected(true);

      // 얼굴이 원 안에 있는지 확인
      const isFaceInCircle = checkFaceInCircle(landmarks);
      setFaceWithinBounds(isFaceInCircle);

      // 얼굴 랜드마크 그리기 - MediaPipe 함수 사용
      // drawing.drawConnectors() 등 그리기 코드...

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks);
      setRotation(rotationValues);

      // 현재 상태 확인
      const currentState = currentStateRef.current;

      // 방향이 올바른지 확인
      const isDirectionCorrect = isCorrectOrientation(rotationValues, currentState);

      // 경계선 색상 설정
      if (stateTimer > 0) {
        setBorderColor(BORDER_COLORS.TIMER_ACTIVE);
      } else if (isDirectionCorrect && isFaceInCircle) {
        setBorderColor(BORDER_COLORS.POSITION_CORRECT);
      } else if (isFaceInCircle) {
        setBorderColor(BORDER_COLORS.PARTIAL_CORRECT);
      } else {
        setBorderColor(BORDER_COLORS.WRONG_POSITION);
      }

      // 타이머가 진행 중일 때 방향 및 위치 확인
      if (timerInProgressRef.current) {
        const isFaceCorrectlyPositioned = isFaceInCircle && isDirectionCorrect;
        if (!isFaceCorrectlyPositioned) {
          stopTimer();
        }
      }

      // 현재 상태가 INIT이 아니고, 얼굴이 원 안에 있고, 방향이 맞으면 타이머 시작
      if (currentState > FaceDetectionState.INIT && 
          isFaceInCircle && 
          isDirectionCorrect && 
          !timerActiveRef.current && 
          !processing) {
        startTimer();
      }
    } else {
      // 얼굴이 감지되지 않음
      setFaceDetected(false);
      setFaceWithinBounds(false);
      setBorderColor(BORDER_COLORS.NO_FACE);

      // 타이머가 진행 중이었다면 중지
      if (timerInProgressRef.current) {
        stopTimer();
      }

      // 얼굴이 감지되지 않음 메시지 표시
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      canvasCtx.fillRect(
        canvasElement.width / 2 - 150,
        canvasElement.height / 2 - 20,
        300,
        40
      );
      canvasCtx.fillStyle = 'red';
      canvasCtx.font = '22px "Noto Sans KR", sans-serif';
      canvasCtx.textAlign = 'center';
      canvasCtx.fillText(
        '얼굴이 감지되지 않았습니다',
        canvasElement.width / 2,
        canvasElement.height / 2 + 7
      );
    }

    // 가이드라인 그리기 (얼굴 원 위치 표시)
    canvasCtx.strokeStyle = faceWithinBounds
      ? 'rgba(0, 200, 83, 0.5)'
      : 'rgba(255, 171, 0, 0.5)';
    canvasCtx.lineWidth = 2;
    canvasCtx.setLineDash([5, 5]);
    canvasCtx.beginPath();
    canvasCtx.arc(
      canvasElement.width / 2,
      canvasElement.height / 2,
      canvasElement.width * 0.25, // 얼굴 크기 기준
      0,
      2 * Math.PI
    );
    canvasCtx.stroke();

    canvasCtx.restore();
  };

  // MediaPipe FaceMesh 초기화
  const { modelsLoaded, loadingError, startCamera, stopCamera } = useFaceMesh(videoRef, onResults);

  // 카메라 사용 시작
  const handleStartCamera = (): void => {
    startVideo()
      .then(() => {
        console.log('카메라 시작 후 상태 강제 변경: INIT → FRONT_FACE');
        // 약간의 지연 후 상태 변경 (카메라가 완전히 초기화되도록)
        setTimeout(() => {
          setDetectionState(FaceDetectionState.FRONT_FACE);
        }, 1000);
      })
      .catch((error) => {
        console.error('카메라 시작 실패:', error);
      });
  };

  const startVideo = async (): Promise<void> => {
    try {
      // 캔버스 크기 설정
      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      // 캡처된 이미지 초기화
      resetCapturedImages();

      // 카메라 시작
      await startCamera();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // 다시 시작 (재촬영)
  const handleRestartCapture = (): void => {
    stopCamera();
    setDetectionState(FaceDetectionState.INIT);
    handleStartCamera();
  };

  // 메시지와 서브메시지 설정
  const getMessage = (): string => {
    if (loadingError) {
      return '카메라 또는 모델 로딩 오류가 발생했습니다';
    }
    return STATE_MESSAGES[detectionState] || (modelsLoaded ? '얼굴 인식을 시작할게요' : '모델 로딩 중...');
  };

  const getSubMessage = (): string => {
    if (loadingError) {
      return '페이지를 새로고침하거나 다시 시도해주세요';
    }
    return STATE_SUB_MESSAGES[detectionState] || '';
  };

  return (
    <Container>
      <BackButton>&lt;</BackButton>

      <Message>{getMessage()}</Message>
      <SubMessage>{getSubMessage()}</SubMessage>

      <ContentWrapper>
        <CameraColumn>
          {detectionState !== FaceDetectionState.COMPLETED && (
            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              detectionState={detectionState}
              borderColor={borderColor}
              stateTimer={stateTimer}
              timerProgress={timerProgress}
            />
          )}

          {/* 완료 화면 - 캡처된 이미지들 */}
          {detectionState === FaceDetectionState.COMPLETED && (
            <CapturedImagesGrid images={capturedImages} />
          )}

          {/* 단계 표시기 */}
          {detectionState !== FaceDetectionState.INIT &&
            detectionState !== FaceDetectionState.COMPLETED && (
              <ProgressSteps currentState={detectionState} />
            )}

          {detectionState === FaceDetectionState.INIT && !loadingError && (
            <Button onClick={handleStartCamera} disabled={!modelsLoaded}>
              {modelsLoaded ? '카메라 켜기' : '모델 로딩 중...'}
            </Button>
          )}

          {detectionState === FaceDetectionState.COMPLETED && (
            <Button onClick={handleRestartCapture}>다시 촬영하기</Button>
          )}

          {loadingError && (
            <Button onClick={() => window.location.reload()}>
              다시 시도하기
            </Button>
          )}
        </CameraColumn>

        <InfoColumn>
          {/* 디버그 패널과 캔버스 */}
          {detectionState !== FaceDetectionState.INIT &&
            detectionState !== FaceDetectionState.COMPLETED && (
              <DebugPanel
                detectionState={detectionState}
                faceDetected={faceDetected}
                faceWithinBounds={faceWithinBounds}
                stateStable={stateStable}
                rotation={rotation}
              />
            )}

          {/* 색상 가이드 추가 */}
          <ColorGuide />

          {/* 현재 단계 정보 추가 */}
          <StageInfo detectionState={detectionState} />
        </InfoColumn>
      </ContentWrapper>
    </Container>
  );
};

export default FaceRecognition;
import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import * as mp from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import * as drawing from '@mediapipe/drawing_utils';

// 얼굴인식 상태 열거형
enum FaceDetectionState {
  INIT = 0,
  FRONT_FACE = 1,
  LEFT_FACE = 2,
  RIGHT_FACE = 3,
  UP_FACE = 4,
  DOWN_FACE = 5,
  COMPLETED = 6,
}

// 스타일 컴포넌트 타입 정의
interface FaceCircleProps {
  borderColor: string;
}

interface TimerCircleProps {
  progress: number;
  color: string;
}

// 3D 회전 상태 타입 정의
interface RotationState {
  roll: number;
  pitch: number;
  yaw: number;
}

// 캡처된 이미지 타입 정의
interface CapturedImage {
  state: FaceDetectionState;
  imageData: string;
}

// 스타일 컴포넌트 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100vh;
  background-color: #000000;
  color: white;
  font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
  gap: 20px;
`;

const CameraColumn = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InfoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
`;

const FaceCircle = styled.div<FaceCircleProps>`
  position: relative;
  width: 300px;
  height: 300px;
  margin-bottom: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${(props) => props.borderColor || '#333'};
  transition: border-color 0.3s ease;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%) scaleX(-1);
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1); // 캔버스도 비디오와 동일하게 좌우 반전
`;

const GuideLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const Message = styled.div`
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
`;

const SubMessage = styled.div`
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
  color: #aaa;
`;

const Button = styled.button`
  width: 90%;
  padding: 15px;
  border-radius: 10px;
  background-color: #333;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TimerDisplay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
`;

// 디버그 패널 스타일 컴포넌트
const DebugPanel = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #555;
  border-radius: 8px;
  padding: 15px;
  font-family: monospace;
  color: #0f0;
`;

const DebugCanvasContainer = styled.div`
  width: 100%;
  margin-bottom: 15px;
`;

const DebugCanvas = styled.canvas`
  width: 100%;
  height: 180px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #555;
  border-radius: 8px;
`;

const DebugValue = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

// 색상 가이드 스타일 컴포넌트
const ColorGuide = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid #555;
  border-radius: 8px;
  padding: 15px;
`;

const ColorItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  margin-right: 10px;
`;

// 타이머 원형 게이지 스타일 컴포넌트
const TimerCircleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const TimerCircleSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const TimerCirclePath = styled.circle<TimerCircleProps>`
  fill: none;
  stroke: ${(props) => props.color};
  stroke-width: 8px;
  stroke-linecap: round;
  stroke-dasharray: 1570;
  stroke-dashoffset: ${(props) => 1570 * (1 - props.progress)};
  transition: stroke-dashoffset 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
`;

// 단계 표시기 스타일 컴포넌트
const ProgressStepsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 80%;
`;

const ProgressStep = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 8px;
  margin: 0 5px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.completed
      ? '#4CAF50'
      : props.active
      ? '#2196F3'
      : 'rgba(255, 255, 255, 0.3)'};
  transition: background-color 0.3s ease;
`;

// 얼굴 가이드라인 컴포넌트
const FaceGuideline = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
`;

// 회전 가이드 마커 컴포넌트 추가
const RotationMarker = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
`;

// 캡처된 이미지 그리드 스타일
const CapturedImagesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 90%;
  margin: 0 auto 20px;
`;

const CapturedImageContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #4caf50;
`;

const CapturedImageLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
`;

const CapturedImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 메인 컴포넌트
const FaceRecognition: React.FC = () => {
  const currentStateRef = useRef<FaceDetectionState>(FaceDetectionState.INIT);
  const [detectionState, setDetectionState] = useState<FaceDetectionState>(
    FaceDetectionState.INIT
  );
  const [processing, setProcessing] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [stateTimer, setStateTimer] = useState<number>(0);
  const [timerProgress, setTimerProgress] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#333');
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [stateStable, setStateStable] = useState<boolean>(true); // 초기값을 true로 변경
  const [rotation, setRotation] = useState<RotationState>({
    roll: 0,
    pitch: 0,
    yaw: 0,
  });
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [faceWithinBounds, setFaceWithinBounds] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<mp.FaceMesh | null>(null);
  const cameraRef = useRef<cam.Camera | null>(null);
  const lastStateTime = useRef<number>(0);
  const lastFrameRef = useRef<ImageData | null>(null);
  const lastTimerCallTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const timerActiveRef = useRef<boolean>(false); // 타이머 활성화 상태를 추적
  const timerInProgressRef = useRef<boolean>(false); // 타이머 진행 중 상태 (카운트다운 중)
  const isFirstMount = useRef<boolean>(true);

  // detectionState가 변경될 때마다 ref 값도 업데이트
  useEffect(() => {
    currentStateRef.current = detectionState;
    console.log(
      `상태 변경됨 및 ref 업데이트: ${FaceDetectionState[detectionState]}`
    );
  }, [detectionState]);

  // 상태 변경 감지용 useEffect 추가
  useEffect(() => {
    console.log(`상태 변경됨: ${FaceDetectionState[detectionState]}`);
    // 상태가 변경될 때마다 stateStable을 항상 true로 설정
    setStateStable(true);
    lastStateTime.current = Date.now();
  }, [detectionState]);

  useEffect(() => {
    // 앱 처음 마운트 시에만 INIT으로 설정
    if (isFirstMount.current) {
      console.log('컴포넌트 첫 마운트, 상태 초기화');
      setDetectionState(FaceDetectionState.INIT);
      isFirstMount.current = false;
    }
  }, []);

  // 메시지와 서브메시지 설정
  const getMessage = (): string => {
    if (loadingError) {
      return '카메라 또는 모델 로딩 오류가 발생했습니다';
    }

    switch (detectionState) {
      case FaceDetectionState.INIT:
        return modelsLoaded ? '얼굴 인식을 시작할게요' : '모델 로딩 중...';
      case FaceDetectionState.FRONT_FACE:
        return '정면을 바라봐주세요';
      case FaceDetectionState.LEFT_FACE:
        return '고개를 왼쪽으로 돌려주세요';
      case FaceDetectionState.RIGHT_FACE:
        return '고개를 오른쪽으로 돌려주세요';
      case FaceDetectionState.UP_FACE:
        return '고개를 들어 위를 바라봐주세요';
      case FaceDetectionState.DOWN_FACE:
        return '고개를 숙여 아래를 바라봐주세요';
      case FaceDetectionState.COMPLETED:
        return '얼굴 인식이 완료되었습니다!';
      default:
        return '';
    }
  };

  const getSubMessage = (): string => {
    if (loadingError) {
      return '페이지를 새로고침하거나 다시 시도해주세요';
    }

    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        return '얼굴이 원 안에 위치하도록 해주세요';
      case FaceDetectionState.LEFT_FACE:
        return '왼쪽으로 약 40도 정도 돌려주세요';
      case FaceDetectionState.RIGHT_FACE:
        return '오른쪽으로 약 30도 정도 돌려주세요';
      case FaceDetectionState.UP_FACE:
        return '위쪽으로 약 11도 정도 올려주세요';
      case FaceDetectionState.DOWN_FACE:
        return '아래쪽으로 약 11도 정도 내려주세요';
      case FaceDetectionState.COMPLETED:
        return '모든 방향에서 얼굴이 캡처되었습니다';
      default:
        return '';
    }
  };

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
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, []);

  // detectionState 변경 확인을 위한 useEffect 추가
  useEffect(() => {
    console.log(`상태가 변경됨: ${FaceDetectionState[detectionState]}`);

    // 상태가 변경되면 새로운 상태에 맞는 UI 조정
    if (detectionState !== FaceDetectionState.INIT) {
      // 타이머 상태 리셋
      timerActiveRef.current = false;
      timerInProgressRef.current = false;
      setProcessing(false);
      setStateTimer(0);
      setTimerProgress(0);

      // 상태 안정화 시간 설정
      lastStateTime.current = Date.now();
      setStateStable(true);

      console.log(`UI 업데이트: ${getMessage()} / ${getSubMessage()}`);
    }
  }, [detectionState]);

  // MediaPipe 결과 처리 함수
  // MediaPipe 결과 처리 함수
  // MediaPipe 결과 처리 함수 (수정된 버전)
  const onResults = (results: mp.Results): void => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    if (!canvasCtx) return;

    // 강제 상태 변경 코드 수정
    // 참조를 통해 현재 값 확인
    const currentState = currentStateRef.current;

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
      }
    }

    // 캔버스 지우기
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // 비디오를 캔버스에 그리기
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

      // 이전 상태가 false였으면 로그 출력
      if (!faceDetected) {
        console.log('얼굴 감지 시작됨');
      }

      // 즉시 변수에 값 설정
      const faceDetectedNow = true;
      setFaceDetected(faceDetectedNow);

      // 얼굴이 원 안에 있는지 확인
      const isFaceInCircle = checkFaceInCircle(landmarks);
      setFaceWithinBounds(isFaceInCircle);

      // 얼굴 랜드마크 그리기 (간소화)
      drawing.drawConnectors(canvasCtx, landmarks, mp.FACEMESH_TESSELATION, {
        color: 'rgba(180, 180, 180, 0.5)',
        lineWidth: 1,
      });

      drawing.drawConnectors(canvasCtx, landmarks, mp.FACEMESH_FACE_OVAL, {
        color: '#E0E0E0',
        lineWidth: 2,
      });

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks);
      setRotation(rotationValues);

      // 디버그 캔버스 업데이트
      updateDebugCanvas(rotationValues);

      // 현재 상태 표시 (추가 로깅)
      console.log('onResults 처리 중:', {
        detectionState: FaceDetectionState[detectionState],
        currentStateRef: FaceDetectionState[currentStateRef.current],
        uiState: document.querySelector('.current-state-element')?.textContent,
      });

      console.log('현재 처리 중인 상태:', FaceDetectionState[currentState]);

      // 방향이 올바른지 확인 (수정된 상태 사용)
      const isDirectionCorrect = isCorrectOrientation(
        rotationValues,
        currentState
      );

      // 경계선 색상 설정 로직도 수정된 상태 사용
      console.log('상태 확인:', {
        state: FaceDetectionState[currentState],
        isFaceInCircle,
        isDirectionCorrect,
        roll: rotationValues.roll,
        pitch: rotationValues.pitch,
        yaw: rotationValues.yaw,
        processing,
        stateStable,
      });

      // 타이머가 진행 중일 때 방향 및 위치 확인
      if (timerInProgressRef.current) {
        const isFaceCorrectlyPositioned = isFaceInCircle && isDirectionCorrect;

        // 타이머가 진행 중인데 위치나 방향이 잘못된 경우
        if (!isFaceCorrectlyPositioned) {
          console.log('타이머 진행 중 위치/방향 불량으로 타이머 초기화');
          // 타이머 중지 및 상태 초기화
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          timerInProgressRef.current = false;
          timerActiveRef.current = false;
          setProcessing(false);
          setStateTimer(0);
          setTimerProgress(0);
        }
      }

      // 경계선 색상 설정
      if (stateTimer > 0) {
        setBorderColor('#4285F4'); // 타이머 작동 중 (파란색)
        console.log('타이머 작동 중 - 파란색');
      } else if (isDirectionCorrect && isFaceInCircle) {
        setBorderColor('#00c853'); // 올바른 방향 (초록색)
        console.log('방향 및 위치 모두 정확 - 초록색');
      } else if (isFaceInCircle) {
        setBorderColor('#FFAB00'); // 얼굴은 원 안에 있지만 방향이 맞지 않음 (주황색)
        console.log('위치만 정확, 방향 부정확 - 주황색');
      } else {
        setBorderColor('#FFC107'); // 얼굴이 원 밖에 있음 (노란색)
        console.log('위치 부정확 - 노란색');
      }

      // 여기서도 수정된 상태 사용
      if (currentState > FaceDetectionState.INIT) {
        checkFaceOrientation(
          rotationValues,
          isFaceInCircle,
          faceDetectedNow,
          currentState
        );
      }
    } else {
      // 이전 상태가 true였으면 로그 출력
      if (faceDetected) {
        console.log('얼굴 감지 중단됨');
      }

      setFaceDetected(false);
      setFaceWithinBounds(false);
      setBorderColor('#ff3d00'); // 얼굴 미감지 (빨간색)

      // 타이머가 진행 중이었다면 중지
      if (timerInProgressRef.current) {
        console.log('얼굴 감지 중단으로 타이머 초기화');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        timerInProgressRef.current = false;
        timerActiveRef.current = false;
        setProcessing(false);
        setStateTimer(0);
        setTimerProgress(0);
      }

      // 얼굴이 감지되지 않음 메시지
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

  // 얼굴이 원 안에 있는지 확인
  const checkFaceInCircle = (landmarks: mp.NormalizedLandmarkList): boolean => {
    // 얼굴 중심점 (코 끝 랜드마크 사용)
    const nose = landmarks[1];

    // 정규화된 중심점 (0~1 범위)
    const center = {
      x: 0.5, // 중앙
      y: 0.5, // 중앙
    };

    // 원의 반지름 (정규화된 값)
    const radius = 0.35; // 0.3에서 0.35로 증가

    // 코와 중심 사이의 거리 계산
    const distance = Math.sqrt(
      Math.pow(nose.x - center.x, 2) + Math.pow(nose.y - center.y, 2)
    );

    // 거리, 반지름, 결과 로깅
    const result = distance < radius;
    console.log('원 위치 체크:', {
      distance: distance.toFixed(3),
      radius,
      result,
      noseX: nose.x.toFixed(3),
      noseY: nose.y.toFixed(3),
    });

    return result;
  };

  // 얼굴 회전 계산 함수 (정수값으로 반환)
  const calculateFaceRotation = (
    landmarks: mp.NormalizedLandmarkList
  ): RotationState => {
    // 주요 랜드마크 추출 (MediaPipe 인덱스)
    const noseTip = landmarks[1]; // 코끝
    const leftEye = landmarks[33]; // 왼쪽 눈
    const rightEye = landmarks[263]; // 오른쪽 눈
    const leftCheek = landmarks[93]; // 왼쪽 볼
    const rightCheek = landmarks[323]; // 오른쪽 볼
    const forehead = landmarks[10]; // 이마 중앙
    const chin = landmarks[152]; // 턱 하단

    // Roll 계산 (Z축 회전) - 눈 사이의 각도
    const deltaY = rightEye.y - leftEye.y;
    const deltaX = rightEye.x - leftEye.x;
    const roll = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

    // Pitch 계산 (X축 회전) - 이마-코-턱 관계
    // 정면에서 0도, 위를 보면 음수, 아래를 보면 양수
    const faceHeight = chin.y - forehead.y;
    const nosePosY = (noseTip.y - forehead.y) / faceHeight;

    let pitch = 0;
    if (nosePosY < 0.48) {
      // 위를 볼 때 (nosePosY가 0.48보다 작으면 위를 보는 것)
      pitch = -((0.48 - nosePosY) * 100);
    } else if (nosePosY > 0.52) {
      // 아래를 볼 때 (nosePosY가 0.52보다 크면 아래를 보는 것)
      pitch = (nosePosY - 0.52) * 100;
    }

    // Yaw 계산 (Y축 회전) - 코와 볼 사이의 관계
    // 정면에서 0도, 왼쪽을 보면 양수, 오른쪽을 보면 음수
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    const nosePosX = (noseTip.x - leftCheek.x) / faceWidth;

    let yaw = 0;
    if (nosePosX < 0.48) {
      // 왼쪽을 볼 때 (nosePosX가 0.48보다 작으면 왼쪽을 보는 것)
      yaw = (0.48 - nosePosX) * 100;
    } else if (nosePosX > 0.52) {
      // 오른쪽을 볼 때 (nosePosX가 0.52보다 크면 오른쪽을 보는 것)
      yaw = -((nosePosX - 0.52) * 100);
    }

    // 정수값으로 반환
    return {
      roll: Math.round(roll),
      pitch: Math.round(pitch),
      yaw: Math.round(yaw),
    };
  };

  // 디버그 캔버스 업데이트 (3D 회전 시각화)
  const updateDebugCanvas = (rotationValues: RotationState): void => {
    if (!debugCanvasRef.current) return;

    const canvas = debugCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 제목
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Face Rotation Debug', canvas.width / 2, 15);

    // 각도 값 표시 (roll, pitch, yaw) - 정수로 표시
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    // Roll (Z축 회전)
    ctx.fillStyle = '#FF8080';
    ctx.fillText(`Roll: ${rotationValues.roll}°`, 10, 35);
    const rollStatus = Math.abs(rotationValues.roll) < 15 ? 'OK' : 'NG';
    ctx.fillText(rollStatus, canvas.width - 30, 35);

    // Pitch (X축 회전)
    ctx.fillStyle = '#80FF80';
    ctx.fillText(`Pitch: ${rotationValues.pitch}°`, 10, 55);

    let pitchStatus = 'NG';
    if (
      detectionState === FaceDetectionState.UP_FACE &&
      rotationValues.pitch < -25
    ) {
      pitchStatus = 'OK';
    } else if (
      detectionState === FaceDetectionState.DOWN_FACE &&
      rotationValues.pitch > 25
    ) {
      pitchStatus = 'OK';
    } else if (Math.abs(rotationValues.pitch) < 15) {
      pitchStatus = 'OK';
    }
    ctx.fillText(pitchStatus, canvas.width - 30, 55);

    // Yaw (Y축 회전)
    ctx.fillStyle = '#8080FF';
    ctx.fillText(`Yaw: ${rotationValues.yaw}°`, 10, 75);

    let yawStatus = 'NG';
    if (
      detectionState === FaceDetectionState.LEFT_FACE &&
      rotationValues.yaw > 25
    ) {
      yawStatus = 'OK';
    } else if (
      detectionState === FaceDetectionState.RIGHT_FACE &&
      rotationValues.yaw < -25
    ) {
      yawStatus = 'OK';
    } else if (Math.abs(rotationValues.yaw) < 15) {
      yawStatus = 'OK';
    }
    ctx.fillText(yawStatus, canvas.width - 30, 75);

    // 현재 상태 표시
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `현재 상태: ${FaceDetectionState[detectionState]} (${detectionState}/6)`,
      canvas.width / 2,
      95
    );

    // 3D 얼굴 시각화
    const centerX = canvas.width / 2;
    const centerY = 135;
    const radius = 35;

    // 얼굴 타원 그리기
    ctx.save();
    ctx.translate(centerX, centerY);

    // Roll 회전 (z축 회전)
    ctx.rotate((rotationValues.roll * Math.PI) / 180);

    // Yaw에 따른 타원 스케일링
    const yawFactor = Math.cos((rotationValues.yaw * Math.PI) / 180);
    // Pitch에 따른 타원 스케일링
    const pitchFactor = Math.cos((rotationValues.pitch * Math.PI) / 180);

    // 얼굴 윤곽 그리기
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      radius * yawFactor,
      radius * pitchFactor,
      0,
      0,
      2 * Math.PI
    );
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 코 그리기 (방향 표시)
    const noseLength = 15;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    const noseEndX =
      noseLength * Math.sin((rotationValues.yaw * Math.PI) / 180);
    const noseEndY =
      noseLength * Math.sin((rotationValues.pitch * Math.PI) / 180);
    ctx.lineTo(noseEndX, noseEndY);
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 눈 그리기
    const eyeOffsetX = 15 * yawFactor;
    const eyeOffsetY = -10 * pitchFactor;
    const eyeWidth = 8 * yawFactor;
    const eyeHeight = 5 * pitchFactor;

    // 왼쪽 눈
    ctx.beginPath();
    ctx.ellipse(
      -eyeOffsetX,
      eyeOffsetY,
      eyeWidth,
      eyeHeight,
      0,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = '#80FFFF';
    ctx.fill();

    // 오른쪽 눈
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#80FFFF';
    ctx.fill();

    // 입 그리기
    const mouthWidth = 20 * yawFactor;
    const mouthHeight = 5 * pitchFactor;
    ctx.beginPath();
    ctx.ellipse(0, 15 * pitchFactor, mouthWidth, mouthHeight, 0, 0, Math.PI);
    ctx.strokeStyle = '#FF8080';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  // 현재 상태에 맞는 얼굴 방향인지 확인 (개선된 로직)
  const isCorrectOrientation = (
    rotation: RotationState,
    state: FaceDetectionState
  ): boolean => {
    // 디버그 정보 출력
    console.log('방향 체크 상세 값:', {
      state: FaceDetectionState[state],
      roll: rotation.roll,
      pitch: rotation.pitch,
      yaw: rotation.yaw,
    });

    // INIT 상태일 때는 항상 false 반환
    if (state === FaceDetectionState.INIT) {
      console.log('INIT 상태에서는 항상 방향 부정확으로 처리');
      return false;
    }

    // 개선된 방향 체크 로직 - 부호 수정
    switch (state) {
      case FaceDetectionState.FRONT_FACE:
        // 정면: roll, pitch, yaw 모두 ±15도 이내
        const frontRollOK = Math.abs(rotation.roll) <= 20;
        const frontPitchOK = Math.abs(rotation.pitch) <= 6;
        const frontYawOK = Math.abs(rotation.yaw) <= 10;

        const frontResult = frontRollOK && frontPitchOK && frontYawOK;
        console.log('정면 방향 체크:', {
          result: frontResult,
          frontRollOK,
          frontPitchOK,
          frontYawOK,
        });
        return frontResult;

      case FaceDetectionState.LEFT_FACE:
        // 왼쪽: yaw가 -45~-35도 (부호 수정)
        const leftRollOK = Math.abs(rotation.roll) <= 15;
        const leftPitchOK = Math.abs(rotation.pitch) <= 15;
        const leftYawOK = rotation.yaw <= -15 && rotation.yaw >= -35;

        const leftResult = leftRollOK && leftPitchOK && leftYawOK;
        console.log('왼쪽 방향 체크:', {
          result: leftResult,
          leftRollOK,
          leftPitchOK,
          leftYawOK,
        });
        return leftResult;

      case FaceDetectionState.RIGHT_FACE:
        // 오른쪽: yaw가 25~35도 (부호 수정)
        const rightRollOK = Math.abs(rotation.roll) <= 15;
        const rightPitchOK = Math.abs(rotation.pitch) <= 15;
        const rightYawOK = rotation.yaw >= 15 && rotation.yaw <= 35;

        const rightResult = rightRollOK && rightPitchOK && rightYawOK;
        console.log('오른쪽 방향 체크:', {
          result: rightResult,
          rightRollOK,
          rightPitchOK,
          rightYawOK,
        });
        return rightResult;

      case FaceDetectionState.UP_FACE:
        // 위: pitch가 -13~-9도
        const upRollOK = Math.abs(rotation.roll) <= 15;
        const upPitchOK = rotation.pitch <= -2 && rotation.pitch >= -7;
        const upYawOK = Math.abs(rotation.yaw) <= 15;

        const upResult = upRollOK && upPitchOK && upYawOK;
        console.log('위쪽 방향 체크:', {
          result: upResult,
          upRollOK,
          upPitchOK,
          upYawOK,
        });
        return upResult;

      case FaceDetectionState.DOWN_FACE:
        // 아래: pitch가 9~13도
        const downRollOK = Math.abs(rotation.roll) <= 15;
        const downPitchOK = rotation.pitch >= 9 && rotation.pitch <= 15;
        const downYawOK = Math.abs(rotation.yaw) <= 15;

        const downResult = downRollOK && downPitchOK && downYawOK;
        console.log('아래쪽 방향 체크:', {
          result: downResult,
          downRollOK,
          downPitchOK,
          downYawOK,
        });
        return downResult;

      default:
        return false;
    }
  };

  // 얼굴 방향 확인 (매개변수 수정)
  const checkFaceOrientation = (
    rotationValues: RotationState,
    inBounds: boolean,
    faceDetectedNow: boolean,
    currentState: FaceDetectionState
  ): void => {
    // 타이머가 이미 진행 중이면 검사하지 않음
    if (timerInProgressRef.current) {
      return;
    }

    console.log('방향 체크 함수 호출됨', {
      faceDetectedNow,
      processing,
      stateStable,
      inBounds,
      state: FaceDetectionState[currentState],
      timerActive: timerActiveRef.current,
    });

    // INIT 상태일 때는 체크하지 않음
    if (currentState === FaceDetectionState.INIT) {
      console.log('INIT 상태에서는 방향 체크하지 않음');
      return;
    }

    if (!faceDetectedNow) {
      console.log('얼굴 미감지로 인한 처리 불가');
      return;
    }

    // 타이머가 이미 활성화되어 있는지 확인
    if (timerActiveRef.current || processing) {
      console.log('이미 타이머 활성화 상태로 인한 미작동');
      return;
    }

    if (!inBounds) {
      console.log('얼굴이 원 밖에 위치하여 타이머 미작동');
      return;
    }

    // 방향이 올바른지 확인 - 여기서 현재 상태 그대로 사용
    const isCorrect = isCorrectOrientation(rotationValues, currentState);

    if (isCorrect) {
      console.log('✅ 모든 조건 만족! 타이머 시작');
      // 타이머 시작을 위한 함수 호출
      handleStateTimer();
    } else {
      console.log('❌ 방향 부정확으로 타이머 미작동');
    }
  };

  // 상태 타이머 처리 및 원형 게이지 업데이트
  const handleStateTimer = (): void => {
    // 이미 타이머가 진행 중이면 중복 호출 무시
    if (timerInProgressRef.current) {
      console.log('이미 타이머가 진행 중입니다. 중복 호출 무시');
      return;
    }

    // 이미 처리 중이면 무시
    if (processing) {
      console.log('이미 처리 중으로 인한 타이머 미작동');
      return;
    }

    console.log('타이머 시작 함수 호출됨');

    // 기존 타이머가 있으면 제거
    if (timerRef.current) {
      clearInterval(timerRef.current);
      console.log('기존 타이머 제거');
    }

    // 타이머 활성화 상태 설정
    timerActiveRef.current = true;
    timerInProgressRef.current = true;

    // 처리 중 상태 설정
    setProcessing(true);
    console.log('타이머 시작: 처리 중 상태 설정');

    // 3초 카운트다운
    let count = 3;
    let progress = 0;
    setStateTimer(count);
    setTimerProgress(progress);

    // 50ms 단위로 진행도 업데이트 (부드러운 애니메이션)
    const updateInterval = 50;
    const totalDuration = 3000;
    const totalSteps = totalDuration / updateInterval;
    let currentStep = 0;

    const interval = setInterval(() => {
      // 타이머 진행 중 얼굴 위치와 방향이 유효하지 않으면
      // onResults에서 timerInProgressRef.current = false로 설정됨
      if (!timerInProgressRef.current) {
        clearInterval(interval);
        timerRef.current = null;
        console.log('타이머 중단: 얼굴 위치/방향 변경');
        setProcessing(false);
        setStateTimer(0);
        setTimerProgress(0);
        return;
      }

      currentStep++;
      progress = currentStep / totalSteps;
      setTimerProgress(progress);

      if (currentStep % (totalSteps / 3) === 0) {
        // 1초마다 카운트 감소
        count--;
        setStateTimer(count);
        console.log(`타이머 카운트: ${count}`);
      }

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        timerRef.current = null;
        console.log('타이머 완료: 얼굴 캡처 호출');

        // 타이머 완료 후 캡처 진행
        captureFace(); // 카운트 완료 후 얼굴 캡처

        console.log('captureFace 호출 완료');

        // 상태 리셋
        setProcessing(false);
        setStateTimer(0);
        setTimerProgress(0);
        timerActiveRef.current = false;
        timerInProgressRef.current = false;
      }
    }, updateInterval);

    // 타이머 ID 저장
    timerRef.current = interval as unknown as number;

    console.log('타이머 설정 완료');
  };

  // 얼굴 캡처
  const captureFace = (): void => {
    console.log(
      'captureFace 함수 시작, 현재 상태:',
      FaceDetectionState[detectionState]
    );
    console.log(
      'currentStateRef 값:',
      FaceDetectionState[currentStateRef.current]
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
      state: detectionState,
      imageData: canvas.toDataURL('image/jpeg'),
    };

    // 이미지 배열에 추가
    setCapturedImages((prev) => [...prev, capturedImage]);

    console.log('캡처 완료, 다음 상태로 이동 호출');
    console.log('이동 전 현재 상태:', FaceDetectionState[detectionState]);

    // 다음 상태로 이동
    moveToNextState();
    console.log(
      'moveToNextState 호출 후, React 상태:',
      FaceDetectionState[detectionState]
    );
    console.log(
      'moveToNextState 호출 후, Ref 상태:',
      FaceDetectionState[currentStateRef.current]
    );
    // 이동 후 확인 (비동기 처리 때문에 setTimeout 사용)
    setTimeout(() => {
      console.log('이동 후 현재 상태:', FaceDetectionState[detectionState]);
    }, 100);

    console.log('moveToNextState 호출 완료');
  };

  // 다음 상태로 이동
  const moveToNextState = (): void => {
    // 현재 ref에서 상태 읽기
    const currentState = currentStateRef.current;
    console.log(
      'moveToNextState 함수 시작, 현재 상태:',
      FaceDetectionState[currentState]
    );

    // 타이머 상태 리셋
    timerActiveRef.current = false;
    timerInProgressRef.current = false;

    let nextState: FaceDetectionState;

    switch (currentState) {
      case FaceDetectionState.INIT:
        nextState = FaceDetectionState.FRONT_FACE;
        break;
      case FaceDetectionState.FRONT_FACE:
        nextState = FaceDetectionState.LEFT_FACE;
        break;
      case FaceDetectionState.LEFT_FACE:
        nextState = FaceDetectionState.RIGHT_FACE;
        break;
      case FaceDetectionState.RIGHT_FACE:
        nextState = FaceDetectionState.UP_FACE;
        break;
      case FaceDetectionState.UP_FACE:
        nextState = FaceDetectionState.DOWN_FACE;
        break;
      case FaceDetectionState.DOWN_FACE:
        // 모든 얼굴 각도 캡처 완료
        nextState = FaceDetectionState.COMPLETED;

        // 카메라 중지
        if (cameraRef.current) {
          cameraRef.current.stop();
        }
        break;
      default:
        nextState = detectionState; // 변경 없음
        break;
    }
    // 상태 변경
    if (nextState !== currentState) {
      console.log(
        `상태 변경 시도: ${FaceDetectionState[currentState]} -> ${FaceDetectionState[nextState]}`
      );

      // 함수형 업데이트 사용
      setDetectionState((prevState) => {
        console.log(
          `상태 변경 실행: ${FaceDetectionState[prevState]} -> ${FaceDetectionState[nextState]}`
        );
        return nextState;
      });

      // 상태 변경 후 안정화 시간 리셋
      lastStateTime.current = Date.now();
      setStateStable(true);

      // 타이머 상태 리셋
      setStateTimer(0);
      setTimerProgress(0);
    }
  };

  // 비디오 시작
  const startVideo = async (): Promise<void> => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      console.warn('모델이나 비디오 엘리먼트가 준비되지 않았습니다');
      return Promise.reject('모델 또는 비디오 준비 안됨');
    }

    try {
      // 캔버스 크기 설정
      if (canvasRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      // 디버그 캔버스 크기 설정
      if (debugCanvasRef.current) {
        debugCanvasRef.current.width = 300;
        debugCanvasRef.current.height = 180;
      }

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

      // 캡처된 이미지 초기화
      setCapturedImages([]);

      // 카메라 시작
      await cameraRef.current.start();
      console.log('카메라 초기화 완료');

      // 상태 즉시 변경
      setDetectionState(FaceDetectionState.FRONT_FACE);
      setStateStable(true); // 안정화 상태 즉시 설정
      lastStateTime.current = Date.now();
      console.log('상태 즉시 변경됨: INIT → FRONT_FACE');

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

  // 카메라 사용 시작 (수정)
  const handleStartCamera = (): void => {
    startVideo()
      .then(() => {
        console.log('카메라 시작 후 상태 강제 변경: INIT → FRONT_FACE');
        // 약간의 지연 후 상태 변경 (카메라가 완전히 초기화되도록)
        setTimeout(() => {
          setDetectionState(FaceDetectionState.FRONT_FACE);
          // 상태 안정화를 위한 타이머도 즉시 시작
          setStateStable(true);
          lastStateTime.current = Date.now();
        }, 1000);
      })
      .catch((error) => {
        console.error('카메라 시작 실패:', error);
      });
  };

  // 다시 시작 (재촬영)
  const handleRestartCapture = (): void => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    handleStartCamera();
  };

  // 캡처된 이미지 렌더링
  const renderCapturedImages = () => {
    if (capturedImages.length === 0) return null;

    const getStateLabel = (state: FaceDetectionState): string => {
      switch (state) {
        case FaceDetectionState.FRONT_FACE:
          return '정면';
        case FaceDetectionState.LEFT_FACE:
          return '좌측';
        case FaceDetectionState.RIGHT_FACE:
          return '우측';
        case FaceDetectionState.UP_FACE:
          return '위';
        case FaceDetectionState.DOWN_FACE:
          return '아래';
        default:
          return '';
      }
    };

    return (
      <CapturedImagesGrid>
        {capturedImages.map((img, index) => (
          <CapturedImageContainer key={index}>
            <CapturedImg src={img.imageData} alt={`captured-${index}`} />
            <CapturedImageLabel>{getStateLabel(img.state)}</CapturedImageLabel>
          </CapturedImageContainer>
        ))}
      </CapturedImagesGrid>
    );
  };

  // 단계 표시기 렌더링
  const renderProgressSteps = () => {
    const steps = [
      FaceDetectionState.FRONT_FACE,
      FaceDetectionState.LEFT_FACE,
      FaceDetectionState.RIGHT_FACE,
      FaceDetectionState.UP_FACE,
      FaceDetectionState.DOWN_FACE,
    ];

    return (
      <ProgressStepsContainer>
        {steps.map((step, index) => (
          <ProgressStep
            key={index}
            active={detectionState === step}
            completed={detectionState > step}
          />
        ))}
      </ProgressStepsContainer>
    );
  };

  // 안내 가이드라인 컴포넌트
  const renderGuidelines = (): JSX.Element | null => {
    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        return (
          <FaceGuideline>
            {/* 정면 안내 - 얼굴 윤곽 원과 십자선 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                height: '80%',
                width: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                width: '80%',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateY(-50%)',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.LEFT_FACE:
        return (
          <FaceGuideline>
            {/* 왼쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateY(30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '25%',
                width: '25%',
                height: '2px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '25%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateY(-50%) rotate(-45deg)',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.RIGHT_FACE:
        return (
          <FaceGuideline>
            {/* 오른쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateY(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '25%',
                height: '2px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderRight: '2px solid white',
                transform: 'translateY(-50%) rotate(45deg)',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.UP_FACE:
        return (
          <FaceGuideline>
            {/* 위쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(45deg)',
              }}
            />
          </FaceGuideline>
        );

      case FaceDetectionState.DOWN_FACE:
        return (
          <FaceGuideline>
            {/* 아래쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderBottom: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(-45deg)',
              }}
            />
          </FaceGuideline>
        );

      default:
        return null;
    }
  };

  // 색상 가이드 렌더링
  const renderColorGuide = () => {
    return (
      <ColorGuide>
        <h3 style={{ margin: '0 0 15px 0' }}>경계선 색상 의미</h3>

        <ColorItem>
          <ColorSwatch color='#ff3d00' />
          <div>
            <strong>빨간색</strong>: 얼굴 미감지
          </div>
        </ColorItem>

        <ColorItem>
          <ColorSwatch color='#FFC107' />
          <div>
            <strong>노란색</strong>: 얼굴이 원 밖에 위치함
          </div>
        </ColorItem>

        <ColorItem>
          <ColorSwatch color='#FFAB00' />
          <div>
            <strong>주황색</strong>: 얼굴은 원 안에 있으나
            <br />
            방향이 올바르지 않음
          </div>
        </ColorItem>

        <ColorItem>
          <ColorSwatch color='#00c853' />
          <div>
            <strong>초록색</strong>: 위치와 방향 모두 올바름
            <br />
            (촬영 준비됨)
          </div>
        </ColorItem>

        <ColorItem>
          <ColorSwatch color='#4285F4' />
          <div>
            <strong>파란색</strong>: 카운트다운 진행 중
          </div>
        </ColorItem>
      </ColorGuide>
    );
  };

  // 현재 단계 정보 렌더링
  const renderStageInfo = () => {
    return (
      <ColorGuide>
        <h3 style={{ margin: '0 0 15px 0' }}>현재 촬영 단계</h3>

        <div style={{ marginBottom: '10px' }}>
          {detectionState === FaceDetectionState.INIT && '준비 중'}
          {detectionState === FaceDetectionState.FRONT_FACE &&
            '정면 촬영 중 (1/5)'}
          {detectionState === FaceDetectionState.LEFT_FACE &&
            '왼쪽 촬영 중 (2/5)'}
          {detectionState === FaceDetectionState.RIGHT_FACE &&
            '오른쪽 촬영 중 (3/5)'}
          {detectionState === FaceDetectionState.UP_FACE &&
            '위쪽 촬영 중 (4/5)'}
          {detectionState === FaceDetectionState.DOWN_FACE &&
            '아래쪽 촬영 중 (5/5)'}
          {detectionState === FaceDetectionState.COMPLETED && '촬영 완료'}
        </div>

        <div style={{ fontSize: '13px', color: '#aaa' }}>
          {detectionState !== FaceDetectionState.INIT &&
            detectionState !== FaceDetectionState.COMPLETED && (
              <>
                <p>- 원 안에 얼굴을 위치시킨 다음,</p>
                <p>- 안내에 따라 얼굴을 천천히 회전하세요</p>
                <p>- 경계선이 초록색으로 변하면 3초 후 자동 촬영됩니다</p>
              </>
            )}
        </div>
      </ColorGuide>
    );
  };

  return (
    <Container>
      <BackButton>&lt;</BackButton>

      <Message>{getMessage()}</Message>
      <SubMessage>{getSubMessage()}</SubMessage>

      <ContentWrapper>
        <CameraColumn>
          {detectionState !== FaceDetectionState.COMPLETED && (
            <FaceCircle borderColor={borderColor}>
              <VideoContainer>
                <Video ref={videoRef} autoPlay playsInline muted />
                <Canvas ref={canvasRef} width={640} height={480} />

                {/* 가이드라인 렌더링 */}
                {renderGuidelines()}

                <GuideLine>
                  {stateTimer > 0 && <TimerDisplay>{stateTimer}</TimerDisplay>}
                </GuideLine>

                {/* 타이머 원형 게이지 */}
                {stateTimer > 0 && (
                  <TimerCircleContainer>
                    <TimerCircleSVG viewBox='0 0 500 500'>
                      <TimerCirclePath
                        cx='250'
                        cy='250'
                        r='248'
                        progress={timerProgress}
                        color='#4285F4'
                      />
                    </TimerCircleSVG>
                  </TimerCircleContainer>
                )}
              </VideoContainer>
            </FaceCircle>
          )}

          {/* 완료 화면 - 캡처된 이미지들 */}
          {detectionState === FaceDetectionState.COMPLETED &&
            renderCapturedImages()}

          {/* 단계 표시기 */}
          {detectionState !== FaceDetectionState.INIT &&
            detectionState !== FaceDetectionState.COMPLETED &&
            renderProgressSteps()}

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
              <DebugPanel>
                <h3 style={{ margin: '0 0 15px 0' }}>얼굴 회전 디버깅</h3>

                <DebugCanvasContainer>
                  <DebugCanvas ref={debugCanvasRef} width={300} height={180} />
                </DebugCanvasContainer>

                <div
                  style={{
                    borderBottom: '1px solid #555',
                    paddingBottom: '5px',
                    marginBottom: '10px',
                  }}
                >
                  <strong>현재 정보</strong>
                </div>

                <DebugValue>
                  <span>현재 상태:</span>
                  <span>
                    {FaceDetectionState[detectionState]} ({detectionState})
                  </span>
                </DebugValue>

                <DebugValue>
                  <span>얼굴 감지:</span>
                  <span>{faceDetected ? '✓' : '✗'}</span>
                </DebugValue>

                <DebugValue>
                  <span>위치 정확:</span>
                  <span>{faceWithinBounds ? '✓' : '✗'}</span>
                </DebugValue>

                <DebugValue>
                  <span>상태 안정화:</span>
                  <span>{stateStable ? '✓' : '✗'}</span>
                </DebugValue>

                <div
                  style={{
                    borderBottom: '1px solid #555',
                    paddingBottom: '5px',
                    margin: '10px 0',
                  }}
                >
                  <strong>회전 값</strong>
                </div>

                <DebugValue>
                  <span>Roll (Z축):</span>
                  <span>{rotation.roll}°</span>
                </DebugValue>
                <DebugValue>
                  <span>Pitch (X축):</span>
                  <span>{rotation.pitch}°</span>
                </DebugValue>
                <DebugValue>
                  <span>Yaw (Y축):</span>
                  <span>{rotation.yaw}°</span>
                </DebugValue>

                <div
                  style={{ marginTop: '15px', fontSize: '13px', color: '#aaa' }}
                >
                  <div>정면: 모든 값이 ±15° 이내</div>
                  <div>좌측: Yaw +25~45°, Roll ±15° 이내</div>
                  <div>우측: Yaw -25~-45°, Roll ±15° 이내</div>
                  <div>위쪽: Pitch -25~-45°, Roll ±15° 이내</div>
                  <div>아래쪽: Pitch +25~45°, Roll ±15° 이내</div>
                </div>
              </DebugPanel>
            )}

          {/* 색상 가이드 추가 */}
          {renderColorGuide()}

          {/* 현재 단계 정보 추가 */}
          {renderStageInfo()}
        </InfoColumn>
      </ContentWrapper>
    </Container>
  );
};

export default FaceRecognition;

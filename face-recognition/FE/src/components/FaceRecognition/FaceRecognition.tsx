// FaceRecognition.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as mp from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import * as drawing from '@mediapipe/drawing_utils';


// 컴포넌트 임포트
import CameraView from './CameraView';
import CapturedImages from './CapturedImages';
import ProgressSteps from './ProgressSteps';
import DebugPanel from './DebugPanel';
import ColorGuide from './ColorGuide';
import StageInfo from './StageInfo';
import {registerFace} from './api';

// 스타일 임포트
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

// 타입과 유틸 함수 임포트
import { 
  FaceDetectionState, 
  RotationState, 
  CapturedImage 
} from './types';
import { 
  checkFaceInCircle, 
  calculateFaceRotation, 
  isCorrectOrientation,
  getMessage,
  getSubMessage
} from './utils';

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
  const [userId, setUserId] = useState<string>(''); // 사용자 ID
  const [registering, setRegistering] = useState<boolean>(false); // 등록 중 상태
  const [apiResponse, setApiResponse] = useState<any>(null); // API 응답
  const [apiError, setApiError] = useState<string | null>(null); // API 오류

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

  // 캡처 완료 상태 디버깅을 위한 useEffect
  useEffect(() => {
    if (detectionState === FaceDetectionState.COMPLETED) {
      console.log('캡처 완료 상태');
      console.log('캡처된 이미지 수:', capturedImages.length);
      console.log('캡처된 이미지 상태:', capturedImages.map(img => 
        `${FaceDetectionState[img.state]} (${img.state})`
      ));
    }
  }, [detectionState, capturedImages]);

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

      console.log(`UI 업데이트: ${getMessage(detectionState, loadingError, modelsLoaded)} / ${getSubMessage(detectionState, loadingError)}`);
    }
  }, [detectionState, loadingError, modelsLoaded]);

  // 사용자 ID 입력 핸들러
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  // 얼굴 등록 함수
  const handleRegisterFace = async () => {
    if (!userId.trim()) {
      setApiError('사용자 ID를 입력해주세요');
      return;
    }

    if (capturedImages.length < 5) {
      setApiError('모든 방향의 얼굴을 캡처해야 합니다');
      return;
    }

    try {
      setRegistering(true);
      setApiError(null);
      
      const result = await registerFace(userId, capturedImages);
      setApiResponse(result);
      
      console.log('얼굴 등록 성공:', result);
    } catch (error) {
      console.error('얼굴 등록 중 오류:', error);
      setApiError(error instanceof Error ? error.message : '얼굴 등록 중 오류가 발생했습니다');
    } finally {
      setRegistering(false);
    }
  };

  // MediaPipe 결과 처리 함수
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
          // FaceRecognition.tsx (이어서)
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
    const currentState = currentStateRef.current;
    console.log('captureFace 함수 시작, 현재 상태:', FaceDetectionState[currentState]);

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

  // 현재 상태에 따른 방향 결정 (currentStateRef 사용)
  let direction: string;
  switch (currentState) {
    case FaceDetectionState.FRONT_FACE:
      direction = 'front';
      break;
    case FaceDetectionState.LEFT_FACE:
      direction = 'left';
      break;
    case FaceDetectionState.RIGHT_FACE:
      direction = 'right';
      break;
    case FaceDetectionState.UP_FACE:
      direction = 'up';
      break;
    case FaceDetectionState.DOWN_FACE:
      direction = 'down';
      break;
    default:
      direction = 'unknown';
  }
  
  console.log(`캡처: ${FaceDetectionState[currentState]} -> ${direction}`);
  
  // 캡처된 이미지 저장 (direction 포함, currentState 사용)
  const imageData = canvas.toDataURL('image/jpeg');
  console.log(`캡처된 이미지 데이터 길이: ${imageData.length}`);
  
  const capturedImage: CapturedImage = {
    state: currentState, // currentStateRef에서 가져온 값 사용
    imageData: imageData,
    direction: direction
  };
  
  // 이미지 배열에 추가
  setCapturedImages(prev => [...prev, capturedImage]);
  
  console.log('캡처 완료, 다음 상태로 이동 호출');
  // 다음 상태로 이동
  moveToNextState();
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

  return (
    <Container>
      <BackButton>&lt;</BackButton>

      <Message>{getMessage(detectionState, loadingError, modelsLoaded)}</Message>
      <SubMessage>{getSubMessage(detectionState, loadingError)}</SubMessage>

      <ContentWrapper>
        <CameraColumn>
          {detectionState !== FaceDetectionState.COMPLETED && (
            <CameraView 
              detectionState={detectionState}
              borderColor={borderColor}
              stateTimer={stateTimer}
              timerProgress={timerProgress}
              videoRef={videoRef}
              canvasRef={canvasRef}
            />
          )}

          {/* 완료 화면 - 캡처된 이미지들 */}
          {detectionState === FaceDetectionState.COMPLETED && (
            <>
              <CapturedImages capturedImages={capturedImages} />
              
              <div style={{ margin: '20px 0', width: '100%', maxWidth: '400px' }}>
                <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                  <input
                    type="text"
                    value={userId}
                    onChange={handleUserIdChange}
                    placeholder="사용자 ID 입력"
                    style={{
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #555',
                      width: '100%',
                      backgroundColor: '#333',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button onClick={handleRestartCapture}>다시 촬영하기</Button>
                  <Button 
                    onClick={handleRegisterFace} 
                    disabled={registering || !userId.trim()}
                    style={{ 
                      backgroundColor: registering ? '#555' : '#4285F4',
                      cursor: registering ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {registering ? '등록 중...' : '얼굴 등록하기'}
                  </Button>
                </div>

                {apiError && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    borderRadius: '5px', 
                    backgroundColor: 'rgba(255, 80, 80, 0.3)',
                    color: '#ff5050',
                    textAlign: 'center',
                  }}>
                    {apiError}
                  </div>
                )}

                {apiResponse && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    borderRadius: '5px', 
                    backgroundColor: 'rgba(80, 255, 80, 0.3)',
                    color: '#50ff50',
                    textAlign: 'center',
                  }}>
                    얼굴 등록 성공! 사용자 ID: {apiResponse.user_id}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 단계 표시기 */}
          {detectionState !== FaceDetectionState.INIT &&
            detectionState !== FaceDetectionState.COMPLETED && (
            <ProgressSteps detectionState={detectionState} />
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
              debugCanvasRef={debugCanvasRef}
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
import { useState, useRef, useEffect } from 'react';
import { FaceDetectionState, RotationState } from '../types';
import { isCorrectOrientation, checkFaceInCircle } from '../utils/faceOrientation';

export const useFaceDetection = () => {
  const [detectionState, setDetectionState] = useState<FaceDetectionState>(FaceDetectionState.INIT);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [faceWithinBounds, setFaceWithinBounds] = useState<boolean>(false);
  const [stateStable, setStateStable] = useState<boolean>(true);
  const [borderColor, setBorderColor] = useState<string>('#333');
  const [rotation, setRotation] = useState<RotationState>({
    roll: 0,
    pitch: 0,
    yaw: 0,
  });

  const currentStateRef = useRef<FaceDetectionState>(FaceDetectionState.INIT);
  const lastStateTime = useRef<number>(0);
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

  // 다음 상태로 이동
  const moveToNextState = (): void => {
    // 현재 ref에서 상태 읽기
    const currentState = currentStateRef.current;
    console.log(
      'moveToNextState 함수 시작, 현재 상태:',
      FaceDetectionState[currentState]
    );

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
    }
  };

  return {
    detectionState,
    setDetectionState,
    faceDetected,
    setFaceDetected,
    faceWithinBounds,
    setFaceWithinBounds,
    stateStable,
    setStateStable,
    borderColor,
    setBorderColor,
    rotation,
    setRotation,
    currentStateRef,
    moveToNextState
  };
};
// 얼굴인식 상태 열거형
export enum FaceDetectionState {
    INIT = 0,
    FRONT_FACE = 1,
    LEFT_FACE = 2,
    RIGHT_FACE = 3,
    UP_FACE = 4,
    DOWN_FACE = 5,
    COMPLETED = 6,
  }
  
  // 3D 회전 상태 타입 정의
  export interface RotationState {
    roll: number;
    pitch: number;
    yaw: number;
  }
  
  // 캡처된 이미지 타입 정의
  export interface CapturedImage {
    state: FaceDetectionState;
    imageData: string;
  }
  
  // 스타일 컴포넌트 관련 타입
  export interface FaceCircleProps {
    borderColor: string;
  }
  
  export interface TimerCircleProps {
    progress: number;
    color: string;
  }
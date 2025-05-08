// types.ts
import * as mp from '@mediapipe/face_mesh';

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

// 메인 컴포넌트 Props
export interface FaceRecognitionProps {}

// 카메라 뷰 Props
export interface CameraViewProps {
  detectionState: FaceDetectionState;
  borderColor: string;
  faceWithinBounds: boolean;
  stateTimer: number;
  timerProgress: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  renderGuidelines: () => JSX.Element | null;
}

// 디버그 패널 Props
export interface DebugPanelProps {
  detectionState: FaceDetectionState;
  faceDetected: boolean;
  faceWithinBounds: boolean;
  stateStable: boolean;
  rotation: RotationState;
  debugCanvasRef: React.RefObject<HTMLCanvasElement>;
}

// 색상 가이드 Props
export interface ColorGuideProps {}

// 단계 정보 Props
export interface StageInfoProps {
  detectionState: FaceDetectionState;
}

// 캡처된 이미지 Props
export interface CapturedImagesProps {
  capturedImages: CapturedImage[];
}

// 단계 진행 표시기 Props
export interface ProgressStepsProps {
  detectionState: FaceDetectionState;
}

// 타이머 서클 Props
export interface TimerCircleProps {
  timerProgress: number;
  stateTimer: number;
}

// 가이드라인 Props
export interface GuidelinesProps {
  detectionState: FaceDetectionState;
}
export interface FaceRegisterMainButtonProps {
  content: string
  src: string
  onClick?: () => void
}

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
  roll: number
  pitch: number
  yaw: number
}

// 캡처된 이미지 타입 정의
export interface CapturedImage {
  state: FaceDetectionState
  imageData: string
  direction?: string
}

// 컴포넌트 Props
export interface StageIndicatorProps {
  detectionState: FaceDetectionState
}

export interface CameraViewProps {
  detectionState: FaceDetectionState
  borderColor: string
  stateTimer: number
  timerProgress: number
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  currentRotation: RotationState // 이 프로퍼티 추가
}

export interface CapturedImagesProps {
  capturedImages: CapturedImage[]
}

export interface StatusMessageProps {
  message: string
}

export interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  secondary?: boolean
  children: React.ReactNode
}

// 스타일 컴포넌트 타입 정의
export interface FaceCircleProps {
  borderColor: string
}

export interface TimerCircleProps {
  progress: number
  color: string
}

export interface ProgressStepProps {
  active: boolean
  completed: boolean
}

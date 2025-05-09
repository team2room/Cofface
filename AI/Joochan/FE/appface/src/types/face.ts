// src/types/face.ts

// 얼굴 방향 타입 정의
export type FaceDirection =
  | 'front'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'unknown'

// 방향별 캡처된 이미지 저장을 위한 타입
export type CapturedImages = Record<FaceDirection, string>

// 방향별 지시 메시지를 위한 타입
export type DirectionGuides = Record<FaceDirection, string>

// 방향별 감지 카운트를 위한 타입
export type DirectionCounts = Record<FaceDirection, number>

// 얼굴 등록 컴포넌트 Props
export interface FaceRegistrationProps {
  userId: string
  onComplete: (success: boolean, message: string) => void
}

// 얼굴 인증 컴포넌트 Props
export interface FaceVerificationProps {
  userId?: string
  apiUrl: string
  onComplete: (success: boolean, userId?: string, confidence?: number) => void
}

// 카메라 뷰 컴포넌트 Props
export interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  canvasSize: { width: number; height: number }
  isCapturing: boolean
}

// 방향 안내 컴포넌트 Props
export interface DirectionGuideProps {
  currentDirection: FaceDirection
  targetDirection: FaceDirection
  directionGuide: string
}

// 진행률 표시 컴포넌트 Props
export interface ProgressBarProps {
  progress: number
  label?: string
}

// 카운트다운 타이머 컴포넌트 Props
export interface CountdownTimerProps {
  countdown: number
  progress: number
  isActive: boolean
}

// 캡처된 이미지 표시 컴포넌트 Props
export interface CapturedImagesProps {
  images: CapturedImages
  showPreview?: boolean
}

// FaceMesh 결과 타입
export interface FaceMeshResults {
  image: HTMLVideoElement | HTMLImageElement
  multiFaceLandmarks: Array<
    Array<{
      x: number
      y: number
      z: number
    }>
  >
}

// 얼굴 랜드마크 좌표 타입
export interface FaceLandmark {
  x: number
  y: number
  z: number
}

// 얼굴 감지 결과 타입
export interface FaceDetectionResult {
  direction: FaceDirection
  confidence: number
  landmarks?: Array<FaceLandmark>
}

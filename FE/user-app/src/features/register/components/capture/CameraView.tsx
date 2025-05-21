import {
  CameraViewProps,
  FaceDetectionState,
  RotationState,
} from '@/interfaces/FaceRegisterInterfaces'
import { colors } from '@/styles/colors'
import {
  FaceCircle,
  VideoContainer,
  Video,
  Canvas,
  GuideLine,
  TimerDisplay,
  TimerCircleContainer,
  TimerCircleSVG,
  TimerCirclePath,
} from './styles'

// 방향별 3D 곡선 가이드라인 SVG 컴포넌트
const RotationGuidelineSVG = ({
  detectionState,
}: {
  detectionState: FaceDetectionState
}) => {
  // 정면일 때는 가이드라인을 표시하지 않음
  if (
    detectionState === FaceDetectionState.FRONT_FACE ||
    detectionState === FaceDetectionState.INIT
  ) {
    return null
  }

  // 각 방향별 가이드라인 렌더링
  switch (detectionState) {
    case FaceDetectionState.LEFT_FACE:
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 280"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 25,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="sphereGradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#A0A0A0" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#A0A0A0" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* 좌측 회전 가이드 - 아랫부분이 타원에 확실히 닿도록 수정 */}
          <path
            d="M 140,30 C 180,50 210,90 220,140 C 210,190 180,230 140,270"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.9"
          />

          {/* 구의 형태를 보완하는 가로선들 */}
          <path
            d="M 80,70 Q 140,80 190,70"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 70,140 Q 140,150 200,140"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 80,210 Q 140,220 190,210"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </svg>
      )

    case FaceDetectionState.RIGHT_FACE:
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 280"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 25,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="sphereGradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#A0A0A0" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#A0A0A0" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* 우측 회전 가이드 - 아랫부분이 타원에 확실히 닿도록 수정 */}
          <path
            d="M 140,30 C 100,50 70,90 60,140 C 70,190 100,230 140,270"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.9"
          />

          {/* 구의 형태를 보완하는 가로선들 */}
          <path
            d="M 90,70 Q 140,80 200,70"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 80,140 Q 140,150 210,140"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 90,210 Q 140,220 200,210"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </svg>
      )

    case FaceDetectionState.UP_FACE:
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 280"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 25,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient
              id="sphereGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#A0A0A0" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#A0A0A0" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* 위쪽 방향 가이드 */}
          <path
            d="M 40,80 C 70,65 140,55 240,80"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.9"
          />

          {/* 구의 형태를 보완하는 세로선들 */}
          <path
            d="M 90,60 C 90,120 90,180 90,220"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 140,50 C 140,110 140,180 140,230"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 190,60 C 190,120 190,180 190,220"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </svg>
      )

    case FaceDetectionState.DOWN_FACE:
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 280"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 25,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient
              id="sphereGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#A0A0A0" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#A0A0A0" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* 아래쪽 방향 가이드 */}
          <path
            d="M 40,200 C 70,215 140,225 240,200"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.9"
          />

          {/* 구의 형태를 보완하는 세로선들 */}
          <path
            d="M 90,60 C 90,120 90,170 90,220"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 140,50 C 140,110 140,170 140,230"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 190,60 C 190,120 190,170 190,220"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </svg>
      )

    default:
      return null
  }
}

// 타원형 얼굴 가이드 SVG 컴포넌트
const OvalFaceGuideSVG = ({ borderColor }: { borderColor: string }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 280 280"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 20,
      pointerEvents: 'none',
    }}
  >
    {/* 타원형 얼굴 모양 */}
    <path
      d="M 140 30 
      C 200 30 220 60 230 90 
      C 240 120 230 190 210 230 
      C 190 260 160 270 140 270 
      C 120 270 90 260 70 230 
      C 50 190 40 120 50 90 
      C 60 60 80 30 140 30 "
      fill="none"
      stroke={borderColor}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
)

// CameraView 컴포넌트 수정 - 간소화
interface ExtendedCameraViewProps extends CameraViewProps {
  currentRotation: RotationState
}

export function CameraView({
  detectionState,
  borderColor,
  stateTimer,
  timerProgress,
  videoRef,
  canvasRef,
}: ExtendedCameraViewProps) {
  return (
    <FaceCircle style={{ borderColor }}>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline muted />
        <Canvas ref={canvasRef} width={640} height={640} />

        {/* Init 상태가 아닐 때만 타원형 얼굴 가이드 표시 */}
        {detectionState !== FaceDetectionState.INIT && (
          <>
            <OvalFaceGuideSVG borderColor={borderColor} />

            {/* 3D 곡선 가이드 추가 */}
            <RotationGuidelineSVG detectionState={detectionState} />
          </>
        )}

        <GuideLine>
          {stateTimer > 0 && <TimerDisplay>{stateTimer}</TimerDisplay>}
        </GuideLine>

        {/* 타이머 원형 게이지 */}
        {stateTimer > 0 && (
          <TimerCircleContainer>
            <TimerCircleSVG viewBox="0 0 500 500">
              <TimerCirclePath
                cx="250"
                cy="250"
                r="248"
                progress={timerProgress}
                color={colors.main}
              />
            </TimerCircleSVG>
          </TimerCircleContainer>
        )}
      </VideoContainer>
    </FaceCircle>
  )
}

export default CameraView

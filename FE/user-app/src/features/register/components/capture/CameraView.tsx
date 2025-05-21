import {
  CameraViewProps,
  FaceDetectionState,
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

// 방향별 가이드라인 SVG 컴포넌트 - 입체적 수직선과 두꺼운 화살표
const DirectionGuidelineSVG = ({
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
          {/* 그라데이션 및 필터 정의 */}
          <defs>
            <linearGradient
              id="verticalLineGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="50%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="white"
                floodOpacity="0.5"
              />
            </filter>
          </defs>

          {/* 회전 경로 - 타원으로 표현 */}
          <ellipse
            cx="140"
            cy="140"
            rx="100"
            ry="40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="5 3"
          />

          {/* 입체적인 수직선 */}
          <line
            x1="140"
            y1="60"
            x2="140"
            y2="220"
            stroke="url(#verticalLineGradient)"
            strokeWidth="3"
            filter="url(#shadow)"
          />

          {/* 두꺼운 화살표 - 오른쪽 방향 */}
          <line
            x1="140"
            y1="140"
            x2="240"
            y2="140"
            stroke="white"
            strokeWidth="5"
            filter="url(#glow)"
          />

          {/* 화살표 헤드 - 더 크고 두껍게 */}
          <polygon
            points="240,140 225,130 225,150"
            fill="white"
            filter="url(#glow)"
          />
        </svg>
      )

    // 나머지 방향 케이스들도 동일한 방식으로 작성
    case FaceDetectionState.RIGHT_FACE:
      // 원본 코드에서 RIGHT_FACE 케이스 유지
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
          {/* 그라데이션 및 필터 정의 */}
          <defs>
            <linearGradient
              id="verticalLineGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="50%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="white"
                floodOpacity="0.5"
              />
            </filter>
          </defs>

          {/* 회전 경로 - 타원으로 표현 */}
          <ellipse
            cx="140"
            cy="140"
            rx="100"
            ry="40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="5 3"
          />

          {/* 입체적인 수직선 */}
          <line
            x1="140"
            y1="60"
            x2="140"
            y2="220"
            stroke="url(#verticalLineGradient)"
            strokeWidth="3"
            filter="url(#shadow)"
          />

          {/* 두꺼운 화살표 - 왼쪽 방향 */}
          <line
            x1="140"
            y1="140"
            x2="40"
            y2="140"
            stroke="white"
            strokeWidth="5"
            filter="url(#glow)"
          />

          {/* 화살표 헤드 - 더 크고 두껍게 */}
          <polygon
            points="40,140 55,130 55,150"
            fill="white"
            filter="url(#glow)"
          />
        </svg>
      )

    case FaceDetectionState.UP_FACE:
      // 원본 코드에서 UP_FACE 케이스 유지
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
          {/* 필터 정의 */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 회전 경로 - 타원으로 표현 */}
          <ellipse
            cx="140"
            cy="140"
            rx="40"
            ry="100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="5 3"
          />

          {/* 두꺼운 화살표 - 위쪽 방향 */}
          <line
            x1="140"
            y1="140"
            x2="140"
            y2="40"
            stroke="white"
            strokeWidth="5"
            filter="url(#glow)"
          />

          {/* 화살표 헤드 - 더 크고 두껍게 */}
          <polygon
            points="140,40 130,55 150,55"
            fill="white"
            filter="url(#glow)"
          />
        </svg>
      )

    case FaceDetectionState.DOWN_FACE:
      // 원본 코드에서 DOWN_FACE 케이스 유지
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
          {/* 필터 정의 */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 회전 경로 - 타원으로 표현 */}
          <ellipse
            cx="140"
            cy="140"
            rx="40"
            ry="100"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
            strokeDasharray="5 3"
          />

          {/* 두꺼운 화살표 - 아래쪽 방향 */}
          <line
            x1="140"
            y1="140"
            x2="140"
            y2="240"
            stroke="white"
            strokeWidth="5"
            filter="url(#glow)"
          />

          {/* 화살표 헤드 - 더 크고 두껍게 */}
          <polygon
            points="140,240 130,225 150,225"
            fill="white"
            filter="url(#glow)"
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

export function CameraView({
  detectionState,
  borderColor,
  stateTimer,
  timerProgress,
  videoRef,
  canvasRef,
}: CameraViewProps) {
  return (
    <FaceCircle style={{ borderColor }}>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline muted />
        <Canvas ref={canvasRef} width={640} height={640} />

        {/* Init 상태가 아닐 때만 타원형 얼굴 가이드 표시 */}
        {detectionState !== FaceDetectionState.INIT && (
          <>
            <OvalFaceGuideSVG borderColor={borderColor} />

            {/* 방향 가이드라인 추가 - 정면이 아닐 때만 표시 */}
            <DirectionGuidelineSVG detectionState={detectionState} />
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

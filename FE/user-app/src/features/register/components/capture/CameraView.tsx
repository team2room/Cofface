// CameraView.tsx의 수정된 코드
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

// 공유해주신 RotationGuidelineSVG 컴포넌트 그대로 유지
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
            {/* 그라데이션 정의 */}
            <linearGradient id="sphereGradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#606060" stopOpacity="0.7" />
            </linearGradient>

            {/* 3D 효과를 위한 필터 */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 3D 구 느낌을 주는 원형 베이스 */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.3"
          />

          {/* 좌측 회전 가이드 - 입체감 강화 */}
          <path
            d="M 140,30 C 180,50 210,90 220,140 C 210,190 180,230 140,270"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="4"
            strokeDasharray="0"
            strokeLinecap="round"
            opacity="0.9"
            filter="url(#glow)"
          />

          {/* 구의 형태를 보완하는 가로선들 - 입체감 추가 */}
          <path
            d="M 80,70 Q 140,80 190,70"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.5"
          />
          <path
            d="M 70,140 Q 140,150 200,140"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          <path
            d="M 80,210 Q 140,220 190,210"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.5"
          />

          {/* 3D 효과 강화를 위한 동심원들 */}
          <circle
            cx="140"
            cy="140"
            r="100"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.5"
            opacity="0.2"
          />
          <circle
            cx="140"
            cy="140"
            r="80"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.5"
            opacity="0.15"
          />

          {/* 움직임 방향 표시 화살표 - 더 두드러진 디자인 */}
          <path
            d="M 180,140 L 200,140"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 195,130 L 205,140 L 195,150"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
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
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#606060" stopOpacity="0.7" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 3D 구 느낌을 주는 원형 베이스 */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.3"
          />

          {/* 우측 회전 가이드 - 입체감 강화 */}
          <path
            d="M 140,30 C 100,50 70,90 60,140 C 70,190 100,230 140,270"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="4"
            strokeDasharray="0"
            strokeLinecap="round"
            opacity="0.9"
            filter="url(#glow)"
          />

          {/* 구의 형태를 보완하는 가로선들 - 입체감 추가 */}
          <path
            d="M 90,70 Q 140,80 200,70"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.5"
          />
          <path
            d="M 80,140 Q 140,150 210,140"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          <path
            d="M 90,210 Q 140,220 200,210"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.5"
          />

          {/* 3D 효과 강화를 위한 동심원들 */}
          <circle
            cx="140"
            cy="140"
            r="100"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.5"
            opacity="0.2"
          />
          <circle
            cx="140"
            cy="140"
            r="80"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.5"
            opacity="0.15"
          />

          {/* 움직임 방향 표시 화살표 - 더 두드러진 디자인 */}
          <path
            d="M 100,140 L 80,140"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 85,130 L 75,140 L 85,150"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
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
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#606060" stopOpacity="0.7" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 3D 구 느낌을 주는 원형 베이스 */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.3"
          />

          {/* 위쪽 방향 가이드 - 입체감 강화 */}
          <ellipse
            cx="140"
            cy="100"
            rx="100"
            ry="40"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="3"
            opacity="0.7"
            filter="url(#glow)"
          />

          {/* 타원 보조선 */}
          <ellipse
            cx="140"
            cy="140"
            rx="90"
            ry="70"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.3"
          />

          {/* 구의 형태를 보완하는 세로선들 */}
          <path
            d="M 90,60 C 90,120 90,180 90,220"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <path
            d="M 140,50 C 140,110 140,180 140,230"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <path
            d="M 190,60 C 190,120 190,180 190,220"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />

          {/* 움직임 방향 표시 화살표 - 더 두드러진 디자인 */}
          <path
            d="M 140,110 L 140,80"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 130,90 L 140,75 L 150,90"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
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
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#606060" stopOpacity="0.7" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 3D 구 느낌을 주는 원형 베이스 */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="#A0A0A0"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.3"
          />

          {/* 아래쪽 방향 가이드 - 입체감 강화 */}
          <ellipse
            cx="140"
            cy="180"
            rx="100"
            ry="40"
            fill="none"
            stroke="url(#sphereGradient)"
            strokeWidth="3"
            opacity="0.7"
            filter="url(#glow)"
          />

          {/* 타원 보조선 */}
          <ellipse
            cx="140"
            cy="140"
            rx="90"
            ry="70"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.3"
          />

          {/* 구의 형태를 보완하는 세로선들 */}
          <path
            d="M 90,60 C 90,120 90,170 90,220"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <path
            d="M 140,50 C 140,110 140,170 140,230"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />
          <path
            d="M 190,60 C 190,120 190,170 190,220"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.4"
          />

          {/* 움직임 방향 표시 화살표 - 더 두드러진 디자인 */}
          <path
            d="M 140,170 L 140,200"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 130,190 L 140,205 L 150,190"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
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
    {/* 타원형 얼굴 모양 - 수정: 아래쪽 공간 확보를 위해 조정 */}
    <path
      d="M 140 20 
      C 200 20 220 50 230 80 
      C 240 110 230 190 210 235 
      C 190 270 160 280 140 280 
      C 120 280 90 270 70 235 
      C 50 190 40 110 50 80 
      C 60 50 80 20 140 20 "
      fill="none"
      stroke={borderColor}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
)

// 스캔 효과 애니메이션 컴포넌트 - 고급 버전
const ScanningEffect = ({
  isActive,
  detectionState,
}: {
  isActive: boolean
  detectionState: FaceDetectionState
}) => {
  if (!isActive) return null

  // 스캔 효과 방향 결정
  let scanDirection = 'vertical' // 기본 세로 스캔

  // 방향에 따라 스캔 효과 다르게 적용
  if (
    detectionState === FaceDetectionState.LEFT_FACE ||
    detectionState === FaceDetectionState.RIGHT_FACE
  ) {
    scanDirection = 'horizontal' // 좌우 회전일 때는 가로 스캔
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 280 280"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 15,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient
          id="scanGradientVertical"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#4285F4" stopOpacity="0" />
          <stop offset="50%" stopColor="#4285F4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
        </linearGradient>

        <linearGradient
          id="scanGradientHorizontal"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#4285F4" stopOpacity="0" />
          <stop offset="50%" stopColor="#4285F4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
        </linearGradient>

        <clipPath id="ovalClip">
          <path
            d="M 140 20 
            C 200 20 220 50 230 80 
            C 240 110 230 190 210 235 
            C 190 270 160 280 140 280 
            C 120 280 90 270 70 235 
            C 50 190 40 110 50 80 
            C 60 50 80 20 140 20"
          />
        </clipPath>
      </defs>

      {/* 스캐닝 라인 애니메이션 */}
      <g clipPath="url(#ovalClip)">
        {/* 세로 스캔 효과 */}
        {scanDirection === 'vertical' && (
          <rect
            x="30"
            y="0"
            width="220"
            height="6"
            fill="url(#scanGradientVertical)"
            opacity="0.7"
            style={{
              animation: 'scanMoveVertical 2.5s ease-in-out infinite',
            }}
          />
        )}

        {/* 가로 스캔 효과 */}
        {scanDirection === 'horizontal' && (
          <rect
            x="0"
            y="30"
            width="6"
            height="220"
            fill="url(#scanGradientHorizontal)"
            opacity="0.7"
            style={{
              animation: 'scanMoveHorizontal 2.5s ease-in-out infinite',
            }}
          />
        )}
      </g>

      <style>
        {`
          @keyframes scanMoveVertical {
            0% { transform: translateY(0); }
            50% { transform: translateY(280px); }
            100% { transform: translateY(0); }
          }
          
          @keyframes scanMoveHorizontal {
            0% { transform: translateX(0); }
            50% { transform: translateX(280px); }
            100% { transform: translateX(0); }
          }
          
          @keyframes pulseEffect {
            0% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
            100% { opacity: 0.3; transform: scale(1); }
          }
        `}
      </style>
    </svg>
  )
}

// CameraView 컴포넌트 - 이제 원래 디자인에 스캔 효과 추가
export function CameraView({
  detectionState,
  borderColor,
  stateTimer,
  timerProgress,
  videoRef,
  canvasRef,
}: CameraViewProps) {
  // 타이머가 진행 중일 때 스캔 효과 활성화
  const isScanActive = stateTimer > 0

  return (
    <FaceCircle style={{ borderColor }}>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline muted />
        <Canvas ref={canvasRef} width={640} height={640} />

        {/* Init 상태가 아닐 때만 타원형 얼굴 가이드 표시 */}
        {detectionState !== FaceDetectionState.INIT && (
          <>
            <OvalFaceGuideSVG borderColor={borderColor} />

            {/* 다른 방향일 때는 회전 가이드라인 표시 */}
            {detectionState !== FaceDetectionState.FRONT_FACE && (
              <RotationGuidelineSVG detectionState={detectionState} />
            )}

            {/* 스캔 효과 추가 */}
            <ScanningEffect
              isActive={isScanActive}
              detectionState={detectionState}
            />
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

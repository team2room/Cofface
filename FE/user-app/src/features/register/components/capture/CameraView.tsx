import { CameraViewProps } from '@/interfaces/RegisterInterfaces'
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

// 타원형 얼굴 가이드 SVG 컴포넌트 - 이미지와 유사한 타원형
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
    {/* 이미지와 유사한 타원형 얼굴 모양 */}
    <path
      d="M 140 30 C 200 30 220 60 230 90 C 240 120 230 190 210 220 C 190 250 170 260 140 260 C 110 260 90 250 70 220 C 50 190 40 120 50 90 C 60 60 80 30 140 30  "
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
    <FaceCircle>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline muted />
        <Canvas ref={canvasRef} width={640} height={480} />

        {/* 타원형 얼굴 가이드 */}
        <OvalFaceGuideSVG borderColor={borderColor} />

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

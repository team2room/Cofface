import tw from 'twin.macro'
import CaptureHeader from '@/features/register/components/capture/CaptureHeader'
import { StageIndicator } from '@/features/register/components/capture/StageIndicator'
import { CameraView } from '@/features/register/components/capture/CameraView'
import CapturedImages from '@/features/register/components/capture/CapturedImages'
import { StatusMessage } from '@/features/register/components/capture/StatusMessage'
import ActionButton from '@/features/register/components/capture/ActionButton'
import {
  CaptureContainer,
  Message,
} from '@/features/register/components/capture/styles'
import { FaceDetectionState } from '@/interfaces/RegisterInterfaces'
import { getMessage } from '@/utils/CaptureUtils'
import { useFaceDetection } from '@/features/register/hooks/useFaceDetection'
import { Text } from '@/styles/typography'

const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen bg-black
`
const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-black w-full
`
const ContentWrapper = tw.div`
  flex flex-col p-6 flex-1 relative
`
// 버튼을 담을 컨테이너 추가
const ButtonsContainer = tw.div`
  w-full pb-6 mt-auto
`

export function FaceRegisterCapturePage() {
  const {
    detectionState,
    borderColor,
    borderStatusMessage,
    stateTimer,
    timerProgress,
    capturedImages,
    modelsLoaded,
    loadingError,
    videoRef,
    canvasRef,
    handleStartCamera,
    handleRestartCapture,
    handleComplete,
  } = useFaceDetection()

  return (
    <Container>
      <HeaderWrapper>
        <CaptureHeader />
      </HeaderWrapper>

      <ContentWrapper>
        <CaptureContainer>
          {/* 상단에 현재 단계 표시 */}
          {detectionState !== FaceDetectionState.INIT && (
            <StageIndicator detectionState={detectionState} />
          )}

          <Message>
            <Text variant="body1" weight="semibold" color="white">
              {getMessage(detectionState, loadingError, modelsLoaded)}
            </Text>
          </Message>

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
            <CapturedImages capturedImages={capturedImages} />
          )}

          {/* 하단에 상태 메시지 표시 */}
          {detectionState !== FaceDetectionState.INIT &&
            detectionState !== FaceDetectionState.COMPLETED && (
              <StatusMessage message={borderStatusMessage} />
            )}
        </CaptureContainer>

        {/* 버튼을 별도 컨테이너로 분리하여 하단에 고정 */}
        <ButtonsContainer>
          {detectionState === FaceDetectionState.INIT && !loadingError && (
            <ActionButton onClick={handleStartCamera} disabled={!modelsLoaded}>
              {modelsLoaded ? '카메라 켜기' : '모델 로딩 중...'}
            </ActionButton>
          )}

          {detectionState === FaceDetectionState.COMPLETED && (
            <>
              <ActionButton onClick={handleComplete}>
                인식 완료 및 계속하기
              </ActionButton>
              <ActionButton onClick={handleRestartCapture} secondary>
                다시 촬영하기
              </ActionButton>
            </>
          )}

          {loadingError && (
            <ActionButton onClick={() => window.location.reload()}>
              다시 시도하기
            </ActionButton>
          )}
        </ButtonsContainer>
      </ContentWrapper>
    </Container>
  )
}

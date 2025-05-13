//SECTION - 단계별 안내 문구 및 탭
import { Text } from '@/styles/typography'
import {
  FaceDetectionState,
  ProgressStepProps,
  StageIndicatorProps,
} from '@/interfaces/FaceRegisterInterfaces'
import { getStageText } from '@/utils/CaptureUtils'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors } from '@/styles/colors'

export const StageIndicatorContainer = tw.div`
  flex flex-col items-center mb-4 w-full
`

export const ProgressStepsContainer = tw.div`
  flex justify-center mt-3 w-full
`

export const ProgressStepItem = styled.div<ProgressStepProps>`
  width: 40px;
  height: 8px;
  margin: 0 5px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.completed
      ? colors.main
      : props.active
        ? colors.littleLight
        : 'rgba(255, 255, 255, 0.3)'};
  transition: background-color 0.3s ease;
`

export function StageIndicator({ detectionState }: StageIndicatorProps) {
  const renderProgressSteps = () => {
    const steps = [
      FaceDetectionState.FRONT_FACE,
      FaceDetectionState.LEFT_FACE,
      FaceDetectionState.RIGHT_FACE,
      FaceDetectionState.UP_FACE,
      FaceDetectionState.DOWN_FACE,
    ]

    return (
      <ProgressStepsContainer>
        {steps.map((step, index) => (
          <ProgressStepItem
            key={index}
            active={detectionState === step}
            completed={detectionState > step}
          />
        ))}
      </ProgressStepsContainer>
    )
  }

  return (
    <StageIndicatorContainer>
      <Text variant="body2" weight="bold" color="white">
        {getStageText(detectionState)}
      </Text>
      {detectionState !== FaceDetectionState.COMPLETED && renderProgressSteps()}
    </StageIndicatorContainer>
  )
}

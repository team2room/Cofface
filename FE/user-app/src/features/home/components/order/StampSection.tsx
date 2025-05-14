import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors } from '@/styles/colors'

const Section = tw.div`
  mb-4
`
const SectionHeader = tw.div`
  flex justify-between items-center mb-3
`
const ProgressBarContainer = tw.div`
  w-full h-3 bg-white rounded-full mb-3
`
const ProgressBar = styled.div<{ width: number }>`
  ${tw`h-full rounded-full`}
  width: ${(props) => props.width}%;
  background-color: ${colors.main};
`
const ProgressLabels = tw.div`
  flex justify-between items-center
`
const StampInfo = tw.div`
  text-end my-1
`

export default function StampSection() {
  const currentStamps = 8
  const maxStamps = 10
  const progressPercentage = (currentStamps / maxStamps) * 100

  return (
    <Section>
      <SectionHeader>
        <Text variant="body1" weight="semibold">
          적립 현황
        </Text>
        <Text variant="body1" weight="bold" color="lightBlack">
          {currentStamps}{' '}
          <Text variant="body1" weight="medium" color="darkGray" as="span">
            / {maxStamps}
          </Text>
        </Text>
      </SectionHeader>

      <div className="bg-light p-4 rounded-lg">
        <ProgressBarContainer>
          <ProgressBar width={progressPercentage} />
        </ProgressBarContainer>

        <ProgressLabels>
          <Text variant="caption1" color="darkGray">
            0
          </Text>
          <Text variant="caption1" color="main" weight="bold">
            {currentStamps}
          </Text>
          <Text variant="caption1" color="darkGray">
            {maxStamps}
          </Text>
        </ProgressLabels>
      </div>
      <StampInfo>
        <Text variant="caption2" color="darkGray">
          2잔 더 마시면 아메리카노 무료 쿠폰을 드려요
        </Text>
      </StampInfo>
    </Section>
  )
}

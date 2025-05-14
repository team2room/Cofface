import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors } from '@/styles/colors'
import { StampInfo } from '@/interfaces/StoreInterfaces'
import { RiCoupon2Fill } from 'react-icons/ri'

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

const StampWrapper = tw.div`
  text-end my-1
`
interface StampSectionProps {
  stampInfo: StampInfo
}

export default function StampSection({ stampInfo }: StampSectionProps) {
  const currentStamps = stampInfo.stampCount
  const maxStamps = stampInfo.stampsRequired
  const progressPercentage = (currentStamps / maxStamps) * 100
  const remainingStamps = stampInfo.remainingStamps
  const discountAmount = stampInfo.discountAmount
  const couponCount = stampInfo.couponCount

  return (
    <Section>
      <SectionHeader>
        <Text variant="body1" weight="semibold">
          적립 현황
        </Text>
      </SectionHeader>

      <div className="flex flex-col gap-4 bg-light px-4 py-3 rounded-lg">
        <div className="flex justify-between">
          <Text variant="body1" weight="bold" color="main">
            {currentStamps}{' '}
            <Text variant="body1" weight="medium" color="lightBlack" as="span">
              / {maxStamps}
            </Text>
          </Text>
          <div className="flex items-center gap-2">
            <RiCoupon2Fill size={18} color={colors.main} />
            <Text variant="caption1">쿠폰 수</Text>
            <Text weight="bold" color="main">
              {couponCount}
            </Text>
          </div>
        </div>
        <ProgressBarContainer>
          <ProgressBar width={progressPercentage} />
        </ProgressBarContainer>
      </div>
      <StampWrapper>
        <Text variant="caption2" color="darkGray">
          {remainingStamps > 0
            ? `${remainingStamps}잔 더 마시면 ${discountAmount}원 할인 쿠폰을 드려요`
            : '무료 쿠폰 사용 가능합니다!'}
        </Text>
      </StampWrapper>
    </Section>
  )
}

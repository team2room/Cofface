import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'
import { TopOrderMenuInfo } from '@/interfaces/StoreInterfaces'

const Section = tw.div`
  mb-6
`
const SectionHeader = tw.div`
  flex justify-between items-center mb-3
`
const BadgeContainer = tw.div`
  flex items-center
`
const Badge = styled.div<{ type: 'gold' | 'silver' | 'bronze' }>`
  ${tw`w-6 h-6 flex items-center justify-center mr-4`}
  background-color: ${(props) => {
    switch (props.type) {
      case 'gold':
        return '#FFD700'
      case 'silver':
        return '#C0C0C0'
      case 'bronze':
        return '#CD7F32'
      default:
        return '#CCCCCC'
    }
  }};
  border-radius: 50%;
`

const TopItem = tw.div`
  flex justify-between items-center py-2
`
const TopItemWrapper = tw.div`
  border border-light border-4 rounded-lg px-4 py-2
`

interface TopOrdersSectionProps {
  topOrders: TopOrderMenuInfo[]
}

export default function TopOrdersSection({ topOrders }: TopOrdersSectionProps) {
  // 배지 타입 결정 함수
  const getBadgeType = (
    index: number,
  ): 'gold' | 'silver' | 'bronze' | undefined => {
    if (index === 0) return 'gold'
    if (index === 1) return 'silver'
    if (index === 2) return 'bronze'
    return undefined
  }

  return (
    <Section>
      <SectionHeader>
        <Text variant="body1" weight="bold" color="lightBlack">
          주문 TOP 5
        </Text>
      </SectionHeader>

      <TopItemWrapper>
        {topOrders.slice(0, 5).map((order, index) => (
          <TopItem key={index}>
            <BadgeContainer>
              {getBadgeType(index) ? (
                <Badge type={getBadgeType(index)!}>
                  <Text variant="caption1" weight="bold" color="white">
                    {index + 1}
                  </Text>
                </Badge>
              ) : (
                <Text
                  variant="caption1"
                  weight="bold"
                  color="darkGray"
                  className="ml-2 mr-6"
                >
                  {index + 1}
                </Text>
              )}
              <Text variant="body1" weight="medium" color="lightBlack">
                {order.menuName}
              </Text>
            </BadgeContainer>
            <Text variant="body1" weight="bold" color="main">
              {order.totalCount}회
            </Text>
          </TopItem>
        ))}
      </TopItemWrapper>
    </Section>
  )
}

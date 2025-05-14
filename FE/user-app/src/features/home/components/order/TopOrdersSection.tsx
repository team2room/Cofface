import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'

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

export default function TopOrdersSection() {
  const topOrders = [
    { rank: 1, name: '아이스 아메리카노', count: 10, badge: 'gold' },
    { rank: 2, name: '아이스 카페라떼', count: 5, badge: 'silver' },
    { rank: 3, name: '아이스티 샷추가', count: 3, badge: 'bronze' },
    { rank: 4, name: '페퍼민트티 샷추가', count: 1 },
    { rank: 5, name: '버터크림라떼', count: 1 },
  ]

  return (
    <Section>
      <SectionHeader>
        <Text variant="body1" weight="bold" color="lightBlack">
          주문 TOP 5
        </Text>
      </SectionHeader>

      <TopItemWrapper>
        {topOrders.map((order) => (
          <TopItem key={order.rank}>
            <BadgeContainer>
              {order.badge ? (
                <Badge type={order.badge as 'gold' | 'silver' | 'bronze'}>
                  <Text variant="caption2" weight="bold" color="white">
                    {order.rank}
                  </Text>
                </Badge>
              ) : (
                <Text
                  variant="caption2"
                  weight="bold"
                  color="darkGray"
                  className="ml-2 mr-6"
                >
                  {order.rank}
                </Text>
              )}
              <Text variant="body1" weight="medium" color="darkGray">
                {order.name}
              </Text>
            </BadgeContainer>
            <Text variant="body1" weight="bold" color="main">
              {order.count}회
            </Text>
          </TopItem>
        ))}
      </TopItemWrapper>
    </Section>
  )
}

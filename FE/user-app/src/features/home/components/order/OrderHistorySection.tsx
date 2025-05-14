import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { RecentOrderInfo } from '@/interfaces/StoreInterfaces'

const Section = tw.div`
`
const SectionHeader = tw.div`
  flex justify-between items-center mb-3 pb-3 border-b-4 border-light 
`

const OrderItem = tw.div`
  flex justify-between items-center px-2 py-1
`
interface OrderHistorySectionProps {
  recentOrders: RecentOrderInfo[]
}

export default function OrderHistorySection({
  recentOrders,
}: OrderHistorySectionProps) {
  // 날짜 포맷 함수 (YY.MM.DD 형식으로 변환)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear().toString().substring(2) // YY
    const month = String(date.getMonth() + 1).padStart(2, '0') // MM
    const day = String(date.getDate()).padStart(2, '0') // DD
    return `${year}.${month}.${day}`
  }

  return (
    <Section>
      <SectionHeader>
        <Text variant="body1" weight="bold" color="lightBlack">
          주문 내역
        </Text>
      </SectionHeader>

      {recentOrders.length > 0 ? (
        recentOrders.map((order, index) => (
          <OrderItem key={index}>
            <div className="flex gap-5 items-center">
              <Text variant="body1" weight="bold" color="lightBlack">
                {formatDate(order.orderDate)}
              </Text>
              <Text variant="body1" weight="medium" color="darkGray">
                {order.orderSummary}
              </Text>
            </div>
            <Text variant="body1" weight="bold" color="lightBlack">
              {order.totalAmount.toLocaleString()} 원
            </Text>
          </OrderItem>
        ))
      ) : (
        <div className="py-4 flex justify-center">
          <Text variant="caption1" color="darkGray">
            최근 주문 내역이 없습니다.
          </Text>
        </div>
      )}
    </Section>
  )
}

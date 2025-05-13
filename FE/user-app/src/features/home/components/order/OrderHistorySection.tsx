import tw from 'twin.macro'
import { Text } from '@/styles/typography'

const Section = tw.div`
`
const SectionHeader = tw.div`
  flex justify-between items-center mb-3 pb-3 border-b-4 border-light 
`

const OrderItem = tw.div`
  flex justify-between items-center px-2 py-1
`

export default function OrderHistorySection() {
  const orders = [
    { date: '25.05.12', name: '아이스 아이스티 외 1종', price: 12800 },
  ]

  return (
    <Section>
      <SectionHeader>
        <Text variant="body1" weight="bold" color="lightBlack">
          주문 내역
        </Text>
      </SectionHeader>

      {orders.map((order, index) => (
        <OrderItem key={index}>
          <div className="flex gap-4 items-center">
            <Text variant="caption1" weight="bold" color="lightBlack">
              {order.date}
            </Text>
            <Text variant="caption1" weight="medium" color="darkGray">
              {order.name}
            </Text>
          </div>
          <Text variant="caption1" weight="bold" color="lightBlack">
            {order.price.toLocaleString()} 원
          </Text>
        </OrderItem>
      ))}
    </Section>
  )
}

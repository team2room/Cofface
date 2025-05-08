import tw from 'twin.macro'
import { Minus, Plus } from 'lucide-react'
import { Text } from '@/styles/typography'
import { IoCloseCircle } from 'react-icons/io5'
import { IoIosArrowForward } from 'react-icons/io'
import { OrderSectionProps } from '@/interfaces/OrderInterface'
import { useDragScroll } from '@/hooks/useDragScroll'

const Section = tw.div`w-full h-72 bg-[#FFF4F8] px-6 py-3.5 mb-4 rounded-xl`
const List = tw.div`flex flex-col gap-2 mt-3.5 h-52 overflow-auto`
const ListItem = tw.div`flex justify-between items-center px-12 py-1 bg-white rounded-md`
const CntButton = tw.button`border border-dark p-2 shadow-md`

export default function OrderSection({ orders }: OrderSectionProps) {
  const {
    ref: scrollRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  } = useDragScroll<HTMLDivElement>()

  return (
    <Section>
      <Text variant="body2" weight="bold" className="mr-2">
        주문 내역
      </Text>
      <Text variant="body2" weight="bold" color="main">
        {orders.length}
      </Text>
      <List
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {orders.map((item) => (
          <ListItem>
            <IoCloseCircle
              size={40}
              className="text-littleDarkGray"
              onClick={() => {}}
            />
            <div className="flex flex-col items-start">
              <Text variant="caption1" weight="semibold">
                {item.name}
              </Text>
              <Text
                variant="caption2"
                color="darkGray"
                className="flex items-center"
              >
                <IoIosArrowForward />
                ICE | 중간 사이즈 | 얼음 적게 ...
              </Text>
            </div>
            <Text variant="caption1" weight="semibold">
              {item.price.toLocaleString()}원
            </Text>
            <div className="flex items-center gap-2">
              <CntButton onClick={() => {}}>
                <Minus size={16} className="text-dark" />
              </CntButton>
              <Text variant="caption1" weight="semibold" className="px-2">
                {item.quantity}
              </Text>
              <CntButton onClick={() => {}}>
                <Plus size={16} className="text-dark" />
              </CntButton>
            </div>
          </ListItem>
        ))}
      </List>
    </Section>
  )
}

import tw from 'twin.macro'
import { Minus, Plus } from 'lucide-react'
import { Text } from '@/styles/typography'
import { IoCloseCircle } from 'react-icons/io5'
import { IoIosArrowForward } from 'react-icons/io'
import { useDragScroll } from '@/hooks/useDragScroll'
import { useOrderStore } from '@/stores/orderStore'
import { formatOptionLabel } from '@/utils/formatOptionLabel'

const Section = tw.div`w-full h-[300px] bg-[#FFF4F8] px-6 py-3.5 mb-6 rounded-xl`
const List = tw.div`flex flex-col gap-2 mt-3.5 h-52 overflow-auto`
const ListItem = tw.div`flex justify-between items-center px-12 py-1 bg-white rounded-md`
const CntButton = tw.button`border border-dark p-2 shadow-md`

export default function OrderSection() {
  const orders = useOrderStore((state) => state.orders)
  const removeOrder = useOrderStore((state) => state.removeOrder)
  const updateQuantity = useOrderStore((state) => state.updateQuantity)

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
        {orders.map((item, index) => (
          <ListItem key={`order-${index}`}>
            <div className="flex items-center gap-12">
              <IoCloseCircle
                size={40}
                className="text-littleDarkGray"
                onClick={() => removeOrder(index)}
              />
              <div className="flex flex-col items-start w-[300px]">
                <Text variant="caption1" weight="semibold">
                  {item.name}
                </Text>
                <Text
                  variant="caption2"
                  color="darkGray"
                  className="w-full overflow-hidden whitespace-nowrap text-ellipsis flex items-center"
                >
                  <IoIosArrowForward className="shrink-0 mr-1" />
                  <span className="truncate">
                    {item.options
                      .map((opt) => formatOptionLabel(opt))
                      .filter(Boolean)
                      .join(' | ')}
                  </span>
                </Text>
              </div>
            </div>

            <Text variant="caption1" weight="semibold">
              {(item.totalPrice * item.quantity).toLocaleString()}원
            </Text>
            <div className="flex items-center gap-2">
              <CntButton
                onClick={() => updateQuantity(index, item.quantity - 1)}
              >
                <Minus size={16} className="text-dark" />
              </CntButton>
              <Text variant="caption1" weight="semibold" className="px-2">
                {item.quantity}
              </Text>
              <CntButton
                onClick={() => updateQuantity(index, item.quantity + 1)}
              >
                <Plus size={16} className="text-dark" />
              </CntButton>
            </div>
          </ListItem>
        ))}
      </List>
    </Section>
  )
}

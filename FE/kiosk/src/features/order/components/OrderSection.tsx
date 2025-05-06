import tw from 'twin.macro'
import { Minus, Plus, Trash } from 'lucide-react'

const Section = tw.div`w-full bg-white border rounded-xl`
const Title = tw.h2`font-semibold p-2`
const List = tw.ul`space-y-2`
const Item = tw.li`flex justify-between items-center border p-2 rounded`
const Name = tw.div`text-sm`
const Controls = tw.div`flex items-center gap-2`
const Button = tw.button`px-2 font-bold`

export interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface OrderSectionProps {
  orders: OrderItem[]
  onUpdate: (index: number, delta: number) => void
  onRemove: (index: number) => void
}

export default function OrderSection({
  orders,
  onUpdate,
  onRemove,
}: OrderSectionProps) {
  return (
    <Section>
      <Title>주문 내역 {orders.length}</Title>
      <List>
        {orders.map((item, i) => (
          <div className="flex justify-between items-center px-2 py-2 border-b text-sm">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.price.toLocaleString()}원
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onUpdate(i, -1)}>
                <Minus size={16} />
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => onUpdate(i, 1)}>
                <Plus size={16} />
              </button>
              <button onClick={() => onRemove(i)}>
                <Trash size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </List>
    </Section>
  )
}

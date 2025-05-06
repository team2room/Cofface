import React from 'react'
import { Minus, Plus, Trash } from 'lucide-react'

interface OrderItemCardProps {
  name: string
  price: number
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
}

export const OrderItemCard: React.FC<OrderItemCardProps> = ({
  name,
  price,
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <div className="flex justify-between items-center px-2 py-2 border-b text-sm">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-gray-500">{price.toLocaleString()}원</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onDecrement}>
          <Minus size={16} />
        </button>
        <span>{quantity}</span>
        <button onClick={onIncrement}>
          <Plus size={16} />
        </button>
        <button onClick={onRemove}>
          <Trash size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  )
}

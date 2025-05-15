import { OrderItem } from '@/interfaces/OrderInterface'
import { Text } from '@/styles/typography'
import { HiMiniArrowTurnDownRight } from 'react-icons/hi2'
import tw from 'twin.macro'
import { ColName, ColPrice, ColQty } from './ReceiptDialog'
import { formatOptionLabel } from '@/utils/formatOptionLabel'

const ItemRow = tw.div`flex justify-between p-2`
const OptionWrapper = tw.div`flex flex-col gap-4 pl-12 pr-2`

interface Props {
  items: OrderItem[]
}

export default function ReceiptItemList({ items }: Props) {
  return (
    <>
      {items.map((item, idx) => (
        <div key={idx} className="my-6">
          <ItemRow>
            <ColName>
              <Text variant="body2" weight="bold">
                {item.name}
              </Text>
            </ColName>
            <ColQty>
              <Text variant="body2" weight="bold">
                {item.quantity}개
              </Text>
            </ColQty>
            <ColPrice>
              <Text variant="body2" weight="bold" color="main">
                {(item.totalPrice * item.quantity).toLocaleString()}원
              </Text>
            </ColPrice>
          </ItemRow>

          <OptionWrapper>
            {item.options.map((opt, i) => (
              <div
                key={i}
                className={`${opt.price > 0 ? 'flex items-center gap-4' : ''}`}
              >
                <div className="flex gap-2">
                  <HiMiniArrowTurnDownRight
                    size={32}
                    className="text-darkGray"
                  />
                  <Text variant="caption1" weight="bold" color="darkGray">
                    {formatOptionLabel(opt)}
                  </Text>
                </div>
                {opt.price > 0 && (
                  <Text variant="caption1" weight="bold" color="darkGray">
                    (+ {opt.price.toLocaleString()}원)
                  </Text>
                )}
              </div>
            ))}
          </OptionWrapper>
        </div>
      ))}
    </>
  )
}

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import ReceiptItemList from './ReceiptItemList'
import { useOrderStore } from '@/stores/orderStore'
import { usePayStore } from '@/stores/payStore'

const Content = tw.div`h-[1150px] bg-lightLight p-4 mt-4 mb-12 flex flex-col justify-between`
const HeaderRow = tw.div`flex justify-between p-2 border-y-2 border-dark`
const TotalRow = tw.div`flex justify-between px-2 py-4 border-t-2 border-dark`

export const ColName = tw.div`w-1/2`
export const ColQty = tw.div`w-1/6 text-center`
export const ColPrice = tw.div`w-1/3 text-right`

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNext: () => void
}

export default function ReceiptModal({
  open,
  onOpenChange,
  onNext,
}: ReceiptModalProps) {
  const orders = useOrderStore((state) => state.orders)
  const payStore = usePayStore()

  const totalQuantity = orders.reduce((sum, item) => sum + item.quantity, 0)

  const totalPrice = orders.reduce((total, item) => {
    return total + item.totalPrice * item.quantity
  }, 0)

  const menuOrders = orders.map((item) => ({
    menuId: item.menuId,
    quantity: item.quantity,
    options: item.options?.map((opt) => ({
      optionItemId: opt.optionId,
      quantity: 1,
    })),
  }))

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95%]">
        <AlertDialogTitle></AlertDialogTitle>
        <Text variant="title4" weight="extrabold" className="text-center my-4">
          주문 정보를 확인해 주세요
        </Text>

        {/* 주문 내용 */}
        <Content>
          <div>
            {/* 헤더 */}
            <HeaderRow>
              <ColName>
                <Text variant="body1" weight="semibold" color="lightBlack">
                  상품명
                </Text>
              </ColName>
              <ColQty>
                <Text variant="body1" weight="semibold" color="lightBlack">
                  수량
                </Text>
              </ColQty>
              <ColPrice>
                <Text variant="body1" weight="semibold" color="lightBlack">
                  가격
                </Text>
              </ColPrice>
            </HeaderRow>

            {/* 상품 목록 */}
            <ReceiptItemList items={orders} />
          </div>

          {/* 총합 */}
          <TotalRow>
            <ColName>
              <Text variant="title4" weight="extrabold">
                전체 금액
              </Text>
            </ColName>
            <ColQty>
              <Text
                variant="title4"
                weight="extrabold"
                className="text-[#FF0000]"
              >
                {totalQuantity}
              </Text>
              <Text variant="title4" weight="extrabold">
                개
              </Text>
            </ColQty>
            <ColPrice>
              <Text
                variant="title4"
                weight="extrabold"
                className="text-[#FF0000]"
              >
                {totalPrice.toLocaleString()}
              </Text>
              <Text variant="title4" weight="extrabold">
                원
              </Text>
            </ColPrice>
          </TotalRow>
        </Content>

        {/* 하단 버튼 */}
        <AlertDialogFooter className="h-20 flex gap-3 justify-center">
          <CustomButton
            text={'취소'}
            variant="cancle"
            onClick={() => onOpenChange(false)}
          />
          <CustomButton
            text={'다음'}
            variant="main"
            onClick={() => {
              payStore.setInitialPayData({
                kioskId: 1,
                totalAmount: totalPrice,
                menuOrders,
                age: 20,
                gender: '여성',
                weather: 'SUNNY',
              })
              onOpenChange(false)
              onNext()
            }}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

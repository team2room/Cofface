import AllMenuSection from '@/features/order/components/Menu/AllMenuSection'
import RecommendSection from '@/features/order/components/Menu/RecommendSection'
import { useState } from 'react'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import OrderSection from '@/features/order/components/Menu/OrderSection'
import ReceiptModal from '@/features/order/components/Receipt/ReceiptDialog'
import { useAllMenu } from '../hooks/useAllMenu'
import { useCategory } from '../hooks/useCategory'
import { useOrderStore } from '@/stores/orderStore'
import { useRecommendMenu } from '../hooks/useRecommendMenu'
import { useStepStore } from '@/stores/stepStore'

const MenuButton = tw.button`w-80 border border-main rounded-xl px-8 py-1 my-4 mx-auto shadow-md`

export default function MenuContent() {
  const { setStep } = useStepStore()
  const { menus, loading: menuLoading } = useAllMenu(1)
  const { category, loading: categoryLoading } = useCategory(1)
  const {
    recentMenus,
    customMenus,
    loading: recommendLoading,
  } = useRecommendMenu(1)

  const [showAllMenu, setShowAllMenu] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)

  const orders = useOrderStore((state) => state.orders)
  const totalPrice = orders.reduce((total, item) => {
    return total + item.totalPrice * item.quantity
  }, 0)

  if (menuLoading || categoryLoading || recommendLoading)
    return <div>불러오는 중...</div>

  return (
    <div className="px-7">
      {/* 추천 메뉴 or 전체 메뉴 */}
      {showAllMenu ? (
        <AllMenuSection menuItems={menus} categories={category} />
      ) : (
        <RecommendSection recentMenus={recentMenus} customMenus={customMenus} />
      )}

      {/* 추천 메뉴 <-> 전체 메뉴 전환 버튼 */}
      <MenuButton onClick={() => setShowAllMenu(!showAllMenu)}>
        <Text variant="body2" weight="bold" color="main">
          {showAllMenu ? '추천메뉴 보기' : '전체메뉴 보기'}
        </Text>
      </MenuButton>

      {/* 주문 내역 */}
      <OrderSection />

      {/* 결제하기 버튼 */}
      <CustomButton
        text={`${totalPrice.toLocaleString()}원 결제하기`}
        variant={orders.length === 0 ? 'disabled' : 'main'}
        onClick={() => setReceiptOpen(true)}
      />

      {/* 주문 정보 모달 */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        onNext={() => setStep('place', 'menu')}
      />
    </div>
  )
}

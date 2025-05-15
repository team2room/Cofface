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

const MenuButton = tw.button`w-80 border border-main rounded-xl px-8 py-1 my-4 mx-auto shadow-md`

export default function MenuContent({ onNext }: { onNext: () => void }) {
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
    <>
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
        onNext={onNext}
      />
    </>
  )
}

// const recentMenus = [
//   {
//     menuId: 3,
//     menuName: '바닐라 라떼',
//     price: 5500,
//     categoryId: 1,
//     categoryName: '커피',
//     isSoldOut: false,
//     imageUrl: 'https://picsum.photos/200',
//     description: '달콤한 바닐라 시럽이 더해진 부드러운 라떼',
//   },
//   {
//     menuId: 1,
//     menuName: '아메리카노',
//     price: 4500,
//     categoryId: 1,
//     categoryName: '커피',
//     isSoldOut: false,
//     imageUrl: 'https://picsum.photos/200',
//     description: '깊고 진한 에스프레소의 풍미가 살아있는 아메리카노',
//   },
//   {
//     menuId: 5,
//     menuName: '에스프레소',
//     price: 4000,
//     categoryId: 1,
//     categoryName: '커피',
//     isSoldOut: false,
//     imageUrl: 'https://picsum.photos/200',
//     description: '진하고 향기로운 에스프레소 한 잔',
//   },
// ]

// const customMenus = [
//   {
//     menuId: 4,
//     menuName: '카라멜 마끼아또',
//     price: 5800,
//     categoryId: 1,
//     categoryName: '커피',
//     isSoldOut: false,
//     imageUrl: 'https://picsum.photos/200',
//     description: '달콤한 카라멜과 바닐라 시럽, 에스프레소가 층을 이루는 음료',
//   },
//   {
//     menuId: 2,
//     menuName: '카페 라떼',
//     price: 5000,
//     categoryId: 1,
//     categoryName: '커피',
//     isSoldOut: false,
//     imageUrl: 'https://picsum.photos/200',
//     description: '부드러운 우유와 에스프레소의 조화로운 맛',
//   },
//   {
//     menuId: 6,
//     menuName: '디카페인 아메리카노',
//     price: 5000,
//     categoryId: 2,
//     categoryName: '디카페인',
//     isSoldOut: false,
//     imageUrl: 'https://picsum.photos/200',
//     description: '카페인 걱정 없이 즐기는 풍부한 맛의 아메리카노',
//   },
//   {
//     menuId: 7,
//     menuName: '디카페인 카페 라떼',
//     price: 5500,
//     categoryId: 2,
//     categoryName: '디카페인',
//     isSoldOut: false,
//     imageUrl: 'https://picsum.photos/200',
//     description: '카페인을 줄인 에스프레소와 우유의 부드러운 조화',
//   },
// ]

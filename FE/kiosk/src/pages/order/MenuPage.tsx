import Header from '@/components/Header'
import AllMenuSection from '@/features/order/components/AllMenuSection'
import RecommendSection from '@/features/order/components/RecommendSection'
import { MenuItem } from '@/interfaces/OrderInterface'
import { useState } from 'react'
import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import OrderSection from '@/features/order/components/OrderSection'

const Container = tw.div`flex flex-col items-center justify-center min-h-screen bg-white px-7`
const MenuButton = tw.button`border border-main rounded-xl px-8 py-1 my-4 shadow-md`

export default function MenuPage() {
  const [showAllMenu, setShowAllMenu] = useState(false)
  const total = 19000

  return (
    <Container>
      <Header isMember={true} />

      {/* 추천 메뉴 or 전체 메뉴 */}
      {showAllMenu ? (
        <AllMenuSection menuItems={menuItems} />
      ) : (
        <RecommendSection
          recentMenus={recentMenus}
          customMenus={recommendedMenus}
        />
      )}

      {/* 추천 메뉴 <-> 전체 메뉴 전환 버튼 */}
      <MenuButton onClick={() => setShowAllMenu(!showAllMenu)}>
        <Text variant="body2" weight="bold" color="main">
          {showAllMenu ? '추천메뉴 보기' : '전체메뉴 보기'}
        </Text>
      </MenuButton>

      {/* 주문 내역 */}
      <OrderSection orders={orderList} />

      {/* 결제하기 버튼 */}
      <CustomButton
        text={`${total.toLocaleString()}원 결제하기`}
        variant={'main'}
      />
    </Container>
  )
}

const recentMenus = [
  { name: '왕메가사과유자', price: 5500 },
  { name: '딸기라떼', price: 4000 },
  { name: '(HOT)상큼 리치 티', price: 3000 },
  { name: '청포도샤워크러쉬', price: 5500 },
]

const recommendedMenus = [
  { name: '왕메가사과유자', price: 5500 },
  { name: '딸기라떼', price: 4000 },
  { name: '(HOT)상큼 리치 티', price: 3000 },
  { name: '청포도샤워크러쉬', price: 5500 },
]

const orderList = [
  {
    name: '코코넛 커피 스무디',
    price: 5000,
    quantity: 2,
  },
  {
    name: '디카페인 카페모카',
    price: 2500,
    quantity: 1,
  },
  {
    name: '디카페인 카페모카',
    price: 2500,
    quantity: 1,
  },
]

// menuItems
const menuItems: MenuItem[] = [
  {
    name: '디카페인 카페모카',
    price: 2500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '디카페인 헬카페라떼',
    price: 4500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
  {
    name: '디카페인 카페모카',
    price: 2500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '디카페인 헬카페라떼',
    price: 4500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
  {
    name: '디카페인 카페모카',
    price: 2500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '디카페인 헬카페라떼',
    price: 4500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
  {
    name: '디카페인 카페모카',
    price: 2500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '디카페인 헬카페라떼',
    price: 4500,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
  {
    name: '콜드브루 아메리카노',
    price: 3000,
    image: 'https://picsum.photos/200',
  },
]

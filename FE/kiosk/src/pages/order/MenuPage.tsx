import Header from '@/components/Header'
import AllMenuSection from '@/features/order/components/AllMenuSection'
import OrderSection, {
  OrderItem,
} from '@/features/order/components/OrderSection'
import RecommendSection, {
  MenuItem,
} from '@/features/order/components/RecommendSection'
import { useState } from 'react'
import tw from 'twin.macro'

const Container = tw.div`
  flex flex-col items-center justify-center min-h-screen bg-white px-7
`
const Button = tw.button`w-full py-4 bg-pink-500 text-white font-bold text-lg rounded`

export default function MenuPage() {
  const [showAllMenu, setShowAllMenu] = useState(false)
  const total = '19000'

  const [orderList, setOrderList] = useState<OrderItem[]>([
    {
      name: '코코넛 커피 스무디',
      price: 5000,
      quantity: 1,
    },
    {
      name: '디카페인 카페모카',
      price: 2500,
      quantity: 2,
    },
  ])

  // 더미 메뉴
  // categories
  const categories = [
    '전체 메뉴',
    '커피',
    '디카페인',
    '에이드&주스',
    '티',
    '스무디&프라페',
    '디저트',
  ]

  // selectedCategory
  const [selectedCategory, setSelectedCategory] = useState('전체 메뉴')

  // onSelectCategory
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat) // useState로 상태 관리 필요
  }

  // menuItems
  const menuItems: MenuItem[] = [
    {
      name: '디카페인 카페모카',
      price: 2500,
      image: '/images/menu1.png',
    },
    {
      name: '디카페인 헬카페라떼',
      price: 4500,
      image: '/images/menu2.png',
    },
    {
      name: '콜드브루 아메리카노',
      price: 3000,
      image: '/images/menu3.png',
    },
  ]
  return (
    <Container>
      <Header isMember={true} />

      {/* 추천 메뉴 or 전체 메뉴 */}
      {showAllMenu ? (
        <AllMenuSection
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          menuItems={menuItems}
        />
      ) : (
        <RecommendSection
          recentMenus={recentMenus}
          customMenus={recommendedMenus}
        />
      )}

      {/* 추천 메뉴 <-> 전체 메뉴 전환 버튼 */}
      <div className="text-center" onClick={() => setShowAllMenu(!showAllMenu)}>
        <button className="text-pink-600 border border-pink-400 text-sm px-4 py-1 rounded-full">
          {showAllMenu ? '추천메뉴 보기' : '전체메뉴 보기'}
        </button>
      </div>

      {/* 주문 내역 */}
      <OrderSection
        orders={orderList}
        onUpdate={() => {}}
        onRemove={() => {}}
      />

      {/* 결제하기 버튼 */}
      <Button>{total.toLocaleString()}원 결제하기</Button>
    </Container>
  )
}

const recentMenus = [
  { name: '청포도샤워크러쉬', price: 5500 },
  { name: '딸기라떼', price: 4000 },
  { name: '(HOT)살얼음 리치 티', price: 3000 },
  { name: '청포도샤워크러쉬', price: 5500 },
]

const recommendedMenus = [
  { name: '청포도샤워크러쉬', price: 5500 },
  { name: '딸기라떼', price: 4000 },
  { name: '(HOT)살얼음 리치 티', price: 3000 },
  { name: '얼얼마샤샤크러쉬', price: 5500 },
]

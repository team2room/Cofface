import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { MenuCardProps } from '@/interfaces/OrderInterface'
import { useState } from 'react'
import OptionModal from '@/features/order/components/Option/OptionDialog'
import { useOption } from '../../hooks/useOption'

const Container = tw.div`w-56 h-72 px-4 py-3 rounded-xl bg-white grid justify-items-center`
const Image = tw.img`w-32 h-32 object-cover`
const Divider = tw.hr`w-full h-px my-2 bg-gray border-0`

export default function MenuCard({ item, boxShadowColor }: MenuCardProps) {
  const [optionOpen, setOptionOpen] = useState(false)
  const { data: menuOption } = useOption(item.menuId)

  return (
    <>
      <Container
        onClick={() => setOptionOpen(true)}
        style={{
          boxShadow: `1.462px 1.462px 4px 2px ${boxShadowColor}`,
        }}
      >
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.menuName} />
        ) : (
          <Image src="https://picsum.photos/200" alt="없음" />
        )}
        <Divider />
        <Text
          variant="caption1"
          className="flex items-center justify-center text-center mb-2 h-16"
        >
          {item.menuName}
        </Text>
        <Text variant="body4" weight="semibold">
          {item.price.toLocaleString()}원
        </Text>
      </Container>

      {/* 옵션 선택 모달 */}
      {menuOption && (
        <OptionModal
          open={optionOpen}
          onOpenChange={setOptionOpen}
          menu={menuOption}
        />
      )}
    </>
  )
}

// const menuOption = {
//   menuId: 1,
//   menuName: '왕카페라떼',
//   price: 4000,
//   categoryId: 1,
//   categoryName: '커피',
//   isSoldOut: false,
//   imageUrl:
//     'https://s3.ap-northeast-2.amazonaws.com/order.me/menus/coffee1.jpg',
//   options: [
//     {
//       optionCategory: 'HOT/ICED',
//       isRequired: true,
//       optionNames: ['차갑게', '뜨겁게'],
//       additionalPrices: [0, 0],
//       optionIds: [1, 2],
//       isDefault: [true, false],
//       maxSelections: 1,
//     },
//     {
//       optionCategory: '사이즈',
//       isRequired: true,
//       optionNames: ['작은', '중간', '큰'],
//       additionalPrices: [0, 500, 1000],
//       optionIds: [4, 5, 6],
//       isDefault: [true, false, false],
//       maxSelections: 1,
//     },
//     {
//       optionCategory: '샷 추가',
//       isRequired: false,
//       optionNames: ['없음', '1샷', '2샷', '3샷'],
//       additionalPrices: [0, 500, 1000, 1500],
//       optionIds: [14, 15, 16, 17],
//       isDefault: [true, false, false, false],
//       maxSelections: 1,
//     },
//     {
//       optionCategory: '우유 변경',
//       isRequired: false,
//       optionNames: ['없음', '오트(귀리)', '아몬드', '두유'],
//       additionalPrices: [0, 600, 600, 600],
//       optionIds: [18, 19, 20, 21],
//       isDefault: [true, false, false, false],
//       maxSelections: 1,
//     },
//   ],
//   description:
//     '진한 에스프레소와 부드러운 우유가 어우러져 고소한 풍미를 완성한 메가MGC커피만의 왕메가사이즈 라떼',
// }

import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { MenuCardProps, MenuData } from '@/interfaces/OrderInterface'
import { useState } from 'react'
import OptionModal from '@/features/order/components/Option/OptionDialog'

const Container = tw.div`w-56 h-72 px-4 py-3 rounded-xl bg-white grid justify-items-center`
const Image = tw.img`w-32 h-32 object-cover`
const Divider = tw.hr`w-full h-px my-2 bg-gray border-0`

export default function MenuCard({ item, boxShadowColor }: MenuCardProps) {
  const [optionOpen, setOptionOpen] = useState(false)

  return (
    <>
      <Container
        onClick={() => setOptionOpen(true)}
        style={{
          boxShadow: `1.462px 1.462px 4px 2px ${boxShadowColor}`,
        }}
      >
        {item.image ? (
          <Image src={item.image} alt={item.name} />
        ) : (
          <Image src="https://picsum.photos/200" alt="없음" />
        )}
        <Divider />
        <Text
          variant="caption1"
          className="flex items-center justify-center text-center mb-2 h-16"
        >
          {item.name}
        </Text>
        <Text variant="body4" weight="semibold">
          {item.price.toLocaleString()}원
        </Text>
      </Container>

      {/* 옵션 선택 모달 */}
      <OptionModal
        open={optionOpen}
        onOpenChange={setOptionOpen}
        menu={dummyMenu}
      />
    </>
  )
}

const dummyMenu: MenuData = {
  menuName: '아메리카노',
  price: 4500,
  imageUrl: 'https://picsum.photos/200',
  description: '깊고 진한 에스프레소의 풍미가 살아있는 아메리카노',
  options: [
    {
      optionCategory: 'HOT/ICED',
      isRequired: true,
      optionNames: ['뜨거운', '차가운'],
      additionalPrices: [0, 500],
      optionIds: [1, 2],
      maxSelections: 1,
    },
    {
      optionCategory: '사이즈',
      isRequired: true,
      optionNames: ['작은', '중간', '큰'],
      additionalPrices: [0, 300, 500],
      optionIds: [3, 4, 5],
      maxSelections: 1,
    },
    {
      optionCategory: '얼음 양',
      isRequired: false,
      optionNames: ['적게', '보통', '많이'],
      additionalPrices: [0, 300, 500],
      optionIds: [6, 7, 8],
      maxSelections: 1,
    },
    {
      optionCategory: '휘핑 크림',
      isRequired: false,
      optionNames: ['없음', '적게', '보통', '많이'],
      additionalPrices: [0, 0, 0, 0],
      optionIds: [9, 10],
      maxSelections: 1,
    },
    {
      optionCategory: '샷 추가',
      isRequired: false,
      optionNames: ['1샷', '2샷', '3샷'],
      additionalPrices: [500, 1000, 1500],
      optionIds: [9, 10],
      maxSelections: 1,
    },
  ],
}

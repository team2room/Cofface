import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import { MenuCardProps } from '@/interfaces/OrderInterface'
import { useState } from 'react'
import OptionModal from '@/features/order/components/Option/OptionDialog'
import { useOption } from '../../hooks/useOption'

const Container = tw.div`w-56 h-72 px-4 py-3 rounded-xl bg-white grid justify-items-center`
const Image = tw.img`w-32 h-32 object-contain`
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

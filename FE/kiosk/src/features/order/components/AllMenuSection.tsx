import MenuCard from '@/features/order/components/MenuCard'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { MenuItem } from '@/interfaces/OrderInterface'
import { useState } from 'react'
import { useDragScroll } from '@/hooks/useDragScroll'
import { Text } from '@/styles/typography'

const Wrapper = tw.div`w-full`
const Tabs = tw.div`grid grid-cols-4 gap-4 my-8`
const Tab = styled.button<{ selected: boolean }>`
  ${tw`w-full py-1`}
  ${({ selected }) =>
    selected
      ? tw`border-b-4 border-littleDark`
      : tw`border-b-2 text-littleDarkGray`}
`
const Section = tw.div`bg-[#F6F6F6] p-5 rounded-xl`
const List = tw.div`h-[1042px] overflow-auto  grid grid-cols-4 gap-4 p-1`

interface AllMenuSectionProps {
  menuItems: MenuItem[]
}

export default function AllMenuSection({ menuItems }: AllMenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체 메뉴')
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat)
  }

  const {
    ref: scrollRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  } = useDragScroll<HTMLDivElement>()

  return (
    <Wrapper>
      <Tabs>
        {categories.map((cat) => (
          <Tab
            key={cat}
            selected={cat === selectedCategory}
            onClick={() => handleSelectCategory(cat)}
          >
            <Text variant="body2" weight="bold">
              {cat}
            </Text>
          </Tab>
        ))}
      </Tabs>
      <Section>
        <List
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {menuItems.map((item, idx) => (
            <MenuCard
              key={`menu-${idx}`}
              item={item}
              boxShadowColor={'#00000040'}
            />
          ))}
        </List>
      </Section>
    </Wrapper>
  )
}

const categories = [
  '전체 메뉴',
  '커피',
  '디카페인',
  '에이드&주스',
  '티',
  '스무디&프라페',
  '디저트',
]

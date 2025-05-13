import MenuCard from '@/features/order/components/Menu/MenuCard'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { useState } from 'react'
import { useDragScroll } from '@/hooks/useDragScroll'
import { Text } from '@/styles/typography'
import { AllMenuSectionProps } from '@/interfaces/OrderInterface'

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

export default function AllMenuSection({
  menuItems,
  categories,
}: AllMenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체 메뉴')
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat)
  }

  const filteredMenus =
    selectedCategory === '전체 메뉴'
      ? menuItems
      : menuItems.filter((item) => item.categoryName === selectedCategory)

  const {
    ref: scrollRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  } = useDragScroll<HTMLDivElement>()

  return (
    <Wrapper>
      <Tabs>
        <Tab
          key="전체 메뉴"
          selected={selectedCategory === '전체 메뉴'}
          onClick={() => handleSelectCategory('전체 메뉴')}
        >
          <Text variant="body2" weight="bold">
            전체 메뉴
          </Text>
        </Tab>
        {categories.map((cat) => (
          <Tab
            key={cat.categoryId}
            selected={cat.categoryName === selectedCategory}
            onClick={() => handleSelectCategory(cat.categoryName)}
          >
            <Text variant="body2" weight="bold">
              {cat.categoryName}
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
          {filteredMenus.map((item) => (
            <MenuCard
              key={item.menuId}
              item={item}
              boxShadowColor="#00000040"
            />
          ))}
        </List>
      </Section>
    </Wrapper>
  )
}

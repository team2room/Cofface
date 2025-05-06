import MenuCard from '@/components/MenuCard'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { MenuItem } from './RecommendSection'

const Wrapper = tw.div`w-full`
const Tabs = tw.div`flex gap-4 border-b mb-4`
const Tab = styled.button<{ selected: boolean }>`
  ${tw`py-2 px-4 font-semibold`}
  ${({ selected }) =>
    selected ? tw`border-b-2 border-pink-500 text-pink-500` : tw`text-gray`}
`
const Grid = tw.div`grid grid-cols-3 gap-4`

interface AllMenuSectionProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  menuItems: MenuItem[]
}

export default function AllMenuSection({
  categories,
  selectedCategory,
  onSelectCategory,
  menuItems,
}: AllMenuSectionProps) {
  return (
    <Wrapper>
      <Tabs>
        {categories.map((cat) => (
          <Tab
            key={cat}
            selected={cat === selectedCategory}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </Tab>
        ))}
      </Tabs>
      <Grid>
        {menuItems.map((item, idx) => (
          <MenuCard key={`menu-${idx}`} item={item} />
        ))}
      </Grid>
    </Wrapper>
  )
}

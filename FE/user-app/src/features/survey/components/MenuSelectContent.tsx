import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { MenuCategoryProps, MenuItemProps } from '@/interfaces/SurveyInterfaces'

interface MenuSelectContentProps {
  menuCategories: MenuCategoryProps[]
  selectedMenus: number[]
  onMenuSelect: (menuId: number) => void
}

const GridContainer = tw.div`
  w-full relative
`
const SelectionStatusHeader = tw.div`
  flex items-center justify-between w-full bg-background py-4 sticky top-0 left-0 z-50
`
const CategoryContainer = tw.div`
  mb-4 
`
const MenuGrid = tw.div`
  grid grid-cols-3 gap-3
`
const MenuItemContainer = styled.div<{ isSelected: boolean }>`
  ${tw`
    flex flex-col items-center justify-center bg-littleGray rounded-full p-6 cursor-pointer
    transition-all duration-200
  `}
  ${({ isSelected }) => isSelected && tw`bg-light`}
`

interface MenuItemComponentProps {
  menu: MenuItemProps
  isSelected: boolean
  onClick: () => void
}

const MenuItemComponent = ({
  menu,
  isSelected,
  onClick,
}: MenuItemComponentProps) => (
  <div className="flex flex-col items-center">
    <MenuItemContainer isSelected={isSelected} onClick={onClick}>
      <div className="w-12 h-12 flex items-center justify-center">
        <img
          src={menu.imageUrl}
          alt={menu.menuName}
          className="w-10 h-10 object-contain opacity-60"
        />
      </div>
    </MenuItemContainer>
    <Text
      variant="caption1"
      weight="bold"
      color={isSelected ? 'dark' : 'darkGray'}
    >
      {menu.menuName}
    </Text>
  </div>
)

export default function MenuSelectContent({
  menuCategories,
  selectedMenus,
  onMenuSelect,
}: MenuSelectContentProps) {
  // 선택 가능한 모든 메뉴 수를 계산 (카테고리별로 메뉴들의 합)
  const totalMenuCount = menuCategories.reduce(
    (total, category) => total + category.menus.length,
    0,
  )

  return (
    <GridContainer>
      <SelectionStatusHeader>
        <Text variant="caption1" weight="bold" color="littleDark">
          최소 1개 선택 해주세요
        </Text>
        <Text
          variant="caption1"
          weight="bold"
          color={selectedMenus.length > 0 ? 'main' : 'darkGray'}
        >
          {selectedMenus.length} / {totalMenuCount} 선택됨
        </Text>
      </SelectionStatusHeader>
      {menuCategories.map((category) => (
        <CategoryContainer key={category.categoryId}>
          <MenuGrid>
            {category.menus.map((menu) => (
              <MenuItemComponent
                key={menu.menuId}
                menu={menu}
                isSelected={selectedMenus.includes(menu.menuId)}
                onClick={() => onMenuSelect(menu.menuId)}
              />
            ))}
          </MenuGrid>
        </CategoryContainer>
      ))}
    </GridContainer>
  )
}

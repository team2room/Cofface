import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { OptionCategoryProps } from '@/interfaces/SurveyInterfaces'

interface OptionSelectContentProps {
  optionCategories: OptionCategoryProps[]
  selectedOptions: Record<number, number>
  onOptionSelect: (categoryId: number, itemId: number) => void
}

const Container = tw.div`
  w-full mt-6
`

const CategorySection = tw.div`
  mb-2 bg-lightLight rounded-lg p-2
`

const CategoryTitle = tw.div`
  text-left mb-2 ml-2
`

const OptionGrid = tw.div`
  grid grid-cols-4 gap-2 
`

const OptionItemContainer = styled.div<{ isSelected: boolean }>`
  ${tw`
    flex flex-col items-center justify-center bg-white rounded-full p-4 cursor-pointer
    transition-all duration-200
  `}
  ${({ isSelected }) => isSelected && tw`bg-littleLight`}
`

interface OptionItemProps {
  name: string
  icon: {
    on: string
    off: string
  }
  isSelected: boolean
  onClick: () => void
}

const OptionItem = ({ name, icon, isSelected, onClick }: OptionItemProps) => (
  <div className="flex flex-col items-center">
    <OptionItemContainer isSelected={isSelected} onClick={onClick}>
      <div className="w-10 h-10 flex items-center justify-center">
        <img
          src={isSelected ? icon.on : icon.off}
          alt={name}
          className="w-10 h-10 object-contain opacity-60"
        />
      </div>
    </OptionItemContainer>
    <Text
      variant="caption1"
      weight="bold"
      color={isSelected ? 'dark' : 'darkGray'}
    >
      {name}
    </Text>
  </div>
)

// 카테고리 ID에 따른 아이콘 매핑
const getCategoryIcons = (categoryId: number, optionName: string) => {
  // 카테고리에 따른 아이콘 경로 구성
  const iconMappings: Record<
    number,
    Record<string, { on: string; off: string }>
  > = {
    // 온도 옵션 (1)
    1: {
      차갑게: {
        on: '/drinks/icons/icon-cold-on.png',
        off: '/drinks/icons/icon-cold-off.png',
      },
      뜨겁게: {
        on: '/drinks/icons/icon-hot-on.png',
        off: '/drinks/icons/icon-hot-off.png',
      },
    },
    // 사이즈 옵션 (2)
    2: {
      작은: {
        on: '/drinks/icons/icon-small-on.png',
        off: '/drinks/icons/icon-small-off.png',
      },
      중간: {
        on: '/drinks/icons/icon-medium-on.png',
        off: '/drinks/icons/icon-medium-off.png',
      },
      큰: {
        on: '/drinks/icons/icon-large-on.png',
        off: '/drinks/icons/icon-large-off.png',
      },
    },
    // 얼음 옵션 (3)
    3: {
      적게: {
        on: '/drinks/icons/icon-ice1-on.png',
        off: '/drinks/icons/icon-ice1-off.png',
      },
      보통: {
        on: '/drinks/icons/icon-ice2-on.png',
        off: '/drinks/icons/icon-ice2-off.png',
      },
      많이: {
        on: '/drinks/icons/icon-ice3-on.png',
        off: '/drinks/icons/icon-ice3-off.png',
      },
    },
    // 샷 추가 옵션 (4)
    4: {
      없음: {
        on: '/drinks/icons/icon-nope-on.png',
        off: '/drinks/icons/icon-nope-off.png',
      },
      '1샷': {
        on: '/drinks/icons/icon-shot1-on.png',
        off: '/drinks/icons/icon-shot1-off.png',
      },
      '2샷': {
        on: '/drinks/icons/icon-shot2-on.png',
        off: '/drinks/icons/icon-shot2-off.png',
      },
      '3샷': {
        on: '/drinks/icons/icon-shot3-on.png',
        off: '/drinks/icons/icon-shot3-off.png',
      },
    },
  }

  // 해당 카테고리와 옵션에 맞는 아이콘 반환
  return (
    iconMappings[categoryId]?.[optionName] || {
      on: '/drinks/icons/icon-default-on.png',
      off: '/drinks/icons/icon-default-off.png',
    }
  )
}

// 카테고리 ID에 따른 제목 매핑 (API에서 받은 제목 대신 사용)
const getCategoryTitle = (categoryId: number): string => {
  const titles: Record<number, string> = {
    1: '음료 온도',
    2: '사이즈',
    3: '얼음 양',
    4: '샷 추가',
  }

  return titles[categoryId] || '옵션'
}

export default function OptionSelectContent({
  optionCategories,
  selectedOptions,
  onOptionSelect,
}: OptionSelectContentProps) {
  return (
    <Container>
      {optionCategories.map((category) => (
        <CategorySection key={category.categoryId}>
          <CategoryTitle>
            <Text variant="caption2" weight="bold">
              {getCategoryTitle(category.categoryId)}
            </Text>
          </CategoryTitle>

          <OptionGrid>
            {category.optionItems.map((option) => {
              const icons = getCategoryIcons(
                category.categoryId,
                option.optionName,
              )

              return (
                <OptionItem
                  key={`${category.categoryId}-${option.itemId}`}
                  name={option.optionName}
                  icon={icons}
                  isSelected={
                    selectedOptions[category.categoryId] === option.itemId
                  }
                  onClick={() =>
                    onOptionSelect(category.categoryId, option.itemId)
                  }
                />
              )
            })}
          </OptionGrid>
        </CategorySection>
      ))}
    </Container>
  )
}

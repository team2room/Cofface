import { useEffect, useState } from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors } from '@/styles/colors'

const Container = tw.div`
  flex flex-col items-center w-full
`

const SelectionWrapper = tw.div`
  flex justify-end my-10 w-full
`

const IconsContainer = tw.div`
  flex rounded-full shadow-sm border border-main border-2
`

const IconButton = styled.button<{ isSelected: boolean }>`
  ${tw`rounded-full p-2 transition-all duration-300`}
  border: ${(props) =>
    props.isSelected
      ? `2px solid ${colors.main}`
      : `2px solid ${colors.white}`};
  background-color: transparent;
`

const DrinkImageWrapper = tw.div`
  relative w-64 h-96 flex justify-center items-center
`

const DrinkImage = styled.img<{ isActive: boolean }>`
  ${tw`absolute inset-0 w-full h-full object-contain transition-opacity duration-500`}
  opacity: ${(props) => (props.isActive ? 1 : 0)};
`

interface DrinkOption {
  id: string
  iconSrc: string
  imgSrc: string
}

export function HomeSelectDrinks() {
  const [selectedDrink, setSelectedDrink] = useState('strawberry')

  const drinkOptions: DrinkOption[] = [
    {
      id: 'strawberry',
      iconSrc: '/src/assets/icons/icon-strawberry.png',
      imgSrc: '/src/assets/drinks/strawberry.png',
    },
    {
      id: 'cookie',
      iconSrc: '/src/assets/icons/icon-cookie.png',
      imgSrc: '/src/assets/drinks/cookie.png',
    },
    {
      id: 'greentea',
      iconSrc: '/src/assets/icons/icon-greentea.png',
      imgSrc: '/src/assets/drinks/greentea.png',
    },
  ]

  // 컴포넌트 마운트 시 strawberry 기본 선택 상태 설정
  useEffect(() => {
    setSelectedDrink('strawberry')
  }, [])

  const handleDrinkSelect = (drinkId: string) => {
    setSelectedDrink(drinkId)
  }

  return (
    <Container>
      <SelectionWrapper>
        <IconsContainer>
          {drinkOptions.map((drink) => (
            <IconButton
              key={drink.id}
              isSelected={selectedDrink === drink.id}
              onClick={() => handleDrinkSelect(drink.id)}
            >
              <img src={drink.iconSrc} alt={drink.id} className="w-5 h-5" />
            </IconButton>
          ))}
        </IconsContainer>
      </SelectionWrapper>
      <DrinkImageWrapper>
        {drinkOptions.map((drink) => (
          <DrinkImage
            key={drink.id}
            src={drink.imgSrc}
            alt={drink.id}
            isActive={selectedDrink === drink.id}
          />
        ))}
      </DrinkImageWrapper>
    </Container>
  )
}

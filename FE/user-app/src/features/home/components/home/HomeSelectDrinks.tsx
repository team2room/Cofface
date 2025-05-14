import { useEffect, useMemo, useState } from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors } from '@/styles/colors'
import { Text } from '@/styles/typography'
import iconStrawberry from '@/assets/icons/icon-strawberry.png'
import iconCookie from '@/assets/icons/icon-cookie.png'
import iconGreentea from '@/assets/icons/icon-greentea.png'
import strawberry from '@/assets/drinks/strawberry.png'
import cookie from '@/assets/drinks/cookie.png'
import greentea from '@/assets/drinks/greentea.png'
import imgIce from '@/assets/ice.png'
import lock from '@/assets/lock.png'

const Container = tw.div`
  flex flex-col items-center w-full relative
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

// 각각의 얼음 아이템을 위한 컴포넌트
const IceImage = styled.img<{
  visitLevel: number
  maxLevel: number
  left: number
  size: number
  rotate: number
  isActive: boolean
}>`
  ${tw`absolute transition-all duration-500 z-10`}
  opacity: ${(props) => (props.isActive ? 1 : 0)};
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  transform: rotate(${(props) => props.rotate}deg);
  left: ${(props) => props.left}%;
  /* 방문 횟수에 따라 얼음의 위치 계산 (값이 클수록 위로) */
  top: ${(props) => {
    // 방문 횟수(visitLevel)에 따라 top 위치를 계산
    // maxLevel은 최대 방문 횟수(30)
    // 최소 위치는 80%(하단), 최대 위치는 10%(상단)
    const minPosition = 84 // 가장 아래 위치 (%)
    const maxPosition = 32 // 가장 위 위치 (%)
    const range = minPosition - maxPosition

    // 방문 횟수의 비율을 계산 (0~1 사이 값)
    const ratio = Math.min(props.visitLevel / props.maxLevel, 1)

    // 위치 계산: 비율이 높을수록 위로 올라감
    return `${minPosition - ratio * range}%`
  }};
`

// 블러 처리를 위한 오버레이 컴포넌트
const LockedOverlay = styled.div`
  ${tw`absolute inset-0 flex flex-col items-center justify-center z-10 w-full`}
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.3);
`

const LockImage = tw.div`
  flex justify-center items-center mb-6 w-44
`

const LockMessage = tw.div`
  text-center px-6 
`

interface DrinkOption {
  id: string
  iconSrc: string
  imgSrc: string
}

interface IceInfo {
  id: string
  visitCount: number // 이 얼음이 나타내는 방문 횟수
  left: number
  size: number
  rotate: number
}

interface IsLockedProps {
  locked?: boolean
}

export function HomeSelectDrinks({ locked = false }: IsLockedProps) {
  const [selectedDrink, setSelectedDrink] = useState('strawberry')

  const drinkOptions: DrinkOption[] = [
    {
      id: 'strawberry',
      iconSrc: iconStrawberry,
      imgSrc: strawberry,
    },
    {
      id: 'cookie',
      iconSrc: iconCookie,
      imgSrc: cookie,
    },
    {
      id: 'greentea',
      iconSrc: iconGreentea,
      imgSrc: greentea,
    },
  ]

  // 7개의 얼음 정보 (각 범위내 횟수별 얼음 위치)
  const iceInfo: IceInfo[] = useMemo(() => {
    return [
      {
        id: 'ice-1',
        visitCount: 1,
        left: 40,
        size: 40,
        rotate: 30,
      },
      {
        id: 'ice-2',
        visitCount: 5,
        left: 56,
        size: 42,
        rotate: 80,
      },
      {
        id: 'ice-3',
        visitCount: 10,
        left: 40,
        size: 48,
        rotate: 150,
      },
      {
        id: 'ice-4',
        visitCount: 15,
        left: 58,
        size: 50,
        rotate: 220,
      },
      {
        id: 'ice-5',
        visitCount: 20,
        left: 40,
        size: 52,
        rotate: 180,
      },
      {
        id: 'ice-6',
        visitCount: 25,
        left: 60,
        size: 58,
        rotate: 110,
      },
      {
        id: 'ice-7',
        visitCount: 27,
        left: 40,
        size: 40,
        rotate: 200,
      },
    ]
  }, [])

  // 컴포넌트 마운트 시 strawberry 기본 선택 상태 설정
  useEffect(() => {
    setSelectedDrink('strawberry')
  }, [])

  const handleDrinkSelect = (drinkId: string) => {
    if (locked) return // 잠금 상태에서는 선택 불가
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
          <>
            {iceInfo.map((ice) => (
              <IceImage
                key={`${drink.id}-${ice.id}`}
                src={imgIce}
                alt={`${ice.visitCount}회 방문`}
                visitLevel={ice.visitCount}
                maxLevel={30}
                left={ice.left}
                size={ice.size}
                rotate={ice.rotate}
                isActive={selectedDrink === drink.id}
                onClick={() => {}}
              />
            ))}
          </>
        ))}
        {drinkOptions.map((drink) => (
          <DrinkImage
            key={drink.id}
            src={drink.imgSrc}
            alt={drink.id}
            isActive={selectedDrink === drink.id}
          />
        ))}
      </DrinkImageWrapper>
      {locked && (
        <LockedOverlay>
          <LockMessage>
            <Text variant="title3" weight="bold" color="main">
              등록 이후에 사용할 수 있어요!
            </Text>
          </LockMessage>
          <LockImage>
            <img src={lock} alt="잠금" />
          </LockImage>
        </LockedOverlay>
      )}
    </Container>
  )
}

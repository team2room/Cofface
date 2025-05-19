import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { colors } from '@/styles/colors'
import { Text } from '@/styles/typography'
import { useVisitedStoreStore } from '@/stores/visitedStoreStore'
import { VisitedStoreInfo } from '@/interfaces/HomeInterfaces'
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
  flex justify-end my-5 w-full
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
  relative w-96 h-96 justify-center items-center
`

const DrinkImage = styled.img<{ isActive: boolean }>`
  ${tw`absolute inset-0 w-full h-full object-contain transition-opacity duration-500`}
  opacity: ${(props) => (props.isActive ? 1 : 0)};
`

// 각각의 얼음 아이템을 위한 컴포넌트
const IceImage = styled.img<{
  isVisible: boolean
  left: number
  size: number
  rotate: number
  isActive: boolean
  topPosition: number
  storeId: number
}>`
  ${tw`absolute transition-all duration-500 z-10 cursor-pointer`}
  opacity: ${(props) => (props.isActive && props.isVisible ? 1 : 0)};
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  transform: rotate(${(props) => props.rotate}deg);
  left: ${(props) => props.left}%;
  top: ${(props) => `${props.topPosition}%`};
`

// 카페 이름을 표시하는 레이블
const CafeLabel = styled.div<{
  isVisible: boolean
  left: number
  topPosition: number
  isActive: boolean
  storeId: number
}>`
  ${tw`absolute z-20 bg-brightModal rounded-full px-1 py-1 shadow-md transition-all duration-500 cursor-pointer flex`}
  opacity: ${(props) => (props.isActive && props.isVisible ? 1 : 0)};
  left: ${(props) => props.left + 20}%;
  top: ${(props) =>
    `${props.topPosition + 7}%`}; // 얼음 위치보다 약간 위에 표시
  transform: translate(-50%, -50%);
`

// 블러 처리를 위한 오버레이 컴포넌트
const LockedOverlay = styled.div`
  ${tw`absolute inset-0 flex flex-col items-center justify-center z-20 w-full`}
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
  minVisitCount: number
  maxVisitCount: number
  height: number
  left: number
  size: number
  rotate: number
  labelLeft: number
}

interface IsLockedProps {
  locked?: boolean
}

export function HomeSelectDrinks({ locked = false }: IsLockedProps) {
  const navigate = useNavigate()
  const [selectedDrink, setSelectedDrink] = useState('strawberry')
  const { visitedStores, fetchVisitedStores, selectStore } =
    useVisitedStoreStore()

  // 방문 매장 정보 가져오기
  useEffect(() => {
    console.log('[HomeSelectDrinks] 방문 매장 정보 가져오기 시작')
    fetchVisitedStores()
  }, [fetchVisitedStores])

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

  // 각 얼음의 구간별 정보 정의
  const iceInfo: IceInfo[] = useMemo(() => {
    return [
      {
        id: 'ice-1',
        minVisitCount: 1,
        maxVisitCount: 2,
        height: 1,
        left: 42,
        size: 46,
        rotate: 30,
        labelLeft: 42,
      },
      {
        id: 'ice-2',
        minVisitCount: 3,
        maxVisitCount: 5,
        height: 5,
        left: 54,
        size: 48,
        rotate: 80,
        labelLeft: 54,
      },
      {
        id: 'ice-3',
        minVisitCount: 6,
        maxVisitCount: 10,
        height: 10,
        left: 42,
        size: 52,
        rotate: 150,
        labelLeft: 42,
      },
      {
        id: 'ice-4',
        minVisitCount: 11,
        maxVisitCount: 15,
        height: 15,
        left: 54,
        size: 54,
        rotate: 250,
        labelLeft: 54,
      },
      {
        id: 'ice-5',
        minVisitCount: 16,
        maxVisitCount: 20,
        height: 20,
        left: 40,
        size: 58,
        rotate: 160,
        labelLeft: 40,
      },
      {
        id: 'ice-6',
        minVisitCount: 21,
        maxVisitCount: 25,
        height: 24,
        left: 56,
        size: 60,
        rotate: 110,
        labelLeft: 56,
      },
      {
        id: 'ice-7',
        minVisitCount: 26,
        maxVisitCount: 30,
        height: 27,
        left: 40,
        size: 48,
        rotate: 200,
        labelLeft: 40,
      },
    ]
  }, [])

  // 방문 횟수에 따른 얼음 위치 계산 함수
  const calculateIcePosition = (height: number) => {
    const maxLevel = 30 // 최대 방문 횟수
    const minPosition = 84 // 가장 아래 위치 (%)
    const maxPosition = 32 // 가장 위 위치 (%)
    const range = minPosition - maxPosition

    // 방문 횟수의 비율을 계산 (0~1 사이 값)
    const ratio = Math.min(height / maxLevel, 1)

    // 위치 계산: 비율이 높을수록 위로 올라감
    return minPosition - ratio * range
  }

  // 컴포넌트 마운트 시 strawberry 기본 선택 상태 설정
  useEffect(() => {
    setSelectedDrink('strawberry')
  }, [])

  const handleDrinkSelect = (drinkId: string) => {
    if (locked) return // 잠금 상태에서는 선택 불가
    setSelectedDrink(drinkId)
  }

  // 방문 매장 페이지로 이동
  const navigateToStore = (storeId: number) => {
    console.log(`[HomeSelectDrinks] 매장 ${storeId}로 이동 시작`)

    if (locked) {
      console.log('[HomeSelectDrinks] 잠금 상태: 이동 불가')
      return // 잠금 상태에서는 이동 불가
    }

    // 선택한 매장 정보를 스토어에 저장
    selectStore(storeId)

    // 매장 상세 페이지로 이동
    console.log(`[HomeSelectDrinks] 매장 ID: ${storeId}로 네비게이션 실행`)
    navigate(`/store/${storeId}`)
  }

  // 각 얼음 단계에 해당하는 매장 찾기
  const findStoreForIceLevel = (
    minCount: number,
    maxCount: number,
  ): VisitedStoreInfo | null => {
    if (!visitedStores || visitedStores.length === 0) return null
    return (
      visitedStores.find(
        (store) => store.visitCount >= minCount && store.visitCount <= maxCount,
      ) || null
    )
  }

  // 각 얼음 단계별로 매장과 얼음 렌더링
  const renderIcesWithStores = () => {
    return drinkOptions.map((drink) => (
      <React.Fragment key={`${drink.id}-ice-container`}>
        {iceInfo.map((ice) => {
          // 이 얼음 레벨에 해당하는 매장 찾기
          const store = findStoreForIceLevel(
            ice.minVisitCount,
            ice.maxVisitCount,
          )

          // 매장이 없으면 렌더링하지 않음
          if (!store) return null

          // 얼음 위치 계산
          const topPosition = calculateIcePosition(ice.height)

          return (
            <React.Fragment key={`${drink.id}-${ice.id}-fragment`}>
              <IceImage
                key={`${drink.id}-${ice.id}`}
                src={imgIce}
                alt={`얼음 레벨 ${ice.id}`}
                isVisible={true}
                left={ice.left}
                size={ice.size}
                rotate={ice.rotate}
                topPosition={topPosition}
                isActive={selectedDrink === drink.id}
                storeId={store.storeId}
                onClick={() => navigateToStore(store.storeId)}
              />
              <CafeLabel
                key={`${drink.id}-${ice.id}-label`}
                isVisible={true}
                left={ice.labelLeft}
                topPosition={topPosition}
                isActive={selectedDrink === drink.id}
                storeId={store.storeId}
                onClick={() => navigateToStore(store.storeId)}
              >
                <Text variant="caption2" weight="bold" color="dark">
                  {store.storeName}
                </Text>
              </CafeLabel>
            </React.Fragment>
          )
        })}
      </React.Fragment>
    ))
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
        {/* 모든 얼음 레벨과 매장 렌더링 */}
        {renderIcesWithStores()}

        {/* 음료 이미지 렌더링 */}
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

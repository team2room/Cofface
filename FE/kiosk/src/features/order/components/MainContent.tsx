import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useStepStore } from '@/stores/stepStore'
import { useRecommend } from '../hooks/useNewRecommend'
import { useCallback, useEffect, useRef, useState } from 'react'
import GestureDetector from '@/components/GestureDetector'
import { useMenuNavigation } from '../hooks/useSlideAnimation'
import { ProgressBar } from './Main/ProgressBar'
import { OptionList } from './Main/OptionList'
import { MenuInfo } from './Main/MenuInfo'
import { SlideButton } from './Main/SlideButtion'
import { useDirectOrderStore } from '@/stores/directOrderStore'
import { convertMenuToOrderItem } from '@/utils/convertMenuToOrder'
import { useRecommendationStore } from '@/stores/recommendStore'
import CustomDialog from '@/components/CustomDialog'
import { generateReason } from '@/utils/generateReason'

export default function MainContent() {
  const { step, setStep } = useStepStore()
  const { data, loading, error } = useRecommend(1)
  const { setDirectOrder } = useDirectOrderStore.getState()
  const { recommendedMenus, setRecommendedMenus, toggleOption } =
    useRecommendationStore()
  const [gestureEnabled, setGestureEnabled] = useState(false)
  const [optionChangeCount, setOptionChangeCount] = useState(0)
  const [activeOptionLayers, setActiveOptionLayers] = useState<
    Record<number, boolean>
  >({})
  const [isHotBackground, setIsHotBackground] = useState(false)
  const initialBackgroundCheckedRef = useRef(false)
  const currentMenuIdRef = useRef<number | null>(null)

  // 슬라이드 완료 콜백 메모이제이션
  const handleSlideComplete = useCallback(() => {
    if (currentMenuIdRef.current) {
      // 현재 메뉴의 옵션 레이어 상태 재설정 (비활성화)
      setActiveOptionLayers((prev) => ({
        ...prev,
        [currentMenuIdRef.current!]: false,
      }))
    }
  }, [])

  const {
    currentIndex,
    isAnimating,
    getAnimationType,
    handlePrev,
    handleNext,
    showModal,
    setShowModal,
  } = useMenuNavigation(recommendedMenus.length, handleSlideComplete)

  // 제스처 감지 활성화
  useEffect(() => {
    if (step === 'main') {
      setGestureEnabled(true)
    } else {
      setGestureEnabled(false)
    }
  }, [step])

  // 페이지 언마운트 시 제스처 감지 비활성화
  useEffect(() => {
    return () => {
      setGestureEnabled(false)
    }
  }, [])

  // 데이터가 로드되면 추천 메뉴 스토어에 설정
  useEffect(() => {
    if (data?.data?.recommendedMenus) {
      console.log('추천 메뉴', data.data.recommendedMenus)
      setRecommendedMenus(data.data.recommendedMenus)
    }
  }, [data, setRecommendedMenus])

  // 데이터가 로드되면 추천 메뉴 스토어에 설정
  useEffect(() => {
    if (data?.data?.recommendedMenus) {
      console.log('추천 메뉴', data.data.recommendedMenus)
      setRecommendedMenus(data.data.recommendedMenus)
    }
  }, [data, setRecommendedMenus])

  useEffect(() => {
    if (!recommendedMenus.length || initialBackgroundCheckedRef.current) return

    const currentMenuGroup = recommendedMenus[0] // 첫 번째 메뉴 그룹
    if (
      !currentMenuGroup ||
      !currentMenuGroup.menus ||
      !currentMenuGroup.menus[0]
    )
      return

    const firstMenu = currentMenuGroup.menus[0]
    const tempOption = firstMenu.options.find(
      (opt) => opt.optionCategory === 'HOT/ICED',
    )

    if (tempOption) {
      const hotIndex = tempOption.optionNames.findIndex(
        (name) => name === '뜨겁게',
      )
      if (hotIndex !== -1 && tempOption.isDefault[hotIndex]) {
        // 초기 온도 옵션이 '뜨겁게'인 경우 배경 변경
        setIsHotBackground(true)
      }
    }

    initialBackgroundCheckedRef.current = true
  }, [recommendedMenus])

  // 메뉴 변경시 해당 메뉴의 온도 옵션에 따라 배경 설정
  useEffect(() => {
    if (!recommendedMenus.length) return

    const currentMenuGroup = recommendedMenus[currentIndex]
    if (
      !currentMenuGroup ||
      !currentMenuGroup.menus ||
      !currentMenuGroup.menus[0]
    )
      return

    const currentMenu = currentMenuGroup.menus[0]
    const tempOption = currentMenu.options.find(
      (opt) => opt.optionCategory === 'HOT/ICED',
    )

    if (tempOption) {
      const hotIndex = tempOption.optionNames.findIndex(
        (name) => name === '뜨겁게',
      )
      const isColdIndex = tempOption.optionNames.findIndex(
        (name) => name === '차갑게',
      )

      if (hotIndex !== -1 && tempOption.isDefault[hotIndex]) {
        // 온도 옵션이 '뜨겁게'인 경우 배경 변경
        setIsHotBackground(true)
      } else if (isColdIndex !== -1 && tempOption.isDefault[isColdIndex]) {
        // 온도 옵션이 '차갑게'인 경우 배경 변경
        setIsHotBackground(false)
      }
    }
  }, [currentIndex, recommendedMenus])

  if (loading) return <> 로딩 중... </>
  if (error) return <> 에러 발생 </>
  if (!recommendedMenus.length) return <>추천 메뉴 없음</>

  const currentMenuGroup = recommendedMenus[currentIndex]
  const currentMenu = currentMenuGroup?.menus?.[0]

  // 현재 메뉴 ID 갱신
  if (currentMenu && currentMenuIdRef.current !== currentMenu.menuId) {
    currentMenuIdRef.current = currentMenu.menuId
  }

  // 현재 메뉴의 옵션 레이어 활성화 상태 확인
  const isOptionLayerActive = currentMenu
    ? activeOptionLayers[currentMenu.menuId] || false
    : false

  const handleOrder = () => {
    const orderItem = convertMenuToOrderItem(currentMenu)
    setDirectOrder(orderItem)
    setStep('place', 'main')
  }

  // 옵션 선택 핸들러
  const handleOptionSelect = (category: string, index: number) => {
    if (!currentMenu) return

    // 옵션 토글
    toggleOption(currentMenu.menuId, category, index)

    // 온도 옵션(HOT/ICED)인 경우 배경 변경
    if (category === 'HOT/ICED') {
      // currentMenu의 해당 카테고리 옵션 찾기
      const option = currentMenu.options.find(
        (opt) => opt.optionCategory === 'HOT/ICED',
      )
      if (option) {
        // 선택된 옵션 이름 가져오기
        const selectedOptionName = option.optionNames[index]
        // '뜨겁게' 옵션일 경우 HOT 배경으로 설정
        setIsHotBackground(selectedOptionName === '뜨겁게')
      }
    }

    // 현재 메뉴의 옵션 레이어 활성화
    if (!activeOptionLayers[currentMenu.menuId]) {
      console.log('옵션 레이어 활성화', currentMenu.menuId)
      setActiveOptionLayers((prev) => ({
        ...prev,
        [currentMenu.menuId]: true,
      }))
    }

    // 옵션 변경 카운트 증가하여 리렌더링 강제
    setOptionChangeCount((prev) => prev + 1)
  }

  return (
    <div>
      {/* 제스처 감지 컴포넌트 */}
      <GestureDetector
        enabled={gestureEnabled}
        onNodDetected={handleOrder}
        onShakeDetected={handleNext}
      />

      {/* 추천 메뉴 진행 바 */}
      <ProgressBar
        currentIndex={currentIndex}
        totalItems={recommendedMenus.length}
      />

      {/* 추천 텍스트 */}
      <div className="my-16 px-10 whitespace-pre-line">
        <Text variant="title1" weight="bold" fontFamily="Suite">
          {generateReason(currentMenuGroup)}
        </Text>
      </div>

      {/* 메뉴 및 옵션 선택 */}
      <div
        className={`${isHotBackground ? 'bg-mainBgHot' : 'bg-mainBgIce'} relative w-full aspect-square flex flex-col items-center justify-center pt-24`}
      >
        <div className="flex gap-20 items-center mb-10">
          {currentMenu && (
            <>
              {/* 메뉴 - 키를 추가하여 변경 시 강제 리렌더링 */}
              <MenuInfo
                menu={currentMenu}
                animationType={getAnimationType()}
                showOptionLayer={isOptionLayerActive}
                key={`menu-${currentMenu.menuId}-${optionChangeCount}`}
              />

              {/* 옵션 버튼들 - 현재 선택된 메뉴와 optionChangeCount 전달 */}
              <OptionList
                menuId={currentMenu.menuId}
                options={currentMenu.options}
                animationType={getAnimationType()}
                onOptionSelect={handleOptionSelect}
                key={`options-${currentMenu.menuId}-${optionChangeCount}`}
              />
            </>
          )}
        </div>

        {/* 왼쪽, 오른쪽 슬라이드 버튼 */}
        <SlideButton
          onClick={handlePrev}
          disabled={currentIndex === 0 || isAnimating}
          direction="left"
        >
          <FiChevronLeft size={80} />
        </SlideButton>
        <SlideButton
          onClick={handleNext}
          disabled={currentIndex === recommendedMenus.length - 1 || isAnimating}
          direction="right"
        >
          <FiChevronRight size={80} />
        </SlideButton>

        {/* 바로 주문하기 버튼 결제 */}
        <div className="w-11/12 h-64 my-16">
          <CustomButton
            text={'바로 주문하기'}
            variant={'main'}
            onClick={handleOrder}
          />
        </div>
      </div>

      <CustomDialog
        open={showModal}
        onOpenChange={setShowModal}
        title="📃모든 추천 확인 완료📃"
        description="COFFACE의 전체 메뉴를 확인시겠습니까?"
        cancelText="취소"
        confirmText="이동하기"
        onCancel={() => setShowModal(false)}
        onConfirm={() => setStep('menu')}
      />
    </div>
  )
}

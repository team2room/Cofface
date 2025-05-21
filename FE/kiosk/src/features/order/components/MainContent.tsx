import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useStepStore } from '@/stores/stepStore'
import { useRecommend } from '../hooks/useNewRecommend'
import { useEffect, useState } from 'react'
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

export default function MainContent() {
  const { step, setStep } = useStepStore()
  const { data, loading, error } = useRecommend(1)
  const { setRecommendedMenus } = useRecommendationStore()
  const { setDirectOrder } = useDirectOrderStore.getState()

  // 제스처 감지 활성화 상태
  const [gestureEnabled, setGestureEnabled] = useState(false)

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

  const recommendedMenus = data?.data?.recommendedMenus || []
  const {
    currentIndex,
    isAnimating,
    getAnimationType,
    handlePrev,
    handleNext,
    showModal,
    setShowModal,
  } = useMenuNavigation(recommendedMenus.length)

  if (loading) return <> 로딩 중... </>
  if (error) return <> 에러 발생 </>
  if (!recommendedMenus.length) return <>추천 메뉴 없음</>

  const currentMenuGroup = recommendedMenus[currentIndex]
  const currentMenu = currentMenuGroup?.menus?.[0]

  const handleOrder = () => {
    const orderItem = convertMenuToOrderItem(currentMenu)
    setDirectOrder(orderItem)
    setStep('place', 'main')
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
      <div className="my-16 px-10">
        <Text variant="title1" weight="bold" fontFamily="Suite">
          오늘 날씨가 너무 춥지 않나요?
          <br />
          따뜻한 카페라떼 추천해요
        </Text>
      </div>

      {/* 메뉴 및 옵션 선택 */}
      <div className="bg-mainBgIce relative w-full aspect-square flex flex-col items-center justify-center pt-24">
        <div className="flex gap-20 items-center mb-10">
          {currentMenu && (
            <>
              {/* 메뉴 */}
              <MenuInfo menu={currentMenu} animationType={getAnimationType()} />

              {/* 옵션 버튼들 */}
              <OptionList
                options={currentMenu.options}
                animationType={getAnimationType()}
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

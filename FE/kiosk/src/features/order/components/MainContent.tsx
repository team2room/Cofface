import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useStepStore } from '@/stores/stepStore'
import { useRecommend } from '../hooks/useNewRecommend'
import { useMenuNavigation } from '../hooks/useSlideAnimation'
import { ProgressBar } from './Main/ProgressBar'
import { OptionList } from './Main/OptionList'
import { MenuInfo } from './Main/MenuInfo'
import { SlideButton } from './Main/SlideButtion'

export default function MainContent() {
  const { setStep } = useStepStore()
  const { data, loading, error } = useRecommend(1)

  const recommendedMenus = data?.data?.recommendedMenus || []
  const {
    currentIndex,
    isAnimating,
    getAnimationType,
    handlePrev,
    handleNext,
  } = useMenuNavigation(recommendedMenus.length)

  if (loading) return <> 로딩 중... </>
  if (error) return <> 에러 발생 </>
  if (!recommendedMenus.length) return <>추천 메뉴 없음</>

  const currentMenuGroup = recommendedMenus[currentIndex]
  const currentMenu = currentMenuGroup?.menus?.[0]

  return (
    <div>
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
            onClick={() => {
              setStep('place', 'main')
            }}
          />
        </div>
      </div>
    </div>
  )
}

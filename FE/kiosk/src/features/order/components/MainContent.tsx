import tw from 'twin.macro'
import { Text } from '@/styles/typography'
import CustomButton from '@/components/CustomButton'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useStepStore } from '@/stores/stepStore'
import { useRecommend } from '../hooks/useNewRecommend'
import { useState } from 'react'

const OptionBtn = tw.div`bg-white rounded-full shadow-md w-[175px] h-[175px] flex flex-col items-center justify-center`

// 원형 배경과 이미지 클리핑을 위한 설정값
const circleRadius = 225 // 원형 배경 반지름 (w-56 = 224px의 절반)
const circleCenterX = 250 // 이미지 중앙 X 좌표 (w-[500px]의 절반)
const bottomCutoffY = 400 // 이미지에서 하단 자르기 시작점

// 이미지 아랫부분을 정확한 원형으로 자르는 SVG 패스 생성
const createCircleBottomPath = () => {
  // 원형 배경과 동일한 곡률의 하단 자르기 패스 생성
  return `
    M0,0 
    L500,0 
    L500,${bottomCutoffY} 
    A${circleRadius},${circleRadius} 0 1,1 0,${bottomCutoffY} 
    Z
  `
    .replace(/\s+/g, ' ')
    .trim()
}

// 옵션 버튼 컴포넌트
function OptionButton({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <OptionBtn>
      {typeof icon === 'string' ? (
        <img src={icon} alt={label} className="w-[80px]" />
      ) : (
        icon
      )}
      <Text variant="body2" weight="semibold">
        {label}
      </Text>
    </OptionBtn>
  )
}

const iconMap: Record<string, Record<string, string>> = {
  '따뜻하게/차갑게': {
    차갑게: '/icons/icon-cold-on.png',
    뜨겁게: '/icons/icon-hot-on.png',
  },
  사이즈: {
    작은: '/icons/icon-small-on.png',
    중간: '/icons/icon-medium-on.png',
    큰: '/icons/icon-large-on.png',
  },
  얼음: {
    없음: '/icons/icon-nope-off.png',
    적게: '/icons/icon-ice1-on.png',
    보통: '/icons/icon-ice2-on.png',
    많이: '/icons/icon-ice3-on.png',
  },
  '샷 추가': {
    없음: '/icons/icon-nope-off.png',
    '1샷': '/icons/icon-shot1-on.png',
    '2샷': '/icons/icon-shot2-on.png',
    '3샷': '/icons/icon-shot3-on.png',
  },
}

const labelMap: Record<string, string> = {
  '따뜻하게/차갑게': '온도',
  사이즈: '사이즈',
  얼음: '얼음 양',
  '샷 추가': '샷 추가',
}

export default function MainContent() {
  const { setStep } = useStepStore()
  const { data, loading, error } = useRecommend(1)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (loading) return <> 로딩 중... </>
  if (error) return <> 에러 발생 </>
  if (!data?.data?.recommendedMenus?.length) return <>추천 메뉴 없음</>

  const recommendedMenus = data.data.recommendedMenus
  const currentMenuGroup = recommendedMenus[currentIndex]
  const currentMenu = currentMenuGroup?.menus?.[0]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentIndex((prev) =>
      data?.data.recommendedMenus &&
      prev < data.data.recommendedMenus.length - 1
        ? prev + 1
        : prev,
    )
  }

  return (
    <div>
      {/* 추천 메뉴 진행 바 */}

      {/* 추천 텍스트 */}
      <div className="my-16 px-7">
        <Text variant="title1" weight="bold">
          오늘 날씨가 너무 춥지 않나요?
          <br />
          따뜻한 카페라떼 추천해요
        </Text>
      </div>

      {/* 메뉴 및 옵션 선택 */}
      <div className="bg-mainBgIce relative w-full aspect-square flex flex-col items-center justify-center pt-40">
        <div className="flex gap-40 items-center mb-20">
          {currentMenu && (
            <>
              {/* 메뉴 */}
              <div className="flex flex-col gap-16">
                <div className="relative w-[518px] h-[700px] flex justify-center items-end">
                  {/* SVG 정의 - 원형 클리핑 패스 */}
                  <svg className="absolute" width="0" height="0">
                    <defs>
                      <clipPath id="circleBottomPath">
                        <path d={createCircleBottomPath()} />
                      </clipPath>
                    </defs>
                  </svg>

                  {/* 원형 흰색 배경 */}
                  <div className="absolute w-[450px] h-[450px] bg-white rounded-full z-10" />

                  {/* 아랫부분이 원형으로 잘린 음료 이미지 */}
                  <div className="absolute z-20">
                    <img
                      src={currentMenu.imageUrl}
                      alt={currentMenu.menuName}
                      className="w-[500px] h-[700px] object-contain"
                      style={{
                        clipPath: 'url(#circleBottomPath)',
                        transform: 'translateY(-10px)',
                      }}
                    />
                  </div>
                </div>
                {/* 이름 */}
                <div className="flex flex-col text-center mb-3">
                  <Text variant="title2" weight="medium">
                    {currentMenu.menuName}
                  </Text>
                  <Text variant="title2" weight="extrabold">
                    {currentMenu.price.toLocaleString()}원
                  </Text>
                </div>
              </div>

              {/* 옵션 버튼들 */}
              <div className="space-y-10">
                {/* <OptionButton icon={'/icons/icon-cold-on.png'} label="온도" />
                <OptionButton
                  icon={'/icons/icon-medium-on.png'}
                  label="사이즈"
                />
                <OptionButton
                  icon={'/icons/icon-ice2-on.png'}
                  label="얼음 양"
                />
                <OptionButton
                  icon={'/icons/icon-nope-off.png'}
                  label="샷 추가"
                /> */}
                {currentMenu.options.map((option) => {
                  const { optionCategory, optionNames, isDefault } = option
                  const defaultIndex = isDefault.findIndex((v) => v === true)
                  const defaultOptionName = optionNames[defaultIndex]

                  // 아이콘 매핑
                  const icon =
                    iconMap[optionCategory]?.[defaultOptionName] ??
                    '/icons/default.png'
                  const label = labelMap[optionCategory] ?? optionCategory

                  return <OptionButton key={label} icon={icon} label={label} />
                })}
              </div>
            </>
          )}
        </div>

        {/* 왼쪽, 오른쪽 슬라이드 버튼 */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-pink-500"
        >
          <FiChevronLeft size={64} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-500"
        >
          <FiChevronRight size={64} />
        </button>

        {/* 바로 주문하기 버튼 결제 */}
        <div className="w-11/12 my-12">
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

import { Text } from '@/styles/typography'
import { AnimationType } from '../../hooks/useSlideAnimation'
import { AnimatedContainer } from './AnimatedContainer'
import { OptionLayer } from './OptionLayerComponent'

// 원형 배경과 이미지 클리핑을 위한 설정값
const circleRadius = 350 // 원형 배경 반지름 (w-56 = 224px의 절반)
const bottomCutoffY = 240 // 이미지에서 하단 자르기 시작점

// 이미지 아랫부분을 정확한 원형으로 자르는 SVG 패스 생성
const createCircleBottomPath = () => {
  // 원형 배경과 동일한 곡률의 하단 자르기 패스 생성
  return `
    M0,0 
    L600,0 
    L600,${bottomCutoffY} 
    A${circleRadius},${circleRadius} 0 1,1 0,${bottomCutoffY} 
    Z
  `
    .replace(/\s+/g, ' ')
    .trim()
}

interface MenuImageProps {
  imageUrl: string
  menuName: string
  menuId: number
  options: any[]
  showOptionLayer: boolean
}

export function MenuImage({
  imageUrl,
  menuName,
  menuId,
  options,
  showOptionLayer,
}: MenuImageProps) {
  // 옵션 변경을 추적하기 위한 키
  const optionKey = JSON.stringify(options)

  return (
    <div className="relative w-[600px] h-[800px] flex justify-center items-end">
      {/* SVG 정의 - 원형 클리핑 패스 (음료 이미지용) */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <clipPath id="circleBottomPath">
            <path d={createCircleBottomPath()} />
          </clipPath>
        </defs>
      </svg>

      {/* 원형 흰색 배경 */}
      <div className="absolute w-[600px] h-[600px] bg-white rounded-full z-10 bottom-10" />

      {/* 아랫부분이 원형으로 잘린 음료 이미지 */}
      <div className="absolute z-20 bottom-14">
        <img
          src={imageUrl}
          alt={menuName}
          className="w-[600px] h-[800px] object-contain"
          style={{
            clipPath: 'url(#circleBottomPath)',
            transform: 'translateY(40px)',
          }}
        />
      </div>

      {/* 옵션 레이어 - 이미지 위에 표시, 클립 패스 없이 */}
      {showOptionLayer && (
        <div className="absolute z-30 bottom-14" key={optionKey}>
          <OptionLayer menuId={menuId} options={options} />
        </div>
      )}
    </div>
  )
}

interface MenuInfoProps {
  menu: {
    menuId: number
    menuName: string
    price: number
    imageUrl: string
    options: any[]
  }
  animationType: AnimationType
  showOptionLayer: boolean
}

export function MenuInfo({
  menu,
  animationType,
  showOptionLayer,
}: MenuInfoProps) {
  return (
    <AnimatedContainer animationType={animationType}>
      <MenuImage
        imageUrl={menu.imageUrl}
        menuName={menu.menuName}
        menuId={menu.menuId}
        options={menu.options}
        showOptionLayer={showOptionLayer}
      />
      {/* 이름 */}
      <div className="flex flex-col text-center">
        <Text variant="title1" weight="medium" fontFamily="Suite">
          {menu.menuName}
        </Text>
        <Text variant="title2" weight="extrabold" fontFamily="Suite">
          {menu.price.toLocaleString()}원
        </Text>
      </div>
    </AnimatedContainer>
  )
}

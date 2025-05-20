import { Text } from '@/styles/typography'
import { AnimationType } from '../../hooks/useSlideAnimation'
import { AnimatedContainer } from './AnimatedContainer'

// 원형 배경과 이미지 클리핑을 위한 설정값
const circleRadius = 350 // 원형 배경 반지름 (w-56 = 224px의 절반)
const bottomCutoffY = 200 // 이미지에서 하단 자르기 시작점

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

interface MenuImageProps {
  imageUrl: string
  menuName: string
}

export function MenuImage({ imageUrl, menuName }: MenuImageProps) {
  return (
    <div className="relative w-[600px] h-[800px] flex justify-center items-end">
      {/* SVG 정의 - 원형 클리핑 패스 */}
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
      <div className="absolute z-20 bottom-0">
        <img
          src={imageUrl}
          alt={menuName}
          className="w-[600px] h-[800px] object-contain"
          style={{
            clipPath: 'url(#circleBottomPath)',
            transform: 'translateY(20px)',
          }}
        />
      </div>
    </div>
  )
}

interface MenuInfoProps {
  menu: {
    menuName: string
    price: number
    imageUrl: string
  }
  animationType: AnimationType
}

export function MenuInfo({ menu, animationType }: MenuInfoProps) {
  return (
    <AnimatedContainer animationType={animationType}>
      <MenuImage imageUrl={menu.imageUrl} menuName={menu.menuName} />
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

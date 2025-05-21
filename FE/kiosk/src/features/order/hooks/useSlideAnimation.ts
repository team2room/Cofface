import { keyframes } from '@emotion/react'
import { useState } from 'react'

// 애니메이션 키프레임 정의
export const slideOutLeft = keyframes`
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-30px);
    opacity: 0;
  }
`

export const slideOutRight = keyframes`
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(30px);
    opacity: 0;
  }
`

export const slideInLeft = keyframes`
  0% {
    transform: translateX(30px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`

export const slideInRight = keyframes`
  0% {
    transform: translateX(-30px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`

// 애니메이션 타입
export type AnimationType =
  | 'slideOutLeft'
  | 'slideOutRight'
  | 'slideInLeft'
  | 'slideInRight'
  | null

export function useSlideAnimation() {
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
    null,
  )
  const [isAnimating, setIsAnimating] = useState(false)

  const startAnimation = (
    direction: 'left' | 'right',
    callback: () => void,
  ) => {
    if (!isAnimating) {
      setIsAnimating(true)
      setSlideDirection(direction)

      // 애니메이션이 완료될 때까지 기다린 후 콜백 실행
      setTimeout(() => {
        callback()

        // 다음 애니메이션을 위해 상태 초기화
        setTimeout(() => {
          setIsAnimating(false)
          setSlideDirection(null)
        }, 50)
      }, 300)
    }
  }

  // 슬라이드 애니메이션 타입 결정
  const getAnimationType = (): AnimationType => {
    if (isAnimating) {
      return slideDirection === 'left' ? 'slideOutLeft' : 'slideOutRight'
    } else if (slideDirection) {
      return slideDirection === 'left' ? 'slideInRight' : 'slideInLeft'
    }
    return null
  }

  return {
    isAnimating,
    getAnimationType,
    startAnimation,
  }
}

export function useMenuNavigation(totalMenus: number) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isAnimating, getAnimationType, startAnimation } = useSlideAnimation()

  const handlePrev = () => {
    if (currentIndex > 0) {
      startAnimation('right', () => {
        setCurrentIndex((prevIndex) => prevIndex - 1)
      })
    }
  }

  const handleNext = () => {
    if (currentIndex < totalMenus - 1) {
      startAnimation('left', () => {
        setCurrentIndex((prevIndex) => prevIndex + 1)
      })
    }
  }

  return {
    currentIndex,
    isAnimating,
    getAnimationType,
    handlePrev,
    handleNext,
  }
}

import { keyframes } from '@emotion/react'
import { useCallback, useEffect, useState } from 'react'

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

export function useMenuNavigation(
  totalMenus: number,
  onSlideComplete?: () => void,
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isAnimating, getAnimationType, startAnimation } = useSlideAnimation()

  // 이전 인덱스 저장
  const [prevIndex, setPrevIndex] = useState(0)

  // 슬라이드 변경 감지
  useEffect(() => {
    if (prevIndex !== currentIndex && !isAnimating) {
      setPrevIndex(currentIndex)
      // 슬라이드가 완료되면 콜백 실행
      if (onSlideComplete) {
        onSlideComplete()
      }
    }
  }, [currentIndex, isAnimating, prevIndex, onSlideComplete])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !isAnimating) {
      startAnimation('right', () => {
        setCurrentIndex((prevIndex) => prevIndex - 1)
      })
    }
  }, [currentIndex, isAnimating, startAnimation])

  const handleNext = useCallback(() => {
    if (currentIndex < totalMenus - 1 && !isAnimating) {
      startAnimation('left', () => {
        setCurrentIndex((prevIndex) => prevIndex + 1)
      })
    }
  }, [currentIndex, totalMenus, isAnimating, startAnimation])

  return {
    currentIndex,
    isAnimating,
    getAnimationType,
    handlePrev,
    handleNext,
  }
}

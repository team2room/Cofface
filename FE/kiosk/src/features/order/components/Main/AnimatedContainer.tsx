import styled from '@emotion/styled'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import {
  AnimationType,
  slideInLeft,
  slideInRight,
  slideOutLeft,
  slideOutRight,
} from '../../hooks/useSlideAnimation'

// 애니메이션 컨테이너 Props 타입 정의
interface AnimatedContainerProps {
  animationType: AnimationType
  className?: string
  children: React.ReactNode
}

// 애니메이션이 적용된 컨테이너 스타일
export const AnimatedContainer = styled.div<
  Omit<AnimatedContainerProps, 'children'>
>`
  ${tw`flex flex-col gap-10`}

  ${({ animationType }) => {
    switch (animationType) {
      case 'slideOutLeft':
        return css`
          animation: ${slideOutLeft} 0.3s forwards;
        `
      case 'slideOutRight':
        return css`
          animation: ${slideOutRight} 0.3s forwards;
        `
      case 'slideInLeft':
        return css`
          animation: ${slideInLeft} 0.3s forwards;
        `
      case 'slideInRight':
        return css`
          animation: ${slideInRight} 0.3s forwards;
        `
      default:
        return ''
    }
  }}
`

import React from 'react'
import styled from '@emotion/styled'
import tw from 'twin.macro'

// 슬라이드 버튼 Props 타입 정의
interface SlideButtonProps {
  direction: 'left' | 'right'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

// 스타일이 적용된 버튼 컴포넌트
export const SlideButton = styled.button<Omit<SlideButtonProps, 'children'>>`
  ${tw`absolute top-1/2 -translate-y-1/2 transition-colors duration-300`}
  ${({ direction }) => (direction === 'left' ? tw`left-2` : tw`right-2`)}
  ${({ disabled }) => (disabled ? tw`text-gray` : tw`text-pink-500`)}
`

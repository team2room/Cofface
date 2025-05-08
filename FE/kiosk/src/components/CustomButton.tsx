import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
  variant: 'main' | 'disabled' | 'cancle'
  className?: string
  onClick?: () => void
}

const StyledButton = styled.button<{
  variant: 'main' | 'disabled' | 'cancle'
}>`
  ${tw`
    w-full
    py-5
    rounded-md 
    mb-1
    flex
    items-center
    justify-center
    text-white
  `}

  ${({ variant }) => {
    switch (variant) {
      case 'cancle':
        return tw`text-littleDark bg-cancle`
      case 'disabled':
        return tw`text-white bg-disabled`
      case 'main':
      default:
        return tw`text-white bg-hover`
    }
  }}
`

export default function CustomButton({
  text,
  variant,
  onClick,
  className,
  ...props
}: ButtonProps) {
  const handleClick = () => {
    if (variant !== 'disabled' && onClick) {
      onClick() // disabled일 경우 onClick 호출 안 함
    }
  }

  return (
    <StyledButton
      onClick={handleClick}
      className={className}
      variant={variant}
      {...props}
    >
      <Text variant="body1" weight="semibold">
        {text}
      </Text>
    </StyledButton>
  )
}

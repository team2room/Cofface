//NOTE - 메인 버튼
import tw from 'twin.macro'
import styled from '@emotion/styled'

interface ButtonProps {
  text: string
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const StyledButton = styled.button<{ disabled: boolean }>`
  ${tw`
    w-full 
    py-3
    rounded-md 
    flex
    items-center
    justify-center
    text-white
    gap-2
  `}
  ${({ disabled }) => {
    if (disabled) {
      return tw`text-white bg-littleLight`
    } else {
      return tw`text-white bg-main`
    }
  }}
`

export default function MainButton({
  text,
  disabled = false,
  onClick,
  className,
}: ButtonProps) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <StyledButton
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {text}
    </StyledButton>
  )
}

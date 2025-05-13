//NOTE - 메인 버튼
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'

interface ButtonProps {
  text: string
  disabled?: boolean
  sub?: boolean
  onClick?: () => void
  className?: string
}

const StyledButton = styled.button<{ disabled: boolean; sub: boolean }>`
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
  ${({ disabled, sub }) => {
    if (disabled) {
      return tw`text-white bg-littleLight`
    } else if (sub) {
      return tw`text-littleDark bg-littleLight`
    } else {
      return tw`text-white bg-main`
    }
  }}
`

export default function MainButton({
  text,
  disabled = false,
  sub = false,
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
      sub={sub}
      className={className}
    >
      <Text variant="body2" weight="bold">
        {text}
      </Text>
    </StyledButton>
  )
}

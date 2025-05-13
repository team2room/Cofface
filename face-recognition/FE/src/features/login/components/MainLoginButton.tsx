//NOTE - 메인화면 로그인 버튼
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Phone } from 'iconoir-react'
import { Text } from '@/styles/typography'

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

const IconWrapper = styled.span`
  ${tw`flex items-center justify-center`}
`

export default function MainLoginButton({
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
      <IconWrapper>
        <Phone width={18} height={18} strokeWidth={2} />
      </IconWrapper>
      <Text variant="body2" weight="medium">
        {text}
      </Text>
    </StyledButton>
  )
}

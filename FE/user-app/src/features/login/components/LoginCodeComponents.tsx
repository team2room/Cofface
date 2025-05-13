import { LoginInputProps } from '@/interfaces/LoginInterfaces'
import { InputContainer } from './LoginComponents'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import styled from '@emotion/styled'

const InputWrapper = tw.div`
  w-full border border-gray rounded-md p-2 flex justify-between
`
const TimerContainer = tw.div`
  flex items-center gap-3
`
const ResendButton = tw.button`
  border border-gray rounded-md px-2 py-1 shrink-0 flex
`
const StyledInput = styled.input`
  ${tw`border-none outline-none`}
  &:focus {
    outline: none;
  }
`

// 인증번호 입력 컴포넌트
export function CodeInputField({
  value,
  onChange,
  onComplete,
  inputRef,
  timeLeft,
  onResend,
}: LoginInputProps & { timeLeft: number; onResend: () => void }) {
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '')

    // 최대 6자리로 제한
    if (inputValue.length <= 6) {
      onChange(inputValue)
    }

    // 코드 6자리 입력 완료시 버튼 생성
    if (inputValue.length === 6 && onComplete) {
      setTimeout(() => onComplete(), 300) // 약간의 딜레이 추가
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length === 6 && onComplete) {
      onComplete()
    }
  }

  // 타이머 표시 형식
  const minutes = Math.floor(timeLeft / 60)
  const remainingSeconds = timeLeft % 60

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        인증번호
      </Text>
      <InputWrapper>
        <StyledInput
          ref={inputRef}
          placeholder="6자리 입력"
          value={value}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          inputMode="numeric" // 모바일에서 숫자 키패드 활성화
          pattern="[0-9]*" // iOS에서 숫자 키패드 활성화
          maxLength={6}
          autoFocus
        />
        <TimerContainer>
          <Text variant="caption1" color="main">
            {String(minutes).padStart(2, '0')}:
            {String(remainingSeconds).padStart(2, '0')}
          </Text>
          <ResendButton onClick={onResend}>
            <Text variant="caption2" color="darkGray">
              다시 받기
            </Text>
          </ResendButton>
        </TimerContainer>
      </InputWrapper>
    </InputContainer>
  )
}

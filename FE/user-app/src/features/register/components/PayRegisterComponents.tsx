import { Input } from '@/components/ui/input'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'
import { useEffect, useState } from 'react'

// 스타일 컴포넌트
export const PaymentForm = styled.div`
  ${tw`w-full max-w-md flex flex-col space-y-3 mt-4`}
`

export const InputContainer = styled.div`
  ${tw`flex flex-col w-full`}
`

export const InputLabel = styled.label`
  ${tw`text-sm text-littleDarkGray`}
`

export const StyledInput = styled(Input)`
  ${tw`w-full border-gray h-10`}
`

export const Dash = styled.span`
  ${tw`text-lg`}
`

export const InputGroup = styled.div`
  ${tw`flex items-center gap-2`}
`

// 인터페이스 정의
export interface PayInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: () => void
  inputRef?: React.RefObject<HTMLInputElement>
}

// 카드번호 입력 컴포넌트 (완전히 새로운 접근법)
export function CardNumberInputField({
  value,
  onChange,
  onComplete,
  inputRef,
}: PayInputProps) {
  // 실제 입력값 상태 관리
  const [displayValue, setDisplayValue] = useState('')

  // 컴포넌트가 마운트되거나 value가 변경될 때마다 표시값 업데이트
  useEffect(() => {
    formatDisplayValue()
  }, [value])

  // 표시값 포맷 함수
  const formatDisplayValue = () => {
    let formatted = ''

    // 값이 있을 경우에만 처리
    if (value) {
      // 첫 8자리는 숫자 그대로, 나머지는 *로 마스킹
      for (let i = 0; i < value.length; i++) {
        // 4자리마다 하이픈 추가
        if (i > 0 && i % 4 === 0) {
          formatted += ' - '
        }

        // 8자리 이후는 마스킹
        if (i < 8) {
          formatted += value[i]
        } else {
          formatted += '*'
        }
      }
    }

    setDisplayValue(formatted)
  }

  // 키 입력 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 숫자 키만 허용 (0-9)
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight'
    ) {
      e.preventDefault()
      return
    }

    // 엔터 키 처리
    if (e.key === 'Enter' && value.length === 16 && onComplete) {
      onComplete()
    }
  }

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력된 값에서 숫자만 추출
    let newValue = e.target.value.replace(/[^0-9]/g, '')

    // 16자리로 제한
    if (newValue.length > 16) {
      newValue = newValue.substring(0, 16)
    }

    // 상태 업데이트
    onChange(newValue)

    // 16자리 입력 완료 시 다음 단계로
    if (newValue.length === 16 && onComplete) {
      onComplete()
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        카드번호
      </Text>
      <div className="relative">
        {/* 숨겨진 실제 입력 필드 (value로 실제 숫자값 관리) */}
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="absolute inset-0 opacity-0 z-10"
          autoComplete="off"
        />
        {/* 표시용 입력 필드 (마스킹된 값 표시) */}
        <StyledInput
          type="text"
          placeholder="카드번호 직접입력"
          value={displayValue}
          readOnly
          className="pointer-events-none"
        />
      </div>
    </InputContainer>
  )
}

// 유효기간 입력 컴포넌트
export function ExpiryDateInputField({
  value,
  onChange,
  onComplete,
  inputRef,
}: PayInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '')

    // 최대 4자리로 제한
    if (inputValue.length > 4) {
      inputValue = inputValue.substring(0, 4)
    }

    onChange(inputValue)

    // 4자리가 모두 입력되면 자동으로 다음 단계로 이동
    if (inputValue.length === 4 && onComplete) {
      onComplete()
    }
  }

  // 유효기간 포맷 (MM / YY)
  const formatExpiryDate = (date: string) => {
    if (!date) return ''

    if (date.length <= 2) {
      return date
    } else {
      return `${date.substring(0, 2)} / ${date.substring(2)}`
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        유효기간
      </Text>
      <StyledInput
        ref={inputRef}
        placeholder="MM / YY"
        value={formatExpiryDate(value)}
        onChange={handleChange}
        inputMode="numeric"
        pattern="[0-9]*"
      />
    </InputContainer>
  )
}

// 보안코드 입력 컴포넌트
export function SecurityCodeInputField({
  value,
  onChange,
  onComplete,
  inputRef,
}: PayInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '')

    // 최대 3자리로 제한
    if (inputValue.length > 3) {
      inputValue = inputValue.substring(0, 3)
    }

    onChange(inputValue)

    // 3자리가 모두 입력되면 자동으로 다음 단계로 이동
    if (inputValue.length === 3 && onComplete) {
      onComplete()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length === 3 && onComplete) {
      onComplete()
    }
  }

  // 보안코드 마스킹 처리
  const maskSecurityCode = () => {
    return '***'.substring(0, value.length)
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        보안코드 (CVC/CVV)
      </Text>
      <StyledInput
        ref={inputRef}
        placeholder="카드 뒷면 3자리"
        value={maskSecurityCode()}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        inputMode="numeric"
        pattern="[0-9]*"
      />
    </InputContainer>
  )
}

// 비밀번호 입력 컴포넌트
export function PasswordInputField({
  value,
  onChange,
  onComplete,
  inputRef,
}: PayInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '')

    // 최대 2자리로 제한
    if (inputValue.length > 2) {
      inputValue = inputValue.substring(0, 2)
    }

    onChange(inputValue)

    // 2자리가 모두 입력되면 자동으로 다음 단계로 이동
    if (inputValue.length === 2 && onComplete) {
      onComplete()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length === 2 && onComplete) {
      onComplete()
    }
  }

  // 비밀번호 마스킹 처리
  const maskPassword = () => {
    return '**'.substring(0, value.length)
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        비밀번호 앞 2자리
      </Text>
      <StyledInput
        ref={inputRef}
        placeholder="비밀번호 앞 2자리"
        value={maskPassword()}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        inputMode="numeric"
        pattern="[0-9]*"
        type="password"
      />
    </InputContainer>
  )
}

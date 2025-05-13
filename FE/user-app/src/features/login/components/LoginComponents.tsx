import React, { useRef } from 'react'
import { Input } from '@/components/ui/input'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'
import { LoginInputProps } from '@/interfaces/LoginInterfaces'

// 스타일 컴포넌트
export const LoginForm = styled.div`
  ${tw`w-full max-w-md flex flex-col space-y-3 mt-20`}
`

export const Title = styled.h1`
  ${tw`text-xl font-semibold mb-3`}
  white-space: pre-line;
`

export const InputContainer = styled.div`
  ${tw`flex flex-col w-full`}
`

export const InputLabel = styled.label`
  ${tw`text-sm text-littleDarkGray`}
`

export const StyledInput = styled(Input)`
  ${tw`w-full border-gray h-10 tracking-wide`}
`

export const PhoneInputGroup = styled.div`
  ${tw`flex items-center gap-2`}
`

export const Dash = styled.span`
  ${tw`text-lg`}
`

export const Dot = styled.span`
  ${tw`inline-block w-2 h-2 bg-black rounded-full mx-0.5`}
`

export const DotsContainer = styled.div`
  ${tw`flex items-center gap-2`}
`

export function NameInputField({
  value,
  onChange,
  onComplete,
  inputRef,
}: LoginInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && onComplete) {
      onComplete()
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        이름
      </Text>
      <StyledInput
        ref={inputRef}
        placeholder="이름"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </InputContainer>
  )
}

export function BirthInputField({
  value,
  onChange,
  onComplete,
  inputRef,
}: LoginInputProps) {
  const internalBirthInputRef = useRef<HTMLInputElement>(null)
  const genderInputRef = useRef<HTMLInputElement>(null)

  // 입력값이 변경될 때 호출되는 함수
  const handleBirthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '')

    // 최대 6자리로 제한
    if (inputValue.length > 6) {
      inputValue = inputValue.substring(0, 6)
    }

    // 현재 값 업데이트
    const newValue = inputValue + (value.length > 6 ? value.substring(6) : '')
    onChange(newValue)

    // 6자리가 모두 입력되면 자동으로 다음 입력 필드로 포커스
    if (inputValue.length === 6 && genderInputRef.current) {
      genderInputRef.current.focus()
    }
  }

  // 성별 입력 필드 변경 처리
  const handleGenderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '')

    // 최대 1자리로 제한
    if (inputValue.length > 1) {
      inputValue = inputValue.substring(0, 1)
    }

    // 현재 생년월일 값(6자리)에 성별 자리(1자리)를 추가
    const birthPart = value.substring(0, 6)
    const newValue = birthPart + inputValue
    onChange(newValue)

    // 성별 자리까지 입력 완료시 자동으로 다음 단계
    if (inputValue.length === 1 && birthPart.length === 6 && onComplete) {
      onComplete()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.length >= 7 && onComplete) {
        onComplete()
      } else if (value.length === 6 && genderInputRef.current) {
        genderInputRef.current.focus()
      }
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        주민등록번호
      </Text>
      <div className="flex items-center gap-2">
        <StyledInput
          ref={(el) => {
            // 외부에서 전달된 ref와 내부 ref 모두에 할당
            if (inputRef) {
              // @ts-ignore - React의 ref 할당 방식
              inputRef.current = el
            }
            // @ts-ignore - React의 ref 할당 방식
            internalBirthInputRef.current = el
          }}
          value={value.substring(0, 6)}
          onChange={handleBirthInputChange}
          onKeyDown={handleKeyDown}
          maxLength={6}
          inputMode="numeric" // 모바일에서 숫자 키패드 활성화
          pattern="[0-9]*" // iOS에서 숫자 키패드 활성화
        />
        <Dash>-</Dash>
        <div className="flex gap-2">
          <StyledInput
            ref={genderInputRef}
            placeholder=""
            value={value.length > 6 ? value.substring(6, 7) : ''}
            onChange={handleGenderInputChange}
            onKeyDown={handleKeyDown}
            maxLength={1}
            inputMode="numeric" // 모바일에서 숫자 키패드 활성화
            pattern="[0-9]*" // iOS에서 숫자 키패드 활성화
          />
          <DotsContainer className="ml-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Dot key={i} />
            ))}
          </DotsContainer>
        </div>
      </div>
    </InputContainer>
  )
}

export function PhoneInputField({
  value,
  onChange,
  onComplete,
  inputRef,
}: LoginInputProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, '')
    onChange(inputValue)

    // 휴대폰 번호 11자리 입력 완료시 자동으로 다음 단계
    if (inputValue.length >= 11 && onComplete) {
      onComplete()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length >= 11 && onComplete) {
      onComplete()
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        휴대폰 번호
      </Text>
      <StyledInput
        ref={inputRef}
        placeholder="-없이 숫자만 입력"
        value={value}
        onChange={handlePhoneChange}
        onKeyDown={handleKeyDown}
        inputMode="numeric" // 모바일에서 숫자 키패드 활성화
        pattern="[0-9]*" // iOS에서 숫자 키패드 활성화
      />
    </InputContainer>
  )
}

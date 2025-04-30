import React from 'react'
import { Input } from '@/components/ui/input'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'

// 스타일 컴포넌트
export const Container = styled.div`
  ${tw`flex flex-col items-center justify-center min-h-screen p-4 bg-white`}
`

export const LoginForm = styled.div`
  ${tw`w-full max-w-md flex flex-col space-y-10 mt-20`}
`

export const Title = styled.h1`
  ${tw`text-xl font-semibold mb-3`}
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

export const PhoneInputGroup = styled.div`
  ${tw`flex items-center gap-2`}
`

export const Dash = styled.span`
  ${tw`text-lg`}
`

export const Dot = styled.span`
  ${tw`inline-block w-1 h-1 bg-black rounded-full mx-0.5`}
`

export const DotsContainer = styled.div`
  ${tw`flex items-center`}
`

// 완료된 필드 컴포넌트
interface CompletedFieldProps {
  label: string
  value: string
  isPassword?: boolean
}

export function CompletedField({
  label,
  value,
  isPassword,
}: CompletedFieldProps) {
  const renderDots = () => {
    return (
      <DotsContainer>
        {Array.from({ length: 6 }).map((_, i) => (
          <Dot key={i} />
        ))}
      </DotsContainer>
    )
  }

  return (
    <div className="flex flex-col">
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        {label}
      </Text>
      <div className="flex items-center w-full border border-gray rounded-md py-2 px-2 mt-1">
        <Text>{value}</Text>
        {isPassword && (
          <>
            <Dash>-</Dash>
            {renderDots()}
          </>
        )}
      </div>
    </div>
  )
}

// 이름 입력 컴포넌트
interface NameInputProps {
  value: string
  onChange: (value: string) => void
}

export function NameInputField({ value, onChange }: NameInputProps) {
  return (
    <InputContainer>
      <InputLabel>이름</InputLabel>
      <StyledInput value={value} onChange={(e) => onChange(e.target.value)} />
    </InputContainer>
  )
}

// 생년월일 입력 컴포넌트
interface BirthInputProps {
  value: string
  onChange: (value: string) => void
}

export const BirthInputField: React.FC<BirthInputProps> = ({
  value,
  onChange,
}: BirthInputProps) => {
  const renderDots = () => {
    return (
      <DotsContainer>
        {Array.from({ length: 6 }).map((_, i) => (
          <Dot key={i} />
        ))}
      </DotsContainer>
    )
  }

  return (
    <InputContainer>
      <InputLabel>주민등록번호</InputLabel>
      <div className="flex items-center gap-2">
        <StyledInput
          placeholder="생년월일 앞 7자리"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Dash>-</Dash>
        {renderDots()}
      </div>
    </InputContainer>
  )
}

// 휴대폰 번호 입력 컴포넌트
interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
}

export const PhoneInputField: React.FC<PhoneInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <InputContainer>
      <InputLabel>휴대폰 번호</InputLabel>
      <StyledInput
        placeholder="휴대폰 번호"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </InputContainer>
  )
}

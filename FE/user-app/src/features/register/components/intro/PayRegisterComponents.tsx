import { Input } from '@/components/ui/input'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { Text } from '@/styles/typography'
import { NavArrowRight } from 'iconoir-react'

export const PaymentForm = tw.div`
  w-full max-w-md flex flex-col space-y-3 my-4
`

export const InputContainer = tw.div`
  flex flex-col w-full
`

export const InputLabel = tw.label`
  text-sm text-littleDarkGray
`

export const StyledInput = styled(Input)`
  ${tw`w-full border-gray h-10`}
`

export const ReadOnlyInput = styled(StyledInput)`
  ${tw`cursor-pointer`}
`

export const Dash = tw.span`
  text-lg
`

export const InputGroup = tw.div`
  flex items-center gap-2
`

export const BoxWrapper = tw.div`
  flex flex-col border border-gray rounded-md p-4 gap-2
`
export const UnderWrapper = tw.div`
  flex items-center justify-between ml-1
`

export interface PayInputProps {
  value: string
  onComplete?: () => void
  inputRef?: React.RefObject<HTMLInputElement>
  onFocus?: () => void
}

// 카드번호 입력 컴포넌트
export function CardNumberInputField({
  value,
  inputRef,
  onFocus,
}: PayInputProps) {
  // 카드번호 형식 변환 및 마스킹 처리 (앞 8자리만 표시, 뒤 8자리는 * 처리)
  const formatCardNumber = (cardNum: string) => {
    if (!cardNum) return ''

    const groups = []

    for (let i = 0; i < cardNum.length; i += 4) {
      const chunk = cardNum.substring(i, i + 4)

      if (i < 8) {
        groups.push(chunk)
      } else {
        const maskedChunk = '*'.repeat(chunk.length)
        groups.push(maskedChunk)
      }
    }

    return groups.join(' - ')
  }

  const handleFocus = () => {
    if (onFocus) {
      onFocus()
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        카드번호
      </Text>
      <ReadOnlyInput
        ref={inputRef}
        type="text"
        placeholder="카드번호 입력"
        value={formatCardNumber(value)}
        readOnly
        onClick={handleFocus}
      />
    </InputContainer>
  )
}

// 유효기간 입력 컴포넌트
export function ExpiryDateInputField({
  value,
  inputRef,
  onFocus,
}: PayInputProps) {
  // 유효기간 포맷 (MM / YY)
  const formatExpiryDate = (date: string) => {
    if (!date) return ''

    if (date.length <= 2) {
      return date
    } else {
      return `${date.substring(0, 2)} / ${date.substring(2)}`
    }
  }

  const handleFocus = () => {
    if (onFocus) {
      onFocus()
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        유효기간
      </Text>
      <ReadOnlyInput
        ref={inputRef}
        placeholder="MM / YY"
        value={formatExpiryDate(value)}
        readOnly
        onClick={handleFocus}
      />
    </InputContainer>
  )
}

// 보안코드 입력 컴포넌트
export function SecurityCodeInputField({
  value,
  inputRef,
  onFocus,
}: PayInputProps) {
  // 보안코드 마스킹
  const maskSecurityCode = () => {
    return '*'.repeat(value.length)
  }

  const handleFocus = () => {
    if (onFocus) {
      onFocus()
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        보안코드 (CVC/CVV)
      </Text>
      <ReadOnlyInput
        ref={inputRef}
        placeholder="카드 뒷면 3자리"
        value={maskSecurityCode()}
        readOnly
        onClick={handleFocus}
      />
    </InputContainer>
  )
}

// 비밀번호 입력 컴포넌트
export function PasswordInputField({
  value,
  inputRef,
  onFocus,
}: PayInputProps) {
  // 비밀번호 마스킹
  const maskPassword = () => {
    return '*'.repeat(value.length)
  }

  const handleFocus = () => {
    if (onFocus) {
      onFocus()
    }
  }

  return (
    <InputContainer>
      <Text variant="caption2" color="darkGray" className="pl-0.5">
        비밀번호
      </Text>
      <ReadOnlyInput
        ref={inputRef}
        placeholder="앞 2자리"
        value={maskPassword()}
        readOnly
        onClick={handleFocus}
      />
    </InputContainer>
  )
}

// 카드 등록 필수 동의 약관
export function AgreementBox() {
  return (
    <BoxWrapper>
      <Text variant="caption2" weight="bold" color="darkGray">
        카드 등록 필수 동의 약관
      </Text>
      <UnderWrapper className="mt-1">
        <Text variant="caption2" color="darkGray" className="whitespace-pre">
          • ㅤ카드사 - 개인(신용) 정보 제공 동의
        </Text>
        <NavArrowRight color="darkGray" width={16} height={16} />
      </UnderWrapper>
      <UnderWrapper>
        <Text variant="caption2" color="darkGray" className="whitespace-pre">
          • ㅤ개인정보 수집 및 이용 동의 - 카드
        </Text>
        <NavArrowRight color="darkGray" width={16} height={16} />
      </UnderWrapper>
      <UnderWrapper>
        <Text variant="caption2" color="darkGray" className="whitespace-pre">
          • ㅤ개인정보 제3자 제공 동의 - 카드
        </Text>
        <NavArrowRight color="darkGray" width={16} height={16} />
      </UnderWrapper>
    </BoxWrapper>
  )
}

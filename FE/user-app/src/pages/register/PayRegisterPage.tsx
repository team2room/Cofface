import DetailHeader from '@/components/DetailHeader'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { useEffect, useRef, useState } from 'react'
import {
  PaymentForm,
  CardNumberInputField,
  ExpiryDateInputField,
  SecurityCodeInputField,
  PasswordInputField,
} from '@/features/register/components/PayRegisterComponents'
import { useNavigate } from 'react-router-dom'

const Container = tw.div`
  w-full 
  max-w-screen-sm 
  mx-auto 
  flex 
  flex-col 
  h-screen
  pb-4
  px-8
`

const InputSection = tw.div`
  w-full mt-2 animate-slide-up
`

const StepContainer = tw.div`
  w-full flex flex-col gap-2
`

const RegisterButton = tw.button`
  bg-main hover:bg-littleDark text-white w-full p-2 mt-10 rounded-md
`

export function PayRegisterPage() {
  const navigate = useNavigate()

  // 상태 관리
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [password, setPassword] = useState('')

  const [showExpiryStep, setShowExpiryStep] = useState(false)
  const [showSecurityStep, setShowSecurityStep] = useState(false)
  const [showPasswordStep, setShowPasswordStep] = useState(false)
  const [showRegisterButton, setShowRegisterButton] = useState(false)

  // 각 입력 필드에 대한 ref 생성
  const cardNumberInputRef = useRef<HTMLInputElement>(null)
  const expiryDateInputRef = useRef<HTMLInputElement>(null)
  const securityCodeInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // 단계 전환 시 자동 포커스 처리를 위한 useEffect
  useEffect(() => {
    if (showExpiryStep && !showSecurityStep && expiryDateInputRef.current) {
      expiryDateInputRef.current.focus()
    }
  }, [showExpiryStep])

  useEffect(() => {
    if (showSecurityStep && !showPasswordStep && securityCodeInputRef.current) {
      securityCodeInputRef.current.focus()
    }
  }, [showSecurityStep])

  useEffect(() => {
    if (showPasswordStep && passwordInputRef.current) {
      passwordInputRef.current.focus()
    }
  }, [showPasswordStep])

  // 초기 렌더링 시 카드번호 입력 필드에 포커스
  useEffect(() => {
    if (cardNumberInputRef.current) {
      cardNumberInputRef.current.focus()
    }
  }, [])

  // 카드번호 완료 처리
  const handleCardNumberComplete = () => {
    if (cardNumber.length === 16) {
      setShowExpiryStep(true)
      // 직접 포커스 설정
      setTimeout(() => {
        if (expiryDateInputRef.current) {
          expiryDateInputRef.current.focus()
        }
      }, 50)
    }
  }

  // 유효기간 완료 처리
  const handleExpiryDateComplete = () => {
    if (expiryDate.length === 4) {
      setShowSecurityStep(true)
      // 직접 포커스 설정
      setTimeout(() => {
        if (securityCodeInputRef.current) {
          securityCodeInputRef.current.focus()
        }
      }, 50)
    }
  }

  // 보안코드 완료 처리
  const handleSecurityCodeComplete = () => {
    if (securityCode.length === 3) {
      setShowPasswordStep(true)
      // 직접 포커스 설정
      setTimeout(() => {
        if (passwordInputRef.current) {
          passwordInputRef.current.focus()
        }
      }, 50)
    }
  }

  // 비밀번호 완료 처리
  const handlePasswordComplete = () => {
    if (password.length === 2) {
      setShowRegisterButton(true)
    }
  }

  // 카드 등록 처리
  const handleRegister = () => {
    console.log('카드 등록 요청:', {
      cardNumber,
      expiryDate,
      securityCode,
      password,
    })

    // 카드 등록 성공 후 이동할 페이지
    navigate('/register/complete')
    // 실제 API 호출 코드가 여기에 들어갈 수 있음
  }

  return (
    <>
      <DetailHeader title="카드 등록하기" />
      <Container>
        <div className="text-center mb-6">
          <Text variant="caption1" weight="medium" color="darkGray">
            본인 명의의 카드만 등록 가능해요
          </Text>
        </div>

        <PaymentForm>
          <StepContainer>
            {/* 비밀번호 입력 */}
            {showPasswordStep && (
              <InputSection>
                <PasswordInputField
                  value={password}
                  onChange={setPassword}
                  onComplete={handlePasswordComplete}
                  inputRef={passwordInputRef}
                />
              </InputSection>
            )}

            {/* 보안코드 입력 */}
            {showSecurityStep && (
              <InputSection>
                <SecurityCodeInputField
                  value={securityCode}
                  onChange={setSecurityCode}
                  onComplete={handleSecurityCodeComplete}
                  inputRef={securityCodeInputRef}
                />
              </InputSection>
            )}

            {/* 유효기간 입력 */}
            {showExpiryStep && (
              <InputSection>
                <ExpiryDateInputField
                  value={expiryDate}
                  onChange={setExpiryDate}
                  onComplete={handleExpiryDateComplete}
                  inputRef={expiryDateInputRef}
                />
              </InputSection>
            )}

            {/* 카드번호 입력 */}
            <InputSection>
              <CardNumberInputField
                value={cardNumber}
                onChange={setCardNumber}
                onComplete={handleCardNumberComplete}
                inputRef={cardNumberInputRef}
              />
            </InputSection>

            {/* 등록하기 버튼 */}
            {showRegisterButton && (
              <RegisterButton onClick={handleRegister}>
                카드 등록하기
              </RegisterButton>
            )}
          </StepContainer>
        </PaymentForm>
      </Container>
    </>
  )
}

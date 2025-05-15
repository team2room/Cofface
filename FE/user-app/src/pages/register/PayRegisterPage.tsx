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
  InputGroup,
  AgreementBox,
} from '@/features/register/components/intro/PayRegisterComponents'
import { useNavigate } from 'react-router-dom'
import RandomKeyPad from '@/features/register/components/intro/PayRandomKeyPad'
import { CardCompanyProps } from '@/interfaces/PayRegisterInterfaces'
import {
  getCardCompany,
  registerCard,
} from '@/features/register/services/payService'

const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-white w-full
`
const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen
`
const ContentWrapper = tw.div`
  flex flex-col px-6 flex-1 pb-6
`
const FormSection = tw.div`
  flex-grow
`
const InputSection = tw.div`
  w-full mt-2 animate-slide-up
`
const StepContainer = tw.div`
  w-full flex flex-col gap-2
`
const RegisterWrapper = tw.div`
  w-full py-4 mt-auto
`
const RegisterButton = tw.button`
  bg-littleDark hover:bg-hover text-white w-full p-2 mt-4 rounded-md
`

// 입력 필드 타입 정의
type InputFieldType = 'cardNumber' | 'expiryDate' | 'securityCode' | 'password'

export function PayRegisterPage() {
  const navigate = useNavigate()

  // 상태 관리
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [password, setPassword] = useState('')
  const [cardCompany, setCardCompany] = useState<CardCompanyProps | null>(null)
  const [isLoadingCardCompany, setIsLoadingCardCompany] = useState(false)

  // 카드 등록 처리
  const [_isRegistering, setIsRegistering] = useState(false)
  const [_registerError, setRegisterError] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState(1) // 1: 카드번호, 2: 유효기간/보안코드, 3: 비밀번호

  // 키패드 관련 상태
  const [showKeypad, setShowKeypad] = useState(false)
  const [activeField, setActiveField] = useState<InputFieldType | null>(null)

  // 각 입력 필드에 대한 ref 생성
  const cardNumberInputRef = useRef<HTMLInputElement>(null)
  const expiryDateInputRef = useRef<HTMLInputElement>(null)
  const securityCodeInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // 단계 변경 시 포커스 처리
  useEffect(() => {
    if (currentStep === 1) {
      openKeypad('cardNumber')
    } else if (currentStep === 2 && !expiryDate.length) {
      openKeypad('expiryDate')
    } else if (currentStep === 3 && !password.length) {
      openKeypad('password')
    }
  }, [currentStep])

  // 카드사 조회 API 호출
  const fetchCardCompany = async (cardNum: string) => {
    if (cardNum.length === 16) {
      try {
        setIsLoadingCardCompany(true)
        const data = await getCardCompany(cardNum)
        setCardCompany(data)
        console.log('카드사 정보:', data)
      } catch (error) {
        console.error('카드사 조회 실패:', error)
        setCardCompany(null)
      } finally {
        setIsLoadingCardCompany(false)
      }
    } else {
      setCardCompany(null)
    }
  }

  // 카드번호 변경 시 카드사 조회 호출
  useEffect(() => {
    if (cardNumber.length === 16) {
      fetchCardCompany(cardNumber)
    }
  }, [cardNumber])

  // 키패드 열기 함수
  const openKeypad = (field: InputFieldType) => {
    setActiveField(field)
    setShowKeypad(true)
  }

  // 키패드에서 숫자 입력 처리
  const handleKeyPress = (key: string) => {
    if (!activeField) return

    switch (activeField) {
      case 'cardNumber':
        if (cardNumber.length < 16) {
          const newValue = cardNumber + key
          setCardNumber(newValue)
          if (newValue.length === 16) {
            handleCardNumberComplete()
          }
        }
        break
      case 'expiryDate':
        if (expiryDate.length < 4) {
          const newValue = expiryDate + key
          setExpiryDate(newValue)
          if (newValue.length === 4) {
            if (securityCode.length === 3) {
              handleExpirySecurityComplete()
            } else {
              openKeypad('securityCode')
            }
          }
        }
        break
      case 'securityCode':
        if (securityCode.length < 3) {
          const newValue = securityCode + key
          setSecurityCode(newValue)
          if (newValue.length === 3) {
            if (expiryDate.length === 4) {
              handleExpirySecurityComplete()
            } else {
              openKeypad('expiryDate')
            }
          }
        }
        break
      case 'password':
        if (password.length < 2) {
          const newValue = password + key
          setPassword(newValue)
          if (newValue.length === 2) {
            setShowKeypad(false)
          }
        }
        break
    }
  }

  // 키패드에서 삭제 버튼 처리
  const handleDelete = () => {
    if (!activeField) return

    switch (activeField) {
      case 'cardNumber':
        setCardNumber((prev) => prev.slice(0, -1))
        break
      case 'expiryDate':
        setExpiryDate((prev) => prev.slice(0, -1))
        break
      case 'securityCode':
        setSecurityCode((prev) => prev.slice(0, -1))
        break
      case 'password':
        setPassword((prev) => prev.slice(0, -1))
        break
    }
  }

  // 키패드 닫기
  const handleCloseKeypad = () => {
    setShowKeypad(false)
    setActiveField(null)
  }

  // 카드번호 완료 처리
  const handleCardNumberComplete = () => {
    // 카드사 정보가 로드되길 기다렸다가 다음 단계로 진행
    if (isLoadingCardCompany) {
      // 로딩 중이면 잠시 대기
      const checkInterval = setInterval(() => {
        if (!isLoadingCardCompany) {
          clearInterval(checkInterval)
          setCurrentStep(2)
        }
      }, 100)
    } else {
      setCurrentStep(2)
    }
  }

  // 유효기간 및 보안코드 완료 처리
  const handleExpirySecurityComplete = () => {
    setCurrentStep(3)
  }

  // 카드 등록 처리
  const handleRegister = async () => {
    try {
      setIsRegistering(true)
      setRegisterError(null)

      // 카드 번호에 하이픈 추가 (4자리마다)
      const formattedCardNumber = cardNumber.replace(/(\d{4})(?=\d)/g, '$1-')

      // 카드 등록 요청 데이터 준비
      const cardRegisterData = {
        cardNumber: formattedCardNumber,
        cardExpiry: `${expiryDate.substring(0, 2)}/${expiryDate.substring(2)}`, // MM/YY 형식으로 변환
        cardCvc: securityCode,
        isDefault: true, // 기본 결제 카드로 설정
      }

      console.log('카드 등록 요청:', cardRegisterData)

      // API 호출
      const response = await registerCard(cardRegisterData)

      console.log('카드 등록 성공:', response)

      // 카드 등록 성공 후 이동할 페이지
      navigate('/setting/pay')
    } catch (error) {
      console.error('카드 등록 실패:', error)
      setRegisterError('카드 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsRegistering(false)
    }
  }

  // 모든 필드가 입력되었는지 확인
  const isFormComplete =
    cardNumber.length === 16 &&
    expiryDate.length === 4 &&
    securityCode.length === 3 &&
    password.length === 2

  // 필드별 키패드 최대 길이 설정
  const getMaxLength = () => {
    switch (activeField) {
      case 'cardNumber':
        return 16
      case 'expiryDate':
        return 4
      case 'securityCode':
        return 3
      case 'password':
        return 2
      default:
        return 0
    }
  }

  // 필드별 현재 입력 길이 가져오기
  const getCurrentLength = () => {
    switch (activeField) {
      case 'cardNumber':
        return cardNumber.length
      case 'expiryDate':
        return expiryDate.length
      case 'securityCode':
        return securityCode.length
      case 'password':
        return password.length
      default:
        return 0
    }
  }

  // 필드별 키패드 타이틀 설정
  const getKeypadTitle = () => {
    switch (activeField) {
      case 'cardNumber':
        return '카드번호 입력'
      case 'expiryDate':
        return '유효기간 입력'
      case 'securityCode':
        return '보안코드 입력'
      case 'password':
        return '비밀번호 입력'
      default:
        return '보안키패드 작동중'
    }
  }

  // 키패드에서 전체 삭제 버튼 처리
  const handleAllDelete = () => {
    if (!activeField) return

    switch (activeField) {
      case 'cardNumber':
        setCardNumber('')
        break
      case 'expiryDate':
        setExpiryDate('')
        break
      case 'securityCode':
        setSecurityCode('')
        break
      case 'password':
        setPassword('')
        break
    }
  }

  return (
    <Container>
      <HeaderWrapper>
        <DetailHeader
          title="카드 등록하기"
          onBack={() => {
            navigate('/')
          }}
        />
      </HeaderWrapper>
      <ContentWrapper>
        <div className="text-center justify-center pt-3 pb-1">
          <Text variant="body1" weight="medium" color="darkGray">
            본인 명의의 카드만 등록 가능해요
          </Text>
        </div>

        <FormSection>
          <PaymentForm>
            <StepContainer>
              {/* 비밀번호 입력 (단계 3일 때 표시) */}
              {currentStep >= 3 && (
                <InputSection>
                  <PasswordInputField
                    value={password}
                    inputRef={passwordInputRef}
                    onFocus={() => openKeypad('password')}
                  />
                </InputSection>
              )}
              {/* 유효기간 및 보안코드 입력 */}
              {currentStep >= 2 && (
                <InputSection>
                  <InputGroup>
                    <div className="w-1/2">
                      <ExpiryDateInputField
                        value={expiryDate}
                        inputRef={expiryDateInputRef}
                        onFocus={() => openKeypad('expiryDate')}
                      />
                    </div>
                    <div className="w-1/2">
                      <SecurityCodeInputField
                        value={securityCode}
                        inputRef={securityCodeInputRef}
                        onFocus={() => openKeypad('securityCode')}
                      />
                    </div>
                  </InputGroup>
                </InputSection>
              )}
              {/* 카드번호 입력 */}
              <InputSection>
                <CardNumberInputField
                  value={cardNumber}
                  inputRef={cardNumberInputRef}
                  onFocus={() => openKeypad('cardNumber')}
                  cardCompany={cardCompany}
                />
              </InputSection>
            </StepContainer>
          </PaymentForm>
        </FormSection>

        {/* 등록하기 버튼 */}
        {isFormComplete && (
          <RegisterWrapper>
            <AgreementBox />
            <RegisterButton onClick={handleRegister}>
              동의하고 등록 완료
            </RegisterButton>
          </RegisterWrapper>
        )}
      </ContentWrapper>

      {/* 보안 키패드 */}
      {showKeypad && activeField && (
        <RandomKeyPad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onClose={handleCloseKeypad}
          onAllDelete={handleAllDelete}
          maxLength={getMaxLength()}
          currentLength={getCurrentLength()}
          title={getKeypadTitle()}
        />
      )}
    </Container>
  )
}

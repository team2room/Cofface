import tw from 'twin.macro'
import { useEffect, useRef, useState } from 'react'
import {
  LoginForm,
  Title,
  NameInputField,
  BirthInputField,
  PhoneInputField,
} from '@/features/login/components/LoginComponents'
import LoginSelectModal from '@/features/login/components/LoginSelectModal'
import { Text } from '@/styles/typography'
import { useAuth } from '@/features/login/hooks/useAuth'

const Container = tw.div`
  w-full
  h-screen
  max-w-screen-sm 
  flex 
  flex-col 
  p-6
  overflow-x-hidden
  items-center
`

const InputSection = tw.div`
  w-full mt-2 animate-slide-up
`

const StepContainer = tw.div`
  w-full flex flex-col gap-2
`

const SelectButton = tw.button`
  w-full border border-gray rounded-md h-10 tracking-wide text-start pl-3
`

const Selectdiv = tw.div`
  w-full border border-gray rounded-md h-10 pl-3 text-darkGray flex items-center
`

const VerifyButton = tw.button`
  bg-main hover:bg-hover text-white w-full p-2 mt-10 rounded-md disabled:bg-gray disabled:text-littleDarkGray
`

// 오류 메시지 스타일
const ErrorMessage = tw.div`
  text-destructive text-sm mt-2 animate-fade-in
`

export default function LoginVerifyPage() {
  const { requestVerification, isLoading, error } = useAuth()

  // 상태 관리
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [phone, setPhone] = useState('')
  const [telecom, setTelecom] = useState('')

  const [showBirthStep, setShowBirthStep] = useState(false)
  const [showPhoneStep, setShowPhoneStep] = useState(false)
  const [showTelecomStep, setShowTelecomStep] = useState(false)
  const [showVerifyButton, setShowVerifyButton] = useState(false)

  // 모달 띄움 여부
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 각 입력 필드에 대한 ref 생성
  const nameInputRef = useRef<HTMLInputElement>(null)
  const birthInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  // 유효성 검사 상태
  const [formError, setFormError] = useState('')

  // 단계 전환 시 자동 포커스 처리를 위한 useEffect
  useEffect(() => {
    if (showBirthStep && !showPhoneStep && birthInputRef.current) {
      birthInputRef.current.focus()
    }
  }, [showBirthStep, showPhoneStep])

  useEffect(() => {
    if (showPhoneStep && !showTelecomStep && phoneInputRef.current) {
      phoneInputRef.current.focus()
    }
  }, [showPhoneStep, showTelecomStep])

  useEffect(() => {
    if (showTelecomStep && !isModalOpen && !telecom) {
      // 자동으로 통신사 선택 모달 열기
      setIsModalOpen(true)
    }
  }, [showTelecomStep, isModalOpen, telecom])

  // 초기 렌더링 시 이름 입력 필드에 포커스
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  // 모달 핸들러
  const handleModalClick = () => {
    setIsModalOpen(true)
  }

  // 이름 입력 처리
  const handleNameChange = (value: string) => {
    setName(value)

    // 이름이 3글자 이상이면 다음 단계로 자동 진행
    if (value.trim().length >= 3) {
      setTimeout(() => setShowBirthStep(true), 500)
    }
  }

  // 생년월일/성별 입력 처리
  const handleBirthdateChange = (value: string) => {
    setBirthdate(value)

    // 주민번호 7자리(생년월일 6자리 + 성별 1자리) 입력 완료되면 다음 단계로 자동 진행
    if (value.length >= 7) {
      setShowPhoneStep(true)
    }
  }

  // 전화번호 입력 처리
  const handlePhoneChange = (value: string) => {
    setPhone(value)

    // 전화번호 11자리 입력 완료시 다음 단계로 자동 진행
    if (value.length >= 11) {
      setShowTelecomStep(true)
    }
  }

  // 통신사 선택 처리
  const handleTelecomSelect = (selectedTelecom: string) => {
    setTelecom(selectedTelecom)
    setShowVerifyButton(true)
  }

  // 인증 요청 전 검증
  const validateForm = () => {
    if (!name.trim()) {
      setFormError('이름을 입력해주세요.')
      return false
    }

    if (birthdate.length < 7) {
      setFormError('생년월일과 성별 정보를 올바르게 입력해주세요.')
      return false
    }

    // 성별 유효성 검사
    const gender = birthdate.substring(6, 7)
    if (!['1', '2', '3', '4'].includes(gender)) {
      setFormError('성별 정보는 1, 2, 3, 4 중 하나여야 합니다.')
      return false
    }

    if (phone.length < 10) {
      setFormError('휴대폰 번호를 올바르게 입력해주세요.')
      return false
    }

    if (!telecom) {
      setFormError('통신사를 선택해주세요.')
      return false
    }

    setFormError('')
    return true
  }

  // 본인인증 처리
  const handleVerify = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const idNumberFront = birthdate.substring(0, 6)
      const idNumberGender = birthdate.substring(6, 7)

      // 통신사 포맷 맞추기 (API 요구사항에 따라 수정 필요할 수 있음)
      let formattedTelecom = telecom
      if (telecom.includes('알뜰폰')) {
        formattedTelecom = '알뜰폰'
      } else if (telecom.includes('SKT')) {
        formattedTelecom = 'SKT'
      } else if (telecom.includes('KT')) {
        formattedTelecom = 'KT'
      } else if (telecom.includes('LG U+')) {
        formattedTelecom = 'LG U+'
      }

      // API 호출 - 인증번호 요청
      await requestVerification(
        name,
        idNumberFront,
        idNumberGender,
        phone,
        formattedTelecom,
      )

      // 페이지 이동은 requestVerification 내부에서 처리됨
    } catch (err) {
      console.error('인증 요청 실패:', err)
    }
  }

  // 상태별 타이틀 렌더링
  const renderTitle = () => {
    if (showVerifyButton) {
      return '정보가 맞다면\n인증하기 버튼을 눌러주세요'
    } else if (showTelecomStep) {
      return '통신사를 선택해주세요\nㅤ'
    } else if (showPhoneStep && !showTelecomStep) {
      return '휴대폰 번호를 입력해주세요\nㅤ'
    } else if (showBirthStep && !showPhoneStep) {
      return '생년월일 포함\n앞 7자리를 입력해주세요'
    } else {
      return '휴대폰 인증을 진행할게요\n이름을 입력해주세요'
    }
  }

  return (
    <Container>
      <LoginForm>
        {/* 타이틀 */}
        <Title>{renderTitle()}</Title>

        <StepContainer>
          {/* 통신사 선택 */}
          {showTelecomStep && (
            <InputSection>
              {telecom ? (
                <div className="flex flex-col">
                  <Text variant="caption2" color="darkGray" className="pl-0.5">
                    통신사
                  </Text>
                  <SelectButton onClick={handleModalClick}>
                    <Text>{telecom}</Text>
                  </SelectButton>
                </div>
              ) : (
                <div className="flex flex-col">
                  <Text variant="caption2" color="darkGray" className="pl-0.5">
                    통신사
                  </Text>
                  <Selectdiv onClick={handleModalClick}>
                    <Text>통신사를 선택해주세요</Text>
                  </Selectdiv>
                </div>
              )}
            </InputSection>
          )}

          {/* 모달 */}
          <LoginSelectModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSelect={handleTelecomSelect}
          />

          {/* 휴대폰 번호 입력 */}
          {showPhoneStep && (
            <InputSection>
              <PhoneInputField
                value={phone}
                onChange={handlePhoneChange}
                onComplete={() => setShowTelecomStep(true)}
                inputRef={phoneInputRef}
              />
            </InputSection>
          )}

          {/* 주민등록번호 입력 */}
          {showBirthStep && (
            <InputSection>
              <BirthInputField
                value={birthdate}
                onChange={handleBirthdateChange}
                onComplete={() => setShowPhoneStep(true)}
                inputRef={birthInputRef}
              />
            </InputSection>
          )}

          {/* 이름 입력 */}
          <InputSection>
            <NameInputField
              value={name}
              onChange={handleNameChange}
              onComplete={() => setShowBirthStep(true)}
              inputRef={nameInputRef}
            />
          </InputSection>

          {/* 오류 메시지 표시 */}
          {(formError || error) && (
            <ErrorMessage>{formError || error}</ErrorMessage>
          )}

          {/* 인증하기 버튼 */}
          {showVerifyButton && (
            <VerifyButton onClick={handleVerify} disabled={isLoading}>
              {isLoading ? '처리 중...' : '본인 인증하기'}
            </VerifyButton>
          )}
        </StepContainer>
      </LoginForm>
    </Container>
  )
}

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
import { useNavigate } from 'react-router-dom'

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
  bg-main hover:bg-hover text-white w-full p-2 mt-10 rounded-md
`

export default function LoginVerifyPage() {
  const navigate = useNavigate()

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

  // 단계 전환 시 자동 포커스 처리를 위한 useEffect
  useEffect(() => {
    if (showBirthStep && !showPhoneStep && birthInputRef.current) {
      birthInputRef.current.focus()
    }
  }, [showBirthStep])

  useEffect(() => {
    if (showPhoneStep && !showTelecomStep && phoneInputRef.current) {
      phoneInputRef.current.focus()
    }
  }, [showPhoneStep])

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

  // 이름 완료 처리
  const handleNameComplete = () => {
    if (name.trim()) {
      setShowBirthStep(true)
      // 직접 포커스 설정
      setTimeout(() => {
        if (birthInputRef.current) {
          birthInputRef.current.focus()
        }
      }, 50)
    }
  }

  // 생년월일 완료 처리
  const handleBirthComplete = () => {
    if (birthdate.length >= 7) {
      setShowPhoneStep(true)
      // 직접 포커스 설정
      setTimeout(() => {
        if (phoneInputRef.current) {
          phoneInputRef.current.focus()
        }
      }, 50)
    }
  }

  // 전화번호 완료 처리
  const handlePhoneComplete = () => {
    if (phone.length >= 11) {
      setShowTelecomStep(true)
      // 통신사 선택으로 이동 (모달을 열도록 할 수도 있음)
      setTimeout(() => {
        // 모달을 바로 열거나 통신사 선택 영역으로 스크롤 등의 처리
      }, 50)
    }
  }

  // 통신사 선택 처리
  const handleTelecomSelect = (selectedTelecom: string) => {
    setTelecom(selectedTelecom)
    setShowVerifyButton(true)
  }

  // 본인인증 처리
  const handleVerify = () => {
    console.log('본인인증 요청:', { name, birthdate, phone, telecom })

    navigate('/login/confirm')
    // 실제 API 호출 코드가 여기에 들어갈 수 있음
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
                  <Selectdiv onClick={handleModalClick}>
                    <Text>통신사를 선택해주세요</Text>
                  </Selectdiv>
                </div>
              )}
            </InputSection>
          )}

          {/* 모달 */}
          {isModalOpen && (
            <LoginSelectModal
              isOpen={isModalOpen}
              onOpenChange={setIsModalOpen}
              onSelect={handleTelecomSelect}
            />
          )}

          {/* 휴대폰 번호 입력 */}
          {showPhoneStep && (
            <InputSection>
              <PhoneInputField
                value={phone}
                onChange={setPhone}
                onComplete={handlePhoneComplete}
                inputRef={phoneInputRef}
              />
            </InputSection>
          )}

          {/* 주민등록번호 입력 */}
          {showBirthStep && (
            <InputSection>
              <BirthInputField
                value={birthdate}
                onChange={setBirthdate}
                onComplete={handleBirthComplete}
                inputRef={birthInputRef}
              />
            </InputSection>
          )}

          {/* 이름 입력 */}
          <InputSection>
            <NameInputField
              value={name}
              onChange={setName}
              onComplete={handleNameComplete}
              inputRef={nameInputRef}
            />
          </InputSection>

          {/* 인증하기 버튼 */}
          {showVerifyButton && (
            <VerifyButton onClick={handleVerify}>본인 인증하기</VerifyButton>
          )}
        </StepContainer>
      </LoginForm>
    </Container>
  )
}

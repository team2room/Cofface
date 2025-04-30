import tw from 'twin.macro'
import styled from '@emotion/styled'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  LoginForm,
  Title,
  CompletedField,
  NameInputField,
  BirthInputField,
  PhoneInputField,
} from '@/features/login/components/LoginComponents'

const Container = styled.div`
  ${tw`
    w-full
    h-screen
    max-w-screen-sm 
    flex 
    flex-col 
    p-6
    overflow-x-hidden
    items-center
  `}
`

// 로그인 단계 타입
type Step = 'name' | 'birth' | 'phone'

const LoginPage = () => {
  // 상태 관리
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [phone, setPhone] = useState('')

  // 다음 단계로 이동하는 함수들
  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep('birth')
    }
  }

  const handleBirthSubmit = () => {
    if (birthdate.trim()) {
      setStep('phone')
    }
  }

  const handlePhoneSubmit = () => {
    // 로그인 로직 구현 부분
    console.log('로그인 요청:', { name, birthdate, phone })
    // 실제 API 호출 코드가 여기에 들어갈 수 있음
  }

  // 단계별 타이틀 렌더링
  const renderTitle = () => {
    switch (step) {
      case 'name':
        return '휴대폰 인증을 진행할게요\n 이름을 입력해주세요'
      case 'birth':
        return '생년월일 포함\n앞 7자리를 입력해주세요'
      case 'phone':
        return '휴대폰 번호를 입력해주세요'
      default:
        return ''
    }
  }

  return (
    <Container>
      <LoginForm>
        {/* 단계별 타이틀 */}
        <Title>{renderTitle()}</Title>

        {/* 완료된 필드 표시 */}
        {step === 'birth' && <CompletedField label="이름" value={name} />}

        {step === 'phone' && (
          <>
            <CompletedField label="이름" value={name} />
            <CompletedField
              label="주민등록번호"
              value={birthdate}
              isPassword={true}
            />
          </>
        )}

        {/* 현재 단계 입력 필드 */}
        {step === 'name' && (
          <>
            <NameInputField value={name} onChange={setName} />
            <Button className="mt-6 w-full" onClick={handleNameSubmit}>
              다음
            </Button>
          </>
        )}

        {step === 'birth' && (
          <>
            <BirthInputField value={birthdate} onChange={setBirthdate} />
            <Button className="mt-6 w-full" onClick={handleBirthSubmit}>
              다음
            </Button>
          </>
        )}

        {step === 'phone' && (
          <>
            <PhoneInputField value={phone} onChange={setPhone} />
            <Button className="mt-6 w-full" onClick={handlePhoneSubmit}>
              로그인
            </Button>
          </>
        )}
      </LoginForm>
    </Container>
  )
}

export default LoginPage

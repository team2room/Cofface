import { CodeInputField } from '@/features/login/components/LoginCodeComponents'
import { LoginForm, Title } from '@/features/login/components/LoginComponents'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'

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
  w-full mt-2 animate-slide-up flex flex-col gap-2
`
const ConfirmButton = tw.button`
  bg-main hover:bg-hover text-white w-full p-2 mt-10 rounded-md
`

export default function LoginConfirmPage() {
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(60 * 3) // 3분
  const [showConfirmButton, setShowConfirmButton] = useState(false)

  const codeInputRef = useRef<HTMLInputElement>(null)

  // 페이지 로드 시 자동으로 input에 포커스
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [])

  // 타이머 설정
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // 코드 입력 처리
  const handleCodeChange = (value: string) => {
    // 최대 6자리로 제한
    if (value.length <= 6) {
      setCode(value)
    }

    // 6자리 모두 입력 시 자동으로 완료 처리
    if (value.length === 6) {
      handleCodeComplete()
    }
  }

  // 코드 완료 처리
  const handleCodeComplete = () => {
    if (code.length === 6) {
      console.log('인증번호 확인:', code)
      setShowConfirmButton(true)

      // 여기에 인증 로직 추가
    }
  }

  const handleConfirm = () => {
    navigate('/home')
  }

  // 재전송 처리
  const handleResend = () => {
    // 인증번호 재전송 로직
    console.log('인증번호 재전송 요청')
    setTimeLeft(60 * 3) // 타이머 리셋
    setCode('') // 입력값 초기화
    // 포커스 다시 설정
    if (codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }

  return (
    <Container>
      <LoginForm>
        <Title>
          문자로 받은
          <br />
          인증번호를 입력해주세요
        </Title>
        <InputSection>
          <CodeInputField
            value={code}
            onChange={handleCodeChange}
            onComplete={handleCodeComplete}
            inputRef={codeInputRef}
            timeLeft={timeLeft}
            onResend={handleResend}
          />
        </InputSection>
      </LoginForm>

      {showConfirmButton && (
        <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
      )}
    </Container>
  )
}

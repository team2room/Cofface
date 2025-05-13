import { CodeInputField } from '@/features/login/components/LoginCodeComponents'
import { LoginForm, Title } from '@/features/login/components/LoginComponents'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
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
  bg-main hover:bg-hover text-white w-full p-2 mt-10 rounded-md disabled:bg-gray disabled:text-littleDarkGray
`

const ErrorMessage = tw.div`
  text-destructive text-sm mt-2 animate-fade-in
`

export default function LoginConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyLogin, login, isLoading, error } = useAuthStore()

  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(60 * 3) // 3분
  const [showConfirmButton, setShowConfirmButton] = useState(false)
  const [formError, setFormError] = useState('')
  const [_isResending, setIsResending] = useState(false)

  // 고정된 비밀번호 설정
  const password = 'gay123'

  const codeInputRef = useRef<HTMLInputElement>(null)

  // 위치 상태에서 로그인 정보 가져오기
  const locationState =
    (location.state as {
      name: string
      idNumberFront: string
      idNumberGender: string
      phoneNumber: string
      telecomProvider: string
      verificationId: string
    }) || null

  // 필수 정보가 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    console.log('LoginConfirmPage에서 location state 확인:', locationState)
    if (!locationState) {
      console.error('location.state가 없습니다')
      navigate('/login/verify', { replace: true })
      return
    }

    if (!locationState.verificationId) {
      console.error('verificationId가 없습니다:', locationState)
      navigate('/login/verify', { replace: true })
      return
    }

    if (!locationState.phoneNumber) {
      console.error('phoneNumber가 없습니다:', locationState)
      navigate('/login/verify', { replace: true })
      return
    }
  }, [locationState, navigate])

  // 페이지 로드 시 자동으로 input에 포커스
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [])

  // 타이머 설정
  useEffect(() => {
    if (timeLeft <= 0) return // 0초가 되면 타이머 멈춤

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0 // 0에서 멈춤
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // 코드 입력 시 버튼 표시 여부 확인
  useEffect(() => {
    if (code.length === 6) {
      setShowConfirmButton(true)
    } else {
      setShowConfirmButton(false)
    }
  }, [code])

  // 코드 입력 처리
  const handleCodeChange = (value: string) => {
    setCode(value)
  }

  // 코드 완료 처리
  const handleCodeComplete = () => {
    if (code.length === 6) {
      console.log('인증번호 확인:', code)
      setFormError('')
    }
  }

  // 폼 유효성 검사
  const validateForm = () => {
    if (code.length !== 6) {
      setFormError('인증번호 6자리를 입력해주세요.')
      return false
    }

    if (timeLeft <= 0) {
      setFormError('인증 시간이 만료되었습니다. 인증번호를 재전송해주세요.')
      return false
    }

    setFormError('')
    return true
  }

  // 확인 버튼 클릭 처리
  const handleConfirm = async () => {
    if (!locationState) {
      console.error('locationState가 없습니다')
      return
    }

    if (!validateForm()) {
      console.error('폼 유효성 검사 실패')
      return
    }

    try {
      console.log('인증 확인 요청 데이터:', {
        verificationId: locationState.verificationId,
        phoneNumber: locationState.phoneNumber,
        verificationCode: code,
        name: locationState.name,
        idNumberFront: locationState.idNumberFront,
        idNumberGender: locationState.idNumberGender,
        password,
      })

      await verifyLogin(
        locationState.verificationId,
        locationState.phoneNumber,
        code,
        locationState.name,
        locationState.idNumberFront,
        locationState.idNumberGender,
        password,
      )

      // 로그인 성공 시 홈 페이지로 이동
      navigate('/home', { replace: true, state: null })
    } catch (err) {
      console.error('로그인 확인 실패:', err)
      setShowConfirmButton(false) // 오류 시 버튼 숨김
    }
  }

  // 재전송 처리
  const handleResend = async () => {
    if (!locationState) return

    try {
      setIsResending(true)

      await login(
        locationState.name,
        locationState.idNumberFront,
        locationState.idNumberGender,
        locationState.phoneNumber,
        locationState.telecomProvider,
      )

      // 타이머 재설정
      setTimeLeft(180)
      setFormError('')

      // 인증번호 입력 필드 초기화
      setCode('')
      setShowConfirmButton(false)

      // 포커스 다시 설정
      if (codeInputRef.current) {
        codeInputRef.current.focus()
      }
    } catch (err) {
      console.error('인증번호 재전송 실패:', err)
    } finally {
      setIsResending(false)
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

          {/* 오류 메시지 표시 */}
          {(formError || error) && (
            <ErrorMessage>{formError || error}</ErrorMessage>
          )}
        </InputSection>
      </LoginForm>

      {showConfirmButton && (
        <ConfirmButton
          onClick={handleConfirm}
          disabled={isLoading || timeLeft <= 0}
        >
          {isLoading ? '로그인 중...' : '확인'}
        </ConfirmButton>
      )}
    </Container>
  )
}

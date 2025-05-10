import { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import tw from 'twin.macro'
import MenuContent from '../../features/order/components/MenuContent'
import PlaceSelectContent from '../../features/order/components/PlaceSelectContent'
import PayContent from '@/features/order/components/PayContent'
import CompleteContent from '@/features/order/components/CompleteContent'
import CustomDialog from '@/components/CustomDialog'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '@/features/userLogin/hooks/useLogout'
import { useExtendSession } from '@/features/userLogin/hooks/useExtendSession'

const Container = tw.div`flex flex-col min-h-screen bg-white px-7 my-4`

type Step = 'menu' | 'place' | 'pay' | 'complete'

export default function OrderPage() {
  const navigate = useNavigate()
  const { logout } = useLogout()
  const { extend } = useExtendSession()

  const [step, setStep] = useState<Step>('menu')

  const [remainingSeconds, setRemainingSeconds] = useState(10)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)
  const [logoutCountdown, setLogoutCountdown] = useState(5)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setShowTimeoutModal(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    }
  }, [])

  // 모달 열린 후 5초 뒤 자동 로그아웃
  useEffect(() => {
    if (showTimeoutModal) {
      setLogoutCountdown(5)

      logoutTimerRef.current = setInterval(() => {
        setLogoutCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(logoutTimerRef.current!)
            handleLogoutClick()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current)
        logoutTimerRef.current = null
      }
    }
  }, [showTimeoutModal])

  const handleLogoutClick = async () => {
    await logout(1)
    navigate('/user')
  }

  const handleExtendClick = async () => {
    await extend(1)
    setRemainingSeconds(10)
    startTimer()
    setShowTimeoutModal(false)
  }

  return (
    <>
      <Container>
        <Header remainingSeconds={remainingSeconds} />

        {step === 'menu' && <MenuContent onNext={() => setStep('place')} />}
        {step === 'place' && (
          <PlaceSelectContent onNext={() => setStep('pay')} />
        )}
        {step === 'pay' && <PayContent />}
        {step === 'complete' && <CompleteContent />}
      </Container>

      <CustomDialog
        open={showTimeoutModal}
        onOpenChange={setShowTimeoutModal}
        title={
          <Text variant="title3" weight="extrabold">
            시간 초과😥
          </Text>
        }
        description={
          <Text variant="body1" weight="bold">
            연장하시겠습니까?
            <br />
            <Text variant="title4" weight="extrabold" className="text-red-600">
              {logoutCountdown}
            </Text>
            초 후 자동 로그아웃됩니다.
          </Text>
        }
        cancelText="로그아웃"
        confirmText="연장하기"
        onCancel={handleLogoutClick}
        onConfirm={handleExtendClick}
      />
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import tw from 'twin.macro'
import MenuContent from '../../features/order/components/MenuContent'
import PlaceSelectContent from '../../features/order/components/PlaceSelectContent'
import PayContent from '@/features/order/components/PayContent'
import CustomDialog from '@/components/CustomDialog'
import { Text } from '@/styles/typography'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '@/features/userLogin/hooks/useLogout'
import { useExtendSession } from '@/features/userLogin/hooks/useExtendSession'
import { useUserStore } from '@/stores/loginStore'
import MainContent from '@/features/order/components/MainContent'
import { useStepStore } from '@/stores/stepStore'
import { changeDisplayType } from '@/lib/changeDisplay'

const Container = tw.div`flex flex-col min-h-screen bg-white my-4`

export default function OrderPage() {
  const navigate = useNavigate()
  const { step, resetStep } = useStepStore()
  const { logout } = useLogout()
  const { extend } = useExtendSession()
  const { isMember } = useUserStore()

  const [remainingSeconds, setRemainingSeconds] = useState(120)
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
    changeDisplayType('motion')
      .then((data) => console.log('성공:', data))
      .catch((error) => console.error('실패:', error))
    resetStep()
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
            handleTimeoutCancel()
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

  const handleTimeoutCancel = async () => {
    if (isMember) {
      await logout(1)
    }
    navigate('/user')
  }

  const handleExtendClick = async () => {
    if (isMember) {
      await extend(1)
    }
    setRemainingSeconds(120)
    startTimer()
    setShowTimeoutModal(false)
  }

  // 모달 내용
  const dialogDescription = isMember ? (
    <Text variant="body1" weight="bold">
      연장하시겠습니까?
      <br />
      <Text variant="title4" weight="extrabold" className="text-red-600">
        {logoutCountdown}
      </Text>
      초 후 자동 로그아웃됩니다.
    </Text>
  ) : (
    <Text variant="body1" weight="bold">
      시간이 초과되었어요.
      <br />
      <Text variant="title4" weight="extrabold" className="text-red-600">
        {logoutCountdown}
      </Text>
      초 후 초기화면으로 돌아갑니다.
    </Text>
  )

  const dialogCancelText = isMember ? '로그아웃' : '처음으로'

  return (
    <>
      <Container>
        <Header remainingSeconds={remainingSeconds} />

        {step === 'main' && <MainContent />}
        {step === 'menu' && <MenuContent />}
        {step === 'place' && <PlaceSelectContent />}
        {step === 'pay' && <PayContent />}
      </Container>

      <CustomDialog
        open={showTimeoutModal}
        onOpenChange={setShowTimeoutModal}
        title={
          <Text variant="title3" weight="extrabold">
            시간 초과😥
          </Text>
        }
        description={dialogDescription}
        cancelText={dialogCancelText}
        confirmText="연장하기"
        onCancel={handleTimeoutCancel}
        onConfirm={handleExtendClick}
      />
    </>
  )
}

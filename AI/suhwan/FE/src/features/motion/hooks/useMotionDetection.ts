// hooks/useMotionDetection.ts
import { useState, useEffect } from 'react'
import { MotionEventBus } from '../services/MotionEventBus'
import AuthService from '../services/AuthService'
import MotionApiService from '../services/MotionApiService'

interface UseMotionDetectionProps {
  onMotionDetected?: (motionType: string, data: any) => void
  autoActivate?: boolean
}

export const useMotionDetection = ({
  onMotionDetected,
  autoActivate = true,
}: UseMotionDetectionProps = {}) => {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [lastMotion, setLastMotion] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState<boolean>(false)

  // 활성화/비활성화 처리
  const setActive = (active: boolean) => {
    setIsActive(active)
    MotionApiService.setActive(active)
  }

  // 얼굴 감지 상태 설정
  const handleFaceDetected = (detected: boolean) => {
    setFaceDetected(detected)
  }

  // 컴포넌트 마운트 시
  useEffect(() => {
    // 로그인 상태에 따라 자동 활성화
    if (autoActivate && AuthService.isLoggedIn()) {
      setActive(true)
    }

    // 모션 이벤트 구독
    const subscription = MotionEventBus.subscribe((event) => {
      setLastMotion(event.type)

      // 콜백 호출
      if (onMotionDetected) {
        onMotionDetected(event.type, event.data)
      }

      // 일정 시간 후 마지막 모션 초기화
      setTimeout(() => {
        setLastMotion(null)
      }, 3000)
    })

    // 인증 상태 변경 리스너
    const handleAuthChange = (event: any) => {
      const { type } = event.detail
      if (type === 'login') {
        setActive(true)
      } else if (type === 'logout') {
        setActive(false)
      }
    }

    // 인증 상태 변경 리스너 등록
    AuthService.addAuthStateListener(handleAuthChange)

    return () => {
      // 구독 해제
      subscription.unsubscribe()
      // 인증 상태 변경 리스너 제거
      AuthService.removeAuthStateListener(handleAuthChange)
      // 컴포넌트 언마운트 시 비활성화
      setActive(false)
    }
  }, [autoActivate, onMotionDetected])

  return {
    isActive,
    setActive,
    lastMotion,
    faceDetected,
    handleFaceDetected,
  }
}

export default useMotionDetection

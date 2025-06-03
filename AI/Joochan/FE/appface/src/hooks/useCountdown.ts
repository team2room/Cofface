// src/hooks/useCountdown.ts

import { useState, useRef, useEffect } from 'react'

interface UseCountdownProps {
  duration: number
  onComplete?: () => void
  autoStart?: boolean
}

interface UseCountdownResult {
  isActive: boolean
  progress: number
  remainingTime: number
  startCountdown: () => void
  resetCountdown: () => void
  pauseCountdown: () => void
}

const useCountdown = ({
  duration,
  onComplete,
  autoStart = false,
}: UseCountdownProps): UseCountdownResult => {
  const [isActive, setIsActive] = useState(autoStart)
  const [progress, setProgress] = useState(0)
  const [remainingTime, setRemainingTime] = useState(duration)

  const startTimeRef = useRef<number>(0)
  const animFrameIdRef = useRef<number | null>(null)
  const isCompletedRef = useRef<boolean>(false)

  // 카운트다운 시작
  const startCountdown = (): void => {
    if (isActive) return

    startTimeRef.current = Date.now()
    setIsActive(true)
    isCompletedRef.current = false
  }

  // 카운트다운 리셋
  const resetCountdown = (): void => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }

    setIsActive(false)
    setProgress(0)
    setRemainingTime(duration)
    startTimeRef.current = 0
    isCompletedRef.current = false
  }

  // 카운트다운 일시정지
  const pauseCountdown = (): void => {
    setIsActive(false)

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }
  }

  // 카운트다운 애니메이션 프레임 업데이트
  useEffect(() => {
    if (!isActive) return

    const updateCountdown = (): void => {
      const elapsedTime = Date.now() - startTimeRef.current
      const newRemainingTime = Math.max(0, duration - elapsedTime)
      const newProgress = ((duration - newRemainingTime) / duration) * 100

      setRemainingTime(newRemainingTime)
      setProgress(newProgress)

      if (newRemainingTime <= 0 && !isCompletedRef.current) {
        isCompletedRef.current = true
        setIsActive(false)

        if (onComplete) {
          onComplete()
        }

        return
      }

      if (isActive && newRemainingTime > 0) {
        animFrameIdRef.current = requestAnimationFrame(updateCountdown)
      }
    }

    animFrameIdRef.current = requestAnimationFrame(updateCountdown)

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [isActive, duration, onComplete])

  // 자동 시작 처리
  useEffect(() => {
    if (autoStart) {
      startCountdown()
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [autoStart])

  return {
    isActive,
    progress,
    remainingTime,
    startCountdown,
    resetCountdown,
    pauseCountdown,
  }
}

export default useCountdown

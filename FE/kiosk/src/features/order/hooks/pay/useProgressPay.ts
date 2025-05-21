import { useState, useRef, useEffect } from 'react'
import { useAutoPay } from '../useAutoPay'
import { useNavigate } from 'react-router-dom'

interface UseCardPaymentReturn {
  cardRef: React.RefObject<HTMLDivElement>
  isDragging: boolean
  isPaymentComplete: boolean
  cardZIndex: number
  showGuide: boolean
  calculateCardStyle: () => React.CSSProperties
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
}

export const useProgressPay = (): UseCardPaymentReturn => {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [cardPosition, setCardPosition] = useState<number>(0) // 0 = bottom, 100 = top (fully inserted)
  const [startDragY, setStartDragY] = useState<number>(0)
  const [startCardPosition, setStartCardPosition] = useState<number>(0)
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false)
  const [cardZIndex, setCardZIndex] = useState<number>(0) // 카드의 z-index를 동적으로 제어합니다
  const [showGuide, setShowGuide] = useState<boolean>(true) // 가이드 화살표 표시 여부
  const cardRef = useRef<HTMLDivElement>(null)
  const { error, startPayment } = useAutoPay()
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false)
  const hasTriggeredPaymentRef = useRef(false)

  // 결제 완료 후 처리 - 카드는 꽂힌 상태로 유지
  useEffect(() => {
    if (isPaymentComplete) {
      // 결제 완료 후 가이드 화살표 숨기기
      setShowGuide(false)
    }
  }, [isPaymentComplete])

  // 첫 렌더링 시 가이드 표시를 위한 효과
  useEffect(() => {
    // 컴포넌트 마운트 시 가이드 표시
    setShowGuide(true)

    // 드래그가 시작되면 가이드 숨기기
    if (isDragging) {
      setShowGuide(false)
    }
  }, [isDragging])

  // 카드 위치 계산 (픽셀 단위)
  const calculateCardStyle = (): React.CSSProperties => {
    // 카드가 카드리더기 안으로 들어가는 느낌을 주기 위해 기존 코드 수정
    // translateY 값이 작을수록 카드가 위로 올라감
    const translateY = 380 - cardPosition * 1.8 // 최대 이동 거리 조정
    return {
      transform: `translateY(${translateY}px)`,
      zIndex: cardZIndex,
      // 결제 완료 시에는 트랜지션을 추가하여 부드럽게 완료
      transition: isPaymentComplete ? 'transform 0.1s ease-out' : 'none',
    }
  }

  // 드래그 시작 처리
  const handleDragStart = (clientY: number): void => {
    // 결제가 완료된 상태에서는 드래그 불가능하게
    if (isPaymentComplete) return

    setIsDragging(true)
    setStartDragY(clientY)
    setStartCardPosition(cardPosition)
    // 드래그 시작 시 카드가 카드리더기 앞에 보이도록 z-index 변경
    setCardZIndex(0)
    // 드래그 시작 시 가이드 숨기기
    setShowGuide(false)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault()
    handleDragStart(e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    e.preventDefault()
    handleDragStart(e.touches[0].clientY)
  }

  // 드래그 중 처리
  const handleDragMove = async (clientY: number): Promise<void> => {
    if (!isDragging) return

    // 얼마나 위로 드래그했는지 계산 (아래로 = 양수, 위로 = 음수)
    const dragDelta = startDragY - clientY

    // 드래그 거리를 0-100 사이의 위치값으로 변환
    // 드래그 위로 = 카드 위치 증가 (더 삽입)
    let newPosition = startCardPosition + dragDelta / 2
    newPosition = Math.max(0, Math.min(100, newPosition))

    setCardPosition(newPosition)

    // 충분히 삽입되었는지 확인 (70% 이상)
    if (
      newPosition > 70 &&
      !hasTriggeredPaymentRef.current &&
      !isPaymentInProgress
    ) {
      triggerPaymentFlow()
      // completePayment()
    }
  }

  const handleMouseMove = (e: MouseEvent): void => {
    handleDragMove(e.clientY)
  }

  const handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault() // 드래그 중 화면 스크롤 방지
    handleDragMove(e.touches[0].clientY)
  }

  // 드래그 종료 처리
  const handleDragEnd = (): void => {
    if (!isDragging) return
    setIsDragging(false)

    // 결제가 완료된 경우 카드 위치 유지
    if (isPaymentComplete) {
      // 카드가 삽입된 상태로 유지하고 z-index만 조정
      setCardZIndex(0)
      // 결제 완료 후 가이드 화살표 숨기기
      setShowGuide(false)
      return
    }

    // 충분히 삽입되지 않았다면 원위치로
    if (cardPosition < 70) {
      setCardPosition(0)
      // 카드가 원래 위치로 돌아갈 때 약간의 지연 후 z-index 변경
      setTimeout(() => {
        setCardZIndex(0)
      }, 300)
      // 카드가 원위치로 돌아가면 가이드 다시 표시
      setTimeout(() => {
        setShowGuide(true)
      }, 500)
    } else {
      // 충분히 삽입되었지만 아직 결제 완료되지 않은 경우
      setCardZIndex(0)
    }
  }

  // 결제 완료 처리
  const completePayment = (): void => {
    if (!isPaymentComplete) {
      // 결제 완료 상태로 설정하기 전에 먼저 가이드를 숨김
      setShowGuide(false)
      setIsPaymentComplete(true)
      setCardPosition(100) // 카드 완전히 삽입
      // 카드가 리더기 안으로 들어갔을 때 z-index를 낮춰 리더기 뒤로 가게 함
      setCardZIndex(0)

      // 드래그 중인 상태를 즉시 종료하여 handleDragEnd가 원치 않는 동작을 하지 않도록 함
      setIsDragging(false)

      // 모든 이벤트 리스너 제거
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleTouchMove as EventListener)
      window.removeEventListener('touchend', handleDragEnd)

      navigate('/loading?type=complete')
    }
  }

  const triggerPaymentFlow = async (): Promise<void> => {
    if (
      isPaymentComplete ||
      isPaymentInProgress ||
      hasTriggeredPaymentRef.current
    )
      return

    hasTriggeredPaymentRef.current = true
    setIsPaymentInProgress(true)

    try {
      await startPayment()
      if (!error) {
        completePayment()
      } else {
        console.error('Payment failed:', error)
        resetCardPosition()
      }
    } catch (e) {
      console.error('Unexpected payment error:', e)
      resetCardPosition()
    } finally {
      setIsPaymentInProgress(false)
    }
  }

  // 카드 위치 초기화
  const resetCardPosition = (): void => {
    setCardPosition(0)
    setIsDragging(false)
    hasTriggeredPaymentRef.current = false

    setTimeout(() => {
      setCardZIndex(0)
    }, 300)

    setTimeout(() => {
      setShowGuide(true)
    }, 500)
  }

  // 전역 이벤트 리스너 설정
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleTouchMove as EventListener, {
        passive: false,
      })
      window.addEventListener('touchend', handleDragEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleTouchMove as EventListener)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging])

  return {
    cardRef,
    isDragging,
    isPaymentComplete,
    cardZIndex,
    showGuide,
    calculateCardStyle,
    handleMouseDown,
    handleTouchStart,
  }
}

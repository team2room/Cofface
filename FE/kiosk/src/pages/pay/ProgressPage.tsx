import { useState, useRef, useEffect } from 'react'
import { Text } from '@/styles/typography'
import tw from 'twin.macro'

const ImageWrapper = tw.div`absolute w-full h-full flex bg-darkModal py-32`
const Content = tw.div`flex flex-col items-center flex-1 gap-[450px] z-10 relative`
const TerminalContainer = tw.div`relative w-[400px] flex flex-col items-center justify-center`
const CardContainer = tw.div`absolute bottom-0 transform translate-y-[480px] cursor-grab active:cursor-grabbing`

export default function ProgressPage() {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [cardPosition, setCardPosition] = useState<number>(0) // 0 = bottom, 100 = top (fully inserted)
  const [startDragY, setStartDragY] = useState<number>(0)
  const [startCardPosition, setStartCardPosition] = useState<number>(0)
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false)
  const [cardZIndex, setCardZIndex] = useState<number>(0) // 카드의 z-index를 동적으로 제어합니다
  const cardRef = useRef<HTMLDivElement>(null)

  // 결제 완료 후 처리 - 카드는 꽂힌 상태로 유지
  useEffect(() => {
    if (isPaymentComplete) {
      // // 결제 완료 메시지만 3초 후 리셋하고, 카드는 그대로 유지
      // const timer = setTimeout(() => {
      //   // 카드 위치와 상태는 리셋하지 않고 메시지만 변경하기 위해 상태를 유지
      //   setIsPaymentComplete(false)
      //   setCardPosition(0)
      // }, 3000)
      // return () => clearTimeout(timer)
    }
  }, [isPaymentComplete])

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
  const handleDragMove = (clientY: number): void => {
    if (!isDragging) return

    // 얼마나 위로 드래그했는지 계산 (아래로 = 양수, 위로 = 음수)
    const dragDelta = startDragY - clientY

    // 드래그 거리를 0-100 사이의 위치값으로 변환
    // 드래그 위로 = 카드 위치 증가 (더 삽입)
    let newPosition = startCardPosition + dragDelta / 2
    newPosition = Math.max(0, Math.min(100, newPosition))

    setCardPosition(newPosition)

    // 충분히 삽입되었는지 확인 (70% 이상)
    if (newPosition > 70) {
      completePayment()
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
      return
    }

    // 충분히 삽입되지 않았다면 원위치로
    if (cardPosition < 70) {
      setCardPosition(0)
      // 카드가 원래 위치로 돌아갈 때 약간의 지연 후 z-index 변경
      setTimeout(() => {
        setCardZIndex(0)
      }, 300)
    } else {
      // 충분히 삽입되었지만 아직 결제 완료되지 않은 경우
      setCardZIndex(0)
    }
  }

  // 결제 완료 처리
  const completePayment = (): void => {
    if (!isPaymentComplete) {
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
    }
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

  return (
    <div>
      <ImageWrapper>
        <Content>
          <TerminalContainer>
            {isPaymentComplete && (
              <Text
                variant="title1"
                weight="bold"
                color="white"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 text-center z-100"
                fontFamily="Suite"
              >
                결제 인증완료
              </Text>
            )}
            {/* 카드 단말기 이미지 */}
            <img
              src="/cardreader.png"
              alt="카드 단말기"
              className="w-full h-auto z-20"
              draggable={false}
            />

            {/* 드래그 가능한 카드 */}
            <CardContainer
              ref={cardRef}
              style={calculateCardStyle()}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <img
                src="/card.png"
                alt="신용 카드"
                className="w-250 h-auto"
                draggable={false}
              />
            </CardContainer>
          </TerminalContainer>
          <Text
            variant="title1"
            weight="bold"
            color="white"
            className="whitespace-pre-line text-center"
            fontFamily="Suite"
          >
            {isPaymentComplete
              ? '결제가 완료되었습니다!\nㅤ'
              : '카드를 위로 슬라이드하면\n자동결제됩니다'}
          </Text>
        </Content>
      </ImageWrapper>
    </div>
  )
}

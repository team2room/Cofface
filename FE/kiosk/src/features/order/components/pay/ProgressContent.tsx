import { Text } from '@/styles/typography'
import tw from 'twin.macro'
import { useProgressPay } from '../../hooks/pay/useProgressPay'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { PiHandTap } from 'react-icons/pi'

const ImageWrapper = tw.div`absolute w-full h-full flex bg-darkModal py-32`
const Content = tw.div`flex flex-col items-center flex-1 gap-[450px] z-10 relative`
const TerminalContainer = tw.div`relative w-[400px] flex flex-col items-center justify-center`
const CardContainer = tw.div`absolute bottom-0 transform translate-y-[480px] cursor-grab active:cursor-grabbing`

// 화살표 애니메이션 정의
const moveUpDown = keyframes`
  0%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-25px);
    opacity: 1;
  }
`

// 스타일이 적용된 화살표 컴포넌트
const ArrowGuide = styled.div`
  position: absolute;
  right: -90px;
  bottom: 100px;
  width: 100px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${moveUpDown} 2.5s ease-in-out infinite;
  z-index: 30;
`

// 스타일이 적용된 아이콘 컴포넌트
const StyledHandIcon = styled(PiHandTap)`
  width: 60px;
  height: 60px;
  color: white;
`

export default function ProgressContent() {
  const {
    cardRef,
    isPaymentComplete,
    showGuide,
    calculateCardStyle,
    handleMouseDown,
    handleTouchStart,
  } = useProgressPay()

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
              {/* 가이드 화살표 - 결제가 완료되지 않았고 showGuide가 true일 때만 표시 */}
              {showGuide && !isPaymentComplete && (
                <ArrowGuide>
                  <StyledHandIcon />
                  <Text
                    variant="body2"
                    weight="semibold"
                    color="white"
                    className="mt-2 whitespace-nowrap"
                    fontFamily="Suite"
                  >
                    위로 밀기
                  </Text>
                </ArrowGuide>
              )}
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

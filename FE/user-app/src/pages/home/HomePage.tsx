import { HomeMainButton } from '@/features/home/components/HomeMainButton'
import { HomeSelectDrinks } from '@/features/home/components/HomeSelectDrinks'
import { HomeTitleLock } from '@/features/home/components/HomeTitleLock'
import { HomeTitleUnlock } from '@/features/home/components/HomeTitleUnlock'
import { HomeMainButtonProps } from '@/interfaces/HomeInterfaces'
import { Text } from '@/styles/typography'
import { Settings } from 'iconoir-react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Container = tw.div`
  w-full
  h-screen
  max-w-screen-sm 
  flex 
  flex-col 
  px-8
  pt-10
  pb-8
`

const PageContainter = tw.div`
  w-full h-screen overflow-hidden fixed top-0 left-0
`

// 스크롤 시 자연스럽게 움직이는 애니메이션 컨테이너
const SmoothScrollContainer = styled.div<{ isScrolled: boolean }>`
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  transform: translateY(${(props) => (props.isScrolled ? '-100vh' : '0')});
  height: 100vh;
  will-change: transform;
`

const HomeNav = tw.div`
  flex justify-between items-center mb-5
`
const ScrollDown = tw.div`
  flex justify-center items-center mt-2 cursor-pointer
`

const ScrollUp = tw.div`
  flex justify-center items-center rotate-180 mb-4 cursor-pointer
`

const ButtonWrapper = tw.div`
  flex flex-col gap-10
`

export default function HomePage() {
  const name = '이혜령'
  const locked = false

  const [isScrolled, setIsScrolled] = useState(false)
  const isScrollingRef = useRef(false)
  const touchStartY = useRef(0)

  const navigate = useNavigate()

  const mainButtonProps: HomeMainButtonProps[] = [
    {
      title: '얼굴 등록',
      content: '얼굴 정보를 등록하고\n 오더미 키오스크에서 편리하게 주문해요',
      src: '/src/assets/phone.png',
      onClick: () => {
        navigate('/register/face')
      },
    },
    {
      title: '결제 정보 등록',
      content: '나의 결제 정보를 등록하고\n 오더미 키오스크에서 바로 결제해요',
      src: '/src/assets/wallet.png',
      onClick: () => {
        navigate('/register/pay')
      },
    },
  ]

  // 휠 이벤트 처리
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // 이미 스크롤 중이면 무시
      if (isScrollingRef.current) return

      // 스크롤 방향 확인
      const isScrollingDown = e.deltaY > 0

      // 방향에 따라 상태 변경
      if (isScrollingDown && !isScrolled) {
        isScrollingRef.current = true
        setIsScrolled(true)
        setTimeout(() => {
          isScrollingRef.current = false
        }, 800) // 트랜지션 시간보다 약간 길게
      } else if (!isScrollingDown && isScrolled) {
        isScrollingRef.current = true
        setIsScrolled(false)
        setTimeout(() => {
          isScrollingRef.current = false
        }, 800) // 트랜지션 시간보다 약간 길게
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isScrolled])

  // 터치 이벤트 처리 (모바일용)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrollingRef.current) return

      const touchY = e.touches[0].clientY
      const diff = touchStartY.current - touchY

      // 위로 스와이프 (아래로 스크롤)
      if (diff > 50 && !isScrolled) {
        isScrollingRef.current = true
        setIsScrolled(true)
        setTimeout(() => {
          isScrollingRef.current = false
        }, 800)
      }
      // 아래로 스와이프 (위로 스크롤)
      else if (diff < -50 && isScrolled) {
        isScrollingRef.current = true
        setIsScrolled(false)
        setTimeout(() => {
          isScrollingRef.current = false
        }, 800)
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isScrolled])

  // 스크롤 버튼 핸들러
  const handleScrollDown = () => {
    if (isScrollingRef.current) return
    isScrollingRef.current = true
    setIsScrolled(true)
    setTimeout(() => {
      isScrollingRef.current = false
    }, 800)
  }

  const handleScrollUp = () => {
    if (isScrollingRef.current) return
    isScrollingRef.current = true
    setIsScrolled(false)
    setTimeout(() => {
      isScrollingRef.current = false
    }, 800)
  }

  // 2가지 경우 고려, 얼굴&결제 미등록/등록
  return (
    <PageContainter>
      <SmoothScrollContainer isScrolled={isScrolled}>
        <Container>
          <HomeNav>
            <Text variant="title2" weight="bold">
              {name}님 반가워요
            </Text>
            <Settings onClick={() => {}} />
          </HomeNav>
          {/* 등록 여부 */}
          {locked ? <HomeTitleLock /> : <HomeTitleUnlock />}
          <HomeSelectDrinks locked={locked} />
          <ScrollDown onClick={handleScrollDown}>
            <img
              className="w-16"
              src="/src/assets/scroll-down.gif"
              alt="스크롤 다운"
            />
          </ScrollDown>
        </Container>
        <Container>
          <ScrollUp onClick={handleScrollUp}>
            <img
              className="w-16"
              src="/src/assets/scroll-down.gif"
              alt="스크롤 업"
            />
          </ScrollUp>
          <ButtonWrapper>
            {mainButtonProps.map((buttonProps, index) => (
              <HomeMainButton key={index} {...buttonProps} />
            ))}
          </ButtonWrapper>
        </Container>
      </SmoothScrollContainer>
    </PageContainter>
  )
}

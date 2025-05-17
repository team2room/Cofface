import { HomeMainButton } from '@/features/home/components/home/HomeMainButton'
import { HomeSelectDrinks } from '@/features/home/components/home/HomeSelectDrinks'
import { HomeTitleLock } from '@/features/home/components/home/HomeTitleLock'
import { HomeTitleUnlock } from '@/features/home/components/home/HomeTitleUnlock'
import {
  HomeMainButtonProps,
  CheckingUserInfo,
} from '@/interfaces/HomeInterfaces'
import { Text } from '@/styles/typography'
import { Settings } from 'iconoir-react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import phone from '@/assets/phone.png'
import wallet from '@/assets/wallet.png'
import scrollDown from '@/assets/scroll-down.gif'
import { useAuthStore } from '@/stores/authStore'
import { checkRegistered } from '@/features/home/services/homeService'
import LoadingMessage from '@/components/LoadingMessage'
import { registerDeviceToken } from '@/services/notificationService'

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
  w-full h-screen overflow-hidden fixed top-0 left-0 overscroll-none touch-none
`

// 알림 권한 요청 컴포넌트 추가
const NotificationBanner = tw.div`
  fixed bottom-5 left-5 right-5 bg-white p-4 rounded-lg shadow-lg z-50
`

const NotificationHeader = tw.div`
  flex items-center justify-between mb-1
`

const NotificationActions = tw.div`
  flex gap-2 mt-3
`

const AllowButton = tw.button`
  bg-main text-white py-2 px-4 rounded-md flex-1
`

const LaterButton = tw.button`
  bg-gray text-darkGray py-2 px-4 rounded-md flex-1
`

// 스크롤 시 자연스럽게 움직이는 애니메이션 컨테이너
const SmoothScrollContainer = styled.div<{ isScrolled: boolean }>`
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  transform: translateY(${(props) => (props.isScrolled ? '-100vh' : '0')});
  height: 100vh;
  will-change: transform;
  overscroll-behavior: none;
  touch-action: pan-y;
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
  const { user } = useAuthStore()
  const name = user?.name || '오늘도'
  const [locked, setLocked] = useState<boolean>(true) // 기본값은 잠김 상태(true)로 설정
  const [loading, setLoading] = useState<boolean>(true) // 로딩 상태 추가

  const [isScrolled, setIsScrolled] = useState(false)
  const isScrollingRef = useRef(false)
  const touchStartY = useRef(0)

  const navigate = useNavigate()

  // 알림 관련 상태 추가
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)
  const [fcmTokenRegistered, setFcmTokenRegistered] = useState(false)

  // 알림 배너 표시 여부 결정
  useEffect(() => {
    if (user) {
      // 이미 알림 배너를 닫았거나 토큰이 등록되어 있는지 확인
      const notificationDismissed = localStorage.getItem(
        'notification_banner_dismissed',
      )
      const fcmToken = localStorage.getItem('fcm_token')

      if (!notificationDismissed && !fcmToken) {
        // 사용자에게 알림 배너 표시
        setTimeout(() => {
          setShowNotificationBanner(true)
        }, 2000) // 페이지 로드 후 2초 뒤에 표시
      } else if (fcmToken) {
        // 이미 토큰이 등록되어 있으면 등록됨으로 상태 설정
        setFcmTokenRegistered(true)
      }
    }
  }, [user])

  // 알림 허용 버튼 클릭 핸들러
  const handleAllowNotifications = async () => {
    try {
      const success = await registerDeviceToken()
      if (success) {
        console.log('FCM 토큰 등록 성공')
        setFcmTokenRegistered(true)
      } else {
        console.log('FCM 토큰 등록 실패 또는 권한 거부')
      }
    } catch (error) {
      console.error('FCM 토큰 등록 중 오류:', error)
    } finally {
      setShowNotificationBanner(false)
    }
  }

  // 나중에 버튼 클릭 핸들러
  const handleDismissNotifications = () => {
    // 배너를 다시 표시하지 않도록 로컬 스토리지에 저장
    localStorage.setItem('notification_banner_dismissed', 'true')
    setShowNotificationBanner(false)
  }

  // 페이지 로드 시 얼굴 등록 여부 확인
  useEffect(() => {
    const checkFaceRegistration = async () => {
      try {
        setLoading(true)

        // 사용자 정보가 없으면 로딩 중단
        if (!user || !user.id) {
          console.error('사용자 정보가 없습니다.')
          setLocked(true) // 사용자 정보가 없으면 잠김 상태로 설정
          setLoading(false)
          return
        }

        // 사용자 정보로 얼굴 등록 여부 확인 요청
        const checkingUserInfo: CheckingUserInfo = {
          phone_number: user.phoneNumber,
          name: user.name,
        }

        const isRegistered = await checkRegistered(checkingUserInfo)

        // 등록 여부에 따라 잠김 상태 업데이트
        setLocked(!isRegistered) // 등록되었으면 false(잠금 해제), 아니면 true(잠김)
        console.log(
          '얼굴 등록 여부:',
          isRegistered,
          '잠김 상태:',
          !isRegistered,
        )
      } catch (error) {
        console.error('얼굴 등록 여부 확인 중 오류:', error)
        setLocked(true) // 오류 발생 시 기본적으로 잠김 상태로 설정
      } finally {
        setLoading(false)
      }
    }

    checkFaceRegistration()
  }, [user])

  const mainButtonProps: HomeMainButtonProps[] = [
    {
      title: '얼굴 등록',
      content: '얼굴 정보를 등록하고\n 오더미 키오스크에서 편리하게 주문해요',
      src: phone,
      onClick: () => {
        navigate('/register/face')
      },
    },
    {
      title: '결제 정보 등록',
      content: '나의 결제 정보를 등록하고\n 오더미 키오스크에서 바로 결제해요',
      src: wallet,
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

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return <LoadingMessage />
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
            <Settings
              onClick={() => {
                navigate('/setting')
              }}
            />
          </HomeNav>
          {/* 등록 여부에 따라 다른 컴포넌트 표시 */}
          {locked ? <HomeTitleLock /> : <HomeTitleUnlock />}
          <HomeSelectDrinks locked={locked} />
          <ScrollDown onClick={handleScrollDown}>
            <img className="w-16" src={scrollDown} alt="스크롤 다운" />
          </ScrollDown>
        </Container>
        <Container>
          <ScrollUp onClick={handleScrollUp}>
            <img className="w-16" src={scrollDown} alt="스크롤 업" />
          </ScrollUp>
          <ButtonWrapper>
            {mainButtonProps.map((buttonProps, index) => (
              <HomeMainButton key={index} {...buttonProps} />
            ))}
          </ButtonWrapper>
        </Container>
        {/* 알림 권한 배너 추가 */}
        {showNotificationBanner && (
          <NotificationBanner>
            <NotificationHeader>
              <Text variant="body2" weight="bold">
                더 편리한 주문 서비스를 위해
              </Text>
            </NotificationHeader>
            <Text variant="body1">
              오더미 알림을 허용하면 주문 상태 및 매장 이용 알림을 받을 수
              있어요.
            </Text>
            <NotificationActions>
              <AllowButton onClick={handleAllowNotifications}>
                알림 허용하기
              </AllowButton>
              <LaterButton onClick={handleDismissNotifications}>
                나중에
              </LaterButton>
            </NotificationActions>
          </NotificationBanner>
        )}
      </SmoothScrollContainer>
    </PageContainter>
  )
}

import HomePage from './pages/home/HomePage'
import LoginConfirmPage from './pages/login/LoginConfirmPage'
import LoginVerifyPage from './pages/login/LoginVerifyPage'
import MainPage from './pages/login/MainPage'
import { FaceRegisterCapturePage } from './pages/register/FaceRegisterCapturePage'
import { FaceRegisterConfirmPage } from './pages/register/FaceRegisterConfirmPage'
import { FaceRegisterPage } from './pages/register/FaceRegisterPage'
import { PayRegisterPage } from './pages/register/PayRegisterPage'
import { SettingPage } from './pages/setting/SettingPage'
import { SettingPayPage } from './pages/setting/SettingPayPage'
import { HeadMotionPage } from './pages/motion/HeadMotionPage'
import BackgroundMotionService from './features/motion/services/BackgroundMotionService'
import Fonts from './styles/fonts'
import { Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MotionEventBus } from './features/motion/services/MotionEventBus'
import AuthService from './features/motion/services/AuthService'

function App() {
  const navigate = useNavigate()
  const [isMotionActive, setIsMotionActive] = useState(false)

  // 모션 인식 서비스 초기화 및 이벤트 구독
  useEffect(() => {
    // 모션 이벤트 구독
    const subscription = MotionEventBus.subscribe((event) => {
      console.log('모션 이벤트 감지:', event.type)

      // 모션 유형에 따른 처리
      if (event.type === 'HEAD_SHAKE') {
        console.log('도리도리 감지됨: 취소 동작 가능')
      } else if (event.type === 'HEAD_NOD') {
        console.log('끄덕임 감지됨: 확인 동작 가능')
      }
    })

    // 백그라운드 모션 서비스 초기화 - 여기서는 실행하지 않고 초기화만 수행
    ;(async () => {
      try {
        await BackgroundMotionService.initialize()
        console.log('백그라운드 모션 서비스 초기화 완료')

        // 이미 로그인되어 있으면 모션 감지 시작
        if (AuthService.isLoggedIn()) {
          console.log('기존 로그인 상태 감지됨, 모션 감지 시작')
          await BackgroundMotionService.start()
          setIsMotionActive(true)
        }
      } catch (error) {
        console.error('백그라운드 모션 서비스 초기화 오류:', error)
      }
    })()

    // 인증 상태 변경 리스너는 이제 필요한 UI 상태 업데이트만 처리
    const handleAuthChange = (event: any) => {
      const { type } = event.detail
      console.log(`인증 상태 변경: ${type}`)
      setIsMotionActive(type === 'login')
    }

    // 인증 상태 변경 리스너 등록
    AuthService.addAuthStateListener(handleAuthChange)

    // 키보드 단축키 설정 (시뮬레이션용)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+L: 로그인 시뮬레이션
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        AuthService.login({ id: 'user123', name: '테스트 사용자' })
      }
      // Ctrl+Shift+O: 로그아웃 시뮬레이션
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        AuthService.logout()
      }
      // Ctrl+Shift+M: 모션 감지 토글 (수동)
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        if (isMotionActive) {
          BackgroundMotionService.stop()
          setIsMotionActive(false)
          console.log('모션 감지 수동 중지')
        } else {
          BackgroundMotionService.start()
            .then(() => {
              setIsMotionActive(true)
              console.log('모션 감지 수동 시작')
            })
            .catch((err) => {
              console.error('모션 감지 시작 오류:', err)
            })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // 개발 도구에 테스트 함수 추가
    if (process.env.NODE_ENV === 'development') {
      ;(window as any).motionTest = {
        login: () =>
          AuthService.login({ id: 'user123', name: '테스트 사용자' }),
        logout: () => AuthService.logout(),
        startMotion: () => BackgroundMotionService.start(),
        stopMotion: () => BackgroundMotionService.stop(),
        isRunning: () => BackgroundMotionService.isRunning(),
        isInitialized: () => BackgroundMotionService.isInitialized(),
      }

      console.log(
        '모션 테스트 도구가 준비되었습니다. Console에서 window.motionTest 객체를 사용하세요.',
      )
    }

    return () => {
      subscription.unsubscribe()
      AuthService.removeAuthStateListener(handleAuthChange)
      window.removeEventListener('keydown', handleKeyDown)
      BackgroundMotionService.stop()
      console.log('App 정리: 모션 감지 중지됨')
    }
  }, [isMotionActive, navigate])

  return (
    <>
      <Fonts />

      {/* 모션 인식 상태 표시 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            padding: '5px 10px',
            background: isMotionActive
              ? 'rgba(0, 200, 0, 0.7)'
              : 'rgba(200, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          모션 인식: {isMotionActive ? '활성화됨' : '비활성화됨'}
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<MainPage />} />
        <Route path="/login/verify" element={<LoginVerifyPage />} />
        <Route path="/login/confirm" element={<LoginConfirmPage />} />

        <Route path="/register/face" element={<FaceRegisterPage />} />
        <Route
          path="/register/face/capture"
          element={<FaceRegisterCapturePage />}
        />
        <Route
          path="/register/face/confirm"
          element={<FaceRegisterConfirmPage />}
        />
        <Route path="/register/pay" element={<PayRegisterPage />} />

        <Route path="/setting" element={<SettingPage />} />
        <Route path="/setting/pay" element={<SettingPayPage />} />

        {/* 헤드 모션 테스트 페이지 */}
        <Route path="/motion" element={<HeadMotionPage />} />
      </Routes>
    </>
  )
}

export default App

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
// import { HeadMotionTestPage } from './pages/motion/HeadMotionTestPage'
import KioskMotionWrapper from './features/motion/components/KioskMotionWrapper'
import Fonts from './styles/fonts'
import { Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MotionEventBus } from './features/motion/services/MotionEventBus'

function App() {
  const navigate = useNavigate()
  // 개발 환경에서 디버그 모드 활성화 여부
  const [debugMotion, setDebugMotion] = useState(
    process.env.NODE_ENV === 'development',
  )
  // 모션 감지 활성화 여부 (로그인 상태에 따라 변경 예정)
  const [motionActive, setMotionActive] = useState(false)

  // 전역 모션 이벤트 리스너
  useEffect(() => {
    // 모션 이벤트 구독
    const subscription = MotionEventBus.subscribe((event) => {
      console.log('전역 모션 이벤트 감지:', event.type)

      // 예시: 특정 모션에 따른 네비게이션 처리
      if (
        event.type === 'QUICK_LEFT_TURN' &&
        event.source === 'motion-service'
      ) {
        // 예: 뒤로 가기 기능
        // navigate(-1);
        console.log('왼쪽 회전 감지: 뒤로가기 동작 가능')
      } else if (
        event.type === 'QUICK_RIGHT_TURN' &&
        event.source === 'motion-service'
      ) {
        console.log('오른쪽 회전 감지: 다음 화면 이동 동작 가능')
      } else if (
        event.type === 'HEAD_SHAKE' &&
        event.source === 'motion-service'
      ) {
        console.log('머리 흔들기 감지: 취소 동작 가능')
      } else if (
        event.type === 'HEAD_NOD' &&
        event.source === 'motion-service'
      ) {
        console.log('고개 끄덕임 감지: 확인 동작 가능')
      }
    })

    // 키보드 이벤트 리스너 (디버그용)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D를 누르면 디버그 모드 토글
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMotion((prev) => !prev)
        console.log(`모션 디버그 모드: ${!debugMotion}`)
      }
      // Ctrl+Shift+M을 누르면 모션 감지 토글
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        setMotionActive((prev) => !prev)
        console.log(`모션 감지: ${!motionActive}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate, debugMotion, motionActive])

  return (
    <>
      <Fonts />

      {/* 모션 감지 컴포넌트 (motionActive가 true일 때만 렌더링) */}
      {motionActive && <KioskMotionWrapper debug={debugMotion} />}

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

        {/* 헤드 모션 관련 경로 (개발용) */}
        {/* <Route path="/motion" element={<HeadMotionPage />} /> */}
        <Route path="/motion" element={<HeadMotionPage />} />
      </Routes>
    </>
  )
}

export default App

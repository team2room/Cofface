import HomePage from './pages/home/HomePage'
import LoginConfirmPage from './pages/login/LoginConfirmPage'
import LoginVerifyPage from './pages/login/LoginVerifyPage'
import MainPage from './pages/login/MainPage'
import {FaceRegisterCapturePage} from './pages/register/FaceRegisterCapturePage'
import {FaceRegisterConfirmPage} from './pages/register/FaceRegisterConfirmPage'
import { FaceRegisterPage } from './pages/register/FaceRegisterPage'
import { PayRegisterPage } from './pages/register/PayRegisterPage'
import { SettingPage } from './pages/setting/SettingPage'
import { SettingPayPage } from './pages/setting/SettingPayPage'
import { HeadMotionPage } from './pages/motion/HeadMotionPage'
import { HeadMotionTestPage } from './pages/motion/HeadMotionTestPage'
import Fonts from './styles/fonts'
import { Route, Routes } from 'react-router-dom'
// 전역 모션 이벤트 리스너 (옵션)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MotionEventBus } from './services/MotionEventBus' 

function App() {
  const navigate = useNavigate();

  // 전역 모션 이벤트 리스너 (옵션)
  useEffect(() => {
    // 모션 이벤트 구독 (전역 네비게이션 등을 위해 사용)
    const subscription = MotionEventBus.subscribe(event => {
      console.log('전역 모션 이벤트 감지:', event.type);
      
      // 예시: 특정 모션을 특정 페이지에서 감지했을 때 네비게이션
      if (event.type === 'QUICK_LEFT_TURN' && event.source === 'home') {
        navigate(-1); // 뒤로 가기
      }
      
      // 다른 전역 모션 처리 로직...
    });
    
    return () => {
      // 컴포넌트 언마운트 시 구독 해제
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  return (
    <>
      <Fonts />
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
        
        {/* 헤드 모션 관련 새로운 경로 */}
        <Route path="/motion" element={<HeadMotionPage />} />
        <Route path="/motion/test" element={<HeadMotionTestPage />} />
      </Routes>
    </>
  )
}

export default App
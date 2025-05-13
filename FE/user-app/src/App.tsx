import AuthRedirect from './components/AuthRedirect'
import ProtectedRoute from './components/ProtectedRoute'
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
import Fonts from './styles/fonts'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <>
      <Fonts />
      <Routes>
        {/* 인증 상태 따라 분기 */}
        <Route path="/" element={<AuthRedirect />} />

        {/* 공개 라우트 */}
        <Route path="/login" element={<MainPage />} />
        <Route path="/login/verify" element={<LoginVerifyPage />} />
        <Route path="/login/confirm" element={<LoginConfirmPage />} />

        {/* 보호된 라우트 */}
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />

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
        </Route>

        {/* 이 외 페이지 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

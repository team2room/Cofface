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
import Fonts from './styles/fonts'
import { Route, Routes } from 'react-router-dom'

function App() {
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
      </Routes>
    </>
  )
}

export default App

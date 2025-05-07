import HomePage from './pages/home/HomePage'
import LoginConfirmPage from './pages/login/LoginConfirmPage'
import LoginVerifyPage from './pages/login/LoginVerifyPage'
import MainPage from './pages/login/MainPage'
import { FaceRegisterPage } from './pages/register/FaceRegisterPage'
import { PayRegisterPage } from './pages/register/PayRegisterPage'
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
        <Route path="/register/pay" element={<PayRegisterPage />} />
      </Routes>
    </>
  )
}

export default App

import 'react-simple-keyboard/build/css/index.css'
import { Route, Routes } from 'react-router-dom'
import Fonts from './styles/fonts'
import AdminLoginPage from './pages/adminLogin/AdminLoginPage'
import UserLoginPage from './pages/userLogin/UserLoginPage'
import GlobalRippleEffect from './styles/RippleEffect'
import OrderPage from './pages/order/OrderPage'
import LoadingPage from './pages/LoadingPage'
import { SuccessPage } from './pages/pay/SuccessPage'
import { FailPage } from './pages/pay/FailPage'
import PayPage from './pages/pay/PayPage'

function App() {
  return (
    <>
      <Fonts />
      <GlobalRippleEffect />
      <Routes>
        {/* 관리자 로그인 */}
        <Route path="/" element={<AdminLoginPage />} />

        {/* 시작 화면 */}
        <Route path="/user" element={<UserLoginPage />} />

        {/* 메뉴 화면 */}
        <Route path="/order" element={<OrderPage />} />

        {/* 로딩 화면 */}
        <Route path="/loading" element={<LoadingPage />} />

        {/* 결제 페이지 */}
        <Route path="/pay" element={<PayPage />} />

        {/* 결제 성공 페이지 */}
        <Route path="/pay/success" element={<SuccessPage />} />

        {/* 결제 실패 페이지 */}
        <Route path="/pay/fail" element={<FailPage />} />
      </Routes>
    </>
  )
}

export default App

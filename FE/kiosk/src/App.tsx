import 'react-simple-keyboard/build/css/index.css'
import { Route, Routes } from 'react-router-dom'
import Fonts from './styles/fonts'
import AdminLoginPage from './pages/adminLogin/AdminLoginPage'
import UserLoginPage from './pages/userLogin/UserLoginPage'
import GlobalRippleEffect from './styles/RippleEffect'
import MenuPage from './pages/order/MenuPage'
import PlaceSelectPage from './pages/order/PlaceSelectPage'

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
        <Route path="/order" element={<MenuPage />} />

        {/* 장소 선택 */}
        <Route path="/place" element={<PlaceSelectPage />} />
      </Routes>
    </>
  )
}

export default App

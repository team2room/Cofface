import 'react-simple-keyboard/build/css/index.css'
import { Route, Routes } from 'react-router-dom'
import Fonts from './styles/fonts'
import AdminLoginPage from './pages/adminLogin/AdminLoginPage'
import UserLoginPage from './pages/userLogin/UserLoginPage'

function App() {
  return (
    <>
      <Fonts />
      <Routes>
        {/* 관리자 로그인 */}
        <Route path="/" element={<AdminLoginPage />} />

        {/* 시작 화면 */}
        <Route path="/user" element={<UserLoginPage />} />
      </Routes>
    </>
  )
}

export default App

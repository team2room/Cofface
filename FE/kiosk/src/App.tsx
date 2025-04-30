import { Route, Routes } from 'react-router-dom'
import Fonts from './styles/fonts'
import AdminLoginPage from './pages/adminLogin/AdminLoginPage'
import 'react-simple-keyboard/build/css/index.css'

function App() {
  return (
    <>
      <Fonts />
      <Routes>
        <Route path="/" element={<AdminLoginPage />} />
      </Routes>
    </>
  )
}

export default App

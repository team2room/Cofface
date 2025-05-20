import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import '@/firebaseConfig'
import { registerServiceWorker } from './utils/firebaseUtils.ts'

// 앱 시작 함수
const startApp = async () => {
  // 페이지 로드 시 서비스 워커 등록 시도
  try {
    const swRegistered = await registerServiceWorker()
    console.log('main.tsx에서 서비스 워커 등록 결과:', swRegistered)
  } catch (error) {
    console.error('main.tsx에서 서비스 워커 등록 중 오류:', error)
  }
  // 앱 렌더링
  createRoot(document.getElementById('root')!).render(
    <CookiesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CookiesProvider>,
  )
}

startApp()

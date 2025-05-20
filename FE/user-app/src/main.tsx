import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import '@/firebaseConfig'

// Service Worker 등록 함수
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        {
          scope: '/',
        },
      )
      console.log('Service Worker 등록 성공:', registration)

      // 개발 환경에서 Service Worker 강제 업데이트
      if (process.env.NODE_ENV === 'development') {
        registration.update()
      }
    } catch (error) {
      console.error('Service Worker 등록 실패:', error)
    }
  } else {
    console.warn('이 브라우저는 Service Worker를 지원하지 않습니다.')
  }
}

// 앱 시작 함수
const startApp = async () => {
  // Service Worker 등록
  await registerServiceWorker()

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

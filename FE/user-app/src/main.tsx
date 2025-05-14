// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'
// import { BrowserRouter } from 'react-router-dom'
// import { CookiesProvider } from 'react-cookie'

// createRoot(document.getElementById('root')!).render(
//   <CookiesProvider>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </CookiesProvider>,
// )

// public/mockServiceWorker.js 파일이 있는지 확인
// 없다면 다음 명령어로 생성해야 합니다
// npx msw init public/ --save

// 서비스 워커 로딩 로직 수정
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { startMSW } from './mocks/mockStore.ts'

// MSW 활성화
async function startApp() {
  // 개발 환경에서만 MSW 시작
  if (process.env.NODE_ENV === 'development') {
    // 서비스 워커 등록이 완료될 때까지 기다림
    await startMSW()
    console.log('MSW 초기화 완료, 애플리케이션 시작')
  }

  // 애플리케이션 렌더링
  createRoot(document.getElementById('root')!).render(
    <CookiesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CookiesProvider>,
  )
}

startApp()

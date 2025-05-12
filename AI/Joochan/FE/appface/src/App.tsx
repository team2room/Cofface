// src/App.tsx
import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom'

import FaceVerification from './components/face-verification/FaceVerification'
import FaceRegistration from './components/FaceRegistration'

// 환경 변수에서 API URL 가져오기 또는 기본값 설정
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// 사용자 정보 인터페이스
interface User {
  id: string
  name: string
  isRegistered: boolean
}

const App: React.FC = () => {
  // 상태 관리
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [serverStatus, setServerStatus] = useState<
    'online' | 'offline' | 'checking'
  >('checking')
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({ show: false, message: '', type: 'info' })

  // 서버 상태 확인
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/health`)
        if (response.ok) {
          setServerStatus('online')
        } else {
          setServerStatus('offline')
        }
      } catch (error) {
        console.error('서버 연결 오류:', error)
        setServerStatus('offline')
      }
    }

    checkServerStatus()
    // 30초마다 서버 상태 확인
    const intervalId = setInterval(checkServerStatus, 30000)

    return () => clearInterval(intervalId)
  }, [])

  // 알림 표시 함수
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    setNotification({ show: true, message, type })

    // 5초 후 알림 자동 숨김
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }))
    }, 5000)
  }

  // 로그인 처리
  const handleLogin = (
    userId: string,
    userName: string,
    isRegistered: boolean = false,
  ) => {
    setCurrentUser({ id: userId, name: userName, isRegistered })
    setIsLoggedIn(true)
    showNotification(`${userName}님, 환영합니다!`, 'success')
  }

  // 로그아웃 처리
  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    showNotification('로그아웃 되었습니다.', 'info')
  }

  // 얼굴 등록 완료 처리
  const handleRegistrationComplete = (success: boolean, message: string) => {
    if (success && currentUser) {
      setCurrentUser({ ...currentUser, isRegistered: true })
      showNotification('얼굴 등록이 완료되었습니다!', 'success')
    } else {
      showNotification(`얼굴 등록 실패: ${message}`, 'error')
    }
  }

  // 얼굴 인증 완료 처리
  const handleVerificationComplete = (
    success: boolean,
    userId?: string,
    confidence?: number,
  ) => {
    if (success && userId) {
      showNotification(
        `사용자 인증 성공! 신뢰도: ${(confidence || 0) * 100}%`,
        'success',
      )
      // 여기에 인증 후 처리 로직 추가 (예: 결제 프로세스로 이동)
    } else {
      showNotification('사용자 인증 실패. 다시 시도해주세요.', 'error')
    }
  }

  // 간단한 로그인 폼
  const LoginForm = () => {
    const [userId, setUserId] = useState('')
    const [userName, setUserName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (userId && userName) {
        // 실제 구현에서는 백엔드 API를 통한 인증 필요
        handleLogin(userId, userName, false)
      }
    }

    return (
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              사용자 ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="사용자 ID를 입력하세요"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              이름
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
          >
            로그인
          </button>
        </form>
      </div>
    )
  }

  // 홈 화면
  const Home = () => (
    <div className="w-full max-w-md mx-auto px-4 py-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-green-600">
        안면인식 시스템
      </h1>
      <p className="text-gray-700 mb-8">
        안면인식 기반 결제 시스템에 오신 것을 환영합니다.
      </p>

      {isLoggedIn ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            {currentUser?.name}님, 환영합니다!
          </h2>
          <p className="mb-4">다음 중 원하는 작업을 선택하세요:</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {!currentUser?.isRegistered && (
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
              >
                얼굴 등록
              </Link>
            )}
            <Link
              to="/verify"
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              얼굴 인증
            </Link>
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              로그아웃
            </button>
          </div>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  )

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 헤더 */}
        <header className="bg-white shadow-sm p-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="text-xl font-bold text-green-600">
                얼굴인식 시스템
              </Link>
            </div>
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-green-600 transition"
                >
                  홈
                </Link>
                {isLoggedIn && (
                  <>
                    {!currentUser?.isRegistered && (
                      <Link
                        to="/register"
                        className="text-gray-700 hover:text-green-600 transition"
                      >
                        얼굴 등록
                      </Link>
                    )}
                    <Link
                      to="/verify"
                      className="text-gray-700 hover:text-green-600 transition"
                    >
                      얼굴 인증
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center text-sm">
                서버 상태:
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ml-2 ${
                    serverStatus === 'online'
                      ? 'bg-green-500'
                      : serverStatus === 'offline'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                ></span>
              </div>
            </div>
          </div>
        </header>

        {/* 알림 메시지 */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center justify-between min-w-64 max-w-xs sm:max-w-md animate-slideIn
              ${
                notification.type === 'success'
                  ? 'bg-green-500 text-white'
                  : notification.type === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
              }`}
          >
            {notification.message}
            <button
              className="ml-4 text-white text-xl"
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
            >
              &times;
            </button>
          </div>
        )}

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-4 max-w-4xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/register"
              element={
                isLoggedIn ? (
                  <FaceRegistration
                    userId={currentUser?.id || ''}
                    apiUrl={API_URL}
                    onComplete={handleRegistrationComplete}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/verify"
              element={
                <FaceVerification
                  apiUrl={API_URL}
                  onVerificationComplete={handleVerificationComplete}
                  autoStart={false}
                  timeout={30000}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

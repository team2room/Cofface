// src/App.tsx

import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom'

// 올바른 경로로 import
import FaceVerification from './components/face-verification/FaceVerification'
import FaceRegistration from './components/face-registration/FaceRegistration'
import Button from './components/common/Button'
import Notification from './components/common/Notification'
import apiService, { type ServerStatus } from './services/api'
import { type User } from './types/user'

const App: React.FC = () => {
  // 상태 관리
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'info'
  }>({ show: false, message: '', type: 'info' })

  // API URL 설정 (apiService에서 직접 접근하지 않음)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // 서버 상태 확인
  useEffect(() => {
    const checkServerStatus = async () => {
      const status = await apiService.checkServerStatus()
      setServerStatus(status)
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
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
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
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
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
          <Button onClick={handleSubmit} type="submit" className="w-full">
            로그인
          </Button>
        </form>
      </div>
    )
  }

  // 홈 화면
  const Home = () => (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">안면인식 시스템</h1>
      <p className="text-xl mb-8 text-center">
        안면인식 기반 결제 시스템에 오신 것을 환영합니다.
      </p>
      {isLoggedIn ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <p className="text-lg mb-4">{currentUser?.name}님, 환영합니다!</p>
          <p className="mb-6">다음 중 원하는 작업을 선택하세요:</p>
          <div className="flex flex-col space-y-4 w-full">
            {!currentUser?.isRegistered && (
              <Link to="/register" className="w-full btn-primary">
                <Button type="primary" className="w-full">
                  얼굴 등록
                </Button>
              </Link>
            )}
            <Link to="/verify" className="w-full">
              <Button type="success" className="w-full">
                얼굴 인증
              </Button>
            </Link>
            <Button onClick={handleLogout} type="secondary" className="w-full">
              로그아웃
            </Button>
          </div>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  )

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-green-600">
              안면인식 시스템
            </Link>
            {serverStatus !== 'online' && (
              <div className="text-sm text-red-500">
                {serverStatus === 'checking'
                  ? '서버 연결 확인 중...'
                  : '서버 연결 오류'}
              </div>
            )}
          </div>
        </header>

        {/* 알림 메시지 */}
        <Notification
          show={notification.show}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
          position="top-right"
        />

        {/* 메인 컨텐츠 */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            {isLoggedIn ? (
              <>
                <Route
                  path="/register"
                  element={
                    <FaceRegistration
                      userId={currentUser?.id || ''}
                      onComplete={handleRegistrationComplete}
                    />
                  }
                />
                <Route
                  path="/verify"
                  element={
                    <FaceVerification
                      apiUrl={API_URL}
                      onVerificationComplete={handleVerificationComplete}
                    />
                  }
                />
              </>
            ) : (
              <>
                <Route path="/register" element={<Navigate to="/" replace />} />
                <Route path="/verify" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

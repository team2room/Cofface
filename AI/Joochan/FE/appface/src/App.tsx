// src/App.tsx
import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom'
import FaceRegistration from './components/FaceRegistration'
// FaceVerification 컴포넌트가 아직 없는 경우를 위한 임시 컴포넌트
const FaceVerification = ({
  apiUrl,
  onVerificationComplete,
  autoStart,
  timeout,
}: {
  apiUrl: string
  onVerificationComplete: (
    success: boolean,
    userId?: string,
    confidence?: number,
  ) => void
  autoStart?: boolean
  timeout?: number
}) => {
  return (
    <div>
      <h2>얼굴 인증</h2>
      <p>이 기능은 아직 구현 중입니다.</p>
      <button onClick={() => onVerificationComplete(false)}>돌아가기</button>
    </div>
  )
}

import './App.css'

// 환경 변수에서 API URL 가져오기 또는 기본값 설정
// process 변수 관련 오류 해결
const API_URL =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  'http://localhost:8000'

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
      <div className="login-container">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>사용자 ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="사용자 ID를 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            로그인
          </button>
        </form>
      </div>
    )
  }

  // 홈 화면
  const Home = () => (
    <div className="home-container">
      <h1>안면인식 시스템</h1>
      <p>안면인식 기반 결제 시스템에 오신 것을 환영합니다.</p>

      {isLoggedIn ? (
        <div className="user-options">
          <h2>{currentUser?.name}님, 환영합니다!</h2>
          <p>다음 중 원하는 작업을 선택하세요:</p>
          <div className="button-group">
            {!currentUser?.isRegistered && (
              <Link to="/register" className="btn-primary">
                얼굴 등록
              </Link>
            )}
            <Link to="/verify" className="btn-primary">
              얼굴 인증
            </Link>
            <button onClick={handleLogout} className="btn-secondary">
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
      <div className="app-container">
        {/* 헤더 */}
        <header className="app-header">
          <div className="logo">
            <Link to="/">얼굴인식 시스템</Link>
          </div>
          <div className="nav-links">
            <Link to="/">홈</Link>
            {isLoggedIn && (
              <>
                {!currentUser?.isRegistered && (
                  <Link to="/register">얼굴 등록</Link>
                )}
                <Link to="/verify">얼굴 인증</Link>
              </>
            )}
          </div>
          <div className="server-status">
            서버 상태:
            <span className={`status-indicator ${serverStatus}`}></span>
          </div>
        </header>

        {/* 알림 메시지 */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button
              className="close-btn"
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
            >
              &times;
            </button>
          </div>
        )}

        {/* 메인 컨텐츠 */}
        <main className="app-content">
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

        {/* 푸터 */}
        <footer className="app-footer">
          <p>&copy; 2025 안면인식 결제 시스템. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App

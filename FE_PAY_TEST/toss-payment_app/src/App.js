import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';
import { isAuthenticated, debugAuthState } from './utils/authUtils';
import { extendSession } from './api/authApi';
import './App.css';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ element }) => {
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  return element;
};

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  
  // 세션 연장 로직
  useEffect(() => {
    const authenticated = isAuthenticated();
    
    if (authenticated) {
      setSessionActive(true);
      
      // 토큰 세션 연장을 위한 타이머 설정 (50초마다)
      const sessionTimer = setInterval(async () => {
        try {
          // 키오스크 ID는 기본값으로 1 설정 (필요에 따라 변경)
          const response = await extendSession(1);
          
          if (response.success) {
            console.log('세션이 성공적으로 연장되었습니다.');
            // 응답에서 새 토큰 저장 (필요한 경우)
            if (response.data && response.data.accessToken) {
              localStorage.setItem('accessToken', response.data.accessToken);
            }
          } else {
            console.warn('세션 연장 실패:', response.message);
            clearInterval(sessionTimer);
            setSessionActive(false);
          }
        } catch (error) {
          console.error('세션 연장 오류:', error);
          clearInterval(sessionTimer);
          setSessionActive(false);
        }
      }, 50000); // 50초마다 (토큰 만료 60초보다 약간 짧게)
      
      // 컴포넌트 언마운트 시 타이머 정리
      return () => {
        clearInterval(sessionTimer);
      };
    }
  }, []);
  
  // 개발 모드에서 인증 상태 표시
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const authState = debugAuthState();
      console.log('현재 인증 상태:', authState);
    }
  }, [sessionActive]);
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment" element={
            <ProtectedRoute element={<PaymentPage />} />
          } />
          <Route path="/success" element={
            <ProtectedRoute element={<SuccessPage />} />
          } />
          <Route path="/fail" element={
            <ProtectedRoute element={<FailPage />} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
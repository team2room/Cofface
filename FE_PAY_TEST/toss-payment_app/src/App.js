import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/authUtils';

// 페이지 컴포넌트 임포트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import FailPage from './pages/FailPage';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* 홈 페이지 */}
          <Route path="/" element={<HomePage />} />
          
          {/* 로그인 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 결제 페이지 (인증 필요) */}
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 결제 성공 페이지 */}
          <Route path="/success" element={<SuccessPage />} />
          
          {/* 결제 실패 페이지 */}
          <Route path="/fail" element={<FailPage />} />
          
          {/* 존재하지 않는 경로는 홈으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
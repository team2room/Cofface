import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { phoneLogin } from '../api/authApi';
import { setTokens, setUser } from '../utils/authUtils';
import '../styles/Login.css';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/payment';
  
  const handlePhoneChange = (e) => {
    // 전화번호 입력 형식 제한 (숫자만)
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
  };
  
  // 전화번호 형식화 (010-1234-5678)
  const formatPhoneNumber = (value) => {
    if (!value) return '';
    
    const numbers = value.replace(/[^0-9]/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 전화번호 유효성 검사
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhoneNumber || cleanPhoneNumber.length < 10) {
      setError('유효한 전화번호를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 전화번호 로그인 API 호출
      const response = await phoneLogin(cleanPhoneNumber);
      
      // 로그인 성공 처리
      if (response.success) {
        // 토큰 및 사용자 정보 저장
        const { accessToken, refreshToken, user } = response.data;
        
        setTokens(accessToken, refreshToken);
        setUser(user);
        
        setLoginSuccess(true);
        
        // 리다이렉션 전 딜레이 (사용자 피드백을 위해)
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      
      // 오류 메시지 처리
      if (err.status === 404) {
        setError('등록되지 않은 전화번호입니다.');
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">로그인</h1>
        <p className="login-subtitle">전화번호로 로그인하여 결제를 진행하세요.</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호</label>
            <input
              type="tel"
              id="phoneNumber"
              value={formatPhoneNumber(phoneNumber)}
              onChange={handlePhoneChange}
              placeholder="전화번호를 입력하세요"
              required
              disabled={loading || loginSuccess}
            />
            <small>예: 010-1234-5678</small>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {loginSuccess && <div className="success-message">로그인이 완료되었습니다. 결제 페이지로 이동합니다...</div>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading || loginSuccess}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <p className="register-text">
          계정이 없으신가요? <a href="/register">회원가입</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
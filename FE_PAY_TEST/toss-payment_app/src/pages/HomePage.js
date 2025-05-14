import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';
import { logout } from '../api/authApi';
import '../styles/Home.css';

const HomePage = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  
  return (
    <div className="home-container">
      <h1 className="home-title">토스 결제 테스트</h1>
      <p className="home-description">
        React와 토스 페이먼츠 결제 위젯을 활용한 결제 시스템 테스트입니다.
      </p>
      
      <div className="home-buttons">
        {authenticated ? (
          <>
            <Link to="/payment" className="home-button">
              결제 테스트 시작하기
            </Link>
            <button onClick={handleLogout} className="home-button logout-button">
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" className="home-button">
            로그인하여 시작하기
          </Link>
        )}
      </div>
      
      <div className="home-info">
        <h2>테스트 정보</h2>
        <p>
          이 프로젝트는 토스 페이먼츠의 결제 위젯을 사용하여 간편하게 결제를 
          테스트할 수 있는 환경을 제공합니다.
        </p>
        <p>
          테스트 모드에서는 실제 결제가 발생하지 않으므로 안심하고 테스트할 수 있습니다.
        </p>
        
        <h3>테스트 카드 정보</h3>
        <ul>
          <li>카드 번호: 4111 1111 1111 1111</li>
          <li>만료일: 12/25</li>
          <li>생년월일/사업자번호: 850101</li>
          <li>비밀번호: 첫 2자리 (예: 00)</li>
        </ul>
        
        <h3>테스트 전화번호</h3>
        <p>
          로그인에 사용할 수 있는 테스트용 전화번호입니다.
        </p>
        <ul>
          <li>010-1234-5678 (예시, 백엔드에 등록된 번호 사용)</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
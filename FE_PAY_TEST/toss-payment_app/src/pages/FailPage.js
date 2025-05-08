import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Payment.css';

const FailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL 쿼리 파라미터 파싱
  const query = new URLSearchParams(location.search);
  const code = query.get('code');
  const message = query.get('message');
  const orderId = query.get('orderId');
  
  const handleGoBack = () => {
    navigate('/payment'); // 결제 페이지로 돌아가기
  };
  
  return (
    <div className="payment-container">
      <div className="payment-fail">
        <h1>결제 실패</h1>
        <div className="fail-icon">✗</div>
        <p className="fail-message">결제 중 오류가 발생했습니다.</p>
        
        <div className="payment-info">
          <h2>오류 정보</h2>
          {code && (
            <div className="info-row">
              <span>오류 코드:</span>
              <span>{code}</span>
            </div>
          )}
          {message && (
            <div className="info-row">
              <span>오류 메시지:</span>
              <span>{message}</span>
            </div>
          )}
          {orderId && (
            <div className="info-row">
              <span>주문 번호:</span>
              <span>{orderId}</span>
            </div>
          )}
        </div>
        
        <div className="buttons-container">
          <button onClick={handleGoBack} className="payment-button primary">
            다시 시도하기
          </button>
          <button onClick={() => navigate('/')} className="payment-button secondary">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailPage;
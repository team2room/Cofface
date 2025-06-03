import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handlePaymentFailure } from '../api/paymentApi';
import '../styles/Payment.css';

const FailPage = () => {
  const [errorInfo, setErrorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const processFailure = async () => {
      // URL 쿼리 파라미터 파싱
      const query = new URLSearchParams(location.search);
      const orderId = query.get('orderId');
      const code = query.get('code');
      const message = query.get('message');
      
      if (!orderId) {
        setError('주문 정보가 누락되었습니다.');
        setLoading(false);
        return;
      }
      
      try {
        // 결제 실패 정보 저장
        setErrorInfo({
          orderId: parseInt(orderId, 10),
          code: code || 'UNKNOWN',
          message: message || '알 수 없는 오류'
        });
        
        // 결제 실패 처리 API 호출
        await handlePaymentFailure(
          parseInt(orderId, 10),
          code || 'UNKNOWN',
          message || '알 수 없는 오류'
        );
      } catch (err) {
        console.error('결제 실패 처리 오류:', err);
        setError(err.message || '결제 실패 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    processFailure();
  }, [location]);
  
  const handleRetry = () => {
    navigate('/payment');
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <h2>결제 실패 처리 중...</h2>
          <p>잠시만 기다려주세요.</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-container">
      <div className="payment-failed">
        <h1>결제 실패</h1>
        <div className="failed-icon">✗</div>
        <p className="failed-message">
          {errorInfo?.message || error || '결제 처리 중 오류가 발생했습니다.'}
        </p>
        
        {errorInfo && (
          <div className="error-info">
            <h2>오류 정보</h2>
            <div className="info-row">
              <span>주문 번호:</span>
              <span>{errorInfo.orderId}</span>
            </div>
            <div className="info-row">
              <span>오류 코드:</span>
              <span>{errorInfo.code}</span>
            </div>
          </div>
        )}
        
        <div className="failed-buttons">
          <button onClick={handleRetry} className="retry-button">
            다시 시도하기
          </button>
          <button onClick={handleGoHome} className="home-button">
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailPage;
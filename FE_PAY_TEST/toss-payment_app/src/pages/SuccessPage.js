import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { approvePayment } from '../api/paymentApi';
import '../styles/Payment.css';

const SuccessPage = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const processPayment = async () => {
      // URL 쿼리 파라미터 파싱
      const query = new URLSearchParams(location.search);
      const paymentKey = query.get('paymentKey');
      const orderId = query.get('orderId');
      const amount = query.get('amount');
      
      if (!paymentKey || !orderId || !amount) {
        setError('필수 결제 정보가 누락되었습니다.');
        setLoading(false);
        return;
      }
      
      try {
        // 결제 승인 API 호출
        const result = await approvePayment({
          paymentKey,
          orderId,
          amount: parseFloat(amount)
        });
        
        setPaymentResult(result.data);
        
        // 결제 성공 시 처리 (예: 홈으로 리다이렉트 타이머 설정)
        // setTimeout(() => {
        //   navigate('/');
        // }, 5000);
      } catch (err) {
        console.error('결제 승인 오류:', err);
        setError(err.response?.data?.message || err.message || '결제 승인 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    processPayment();
  }, [location, navigate]);
  
  const handleGoBack = () => {
    navigate('/');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };
  
  if (loading) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <h2>결제 승인 중...</h2>
          <p>잠시만 기다려주세요.</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="payment-container">
        <div className="payment-error">
          <h1>결제 오류</h1>
          <p className="error-message">{error}</p>
          <button onClick={handleGoBack} className="payment-button">
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-container">
      <div className="payment-success">
        <h1>결제 성공</h1>
        <div className="success-icon">✓</div>
        <p className="success-message">결제가 성공적으로 완료되었습니다!</p>
        
        {paymentResult && (
          <div className="payment-info">
            <h2>결제 정보</h2>
            <div className="info-row">
              <span>주문 번호:</span>
              <span>{paymentResult.orderId}</span>
            </div>
            <div className="info-row">
              <span>결제 금액:</span>
              <span>{formatPrice(paymentResult.amount)}원</span>
            </div>
            <div className="info-row">
              <span>결제 상태:</span>
              <span>{paymentResult.status}</span>
            </div>
            {paymentResult.paymentDate && (
              <div className="info-row">
                <span>결제 일시:</span>
                <span>{formatDate(paymentResult.paymentDate)}</span>
              </div>
            )}
          </div>
        )}
        
        <button onClick={handleGoBack} className="payment-button">
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { preparePayment } from '../api/paymentApi';
import '../styles/Payment.css';

const PaymentPage = () => {
  // 랜덤 문자열 생성 함수 (주문 ID용)
  const generateRandomString = () => window.btoa(Math.random()).slice(0, 20);
  
  const [paymentInfo, setPaymentInfo] = useState({
    orderName: '',
    amount: '',
    customerName: '',
    customerEmail: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tossPayments, setTossPayments] = useState(null);
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  
  // 결제 요청 중인지 확인하는 ref
  const isProcessingRef = useRef(false);
  // 위젯 인스턴스 저장용 ref
  const paymentMethodsRef = useRef(null);
  const agreementRef = useRef(null);
  const mountedRef = useRef(false);
  
  // 토스 결제 위젯 초기화 - V2 방식
  useEffect(() => {
    // 이미 마운트되었거나 초기화되었다면 재실행하지 않음
    if (mountedRef.current || initialized) return;
    mountedRef.current = true;
    
    // 토스 페이먼츠 테스트용 클라이언트 키
    const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
    
    async function initializeWidget() {
      try {
        // 기존 위젯 정리 (혹시 있다면)
        if (paymentMethodsRef.current) {
          try {
            paymentMethodsRef.current.cleanup();
            paymentMethodsRef.current = null;
          } catch (e) {
            console.error("결제 위젯 정리 중 오류:", e);
          }
        }
        
        if (agreementRef.current) {
          try {
            agreementRef.current.cleanup();
            agreementRef.current = null;
          } catch (e) {
            console.error("약관 위젯 정리 중 오류:", e);
          }
        }
        
        // DOM 요소 확인
        const paymentMethodEl = document.querySelector('#payment-method');
        const agreementEl = document.querySelector('#agreement');
        
        if (!paymentMethodEl || !agreementEl) {
          console.error("위젯을 렌더링할 DOM 요소를 찾을 수 없습니다.");
          return;
        }
        
        // 토스페이먼츠 SDK 로드 (V2 방식)
        const tossPaymentsInstance = await loadTossPayments(clientKey);
        setTossPayments(tossPaymentsInstance);
        
        // 결제 위젯 초기화 (비회원 결제는 ANONYMOUS 사용)
        const widgetsInstance = tossPaymentsInstance.widgets({ customerKey: ANONYMOUS });
        setWidgets(widgetsInstance);
        
        // 초기 금액 설정 (1,000원)
        await widgetsInstance.setAmount({
          value: 1000,
          currency: 'KRW'
        });
        
        // DOM 요소 상태 확인 함수
        const isDomElementInitialized = (selector) => {
          const element = document.querySelector(selector);
          return element && element.childNodes.length > 0;
        };
        
        // 결제 수단 위젯 렌더링
        if (!isDomElementInitialized('#payment-method')) {
          const paymentMethodsInstance = await widgetsInstance.renderPaymentMethods({
            selector: '#payment-method',
            variantKey: 'DEFAULT'
          });
          paymentMethodsRef.current = paymentMethodsInstance;
        }
        
        // 이용약관 위젯 렌더링
        if (!isDomElementInitialized('#agreement')) {
          const agreementInstance = await widgetsInstance.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT'
          });
          agreementRef.current = agreementInstance;
        }
        
        setReady(true);
        setInitialized(true);
      } catch (error) {
        console.error("결제 위젯 초기화 오류:", error);
        setError("결제 위젯을 불러오는 중 오류가 발생했습니다.");
      }
    }
    
    // 렌더링 지연을 통한 중복 실행 방지
    const timer = setTimeout(() => {
      initializeWidget();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
      
      // 컴포넌트 언마운트 시 정리
      if (paymentMethodsRef.current) {
        try {
          paymentMethodsRef.current.cleanup();
          paymentMethodsRef.current = null;
        } catch (e) {
          console.error("결제 위젯 정리 중 오류:", e);
        }
      }
      
      if (agreementRef.current) {
        try {
          agreementRef.current.cleanup();
          agreementRef.current = null;
        } catch (e) {
          console.error("약관 위젯 정리 중 오류:", e);
        }
      }
    };
  }, [initialized]);
  
  // 금액 변경 시 위젯 업데이트 - V2 방식
  useEffect(() => {
    if (!widgets || !paymentInfo.amount) return;
    
    try {
      // 문자열에서 쉼표 제거하고 정수로 변환
      const amountValue = parseInt(String(paymentInfo.amount).replace(/,/g, ''));
      if (amountValue >= 1000) { // 최소 금액 검증
        // V2에서는 setAmount 메소드 사용
        widgets.setAmount({
          value: amountValue,
          currency: 'KRW'
        });
      }
    } catch (error) {
      console.error("결제 금액 업데이트 오류:", error);
    }
  }, [widgets, paymentInfo.amount]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // amount 필드의 경우 쉼표 제거 후 정수형으로 변환
    if (name === 'amount') {
      const cleanValue = value.replace(/,/g, '');
      const numValue = parseInt(cleanValue) || '';
      setPaymentInfo(prev => ({ ...prev, [name]: numValue }));
    } else {
      setPaymentInfo(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 이미 처리 중인 요청이 있으면 중복 실행 방지
    if (isProcessingRef.current || loading) {
      console.log("이미 결제 요청이 진행 중입니다.");
      return;
    }
    
    // 결제 처리 중 상태로 설정
    isProcessingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // 금액 유효성 검사 - 쉼표 제거하고 정수로 변환
      const amount = typeof paymentInfo.amount === 'string' 
        ? parseInt(paymentInfo.amount.replace(/,/g, '')) 
        : paymentInfo.amount;
        
      if (!amount || amount < 1000) {
        setError("결제 금액은 최소 1,000원 이상이어야 합니다.");
        setLoading(false);
        isProcessingRef.current = false;
        return;
      }
      
      // 결제 준비 API 호출
      const response = await preparePayment({
        ...paymentInfo,
        amount: amount, // 정수형으로 변환
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`
      });
      
      console.log("결제 준비 완료:", response);
      
      // orderName이 비어있으면 기본값 설정
      const orderName = paymentInfo.orderName || "주문 상품";
      
      // V2 방식의 결제 요청
      try {
        await widgets.requestPayment({
          orderId: response.data.orderId || generateRandomString(),
          orderName: orderName,
          successUrl: `${window.location.origin}/success`,
          failUrl: `${window.location.origin}/fail`,
          customerEmail: paymentInfo.customerEmail,
          customerName: paymentInfo.customerName
        });
      } catch (paymentError) {
        // 위젯 관련 오류 처리
        console.error("결제 요청 오류:", paymentError);
        
        // 위젯 초기화 오류인 경우 재설정 시도
        if (paymentError.message && paymentError.message.includes('이미 위젯이 렌더링되어 있습니다')) {
          setInitialized(false); // 위젯 재초기화를 위해 상태 변경
          setError("위젯을 재설정합니다. 잠시 후 다시 시도해주세요.");
        } else {
          setError(paymentError.message || "결제 요청 중 오류가 발생했습니다.");
        }
      }
    } catch (err) {
      console.error('결제 요청 오류:', err);
      setError(err.message || '결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      // 일정 시간 후에 처리 상태 초기화 (다음 요청을 위한 준비)
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };
  
  return (
    <div className="payment-container">
      <h1 className="payment-title">상품 결제</h1>
      
      <form className="payment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="orderName">상품명</label>
          <input
            type="text"
            id="orderName"
            name="orderName"
            value={paymentInfo.orderName}
            onChange={handleChange}
            placeholder="상품명을 입력하세요"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">결제 금액</label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={typeof paymentInfo.amount === 'number' 
              ? paymentInfo.amount.toLocaleString('ko-KR') 
              : paymentInfo.amount}
            onChange={handleChange}
            placeholder="최소 1,000원"
            required
          />
          <small>최소 결제 금액은 1,000원입니다.</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="customerName">고객명</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={paymentInfo.customerName}
            onChange={handleChange}
            placeholder="고객명을 입력하세요"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="customerEmail">이메일</label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={paymentInfo.customerEmail}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        
        {/* 결제 위젯 렌더링 영역 - V2에서는 selector로 지정 */}
        <div id="payment-method" className="payment-widget-area"></div>
        <div id="agreement" className="agreement-widget-area"></div>
        
        <button
          type="submit"
          className="payment-button"
          disabled={loading || !ready || isProcessingRef.current}
        >
          {loading ? '처리 중...' : '결제하기'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PaymentPage;
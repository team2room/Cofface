import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { preparePayment, getClientKey } from '../api/paymentApi';
import { isAuthenticated, getUser } from '../utils/authUtils';
import '../styles/Payment.css';

const TOSS_PAYMENTS_TEST_CLIENT_KEY = process.env.REACT_APP_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

// 테스트용 상품 데이터
const TEST_PRODUCTS = [
  { id: 1, name: '아메리카노', price: 4500, image: '/images/americano.jpg' },
  { id: 2, name: '카페라떼', price: 5000, image: '/images/latte.jpg' },
  { id: 3, name: '바닐라라떼', price: 5500, image: '/images/vanilla-latte.jpg' },
];

// 테스트용 옵션 데이터
const TEST_OPTIONS = {
  1: [
    { id: 101, name: '샷 추가', price: 500 },
    { id: 102, name: '시럽 추가', price: 300 },
  ],
  2: [
    { id: 201, name: '샷 추가', price: 500 },
    { id: 202, name: '두유로 변경', price: 500 },
  ],
  3: [
    { id: 301, name: '샷 추가', price: 500 },
    { id: 302, name: '두유로 변경', price: 500 },
    { id: 303, name: '시럽 추가', price: 300 },
  ],
};

const PaymentPage = () => {
  const [clientKey, setClientKey] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useStamp, setUseStamp] = useState(false);
  const [isTakeout, setIsTakeout] = useState(false);
  const [paymentWidgetLoaded, setPaymentWidgetLoaded] = useState(false);
  const [paymentWidget, setPaymentWidget] = useState(null);
  const [paymentMethodsWidget, setPaymentMethodsWidget] = useState(null);
  const navigate = useNavigate();
  
  // 인증 확인 및 클라이언트 키 가져오기
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/payment' } });
      return;
    }
    
    const fetchClientKey = async () => {
      try {
        const response = await getClientKey();
        
        if (response.success) {
          setClientKey(response.data.clientKey || TOSS_PAYMENTS_TEST_CLIENT_KEY);
        } else {
          console.error('클라이언트 키 가져오기 실패:', response.message);
          setError('결제 정보를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('클라이언트 키 가져오기 오류:', err);
        setError('결제 정보를 가져오는데 실패했습니다.');
      }
    };
    
    fetchClientKey();
  }, [navigate]);
  
  // 토스페이먼츠 결제 위젯 로드
  useEffect(() => {
    if (!clientKey) return;
    
    const loadWidget = async () => {
      try {
        const paymentWidgetInstance = await loadPaymentWidget(clientKey, 'test');
        setPaymentWidget(paymentWidgetInstance);
        setPaymentWidgetLoaded(true);
      } catch (err) {
        console.error('결제 위젯 로드 오류:', err);
        setError('결제 위젯을 로드하는데 실패했습니다.');
      }
    };
    
    loadWidget();
  }, [clientKey]);
  
  // 결제 수단 위젯 마운트
  useEffect(() => {
    if (!paymentWidgetLoaded || !paymentWidget) return;
    
    try {
      const paymentMethodsWidgetInstance = paymentWidget.renderPaymentMethods(
        '#payment-methods',
        { value: totalAmount },
        { variantKey: 'DEFAULT' }
      );
      
      setPaymentMethodsWidget(paymentMethodsWidgetInstance);
    } catch (err) {
      console.error('결제 수단 위젯 마운트 오류:', err);
    }
  }, [paymentWidgetLoaded, paymentWidget, totalAmount]);
  
  // 총 결제 금액 계산
  useEffect(() => {
    let amount = 0;
    
    cart.forEach(item => {
      // 메뉴 가격
      amount += item.price * item.quantity;
      
      // 선택된 옵션 가격 추가
      if (selectedOptions[item.id]) {
        selectedOptions[item.id].forEach(optionId => {
          const option = TEST_OPTIONS[item.id].find(opt => opt.id === optionId);
          if (option) {
            amount += option.price * item.quantity;
          }
        });
      }
    });
    
    setTotalAmount(amount);
    
    // 결제 수단 위젯이 있으면 금액 업데이트
    if (paymentMethodsWidget) {
      try {
        paymentMethodsWidget.updateAmount(amount);
      } catch (err) {
        console.error('결제 금액 업데이트 오류:', err);
      }
    }
  }, [cart, selectedOptions, paymentMethodsWidget]);
  
  // 장바구니에 상품 추가
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // 이미 장바구니에 있는 경우 수량 증가
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // 새로운 아이템 추가
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };
  
  // 장바구니에서 상품 제거
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    
    // 해당 상품의 옵션 선택 정보도 제거
    setSelectedOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[productId];
      return newOptions;
    });
  };
  
  // 상품 수량 변경
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  // 옵션 선택 토글
  const toggleOption = (productId, optionId) => {
    setSelectedOptions(prev => {
      const currentOptions = prev[productId] || [];
      
      if (currentOptions.includes(optionId)) {
        // 이미 선택된 옵션이면 제거
        return {
          ...prev,
          [productId]: currentOptions.filter(id => id !== optionId)
        };
      } else {
        // 새로운 옵션 추가
        return {
          ...prev,
          [productId]: [...currentOptions, optionId]
        };
      }
    });
  };
  
  // 결제 처리
  const handlePayment = async () => {
    if (cart.length === 0) {
      setError('장바구니가 비어있습니다.');
      return;
    }
    
    if (!paymentWidget) {
      setError('결제 위젯이 로드되지 않았습니다.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 장바구니 정보를 API 요청에 맞게 변환
      const menuOrders = cart.map(item => ({
        menuId: item.id,
        quantity: item.quantity,
        options: selectedOptions[item.id]
          ? selectedOptions[item.id].map(optionId => ({ optionItemId: optionId }))
          : []
      }));
      
      // 결제 준비 API 호출
      const prepareResponse = await preparePayment({
        kioskId: 1, // 테스트용 키오스크 ID
        amount: totalAmount,
        isStampUsed: useStamp,
        isTakeout: isTakeout,
        menuOrders: menuOrders
      });
      
      if (!prepareResponse.success) {
        throw new Error(prepareResponse.message || '결제 준비에 실패했습니다.');
      }
      
      const { orderId } = prepareResponse.data;
      
      // 토스페이먼츠 결제 요청
      await paymentWidget.requestPayment({
        orderId: orderId.toString(),
        orderName: `커피 주문 (${cart.length}건)`,
        amount: totalAmount,
        customerName: getUser()?.name || '고객',
        customerEmail: getUser()?.email,
        customerMobilePhone: getUser()?.phoneNumber,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`
      });
      
    } catch (err) {
      console.error('결제 처리 오류:', err);
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  return (
    <div className="payment-container">
      <h1 className="payment-title">주문 및 결제</h1>
      
      <div className="payment-content">
        <div className="menu-section">
          <h2>메뉴 선택</h2>
          <div className="menu-grid">
            {TEST_PRODUCTS.map(product => (
              <div key={product.id} className="menu-item">
                <div className="menu-image">
                  <img src={product.image || '/images/default-menu.jpg'} alt={product.name} />
                </div>
                <div className="menu-info">
                  <h3>{product.name}</h3>
                  <p className="menu-price">{product.price.toLocaleString()}원</p>
                </div>
                <button 
                  className="add-to-cart-button"
                  onClick={() => addToCart(product)}
                  disabled={loading}
                >
                  담기
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cart-section">
          <h2>장바구니</h2>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>장바구니가 비어있습니다.</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">{item.price.toLocaleString()}원</p>
                    
                    <div className="quantity-control">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-item-options">
                    <h4>옵션 선택</h4>
                    <div className="options-list">
                      {TEST_OPTIONS[item.id] && TEST_OPTIONS[item.id].map(option => (
                        <div key={option.id} className="option-item">
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedOptions[item.id]?.includes(option.id) || false}
                              onChange={() => toggleOption(item.id, option.id)}
                              disabled={loading}
                            />
                            {option.name} (+{option.price.toLocaleString()}원)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="remove-item-button"
                    onClick={() => removeFromCart(item.id)}
                    disabled={loading}
                  >
                    삭제
                  </button>
                </div>
              ))}
              
              <div className="cart-options">
                <label className="option-checkbox">
                  <input
                    type="checkbox"
                    checked={useStamp}
                    onChange={e => setUseStamp(e.target.checked)}
                    disabled={loading}
                  />
                  스탬프 사용하기
                </label>
                
                <label className="option-checkbox">
                  <input
                    type="checkbox"
                    checked={isTakeout}
                    onChange={e => setIsTakeout(e.target.checked)}
                    disabled={loading}
                  />
                  포장하기
                </label>
              </div>
              
              <div className="cart-total">
                <span>총 금액:</span>
                <span className="total-price">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="payment-section">
          <h2>결제 수단</h2>
          <div id="payment-methods" className="payment-methods-widget"></div>
          
          {error && <div className="payment-error">{error}</div>}
          
          <button 
            className="payment-button"
            onClick={handlePayment}
            disabled={loading || cart.length === 0}
          >
            {loading ? '처리 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
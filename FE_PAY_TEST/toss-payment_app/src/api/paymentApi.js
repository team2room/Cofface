import axiosInstance from '../utils/axiosConfig';

// 결제 준비 API (토스페이먼츠 결제 위젯을 위한 정보 가져오기)
export const preparePayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/api/payments/prepare', {
      kioskId: paymentData.kioskId || 1, // 기본값으로 1 설정, 실제 구현에서는 매장 ID 전달
      totalAmount: paymentData.amount,
      isStampUsed: paymentData.isStampUsed || false,
      isTakeout: paymentData.isTakeout || false,
      menuOrders: paymentData.menuOrders || []
    });
    
    return response.data;
  } catch (error) {
    console.error('결제 준비 오류:', error);
    throw error;
  }
};

// 토스페이먼츠 클라이언트 키 가져오기
export const getClientKey = async () => {
  try {
    // 수정: 전체 경로 사용 (/api/payments/client-key)
    const response = await axiosInstance.get('/api/payments/client-key');
    return response.data;
  } catch (error) {
    console.error('클라이언트 키 가져오기 오류:', error);
    throw error;
  }
};

// 결제 승인 API
export const approvePayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/api/payments/confirm', {
      paymentKey: paymentData.paymentKey,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      paymentType: 'CARD' // 기본값
    });
    
    return response.data;
  } catch (error) {
    console.error('결제 승인 오류:', error);
    throw error;
  }
};

// 결제 실패 처리 API
export const handlePaymentFailure = async (orderId, errorCode, errorMessage) => {
  try {
    const response = await axiosInstance.post('/api/payments/failure', null, {
      params: {
        orderId,
        errorCode,
        errorMessage
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('결제 실패 처리 오류:', error);
    throw error;
  }
};

export default {
  preparePayment,
  getClientKey,
  approvePayment,
  handlePaymentFailure
};
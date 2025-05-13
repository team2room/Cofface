import axios from 'axios';

// 백엔드 API를 직접 호출하지 않고 클라이언트에서만 처리하는 간단한 버전
export const preparePayment = async (paymentData) => {
  // 모의 응답만 반환 (실제로는 백엔드 호출 없음)
  return {
    success: true,
    data: {
      orderId: generateRandomId(),
      amount: paymentData.amount,
      clientKey: 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'
    }
  };
};

// 결제 승인 API (SuccessPage에서 사용)
export const approvePayment = async (paymentKey, orderId, amount) => {
  try {
    console.log('결제 승인 정보:', { paymentKey, orderId, amount });

    // 모의 응답 (백엔드 호출 없이 성공 응답)
    return {
      success: true,
      data: {
        orderId: orderId,
        amount: amount,
        paymentKey: paymentKey,
        status: '결제 완료',
        paymentDate: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('결제 승인 오류:', error);
    throw new Error('결제 승인 중 오류가 발생했습니다.');
  }
};

// 랜덤 ID 생성 (주문 ID용)
const generateRandomId = () => {
  return 'ORDER' + Date.now() + '' + Math.random().toString(36).substring(2, 9);
};

export default {
  preparePayment,
  approvePayment
};
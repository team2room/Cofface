import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

// 전화번호 로그인 (키오스크용)
export const phoneLogin = async (phoneNumber) => {
  try {
    console.log('전화번호 로그인 요청:', phoneNumber);
    
    const response = await axios.post(
      `${API_BASE_URL}/kiosk/phone-login`, 
      { phoneNumber },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('로그인 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('로그인 오류:', error);
    
    // 오류 응답 데이터가 있으면 반환
    if (error.response?.data) {
      throw error.response.data;
    }
    
    // 그 외의 경우 일반 오류 객체 반환
    throw {
      success: false,
      message: error.message || '로그인 중 오류가 발생했습니다.'
    };
  }
};

// 토큰 갱신
export const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/refresh`, 
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    
    if (error.response?.data) {
      throw error.response.data;
    }
    
    throw {
      success: false,
      message: error.message || '토큰 갱신 중 오류가 발생했습니다.'
    };
  }
};

// 세션 연장
export const extendSession = async (kioskId) => {
  try {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw {
        success: false,
        message: '로그인이 필요합니다.'
      };
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/kiosk/extend-session`,
      { kioskId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('세션 연장 오류:', error);
    
    if (error.response?.data) {
      throw error.response.data;
    }
    
    throw {
      success: false,
      message: error.message || '세션 연장 중 오류가 발생했습니다.'
    };
  }
};

// 로그아웃
export const logout = async () => {
  try {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      // 토큰이 없으면 로컬 스토리지만 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return { success: true };
    }
    
    // 서버에 로그아웃 요청
    const response = await axios.post(
      `${API_BASE_URL}/kiosk/logout`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // 로컬 스토리지 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response.data;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    
    // 어떤 오류가 발생하더라도 로컬 스토리지는 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    if (error.response?.data) {
      throw error.response.data;
    }
    
    throw {
      success: false,
      message: error.message || '로그아웃 중 오류가 발생했습니다.'
    };
  }
};
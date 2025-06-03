import axiosInstance from '../utils/axiosConfig';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/auth';

// 전화번호 로그인 (키오스크용)
export const phoneLogin = async (phoneNumber) => {
  try {
    const response = await axiosInstance.post('api/auth/kiosk/phone-login', { phoneNumber });
    return response.data;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// 토큰 갱신
export const refreshToken = async (refreshToken) => {
  try {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    return response.data;
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    throw error;
  }
};

// 세션 연장
export const extendSession = async (kioskId) => {
  try {
    const response = await axiosInstance.post('/auth/kiosk/extend-session', { kioskId });
    return response.data;
  } catch (error) {
    console.error('세션 연장 오류:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    // 서버에 로그아웃 요청
    const response = await axiosInstance.post('/auth/kiosk/logout');
    
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
    
    throw error;
  }
};

export default {
  phoneLogin,
  refreshToken,
  extendSession,
  logout
};
// 토큰 설정
export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// 사용자 정보 설정
export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// 인증 여부 확인
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  return !!token; // 토큰이 있으면 true, 없으면 false
};

// 사용자 정보 가져오기
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 토큰 가져오기
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  };
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export default {
  setTokens,
  setUser,
  isAuthenticated,
  getUser,
  getTokens,
  logout
};
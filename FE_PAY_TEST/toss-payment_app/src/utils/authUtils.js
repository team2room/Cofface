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
  
  // 로그아웃
  export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };
  
  // 디버깅용 인증 상태 출력
  export const debugAuthState = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    
    return {
      isAuthenticated: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUserInfo: !!user,
      accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : null,
      refreshToken: refreshToken ? `${refreshToken.substring(0, 10)}...` : null,
      user: user ? JSON.parse(user) : null
    };
  };
  
  // 토큰에서 ID 추출 (JWT 디코딩)
  export const getUserIdFromToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    try {
      // JWT는 header.payload.signature 형태
      const payload = token.split('.')[1];
      // Base64 디코딩
      const decodedPayload = atob(payload);
      // JSON 파싱
      const parsedPayload = JSON.parse(decodedPayload);
      
      return parsedPayload.sub; // sub 필드에 사용자 ID가 있다고 가정
    } catch (error) {
      console.error('토큰 디코딩 오류', error);
      return null;
    }
  };
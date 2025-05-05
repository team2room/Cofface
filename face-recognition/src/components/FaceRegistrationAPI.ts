/**
 * 얼굴 등록 방향 타입
 */
export type Direction = 'front' | 'left' | 'right' | 'up' | 'down';

/**
 * API 응답 인터페이스
 */
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 세션 생성 응답 데이터
 */
interface SessionData {
  sessionId: string;
  expiresAt: string;
}

/**
 * 얼굴 등록 API 클래스
 * - 얼굴 등록 관련 API 호출을 담당
 */
export class FaceRegistrationAPI {
  private readonly baseUrl: string;
  
  /**
   * 생성자
   * @param apiUrl API 기본 URL (옵션)
   */
  constructor(apiUrl?: string) {
    this.baseUrl = apiUrl || '/api/face-registration';
  }
  
  /**
   * 세션 생성
   * @returns API 응답
   */
  async createSession(): Promise<ApiResponse<SessionData>> {
    try {
      // 개발 모드에서는 모의 데이터 반환
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateSession();
      }
      
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('세션 생성 API 오류:', error);
      return {
        success: false,
        message: '서버 연결에 실패했습니다.'
      };
    }
  }
  
  /**
   * 이미지 업로드
   * @param sessionId 세션 ID
   * @param images 방향별 이미지
   * @returns API 응답
   */
  async uploadImages(
    sessionId: string, 
    images: Record<Direction, string>
  ): Promise<ApiResponse> {
    try {
      // 개발 모드에서는 모의 데이터 반환
      if (process.env.NODE_ENV === 'development') {
        return this.mockUploadImages(sessionId, images);
      }
      
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images })
      });
      
      return await response.json();
    } catch (error) {
      console.error('이미지 업로드 API 오류:', error);
      return {
        success: false,
        message: '서버 연결에 실패했습니다.'
      };
    }
  }
  
  /**
   * 등록 완료
   * @param sessionId 세션 ID
   * @returns API 응답
   */
  async completeRegistration(sessionId: string): Promise<ApiResponse> {
    try {
      // 개발 모드에서는 모의 데이터 반환
      if (process.env.NODE_ENV === 'development') {
        return this.mockCompleteRegistration(sessionId);
      }
      
      const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('등록 완료 API 오류:', error);
      return {
        success: false,
        message: '서버 연결에 실패했습니다.'
      };
    }
  }
  
  /**
   * 모의 세션 생성 (개발용)
   * @returns 모의 API 응답
   */
  private mockCreateSession(): Promise<ApiResponse<SessionData>> {
    return new Promise(resolve => {
      setTimeout(() => {
        const sessionId = `test-${Date.now()}`;
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1시간
        
        resolve({
          success: true,
          message: '세션이 생성되었습니다.',
          data: {
            sessionId,
            expiresAt
          }
        });
      }, 500); // 지연 시간
    });
  }
  
  /**
   * 모의 이미지 업로드 (개발용)
   * @param sessionId 세션 ID
   * @param images 방향별 이미지
   * @returns 모의 API 응답
   */
  private mockUploadImages(
    sessionId: string, 
    images: Record<Direction, string>
  ): Promise<ApiResponse> {
    return new Promise(resolve => {
      setTimeout(() => {
        const imageCount = Object.keys(images).length;
        
        if (imageCount < 5) {
          console.log(`[개발 모드] ${imageCount}개 이미지 업로드 완료`);
        }
        
        resolve({
          success: true,
          message: '이미지가 업로드되었습니다.',
          data: {
            imageCount
          }
        });
      }, 1000); // 지연 시간
    });
  }
  
  /**
   * 모의 등록 완료 (개발용)
   * @param sessionId 세션 ID
   * @returns 모의 API 응답
   */
  private mockCompleteRegistration(sessionId: string): Promise<ApiResponse> {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`[개발 모드] 세션 ${sessionId} 등록 완료`);
        
        resolve({
          success: true,
          message: '얼굴 등록이 완료되었습니다.',
          data: {
            registrationId: `reg-${Date.now()}`
          }
        });
      }, 800); // 지연 시간
    });
  }
}
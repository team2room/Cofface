import axios, { AxiosResponse } from 'axios';

// 방향 타입 정의
export type Direction = 'front' | 'left' | 'right' | 'up' | 'down';

// API 응답 타입 정의
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

// 세션 데이터 타입 정의
export interface SessionData {
  sessionId: string;
  expiresIn: number;
}

// 이미지 업로드 응답 타입 정의
export interface ImageUploadResponse {
  validImages: Direction[];
  invalidImages: Direction[];
}

// 등록 완료 데이터 타입 정의
export interface RegistrationCompleteData {
  faceId: string;
  registrationDate: string;
}

// 얼굴 등록 상태 응답 타입 정의
export interface FaceStatusResponse {
  isRegistered: boolean;
  registrationDate: string | null;
  faceId: string | null;
}

// 모델 정보 응답 타입 정의
export interface ModelInfoResponse {
  modelName: string;
  modelVersion: string;
  requiredAngles: Direction[];
  requiredImageSize: {
    width: number;
    height: number;
  };
  requiredImageFormat: string;
}

/**
 * 얼굴 등록 API 클래스
 * - 얼굴 등록 관련 API 호출 함수 모음
 */
export class FaceRegistrationAPI {
  private baseUrl: string;
  
  /**
   * 생성자
   * @param baseUrl API 기본 URL
   */
  constructor(baseUrl: string = 'https://api.facepay.example.com/v1') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * 인증 토큰 가져오기
   * @returns 인증 토큰
   */
  private getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  
  /**
   * 인증 헤더 생성
   * @returns 인증 헤더 객체
   */
  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  
  /**
   * 모델 정보 조회
   * @returns 얼굴 인식 모델 정보
   */
  async getModelInfo(): Promise<ApiResponse<ModelInfoResponse>> {
    try {
      const response = await axios.get<ApiResponse<ModelInfoResponse>>(
        `${this.baseUrl}/face/model-info`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<ModelInfoResponse>;
      }
      
      throw error;
    }
  }
  
  /**
   * 얼굴 등록 세션 생성
   * @returns 세션 정보
   */
  async createSession(): Promise<ApiResponse<SessionData>> {
    try {
      const response = await axios.post<ApiResponse<SessionData>>(
        `${this.baseUrl}/face/register/session`,
        {},
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<SessionData>;
      }
      
      throw error;
    }
  }
  
  /**
   * 얼굴 이미지 업로드
   * @param sessionId 세션 ID
   * @param images 방향별 이미지 객체
   * @returns 업로드 결과
   */
  async uploadImages(
    sessionId: string, 
    images: Record<Direction, string>
  ): Promise<ApiResponse<ImageUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      
      // 방향별 이미지 추가
      for (const direction in images) {
        if (Object.prototype.hasOwnProperty.call(images, direction)) {
          const image = images[direction as Direction];
          if (!image) continue;
          
          // Base64 이미지를 Blob으로 변환
          const imageBlob = await fetch(image).then(r => r.blob());
          formData.append(`images[${direction}]`, imageBlob, `${direction}.jpg`);
        }
      }
      
      const response = await axios.post<ApiResponse<ImageUploadResponse>>(
        `${this.baseUrl}/face/register/images`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<ImageUploadResponse>;
      }
      
      throw error;
    }
  }
  
  /**
   * 얼굴 등록 완료
   * @param sessionId 세션 ID
   * @returns 등록 완료 결과
   */
  async completeRegistration(sessionId: string): Promise<ApiResponse<RegistrationCompleteData>> {
    try {
      const response = await axios.post<ApiResponse<RegistrationCompleteData>>(
        `${this.baseUrl}/face/register/complete`,
        { sessionId },
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<RegistrationCompleteData>;
      }
      
      throw error;
    }
  }
  
  /**
   * 얼굴 등록 상태 확인
   * @returns 등록 상태
   */
  async checkFaceStatus(): Promise<ApiResponse<FaceStatusResponse>> {
    try {
      const response = await axios.get<ApiResponse<FaceStatusResponse>>(
        `${this.baseUrl}/face/status`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<FaceStatusResponse>;
      }
      
      throw error;
    }
  }
  
  /**
   * 얼굴 등록 삭제
   * @returns 삭제 결과
   */
  async deleteFaceRegistration(): Promise<ApiResponse<null>> {
    try {
      const response = await axios.delete<ApiResponse<null>>(
        `${this.baseUrl}/face/register`,
        { headers: this.getAuthHeaders() }
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<null>;
      }
      
      throw error;
    }
  }
}
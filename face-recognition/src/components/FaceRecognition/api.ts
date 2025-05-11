// api.ts
import axios from 'axios';
import { CapturedImage, FaceDetectionState } from './types';

// API 기본 설정
const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// 웹소켓 인증 클래스
export class FaceVerificationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private pingTimer: NodeJS.Timeout | null = null;

  constructor(
    private onMessage: (data: any) => void,
    private onError: (error: Event) => void,
    private onClose: () => void,
    private onOpen: () => void
  ) {}

  connect(): void {
    try {
      const wsUrl = `${WS_BASE_URL}/ws/verify`;
      console.log('WebSocket 연결 시도:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('WebSocket 연결 성공');
        this.reconnectAttempts = 0;
        this.onOpen();

        // 연결 유지를 위한 ping 시작
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket 메시지 수신:', data);
          this.onMessage(data);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket 오류:', event);
        this.onError(event);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason);
        this.onClose();

        // ping 정지
        this.stopPing();

        // 자동 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            30000
          );
          console.log(
            `${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
          );

          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('WebSocket 연결 중 오류:', error);
      this.onError(error as Event);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopPing();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendVerifyRequest(rgbImage: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'verify',
        rgb_image: rgbImage,
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket이 연결되지 않았습니다.');
    }
  }

  sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'ping',
        timestamp: new Date().toISOString(),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  private startPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }

    // 30초마다 ping 전송
    this.pingTimer = setInterval(() => {
      this.sendPing();
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

// 기존 REST API 함수들
export const registerFace = async (
  userId: string,
  capturedImages: CapturedImage[]
): Promise<any> => {
  console.log('등록 시작: 사용자 ID', userId);
  console.log('캡처된 이미지 수:', capturedImages.length);
  console.log(
    '캡처된 이미지 상태:',
    capturedImages.map((img) => FaceDetectionState[img.state])
  );

  try {
    // 캡처된 이미지를 방향별로 매핑 (정수 키를 사용)
    const directionMap: { [key: number]: string } = {
      1: 'front', // FaceDetectionState.FRONT_FACE는 1
      2: 'left', // FaceDetectionState.LEFT_FACE는 2
      3: 'right', // FaceDetectionState.RIGHT_FACE는 3
      4: 'up', // FaceDetectionState.UP_FACE는 4
      5: 'down', // FaceDetectionState.DOWN_FACE는 5
    };

    // API 요청 형식에 맞게 데이터 변환
    const faceImages: Record<string, string> = {};

    capturedImages.forEach((img) => {
      const direction = directionMap[img.state];
      if (direction) {
        // 이미지가 'data:image/jpeg;base64,' 형식인지 확인
        if (
          img.imageData.startsWith('data:image/') &&
          img.imageData.includes('base64,')
        ) {
          faceImages[direction] = img.imageData;
        } else {
          console.error(
            `${direction} 방향 이미지 형식이 잘못됨:`,
            img.imageData.substring(0, 50) + '...'
          );
        }
      }
    });

    // 모든 방향(5개)이 있는지 확인
    const requiredDirections = ['front', 'left', 'right', 'up', 'down'];
    const missingDirections = requiredDirections.filter(
      (dir) => !faceImages[dir]
    );

    if (missingDirections.length > 0) {
      throw new Error(
        `다음 방향의 얼굴 이미지가 누락되었습니다: ${missingDirections.join(
          ', '
        )}`
      );
    }

    // API 요청 전송
    const response = await api.post('/register', {
      user_id: userId,
      face_images: faceImages,
    });

    return response.data;
  } catch (error) {
    console.error('얼굴 등록 API 호출 중 오류 발생:', error);
    throw error;
  }
};

// REST 얼굴 인증 함수 (호환성을 위해 유지)
export const verifyFace = async (rgbImage: string): Promise<any> => {
  try {
    // Base64 문자열 처리
    let base64Data = rgbImage;

    // 프리픽스 제거 (data:image/jpeg;base64, 등)
    if (base64Data.includes(';base64,')) {
      base64Data = base64Data.split(';base64,')[1];
    }

    console.log('Base64 문자열 길이:', base64Data.length);

    // 쿼리 파라미터로 요청 보내기
    const response = await api.post(
      `/verify?rgb_image=${encodeURIComponent(base64Data)}`
    );

    return response.data;
  } catch (error) {
    console.error('얼굴 인증 API 호출 중 오류 발생:', error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('서버 응답 데이터:', error.response.data);
      console.error('서버 응답 상태:', error.response.status);
    }

    throw error;
  }
};

// 서버 상태 확인 함수
export const checkServerHealth = async (): Promise<any> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('서버 상태 확인 중 오류 발생:', error);
    throw error;
  }
};

export default {
  registerFace,
  verifyFace,
  checkServerHealth,
  FaceVerificationWebSocket,
};

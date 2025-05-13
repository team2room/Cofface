// api.ts
import axios from 'axios';
import { CapturedImage, FaceDetectionState } from './types';

// GPU 서버 설정
// const REMOTE_API_BASE_URL = 'https://face.orderme.store';
// const REMOTE_WS_BASE_URL = 'wss://face.orderme.store';
const REMOTE_API_BASE_URL = 'http://localhost:8800';
const REMOTE_WS_BASE_URL = 'ws://localhost:8800';

// 로컬 서버 설정 (라이브니스 검사용)
const LOCAL_API_BASE_URL = 'http://localhost:8000';
const LOCAL_WS_BASE_URL = 'ws://localhost:8000';

console.log('원격 API URL:', REMOTE_API_BASE_URL);
console.log('로컬 API URL:', LOCAL_API_BASE_URL);

// GPU 서버 API
const remoteApi = axios.create({
  baseURL: REMOTE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// 로컬 서버 API
const localApi = axios.create({
  baseURL: LOCAL_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 5000,
});

// 원격 서버 웹소켓 인증 클래스
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
      const wsUrl = `${REMOTE_WS_BASE_URL}/ws/verify`;
      console.log('원격 WebSocket 연결 URL:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('원격 WebSocket 연결 성공');
        this.reconnectAttempts = 0;
        this.onOpen();

        // 연결 유지를 위한 ping 시작
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('원격 WebSocket 메시지 수신:', data);
          this.onMessage(data);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      this.ws.onerror = (event) => {
        console.error('원격 WebSocket 상세 오류:', {
          event,
          readyState: this.ws?.readyState,
          url: this.ws?.url,
          protocol: this.ws?.protocol,
        });
        this.onError(event);
      };

      this.ws.onclose = (event) => {
        console.log('원격 WebSocket 연결 종료:', event.code, event.reason);
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

  sendVerifyRequest(rgbImage: string, livenessResult: any = null): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'verify',
        rgb_image: rgbImage,
        liveness_result: livenessResult // 로컬에서 처리한 라이브니스 결과 포함
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

// 로컬 RealSense 프레임 및 라이브니스 수신 클래스
export class RealSenseWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(
    private onFrame: (data: any) => void,
    private onError: (error: Event) => void,
    private onClose: () => void,
    private onOpen: () => void
  ) {}

  connect(): void {
    try {
      const wsUrl = `${LOCAL_WS_BASE_URL}/ws/realsense`;
      console.log('로컬 RealSense 연결 URL:', wsUrl);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('로컬 RealSense WebSocket 연결 성공');
        this.reconnectAttempts = 0;
        this.onOpen();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onFrame(data);
        } catch (error) {
          console.error('RealSense 메시지 파싱 오류:', error);
        }
      };

      this.ws.onerror = (event) => {
        console.error('로컬 RealSense WebSocket 오류:', event);
        this.onError(event);
      };

      this.ws.onclose = (event) => {
        console.log('로컬 RealSense WebSocket 연결 종료:', event.code, event.reason);
        this.onClose();

        // 자동 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            30000
          );
          console.log(
            `${delay}ms 후 로컬 RealSense 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
          );

          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('로컬 RealSense WebSocket 연결 중 오류:', error);
      this.onError(error as Event);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  // 필요시 라이브니스 검사 요청 함수 추가
  requestLivenessCheck(rgbImage: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'check_liveness',
        rgb_image: rgbImage
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('RealSense WebSocket이 연결되지 않았습니다.');
    }
  }
}

// 기존 REST API 함수들 (원격 GPU 서버로 전송)
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

    // 원격 GPU 서버에 요청 전송
    const response = await remoteApi.post('/register', {
      user_id: userId,
      face_images: faceImages,
    });

    return response.data;
  } catch (error) {
    console.error('얼굴 등록 API 호출 중 오류 발생:', error);
    throw error;
  }
};

// 얼굴 인증 함수 - 원격 GPU 서버로 전송
export const verifyFace = async (rgbImage: string, livenessResult: any = null): Promise<any> => {
  try {
    // 요청 본문에 이미지 데이터와 라이브니스 결과 포함
    const response = await remoteApi.post('/verify', {
      rgb_image: rgbImage,
      liveness_result: livenessResult // 로컬 서버에서 처리한 라이브니스 결과
    });

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

// 로컬 라이브니스 상태 확인 함수
export const checkLiveness = async (rgbImage: string): Promise<any> => {
  try {
    const response = await localApi.post('/check_liveness', {
      rgb_image: rgbImage
    });
    return response.data;
  } catch (error) {
    console.error('라이브니스 확인 중 오류 발생:', error);
    throw error;
  }
};

// 로컬 RealSense 상태 확인 함수
export const checkRealSenseStatus = async (): Promise<any> => {
  try {
    const response = await localApi.get('/test-realsense');
    return response.data;
  } catch (error) {
    console.error('RealSense 상태 확인 중 오류 발생:', error);
    throw error;
  }
};

// 원격 서버 상태 확인 함수
export const checkRemoteServerHealth = async (): Promise<any> => {
  try {
    const response = await remoteApi.get('/health');
    return response.data;
  } catch (error) {
    console.error('원격 서버 상태 확인 중 오류 발생:', error);
    throw error;
  }
};

// 로컬 서버 상태 확인 함수
export const checkLocalServerHealth = async (): Promise<any> => {
  try {
    const response = await localApi.get('/health');
    return response.data;
  } catch (error) {
    console.error('로컬 서버 상태 확인 중 오류 발생:', error);
    throw error;
  }
};

export default {
  registerFace,
  verifyFace,
  checkLiveness,
  checkRealSenseStatus,
  checkRemoteServerHealth,
  checkLocalServerHealth,
  FaceVerificationWebSocket,
  RealSenseWebSocket
};
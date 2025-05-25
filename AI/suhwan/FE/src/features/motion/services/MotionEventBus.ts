// services/MotionEventBus.ts
interface MotionEvent {
  type: string;
  source: string;
  data?: any;
  timestamp: number;
}

type EventCallback = (event: MotionEvent) => void;

interface Subscription {
  unsubscribe: () => void;
}

class MotionEventBusService {
  private subscribers: EventCallback[] = [];
  
  // 이벤트 구독
  public subscribe(callback: EventCallback): Subscription {
    this.subscribers.push(callback);
    
    // 구독 해제 함수 반환
    return {
      unsubscribe: () => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
      }
    };
  }
  
  // 이벤트 발행
  public publish(event: MotionEvent): void {
    console.log(`MotionEventBus: 이벤트 발행 - ${event.type}`, event);
    
    // 모든 구독자에게 알림
    this.subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('이벤트 콜백 실행 중 오류:', error);
      }
    });
  }
}

// 싱글톤 인스턴스
export const MotionEventBus = new MotionEventBusService();
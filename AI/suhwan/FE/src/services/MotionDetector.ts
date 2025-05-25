// services/MotionDetector.ts
import { MotionDetector as MotionDetectorClass, MotionDetectorSettings } from '../components/HeadShaking/MotionDetector';

// 싱글톤 패턴 구현
class MotionDetectorService {
  private static instance: MotionDetectorClass | null = null;
  
  // 싱글톤 인스턴스 접근자
  public static getInstance(): MotionDetectorClass {
    if (!MotionDetectorService.instance) {
      MotionDetectorService.instance = new MotionDetectorClass();
    }
    return MotionDetectorService.instance;
  }
  
  // 설정 업데이트 헬퍼 메서드
  public static updateSettings(settings: MotionDetectorSettings): void {
    const instance = MotionDetectorService.getInstance();
    instance.updateSettings(settings);
  }
  
  // 현재 설정 가져오기
  public static getCurrentSettings(): MotionDetectorSettings {
    const instance = MotionDetectorService.getInstance();
    return instance.getCurrentSettings();
  }
  
  // 히스토리 초기화
  public static resetHistory(): void {
    const instance = MotionDetectorService.getInstance();
    instance.resetHistory();
  }
}

export const MotionDetector = MotionDetectorService;
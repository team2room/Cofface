// services/MotionDetectorService.ts
import {
  MotionDetector as MotionDetectorClass,
  MotionDetectorSettings,
} from '../components/MotionDetector'
import { MotionEventBus } from './MotionEventBus'

// 싱글톤 패턴 구현
class MotionDetectorService {
  private static instance: MotionDetectorClass | null = null
  private static isActive: boolean = false

  // 싱글톤 인스턴스 접근자
  public static getInstance(): MotionDetectorClass {
    if (!MotionDetectorService.instance) {
      MotionDetectorService.instance = new MotionDetectorClass()
      console.log('[MotionDetectorService] 인스턴스 생성됨')
    }
    return MotionDetectorService.instance
  }

  // 활성화 상태 설정
  public static setActive(active: boolean): void {
    this.isActive = active
    console.log(`[MotionDetectorService] ${active ? '활성화됨' : '비활성화됨'}`)

    if (!active) {
      // 비활성화 시 히스토리 초기화
      if (MotionDetectorService.instance) {
        MotionDetectorService.instance.resetHistory()
      }
    }
  }

  // 활성화 상태 확인
  public static isActiveState(): boolean {
    return this.isActive
  }

  // 새로운 측정값 처리 (활성화 상태에 따라)
  public static processRotation(rotation: any, timestamp: number): void {
    if (!this.isActive) return

    const instance = this.getInstance()
    const motionEvent = instance.addMeasurement(rotation, timestamp)

    if (motionEvent) {
      console.log(
        `[MotionDetectorService] 모션 감지: ${motionEvent.type}`,
        motionEvent,
      )

      // 이벤트 버스를 통해 모션 이벤트 발행
      MotionEventBus.publish({
        type: motionEvent.type,
        source: 'motion-service',
        data: motionEvent,
        timestamp: timestamp,
      })
    }
  }

  // 설정 업데이트 헬퍼 메서드
  public static updateSettings(settings: MotionDetectorSettings): void {
    const instance = MotionDetectorService.getInstance()
    instance.updateSettings(settings)
  }

  // 현재 설정 가져오기
  public static getCurrentSettings(): MotionDetectorSettings {
    const instance = MotionDetectorService.getInstance()
    return instance.getCurrentSettings()
  }

  // 히스토리 초기화
  public static resetHistory(): void {
    const instance = MotionDetectorService.getInstance()
    instance.resetHistory()
  }

  // 모션 감지기 설정 최적화 함수 추가
  public static optimizeForHeadShakeAndNod(): void {
    const instance = this.getInstance()
    instance.updateSettings({
      historyLength: 20, // 더 많은 기록 저장
      yawThreshold: 8, // 더 작은 값으로 민감도 증가
      pitchThreshold: 8, // 더 작은 값으로 민감도 증가
      yawVelocityThreshold: 0.08, // 더 낮은 속도 임계값
      pitchVelocityThreshold: 0.08, // 더 낮은 속도 임계값
      eventCooldown: 1200, // 중복 인식 방지 쿨다운
    })

    console.log('[MotionDetectorService] 도리도리 및 끄덕임 감지에 최적화됨')
  }
}

export const MotionDetector = MotionDetectorService

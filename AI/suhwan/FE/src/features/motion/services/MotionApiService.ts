// services/MotionApiService.ts
import { MotionDetector } from './MotionDetectorService'
import { MotionEventBus } from './MotionEventBus'

class MotionApiService {
  private static apiEndpoint: string = '/api/motion' // 실제 API 엔드포인트로 수정 필요

  // API 엔드포인트 설정
  public static setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint
    console.log(`[MotionApiService] API 엔드포인트 설정: ${endpoint}`)
  }

  // 모션 이벤트 처리 및 API 호출
  public static async handleMotionEvent(
    eventType: string,
    data: any,
  ): Promise<any> {
    try {
      console.log(`[MotionApiService] 모션 이벤트 처리: ${eventType}`, data)

      // 필요한 모션 유형만 API 호출
      if (eventType !== 'HEAD_SHAKE' && eventType !== 'HEAD_NOD') {
        console.log(`[MotionApiService] ${eventType} 모션은 처리하지 않음`)
        return { success: false, message: '지원되지 않는 모션 유형' }
      }

      // API 호출
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motionType: eventType,
          data: data,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `API 호출 실패: ${response.status} ${response.statusText}`,
        )
      }

      const result = await response.json()
      console.log(`[MotionApiService] API 응답:`, result)

      return result
    } catch (error) {
      console.error('[MotionApiService] 오류:', error)
      return { success: false, error: String(error) }
    }
  }

  // 모션 리스너 설정 (이벤트 버스 구독)
  public static setupMotionListener(): void {
    console.log('[MotionApiService] 모션 리스너 설정 중...')

    // 이벤트 버스 구독
    MotionEventBus.subscribe(async (event) => {
      console.log(`[MotionApiService] 모션 이벤트 수신: ${event.type}`, event)

      // 도리도리 및 끄덕임만 처리
      if (event.type === 'HEAD_SHAKE' || event.type === 'HEAD_NOD') {
        await this.handleMotionEvent(event.type, event.data)
      }
    })

    console.log(
      '[MotionApiService] 모션 리스너 설정 완료 (도리도리 및 끄덕임만 처리)',
    )
  }

  // 모션 감지 활성화/비활성화
  public static setActive(active: boolean): void {
    MotionDetector.setActive(active)
  }
}

export default MotionApiService

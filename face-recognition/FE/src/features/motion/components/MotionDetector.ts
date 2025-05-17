// MotionDetector.ts
interface RotationState {
  roll: number
  pitch: number
  yaw: number
}

interface MotionEvent {
  type: string
  confidence: number
  details?: any
}

interface MotionMeasurement {
  rotation: RotationState
  timestamp: number
}

// 옵션 인터페이스 정의
export interface MotionDetectorSettings {
  historyLength?: number
  yawThreshold?: number
  pitchThreshold?: number
  eventCooldown?: number
  yawVelocityThreshold?: number
  pitchVelocityThreshold?: number
}

export class MotionDetector {
  private yawHistory: MotionMeasurement[] = []
  private pitchHistory: MotionMeasurement[] = []

  // 리터럴 타입 대신 명시적인 number 타입으로 선언
  private historyLength: number = 15
  private yawThreshold: number = 15
  private yawVelocityThreshold: number = 0.15
  private pitchThreshold: number = 15
  private pitchVelocityThreshold: number = 0.12
  private eventCooldown: number = 1000
  private lastEventTime: number = 0

  constructor(options?: MotionDetectorSettings) {
    if (options) {
      this.applySettings(options)
    }
  }

  // 설정 업데이트 메서드 추가
  public updateSettings(settings: MotionDetectorSettings): void {
    this.applySettings(settings)
    console.log('모션 감지기 설정 업데이트됨:', settings)
  }

  // 설정 적용 내부 메서드
  private applySettings(settings: MotionDetectorSettings): void {
    if (settings.historyLength !== undefined)
      this.historyLength = settings.historyLength
    if (settings.yawThreshold !== undefined)
      this.yawThreshold = settings.yawThreshold
    if (settings.pitchThreshold !== undefined)
      this.pitchThreshold = settings.pitchThreshold
    if (settings.eventCooldown !== undefined)
      this.eventCooldown = settings.eventCooldown
    if (settings.yawVelocityThreshold !== undefined)
      this.yawVelocityThreshold = settings.yawVelocityThreshold
    if (settings.pitchVelocityThreshold !== undefined)
      this.pitchVelocityThreshold = settings.pitchVelocityThreshold
  }

  // 새로운 회전 측정값 추가 및 모션 감지
  public addMeasurement(
    rotation: RotationState,
    timestamp: number,
  ): MotionEvent | null {
    // 과거 데이터 저장
    this.yawHistory.push({ rotation, timestamp })
    this.pitchHistory.push({ rotation, timestamp })

    // 히스토리 크기 제한
    if (this.yawHistory.length > this.historyLength) {
      this.yawHistory.shift()
    }
    if (this.pitchHistory.length > this.historyLength) {
      this.pitchHistory.shift()
    }

    // 이벤트 쿨다운 체크
    if (timestamp - this.lastEventTime < this.eventCooldown) {
      return null
    }

    // 충분한 데이터가 없으면 패스
    if (this.yawHistory.length < 5 || this.pitchHistory.length < 5) {
      return null
    }

    // 1. 머리 흔들기 패턴 감지 (도리도리)
    const headShakeEvent = this.detectHeadShake()
    if (headShakeEvent) {
      this.lastEventTime = timestamp
      return headShakeEvent
    }

    // 2. 고개 끄덕임 감지
    const nodEvent = this.detectHeadNod()
    if (nodEvent) {
      this.lastEventTime = timestamp
      return nodEvent
    }

    return null
  }

  // 머리 흔들기 패턴 감지 (좌우 반복)
  private detectHeadShake(): MotionEvent | null {
    if (this.yawHistory.length < 6) return null

    // 최근 1초 내의 측정값으로 확장 (더 넓은 시간 범위)
    const currentTime = this.yawHistory[this.yawHistory.length - 1].timestamp
    const shakeWindow = this.yawHistory.filter(
      (r) => currentTime - r.timestamp < 1000,
    )

    if (shakeWindow.length < 5) return null

    // 로우패스 필터링으로 노이즈 제거 (이동 평균)
    const smoothedYaw: number[] = []
    const smoothingWindow = 2 // 평활화 윈도우 크기

    for (let i = 0; i < shakeWindow.length; i++) {
      let sum = 0
      let count = 0
      for (
        let j = Math.max(0, i - smoothingWindow);
        j <= Math.min(shakeWindow.length - 1, i + smoothingWindow);
        j++
      ) {
        sum += shakeWindow[j].rotation.yaw
        count++
      }
      smoothedYaw.push(sum / count)
    }

    // 방향 변화 감지
    const directions: number[] = []
    for (let i = 1; i < smoothedYaw.length; i++) {
      const diff = smoothedYaw[i] - smoothedYaw[i - 1]
      // 노이즈 필터링 (0.8도 미만 변화는 무시)
      if (Math.abs(diff) > 0.8) {
        directions.push(Math.sign(diff))
      }
    }

    // 방향 전환 횟수 계산 (연속된 같은 방향은 하나로 취급)
    let directionChanges = 0
    let prevDirection = 0

    for (let i = 0; i < directions.length; i++) {
      if (directions[i] !== 0 && directions[i] !== prevDirection) {
        if (prevDirection !== 0) {
          // 처음이 아닌 경우에만 카운트
          directionChanges++
        }
        prevDirection = directions[i]
      }
    }

    // 총 yaw 이동 범위 계산 (좌우 진폭)
    const yawRange = Math.max(...smoothedYaw) - Math.min(...smoothedYaw)

    // 도리도리 감지 기준:
    // 1. 충분한 방향 전환 (1회 이상)
    // 2. 충분한 yaw 각도 변화 (8도 이상)
    // 3. 충분한 데이터 포인트 수
    if (directionChanges >= 1 && yawRange >= 8 && directions.length >= 4) {
      console.log(
        `[MotionDetector] 도리도리 감지: 방향 전환 ${directionChanges}회, Yaw 범위 ${yawRange.toFixed(2)}°`,
      )

      return {
        type: 'HEAD_SHAKE',
        confidence: Math.min(1.0, (directionChanges / 2) * (yawRange / 10)),
        details: {
          directionChanges,
          yawRange,
          window: shakeWindow.length,
          directions,
        },
      }
    }

    return null
  }

  // 고개 끄덕임 감지 (상하 움직임)
  private detectHeadNod(): MotionEvent | null {
    if (this.pitchHistory.length < 6) return null

    // 최근 1초 내의 측정값만 고려
    const currentTime =
      this.pitchHistory[this.pitchHistory.length - 1].timestamp
    const nodWindow = this.pitchHistory.filter(
      (r) => currentTime - r.timestamp < 1000,
    )

    if (nodWindow.length < 5) return null

    // 로우패스 필터링으로 노이즈 제거 (이동 평균)
    const smoothedPitch: number[] = []
    const smoothingWindow = 2 // 평활화 윈도우 크기

    for (let i = 0; i < nodWindow.length; i++) {
      let sum = 0
      let count = 0
      for (
        let j = Math.max(0, i - smoothingWindow);
        j <= Math.min(nodWindow.length - 1, i + smoothingWindow);
        j++
      ) {
        sum += nodWindow[j].rotation.pitch
        count++
      }
      smoothedPitch.push(sum / count)
    }

    // 피치 방향 변화 감지
    const directions: number[] = []
    for (let i = 1; i < smoothedPitch.length; i++) {
      const diff = smoothedPitch[i] - smoothedPitch[i - 1]
      // 노이즈 필터링 (0.8도 미만 변화는 무시)
      if (Math.abs(diff) > 0.8) {
        directions.push(Math.sign(diff))
      }
    }

    // 방향 전환 횟수 계산 (연속된 같은 방향은 하나로 취급)
    let directionChanges = 0
    let prevDirection = 0

    for (let i = 0; i < directions.length; i++) {
      if (directions[i] !== 0 && directions[i] !== prevDirection) {
        if (prevDirection !== 0) {
          // 처음이 아닌 경우에만 카운트
          directionChanges++
        }
        prevDirection = directions[i]
      }
    }

    // 총 pitch 이동 범위 계산 (상하 진폭)
    const pitchRange = Math.max(...smoothedPitch) - Math.min(...smoothedPitch)

    // 끄덕임 감지 기준:
    // 1. 충분한 방향 전환 (1회 이상)
    // 2. 충분한 pitch 각도 변화 (8도 이상)
    // 3. 처음 움직임이 아래쪽(양수)인지 확인 (옵션)
    const firstSignificantMove = directions.find((d) => d !== 0) || 0
    const isTypicalNod = firstSignificantMove > 0 // 일반적인 끄덕임은 먼저 아래로

    if (directionChanges >= 1 && pitchRange >= 8 && directions.length >= 4) {
      console.log(
        `[MotionDetector] 고개 끄덕임 감지: 방향 전환 ${directionChanges}회, Pitch 범위 ${pitchRange.toFixed(2)}°`,
      )

      return {
        type: 'HEAD_NOD',
        confidence: Math.min(1.0, (directionChanges / 2) * (pitchRange / 10)),
        details: {
          directionChanges,
          pitchRange,
          window: nodWindow.length,
          isTypicalNod,
        },
      }
    }

    return null
  }

  // 임계값 및 설정 접근자 메서드들
  public getHistoryLength(): number {
    return this.historyLength
  }

  public getYawThreshold(): number {
    return this.yawThreshold
  }

  public getVelocityThreshold(): number {
    return this.yawVelocityThreshold
  }

  public getEventCooldown(): number {
    return this.eventCooldown
  }

  // 히스토리 데이터 얻기 (디버깅용)
  public getYawHistory(): MotionMeasurement[] {
    return [...this.yawHistory]
  }

  public getPitchHistory(): MotionMeasurement[] {
    return [...this.pitchHistory]
  }

  // 모든 히스토리 초기화
  public resetHistory(): void {
    this.yawHistory = []
    this.pitchHistory = []
    this.lastEventTime = 0
    console.log('[MotionDetector] 히스토리 초기화됨')
  }

  // 현재 설정 가져오기
  public getCurrentSettings(): MotionDetectorSettings {
    return {
      historyLength: this.historyLength,
      yawThreshold: this.yawThreshold,
      pitchThreshold: this.pitchThreshold,
      eventCooldown: this.eventCooldown,
      yawVelocityThreshold: this.yawVelocityThreshold,
      pitchVelocityThreshold: this.pitchVelocityThreshold,
    }
  }
}

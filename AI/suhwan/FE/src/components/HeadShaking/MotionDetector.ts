// MotionDetector.ts
interface RotationState {
  roll: number;
  pitch: number;
  yaw: number;
}

interface MotionEvent {
  type: string;
  confidence: number;
  details?: any;
}

interface MotionMeasurement {
  rotation: RotationState;
  timestamp: number;
}

// 옵션 인터페이스 정의
export interface MotionDetectorSettings {
  historyLength?: number;
  yawThreshold?: number;
  pitchThreshold?: number;
  eventCooldown?: number;
  yawVelocityThreshold?: number;
  pitchVelocityThreshold?: number;
}

export class MotionDetector {
  private yawHistory: MotionMeasurement[] = [];
  private pitchHistory: MotionMeasurement[] = [];
  
  // 리터럴 타입 대신 명시적인 number 타입으로 선언
  private historyLength: number = 15;
  private yawThreshold: number = 15;
  private yawVelocityThreshold: number = 0.15;
  private pitchThreshold: number = 15;
  private pitchVelocityThreshold: number = 0.12;
  private eventCooldown: number = 1000;
  private lastEventTime: number = 0;

  constructor(options?: MotionDetectorSettings) {
    if (options) {
      this.applySettings(options);
    }
  }

  // 설정 업데이트 메서드 추가
  public updateSettings(settings: MotionDetectorSettings): void {
    this.applySettings(settings);
    console.log('모션 감지기 설정 업데이트됨:', settings);
  }

  // 설정 적용 내부 메서드
  private applySettings(settings: MotionDetectorSettings): void {
    if (settings.historyLength !== undefined) this.historyLength = settings.historyLength;
    if (settings.yawThreshold !== undefined) this.yawThreshold = settings.yawThreshold;
    if (settings.pitchThreshold !== undefined) this.pitchThreshold = settings.pitchThreshold;
    if (settings.eventCooldown !== undefined) this.eventCooldown = settings.eventCooldown;
    if (settings.yawVelocityThreshold !== undefined) this.yawVelocityThreshold = settings.yawVelocityThreshold;
    if (settings.pitchVelocityThreshold !== undefined) this.pitchVelocityThreshold = settings.pitchVelocityThreshold;
  }

  // 새로운 회전 측정값 추가 및 모션 감지
  public addMeasurement(rotation: RotationState, timestamp: number): MotionEvent | null {
    // 과거 데이터 저장
    this.yawHistory.push({ rotation, timestamp });
    this.pitchHistory.push({ rotation, timestamp });
    
    // 히스토리 크기 제한
    if (this.yawHistory.length > this.historyLength) {
      this.yawHistory.shift();
    }
    if (this.pitchHistory.length > this.historyLength) {
      this.pitchHistory.shift();
    }

    // 이벤트 쿨다운 체크
    if (timestamp - this.lastEventTime < this.eventCooldown) {
      return null;
    }

    // 충분한 데이터가 없으면 패스
    if (this.yawHistory.length < 5) {
      return null;
    }

    // 좌우 빠른 회전 감지
    const yawEvent = this.detectYawMotion();
    if (yawEvent) {
      this.lastEventTime = timestamp;
      return yawEvent;
    }

    // 머리 흔들기 패턴 감지
    const headShakeEvent = this.detectHeadShake();
    if (headShakeEvent) {
      this.lastEventTime = timestamp;
      return headShakeEvent;
    }

    // 고개 끄덕임 감지
    const nodEvent = this.detectHeadNod();
    if (nodEvent) {
      this.lastEventTime = timestamp;
      return nodEvent;
    }

    return null;
  }

  // 좌우 빠른 회전 감지
  private detectYawMotion(): MotionEvent | null {
    if (this.yawHistory.length < 5) return null;

    // 최근 200ms 이내의 측정값만 사용
    const currentTime = this.yawHistory[this.yawHistory.length - 1].timestamp;
    const recentReadings = this.yawHistory.filter(
      r => currentTime - r.timestamp < 200
    );

    if (recentReadings.length < 3) return null;

    // 최근 변화량 계산
    const firstYaw = recentReadings[0].rotation.yaw;
    const lastYaw = recentReadings[recentReadings.length - 1].rotation.yaw;
    const yawDiff = lastYaw - firstYaw;
    const timeSpan = recentReadings[recentReadings.length - 1].timestamp - recentReadings[0].timestamp;

    // 시간이 너무 짧으면 오류 방지
    if (timeSpan === 0) return null;

    // 속도 계산 (도/ms)
    const velocity = Math.abs(yawDiff) / timeSpan;

    // 속도와 변화량 모두 임계값 이상인지 확인
    if (velocity >= this.yawVelocityThreshold && Math.abs(yawDiff) >= this.yawThreshold) {
      const eventType = yawDiff > 0 ? "QUICK_LEFT_TURN" : "QUICK_RIGHT_TURN";
      
      console.log(`[MotionDetector] 빠른 회전 감지: ${eventType}, 변화량: ${yawDiff.toFixed(2)}°, 속도: ${velocity.toFixed(4)}°/ms`);
      
      return {
        type: eventType,
        confidence: Math.min(1.0, velocity / (this.yawVelocityThreshold * 2)),
        details: {
          yawDiff,
          velocity,
          timeSpan,
          readings: recentReadings.map(r => ({ 
            yaw: r.rotation.yaw, 
            timestamp: r.timestamp 
          }))
        }
      };
    }

    return null;
  }

  // 머리 흔들기 패턴 감지 (좌우 반복)
  private detectHeadShake(): MotionEvent | null {
    if (this.yawHistory.length < 8) return null;
    
    // 최근 800ms 내의 측정값만 고려
    const currentTime = this.yawHistory[this.yawHistory.length - 1].timestamp;
    const shakeWindow = this.yawHistory.filter(
      r => currentTime - r.timestamp < 800
    );
    
    if (shakeWindow.length < 6) return null;
    
    // 연속된 측정값 간의 변화 방향 계산
    const directions: number[] = [];
    for (let i = 1; i < shakeWindow.length; i++) {
      const diff = shakeWindow[i].rotation.yaw - shakeWindow[i-1].rotation.yaw;
      // 노이즈 필터링 (1도 미만 변화는 무시)
      if (Math.abs(diff) > 1) {
        directions.push(Math.sign(diff));
      }
    }
    
    // 방향 전환 횟수 계산
    let directionChanges = 0;
    for (let i = 1; i < directions.length; i++) {
      if (directions[i] !== directions[i-1] && directions[i] !== 0 && directions[i-1] !== 0) {
        directionChanges++;
      }
    }
    
    // 충분한 방향 전환이 있으면 머리 흔들기로 간주
    if (directionChanges >= 2) {
      console.log(`[MotionDetector] 머리 흔들기 감지: 방향 전환 ${directionChanges}회`);
      
      return {
        type: "HEAD_SHAKE",
        confidence: Math.min(1.0, directionChanges / 4),
        details: {
          directionChanges,
          window: shakeWindow.length,
          directions
        }
      };
    }
    
    return null;
  }

  // 고개 끄덕임 감지 (상하 움직임)
  private detectHeadNod(): MotionEvent | null {
    if (this.pitchHistory.length < 6) return null;
    
    // 최근 800ms 내의 측정값만 고려
    const currentTime = this.pitchHistory[this.pitchHistory.length - 1].timestamp;
    const nodWindow = this.pitchHistory.filter(
      r => currentTime - r.timestamp < 800
    );
    
    if (nodWindow.length < 5) return null;
    
    // 연속된 측정값 간의 피치 변화 방향 계산
    const directions: number[] = [];
    for (let i = 1; i < nodWindow.length; i++) {
      const diff = nodWindow[i].rotation.pitch - nodWindow[i-1].rotation.pitch;
      // 노이즈 필터링 (1도 미만 변화는 무시)
      if (Math.abs(diff) > 1) {
        directions.push(Math.sign(diff));
      }
    }
    
    // 방향 전환 횟수 계산
    let directionChanges = 0;
    for (let i = 1; i < directions.length; i++) {
      if (directions[i] !== directions[i-1] && directions[i] !== 0 && directions[i-1] !== 0) {
        directionChanges++;
      }
    }
    
    // 충분한 방향 전환과 충분한 피치 변화가 있으면 고개 끄덕임으로 간주
    const pitchRange = Math.max(...nodWindow.map(r => r.rotation.pitch)) - 
                       Math.min(...nodWindow.map(r => r.rotation.pitch));
                     
    if (directionChanges >= 1 && pitchRange >= this.pitchThreshold) {
      console.log(`[MotionDetector] 고개 끄덕임 감지: 방향 전환 ${directionChanges}회, 피치 변화 ${pitchRange.toFixed(2)}°`);
      
      return {
        type: "HEAD_NOD",
        confidence: Math.min(1.0, (directionChanges / 2) * (pitchRange / this.pitchThreshold)),
        details: {
          directionChanges,
          pitchRange,
          window: nodWindow.length
        }
      };
    }
    
    return null;
  }

  // 임계값 및 설정 접근자 메서드들
  public getHistoryLength(): number {
    return this.historyLength;
  }

  public getYawThreshold(): number {
    return this.yawThreshold;
  }

  public getVelocityThreshold(): number {
    return this.yawVelocityThreshold;
  }

  public getEventCooldown(): number {
    return this.eventCooldown;
  }

  // 히스토리 데이터 얻기 (디버깅용)
  public getYawHistory(): MotionMeasurement[] {
    return [...this.yawHistory];
  }

  public getPitchHistory(): MotionMeasurement[] {
    return [...this.pitchHistory];
  }

  // 모든 히스토리 초기화
  public resetHistory(): void {
    this.yawHistory = [];
    this.pitchHistory = [];
    this.lastEventTime = 0;
    console.log('[MotionDetector] 히스토리 초기화됨');
  }

  // 현재 설정 가져오기
  public getCurrentSettings(): MotionDetectorSettings {
    return {
      historyLength: this.historyLength,
      yawThreshold: this.yawThreshold,
      pitchThreshold: this.pitchThreshold,
      eventCooldown: this.eventCooldown,
      yawVelocityThreshold: this.yawVelocityThreshold,
      pitchVelocityThreshold: this.pitchVelocityThreshold
    };
  }
}
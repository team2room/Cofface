// services/BackgroundMotionService.ts
import * as mp from '@mediapipe/face_mesh'
import { MotionDetector } from './MotionDetectorService'
import { calculateFaceRotation } from '../../../components/FaceRecognition/utils'

class BackgroundMotionServiceClass {
  private faceMesh: mp.FaceMesh | null = null
  private videoElement: HTMLVideoElement | null = null
  private stream: MediaStream | null = null
  private isActive: boolean = false
  private frameId: number | null = null
  private initialized: boolean = false

  // 서비스 초기화
  public initialize(): void {
    if (this.initialized) return

    console.log('[BackgroundMotionService] 초기화 중...')

    // MediaPipe FaceMesh 초기화
    this.faceMesh = new mp.FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
      },
    })

    // 설정
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    // 결과 처리 콜백 설정
    this.faceMesh.onResults(this.onResults.bind(this))

    // 비디오 엘리먼트 생성 (백그라운드용)
    this.videoElement = document.createElement('video')
    this.videoElement.style.position = 'absolute'
    this.videoElement.style.top = '-9999px'
    this.videoElement.style.left = '-9999px'
    this.videoElement.style.width = '1px'
    this.videoElement.style.height = '1px'
    this.videoElement.muted = true
    this.videoElement.playsInline = true

    document.body.appendChild(this.videoElement)

    // 모션 감지 최적화 설정 적용
    MotionDetector.optimizeForHeadShakeAndNod()

    this.initialized = true
    console.log('[BackgroundMotionService] 초기화 완료')
  }

  // 모션 감지 결과 처리
  private onResults(results: mp.Results): void {
    // 얼굴이 감지된 경우만 처리
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0]

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks)

      // 모션 감지 처리
      MotionDetector.processRotation(rotationValues, Date.now())
    }
  }

  // 프레임 처리 루프
  private async processFrame(): Promise<void> {
    if (!this.isActive || !this.faceMesh || !this.videoElement) return

    try {
      await this.faceMesh.send({ image: this.videoElement })
    } catch (error) {
      console.error('[BackgroundMotionService] 프레임 처리 오류:', error)
    }

    // 다음 프레임 처리 예약
    this.frameId = requestAnimationFrame(this.processFrame.bind(this))
  }

  // 서비스 시작
  public async start(): Promise<void> {
    if (this.isActive) return

    if (!this.initialized) {
      this.initialize()
    }

    console.log('[BackgroundMotionService] 시작 중...')

    try {
      // 카메라 스트림 가져오기
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      )

      // 첫 번째 카메라 자동 선택
      const constraints: MediaStreamConstraints = {
        video:
          videoDevices.length > 0
            ? { deviceId: { exact: videoDevices[0].deviceId } }
            : true,
      }

      // 기존 스트림 정리
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop())
      }

      console.log('[BackgroundMotionService] 카메라 접근 중...')
      this.stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (this.videoElement) {
        this.videoElement.srcObject = this.stream
        await this.videoElement.play()
        console.log('[BackgroundMotionService] 비디오 스트림 시작됨')

        // 프레임 처리 시작
        this.isActive = true
        this.processFrame()
      }

      console.log('[BackgroundMotionService] 시작 완료')
    } catch (error) {
      console.error('[BackgroundMotionService] 시작 오류:', error)
    }
  }

  // 서비스 중지
  public stop(): void {
    console.log('[BackgroundMotionService] 중지 중...')

    this.isActive = false

    // 프레임 처리 중지
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }

    // 스트림 정리
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    // 비디오 소스 제거
    if (this.videoElement) {
      this.videoElement.srcObject = null
    }

    console.log('[BackgroundMotionService] 중지 완료')
  }

  // 서비스 정리 (앱 종료 시 등)
  public cleanup(): void {
    this.stop()

    // 비디오 엘리먼트 제거
    if (this.videoElement && document.body.contains(this.videoElement)) {
      document.body.removeChild(this.videoElement)
    }

    this.videoElement = null
    this.faceMesh = null
    this.initialized = false

    console.log('[BackgroundMotionService] 리소스 정리 완료')
  }

  // 상태 확인
  public isRunning(): boolean {
    return this.isActive
  }
}

// 싱글톤 인스턴스
const BackgroundMotionService = new BackgroundMotionServiceClass()

export default BackgroundMotionService

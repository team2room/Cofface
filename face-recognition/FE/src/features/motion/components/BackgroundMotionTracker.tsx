// components/HeadShaking/BackgroundMotionTracker.tsx
import React, { useState, useEffect, useRef } from 'react'
import * as mp from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import { calculateFaceRotation } from '../../../components/FaceRecognition/utils'
import { MotionDetector } from '../services/MotionDetectorService'

interface BackgroundMotionTrackerProps {
  active?: boolean
  cameraId?: string
  onFaceDetected?: (detected: boolean) => void
}

const BackgroundMotionTracker: React.FC<BackgroundMotionTrackerProps> = ({
  active = true,
  cameraId,
  onFaceDetected,
}) => {
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [faceDetected, setFaceDetected] = useState<boolean>(false)

  // Refs 선언
  const videoRef = useRef<HTMLVideoElement>(null)
  const faceMeshRef = useRef<mp.FaceMesh | null>(null)
  const cameraRef = useRef<cam.Camera | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameCountRef = useRef<number>(0)

  // 디버깅을 위한 스타일 (hidden video element)
  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1000,
  }

  // MediaPipe 모델 로드
  useEffect(() => {
    const loadMediaPipeModels = async (): Promise<void> => {
      try {
        console.log('[BackgroundMotionTracker] MediaPipe 모델 로딩 시작...')

        // MediaPipe FaceMesh 초기화
        const faceMesh = new mp.FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
          },
        })

        // 설정
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.2,
          minTrackingConfidence: 0.2,
        })

        // 결과 처리 콜백 설정
        faceMesh.onResults(onResults)
        faceMeshRef.current = faceMesh

        console.log('[BackgroundMotionTracker] MediaPipe 모델 로딩 완료')
        setModelsLoaded(true)
      } catch (error) {
        console.error(
          '[BackgroundMotionTracker] MediaPipe 모델 로딩 오류:',
          error,
        )
      }
    }

    loadMediaPipeModels()

    return () => {
      stopCamera()
    }
  }, [])

  // 활성화 상태 변경 감지
  useEffect(() => {
    console.log(`[BackgroundMotionTracker] 활성화 상태 변경: ${active}`)
    MotionDetector.setActive(active)

    if (active && modelsLoaded && !cameraActive) {
      startCamera()
    } else if (!active && cameraActive) {
      stopCamera()
    }
  }, [active, modelsLoaded])

  // 카메라 ID 변경 감지
  useEffect(() => {
    if (cameraId && cameraActive) {
      // 카메라 ID가 변경되면 카메라 재시작
      stopCamera()
      startCamera()
    }
  }, [cameraId])

  // MediaPipe 결과 처리 함수
  const onResults = (results: mp.Results): void => {
    // 얼굴이 감지되었는지 확인
    const detected =
      results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0

    // 얼굴 감지 상태 변경 시에만 상태 업데이트 및 콜백 호출 (불필요한 리렌더링 방지)
    if (detected !== faceDetected) {
      setFaceDetected(detected)
      onFaceDetected?.(detected)
    }

    // 얼굴이 감지된 경우만 처리
    if (detected) {
      const landmarks = results.multiFaceLandmarks[0]

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks)

      // 모션 감지 서비스에 전달 (5 프레임마다 처리)
      frameCountRef.current = (frameCountRef.current + 1) % 5
      if (frameCountRef.current === 0) {
        MotionDetector.processRotation(rotationValues, Date.now())
      }
    }
  }

  // 카메라 시작
  const startCamera = async (): Promise<void> => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      console.warn(
        '[BackgroundMotionTracker] 모델이나 비디오 엘리먼트가 준비되지 않았습니다',
      )
      return
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: cameraId ? { exact: cameraId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      }

      console.log('[BackgroundMotionTracker] 카메라 시작 중...', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      // MediaPipe 카메라 객체 생성
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            try {
              await faceMeshRef.current.send({ image: videoRef.current })
            } catch (error) {
              console.error(
                '[BackgroundMotionTracker] FaceMesh 처리 오류:',
                error,
              )
            }
          }
        },
        width: 640,
        height: 480,
      })

      // 카메라 시작
      await cameraRef.current.start()
      setCameraActive(true)
      console.log('[BackgroundMotionTracker] 카메라 스트림 시작 완료')
    } catch (err) {
      console.error('[BackgroundMotionTracker] 카메라 시작 실패:', err)
    }
  }

  // 카메라 중지
  const stopCamera = (): void => {
    console.log('[BackgroundMotionTracker] 카메라 중지 중...')

    if (cameraRef.current) {
      cameraRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    setCameraActive(false)
    setFaceDetected(false)
    console.log('[BackgroundMotionTracker] 카메라 중지 완료')
  }

  return (
    <>
      <video ref={videoRef} style={videoStyle} autoPlay playsInline muted />
    </>
  )
}

export default BackgroundMotionTracker

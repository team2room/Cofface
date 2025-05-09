// src/hooks/useCamera.ts

import { useState, useRef, useEffect } from 'react'
import { Camera } from '@mediapipe/camera_utils'

interface UseCameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  width: number
  height: number
  onFrame?: () => Promise<void>
  enabled?: boolean
}

interface UseCameraResult {
  isReady: boolean
  isRunning: boolean
  startCamera: () => Promise<void>
  stopCamera: () => void
  error: string | null
}

const useCamera = ({
  videoRef,
  width,
  height,
  onFrame,
  enabled = false,
}: UseCameraProps): UseCameraResult => {
  const [isReady, setIsReady] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraRef = useRef<Camera | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // 카메라 초기화
  useEffect(() => {
    if (!videoRef.current) return

    try {
      // 카메라 객체 생성
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (onFrame) await onFrame()
        },
        width,
        height,
      })
      setIsReady(true)
    } catch (err) {
      console.error('카메라 초기화 오류:', err)
      setError('카메라를 초기화하는 중 오류가 발생했습니다.')
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      stopCamera()
    }
  }, [videoRef, width, height, onFrame])

  // enabled 속성이 변경될 때 카메라 시작/중지
  useEffect(() => {
    if (enabled && isReady && !isRunning) {
      startCamera()
    } else if (!enabled && isRunning) {
      stopCamera()
    }
  }, [enabled, isReady, isRunning])

  // 카메라 시작
  const startCamera = async (): Promise<void> => {
    if (!cameraRef.current || isRunning) return

    try {
      await cameraRef.current.start()
      setIsRunning(true)
    } catch (err) {
      console.error('카메라 시작 오류:', err)
      setError('카메라를 시작하는 중 오류가 발생했습니다.')
    }
  }

  // 카메라 중지
  const stopCamera = (): void => {
    if (!cameraRef.current) return

    try {
      cameraRef.current.stop()

      // 미디어 스트림 정리
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }

      setIsRunning(false)
    } catch (err) {
      console.error('카메라 중지 오류:', err)
    }
  }

  useEffect(() => {
    if (!videoRef.current || !isRunning) return

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'user' },
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current
            .play()
            .catch((e) => console.error('비디오 재생 오류:', e))
          mediaStreamRef.current = stream
        }
      })
      .catch((err) => {
        console.error('카메라 접근 오류:', err)
        setError('카메라 접근에 실패했습니다.')
      })

    // 정리 함수
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isRunning])

  return {
    isReady,
    isRunning,
    startCamera,
    stopCamera,
    error,
  }
}

export default useCamera

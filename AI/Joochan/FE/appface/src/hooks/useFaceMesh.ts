// src/hooks/useFaceMesh.ts

import { useState, useRef, useEffect } from 'react'
import * as facemesh from '@mediapipe/face_mesh'
// import { type FaceMeshResults } from '../types/face'

interface UseFaceMeshProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  onResults: (results: facemesh.Results) => void
  enabled?: boolean
  isMobile?: boolean
}

interface UseFaceMeshResult {
  isReady: boolean
  isRunning: boolean
  error: string | null
  processFrame: () => Promise<void>
}

const useFaceMesh = ({
  videoRef,
  onResults,
  enabled = false,
  isMobile = false,
}: UseFaceMeshProps): UseFaceMeshResult => {
  const [isReady, setIsReady] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const faceMeshRef = useRef<facemesh.FaceMesh | null>(null)

  // FaceMesh 초기화
  useEffect(() => {
    if (!videoRef.current) return

    try {
      // FaceMesh 인스턴스 생성
      faceMeshRef.current = new facemesh.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      // 모바일 성능 최적화
      const detectionConfidence = isMobile ? 0.2 : 0.3
      const trackingConfidence = isMobile ? 0.2 : 0.3

      // FaceMesh 설정
      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: detectionConfidence,
        minTrackingConfidence: trackingConfidence,
      })

      // 결과 콜백 설정
      faceMeshRef.current.onResults(onResults)
      setIsReady(true)
    } catch (err) {
      console.error('FaceMesh 초기화 오류:', err)
      setError('얼굴 인식 모듈을 초기화하는 중 오류가 발생했습니다.')
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (faceMeshRef.current) {
        faceMeshRef.current.close()
      }
    }
  }, [videoRef, onResults, isMobile])

  // enabled 상태에 따라 실행 상태 업데이트
  useEffect(() => {
    setIsRunning(enabled && isReady)
  }, [enabled, isReady])

  // 비디오 프레임 처리 함수
  const processFrame = async (): Promise<void> => {
    if (faceMeshRef.current && videoRef.current && isRunning) {
      await faceMeshRef.current.send({ image: videoRef.current })
    }
  }

  return {
    isReady,
    isRunning,
    error,
    processFrame,
  }
}

export default useFaceMesh

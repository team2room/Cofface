// src/hooks/useFaceDirection.ts

import { useState, useRef, useEffect } from 'react'
import { type FaceDirection, type FaceLandmark } from '../types/face'
import faceRecognitionService from '../services/faceRegistrationService'

interface UseFaceDirectionProps {
  landmarks?: Array<FaceLandmark>
  threshold?: number
  stabilityFrames?: number
}

interface UseFaceDirectionResult {
  direction: FaceDirection
  confidence: number
  isStable: boolean
  directionCounts: Record<FaceDirection, number>
}

const useFaceDirection = ({
  landmarks,
  threshold = 3,
  stabilityFrames = 5,
}: UseFaceDirectionProps): UseFaceDirectionResult => {
  const [direction, setDirection] = useState<FaceDirection>('unknown')
  const [confidence, setConfidence] = useState<number>(0)
  const [isStable, setIsStable] = useState<boolean>(false)

  const directionCountsRef = useRef<Record<FaceDirection, number>>({
    front: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    unknown: 0,
  })

  const previousDirectionRef = useRef<FaceDirection>('unknown')
  const stableFramesRef = useRef<number>(0)

  // 랜드마크가 변경될 때마다 방향 계산
  useEffect(() => {
    if (!landmarks || landmarks.length < 468) {
      setDirection('unknown')
      setConfidence(0)
      setIsStable(false)
      return
    }

    // 얼굴 방향 계산에 필요한 랜드마크 추출
    const leftEye = landmarks[33]
    const rightEye = landmarks[263]
    const noseTip = landmarks[1]
    const foreHead = landmarks[10]
    const chin = landmarks[152]

    // 수평 및 수직 오프셋 계산
    const centerX = (leftEye.x + rightEye.x) / 2
    const horizontalOffset = (noseTip.x - centerX) * 100

    const normalizedNoseY = (noseTip.y - foreHead.y) / (chin.y - foreHead.y)
    const verticalOffset = (normalizedNoseY - 0.5) * 100

    // 얼굴 방향 계산
    const detectedDirection = faceRecognitionService.calculateFaceDirection(
      horizontalOffset,
      verticalOffset,
    )

    // 방향 카운트 업데이트
    directionCountsRef.current[detectedDirection]++

    // 방향 안정성 확인
    if (detectedDirection === previousDirectionRef.current) {
      stableFramesRef.current++
    } else {
      stableFramesRef.current = 0
    }

    const newIsStable = stableFramesRef.current >= stabilityFrames

    // 안정적인 방향으로 판단되면 상태 업데이트
    if (newIsStable && detectedDirection !== direction) {
      setDirection(detectedDirection)

      // 방향별 신뢰도 계산 (간단한 구현)
      const totalCounts = Object.values(directionCountsRef.current).reduce(
        (a, b) => a + b,
        0,
      )
      const directionConfidence =
        totalCounts > 0
          ? directionCountsRef.current[detectedDirection] / totalCounts
          : 0

      setConfidence(directionConfidence)
    }

    setIsStable(newIsStable)
    previousDirectionRef.current = detectedDirection
  }, [landmarks, threshold, stabilityFrames])

  return {
    direction,
    confidence,
    isStable,
    directionCounts: { ...directionCountsRef.current },
  }
}

export default useFaceDirection

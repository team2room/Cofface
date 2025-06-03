// src/components/face-registration/FaceRegistration.tsx

import React, { useState, useRef, useEffect } from 'react'
import {
  type FaceRegistrationProps,
  type FaceDirection,
  type CapturedImages,
} from '../../types/face'
import CameraView from './CameraView'
import DirectionGuide from './DirectionGuide'
import ProgressBar from './ProgressBar'
import CountdownTimer from './CountdownTimer'
import CapturedImagesView from './CapturedImages'
import Button from '../common/Button'
import useCamera from '../../hooks/useCamera'
import useFaceMesh from '../../hooks/useFaceMesh'
import useCountdown from '../../hooks/useCountdown'
import useFaceDirection from '../../hooks/useFaceDirection'
import faceRecognitionService from '../../services/faceRegistrationService'

const FaceRegistration: React.FC<FaceRegistrationProps> = ({
  userId,
  onComplete,
}) => {
  // 상태 관리
  const [capturedImages, setCapturedImages] = useState<CapturedImages>(
    {} as CapturedImages,
  )
  const [message, setMessage] = useState('카메라를 활성화하고 시작하세요')
  const [progress, setProgress] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 640 })
  const [currentTargetDirection, setCurrentTargetDirection] =
    useState<FaceDirection>('front')
  const [isChangingDirection, setIsChangingDirection] = useState(false)
  const [faceLandmarks, setFaceLandmarks] = useState<any[]>([])

  // 참조 생성
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isSubmittingRef = useRef(false)
  const currentTargetDirectionRef = useRef<FaceDirection>('front')

  const { direction: currentDirection, isStable } = useFaceDirection({
    landmarks: faceLandmarks,
    stabilityFrames: 5,
  })

  // 필요한 방향 목록
  const requiredDirections: FaceDirection[] = [
    'front',
    'left',
    'right',
    'up',
    'down',
  ]

  // 방향별 지시 메시지
  const directionGuides: Record<FaceDirection, string> = {
    front: '카메라를 정면으로 바라봐주세요',
    left: '천천히 왼쪽으로 고개를 돌려주세요',
    right: '천천히 오른쪽으로 고개를 돌려주세요',
    up: '천천히 위쪽을 바라봐주세요',
    down: '천천히 아래쪽을 바라봐주세요',
    unknown: '얼굴을 감지할 수 없습니다. 카메라 앞에 위치해주세요',
  }

  // 훅 사용
  const {
    isReady: _isCameraReady,
    startCamera,
    stopCamera: _stopCamera,
  } = useCamera({
    videoRef,
    width: canvasSize.width,
    height: canvasSize.height,
    enabled: isCapturing,
  })

  const {
    isActive: isCountdownActive,
    progress: countdownProgress,
    remainingTime: captureCountdown,
    startCountdown,
    resetCountdown,
  } = useCountdown({
    duration: 2000,
    onComplete: () => handleCountdownComplete(),
  })

  // FaceMesh 결과 처리 콜백
  const onFaceMeshResults = (results: any) => {
    if (!canvasRef.current || !results || !results.image) return

    const canvasCtx = canvasRef.current.getContext('2d')
    if (!canvasCtx) return

    // 캔버스 초기화
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // 비디오 피드 그리기 (반전 적용)
    canvasCtx.save()
    canvasCtx.scale(-1, 1)
    canvasCtx.translate(-canvasRef.current.width, 0)
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    )
    canvasCtx.restore()

    // 랜드마크 처리 로직...
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      // 얼굴 랜드마크 추출
      const landmarks = results.multiFaceLandmarks[0]

      // useFaceDirection 훅에 랜드마크 전달하기 위해 상태 업데이트
      setFaceLandmarks(landmarks)
      // 디버깅용 - 주요 랜드마크 표시 (선택적)
      if (isCapturing) {
        processFrame()
      }
    }
  }

  const { isReady: _isFaceMeshReady, processFrame } = useFaceMesh({
    videoRef,
    onResults: onFaceMeshResults,
    enabled: isCapturing,
  })

  // 반응형 캔버스 크기 조절
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const height = Math.floor(containerWidth * (4 / 3))
      const isMobile = window.innerWidth < 768
      const scaleFactor = isMobile ? 0.8 : 1.0

      const finalWidth = Math.floor(containerWidth * scaleFactor)
      const finalHeight = Math.floor(height * scaleFactor)

      if (
        finalWidth !== canvasSize.width ||
        finalHeight !== canvasSize.height
      ) {
        setCanvasSize({ width: finalWidth, height: finalHeight })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  // 타겟 방향 업데이트
  useEffect(() => {
    if (!isCapturing) return

    const nextDirection = requiredDirections.find(
      (dir) => !Object.keys(capturedImages).includes(dir),
    )

    if (nextDirection) {
      setCurrentTargetDirection(nextDirection)
      currentTargetDirectionRef.current = nextDirection
      setMessage(
        `${nextDirection} 방향을 바라봐주세요. ${directionGuides[nextDirection]}`,
      )
    }
  }, [isCapturing, capturedImages])

  // 현재 방향과 타겟 방향 비교
  useEffect(() => {
    if (!isCapturing || isChangingDirection) return

    const isMatchingDirection = currentDirection === currentTargetDirection

    if (isMatchingDirection && isStable && !isCountdownActive) {
      startCountdown()
    } else if (!isMatchingDirection && isCountdownActive) {
      resetCountdown()
    }
  }, [
    currentDirection,
    currentTargetDirection,
    isCapturing,
    isStable,
    isChangingDirection,
  ])

  // 카운트다운 완료 처리
  const handleCountdownComplete = () => {
    if (isChangingDirection) return

    if (isCapturing && currentDirection === currentTargetDirection) {
      captureImage(currentTargetDirection)
    }
  }

  // 이미지 캡처
  const captureImage = (direction: FaceDirection) => {
    if (!canvasRef.current || capturedImages[direction]) return

    setIsChangingDirection(true)
    resetCountdown()

    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9)

    if (!imageData) {
      console.error('이미지 데이터 추출 실패')
      setIsChangingDirection(false)
      return
    }

    setCapturedImages((prev) => {
      const updated = { ...prev, [direction]: imageData }

      const isAllCaptured = requiredDirections.every(
        (dir) => updated[dir] !== undefined,
      )

      if (isAllCaptured) {
        setTimeout(() => {
          setIsCapturing(false)
          submitRegistration()
        }, 1000)
      }

      return updated
    })

    setMessage(`${direction} 방향 캡처 완료!`)
    processNextDirection(direction)
  }

  // 다음 방향 처리
  const processNextDirection = (currentDirection: FaceDirection) => {
    const currentIndex = requiredDirections.findIndex(
      (dir) => dir === currentDirection,
    )
    const nextIndex = currentIndex + 1

    resetCountdown()

    if (nextIndex < requiredDirections.length) {
      const nextDirection = requiredDirections[nextIndex]
      currentTargetDirectionRef.current = nextDirection

      setTimeout(() => {
        setCurrentTargetDirection(nextDirection)
        setTimeout(() => {
          setMessage(
            `다음은 ${nextDirection} 방향을 캡처해주세요. ${directionGuides[nextDirection]}`,
          )
          setIsChangingDirection(false)
        }, 300)
      }, 500)
    } else {
      setTimeout(() => {
        setIsChangingDirection(false)
      }, 500)
    }
  }

  // 서버에 등록 데이터 제출
  const submitRegistration = async () => {
    const missingDirections = requiredDirections.filter(
      (dir) => !capturedImages[dir],
    )

    if (missingDirections.length > 0) {
      setMessage(
        `다음 방향이 누락되었습니다: ${missingDirections.join(', ')}. 다시 시도해주세요.`,
      )
      return
    }

    if (isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsProcessing(true)
    setMessage('서버에 얼굴 정보를 등록 중입니다...')

    try {
      const result = await faceRecognitionService.registerFace(
        userId,
        capturedImages,
      )
      setMessage('얼굴 등록이 완료되었습니다!')
      onComplete(true, '얼굴 등록 성공')
      console.log(result)
    } catch (error) {
      console.error('등록 중 오류:', error)
      setMessage('서버 연결 오류가 발생했습니다.')
      onComplete(false, '서버 연결 오류')
    } finally {
      setIsProcessing(false)
      isSubmittingRef.current = false
    }
  }

  // 캡처 시작
  const handleStart = () => {
    setIsCapturing(true)
    setCapturedImages({} as CapturedImages)
    setMessage('모든 방향의 얼굴을 캡처합니다. 먼저 정면을 바라봐주세요.')
    startCamera()
  }

  // 진행 상황 업데이트
  useEffect(() => {
    const capturedCount = Object.keys(capturedImages).length
    const totalCount = requiredDirections.length
    setProgress((capturedCount / totalCount) * 100)
  }, [capturedImages])

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">얼굴 등록</h2>

      <CameraView
        videoRef={videoRef}
        canvasRef={canvasRef}
        containerRef={containerRef}
        canvasSize={canvasSize}
        isCapturing={isCapturing}
      />

      {isCapturing && (
        <DirectionGuide
          currentDirection={currentDirection}
          targetDirection={currentTargetDirection}
          directionGuide={directionGuides[currentTargetDirection]}
        />
      )}

      <CountdownTimer
        countdown={captureCountdown}
        progress={countdownProgress}
        isActive={isCountdownActive && !isChangingDirection}
      />

      <div className="w-full mt-4">
        <ProgressBar progress={progress} label="등록 진행률" />
      </div>

      <div className="text-center mt-2 mb-4">
        <p className="text-gray-700">{message}</p>
      </div>

      <div className="flex space-x-4 mt-4">
        {!isCapturing && !isProcessing && (
          <Button onClick={handleStart} type="primary">
            시작
          </Button>
        )}

        {isCapturing && (
          <Button onClick={() => setIsCapturing(false)} type="secondary">
            취소
          </Button>
        )}
      </div>

      <CapturedImagesView
        images={capturedImages}
        showPreview={Object.keys(capturedImages).length > 0}
      />
    </div>
  )
}

export default FaceRegistration

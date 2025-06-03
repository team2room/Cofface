// src/components/FaceRegistration.tsx
import React, { useState, useRef, useEffect } from 'react'
import * as facemesh from '@mediapipe/face_mesh'
import * as camera from '@mediapipe/camera_utils'
import axios from 'axios'

interface FaceRegistrationProps {
  userId: string
  apiUrl: string
  onComplete: (success: boolean, message: string) => void
}

// 얼굴 방향 정의
type FaceDirection = 'front' | 'left' | 'right' | 'up' | 'down' | 'unknown'

const FaceRegistration: React.FC<FaceRegistrationProps> = ({
  userId,
  apiUrl,
  onComplete,
}) => {
  // 상태 관리
  const [capturedImages, setCapturedImages] = useState<
    Record<FaceDirection, string>
  >({} as Record<FaceDirection, string>)
  const [currentDirection, setCurrentDirection] =
    useState<FaceDirection>('unknown')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [message, setMessage] =
    useState<string>('카메라를 활성화하고 시작하세요')
  const [progress, setProgress] = useState<number>(0)
  const [isCapturing, setIsCapturing] = useState<boolean>(false)
  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 640 })

  const [currentTargetDirection, setCurrentTargetDirection] =
    useState<FaceDirection>('front')
  const [captureCountdown, setCaptureCountdown] = useState<number>(0)
  const isCapturingRef = useRef<boolean>(false)

  // 캔버스 컨테이너 참조 - 반응형 크기 조절을 위해 추가
  const containerRef = useRef<HTMLDivElement>(null)

  // 카운트다운 정확도를 위한 타임스탬프 참조
  const countdownStartTimeRef = useRef<number>(0)
  const countdownDurationRef = useRef<number>(2000) // 2초 (밀리초 단위)

  useEffect(() => {
    isCapturingRef.current = isCapturing
  }, [isCapturing])

  const currentDirectionRef = useRef<FaceDirection>('unknown')
  const captureCountdownRef = useRef<number>(0)

  useEffect(() => {
    currentDirectionRef.current = currentDirection
  }, [currentDirection])

  // 반응형 캔버스 크기 조절 함수 추가
  const updateCanvasSize = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      // 가로폭에 맞게 4:3 비율 유지
      const height = Math.floor(containerWidth * (4 / 3))

      // 모바일에서는 더 작은 크기로 조정하여 성능 최적화
      const isMobile = window.innerWidth < 768
      const scaleFactor = isMobile ? 0.8 : 1.0 // 모바일에서는 해상도 80%로 조정

      const finalWidth = Math.floor(containerWidth * scaleFactor)
      const finalHeight = Math.floor(height * scaleFactor)

      // 캔버스 크기가 변경될 때만 상태 업데이트
      if (
        finalWidth !== canvasSize.width ||
        finalHeight !== canvasSize.height
      ) {
        setCanvasSize({ width: finalWidth, height: finalHeight })

        // FaceMesh에도 새 크기 적용
        if (videoRef.current) {
          videoRef.current.width = finalWidth
          videoRef.current.height = finalHeight
        }

        if (canvasRef.current) {
          canvasRef.current.width = finalWidth
          canvasRef.current.height = finalHeight
        }
      }
    }
  }

  // 화면 크기 변경 감지
  useEffect(() => {
    updateCanvasSize() // 초기 로드 시 크기 설정

    const handleResize = () => {
      updateCanvasSize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 방향별 지시 메시지
  const directionGuides: Record<FaceDirection, string> = {
    front: '카메라를 정면으로 바라봐주세요',
    left: '천천히 왼쪽으로 고개를 돌려주세요',
    right: '천천히 오른쪽으로 고개를 돌려주세요',
    up: '천천히 위쪽을 바라봐주세요',
    down: '천천히 아래쪽을 바라봐주세요',
    unknown: '얼굴을 감지할 수 없습니다. 카메라 앞에 위치해주세요',
  }

  // 필요한 방향 목록
  const requiredDirections: FaceDirection[] = [
    'front',
    'left',
    'right',
    'up',
    'down',
  ]

  // 참조 변수
  const frameCounterRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const faceMeshRef = useRef<facemesh.FaceMesh | null>(null)
  const cameraRef = useRef<camera.Camera | null>(null)
  const detectedDirectionCountRef = useRef<Record<FaceDirection, number>>({
    front: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    unknown: 0,
  })

  useEffect(() => {
    if (isCapturing && cameraRef.current) {
      // 캡처 모드 활성화 시 카메라 시작
      cameraRef.current
        .start()
        .then(() => {
          console.log('카메라 시작됨')
        })
        .catch((err) => {
          console.error('카메라 시작 오류:', err)
        })
    } else if (!isCapturing && cameraRef.current) {
      // 캡처 모드 비활성화 시 카메라 정지
      try {
        cameraRef.current.stop()
      } catch (err) {
        console.error('카메라 정지 오류:', err)
      }
    }
  }, [isCapturing])

  useEffect(() => {
    if (isCapturing) {
      // 아직 캡처되지 않은 방향 중 순서에 맞는 첫 번째 방향 선택
      const directionOrder: FaceDirection[] = [
        'front',
        'left',
        'right',
        'up',
        'down',
      ]
      const nextDirection = directionOrder.find(
        (dir) => !Object.keys(capturedImages).includes(dir),
      )

      if (nextDirection) {
        setCurrentTargetDirection(nextDirection)
        setMessage(
          `${nextDirection} 방향을 바라봐주세요. ${directionGuides[nextDirection]}`,
        )
      }
    }
  }, [isCapturing, capturedImages])

  // 얼굴 방향 계산
  const calculateFaceDirection = (
    horizontalOffset: number,
    verticalOffset: number,
  ): FaceDirection => {
    // 반전된 화면에 맞게 horizontalOffset 부호 변경
    horizontalOffset = -horizontalOffset

    // 방향 판별 로직
    if (
      horizontalOffset >= -3 &&
      horizontalOffset <= 3 &&
      verticalOffset >= -3 &&
      verticalOffset <= 12
    ) {
      return 'front'
    } else if (
      horizontalOffset < -3 &&
      verticalOffset >= -3 &&
      verticalOffset <= 12
    ) {
      return 'left'
    } else if (
      horizontalOffset > 3 &&
      verticalOffset >= -3 &&
      verticalOffset <= 12
    ) {
      return 'right'
    } else if (
      horizontalOffset >= -3 &&
      horizontalOffset <= 3 &&
      verticalOffset < -3
    ) {
      return 'up'
    } else if (
      horizontalOffset >= -3 &&
      horizontalOffset <= 3 &&
      verticalOffset > 12
    ) {
      return 'down'
    } else {
      return 'unknown'
    }
  }

  // 정확한 시간 측정을 위한 카운트다운 시작 함수
  const startCountdown = () => {
    // 현재 시간을 밀리초로 저장
    countdownStartTimeRef.current = Date.now()
    setCaptureCountdown(countdownDurationRef.current)
    captureCountdownRef.current = countdownDurationRef.current
  }

  // 카운트다운 리셋 함수
  const resetCountdown = () => {
    setCaptureCountdown(0)
    captureCountdownRef.current = 0
    countdownStartTimeRef.current = 0
    setCountdownProgress(0)

    // 프로그레스바 DOM 직접 제어
    const progressBar = document.getElementById('countdown-progress-bar')
    if (progressBar) {
      progressBar.style.width = '0%'
    }
  }
  // FaceMesh 결과 처리 (메시망 표시 제거)
  const onFaceMeshResults = (results: facemesh.Results) => {
    if (!canvasRef.current || !results) return

    const canvasCtx = canvasRef.current.getContext('2d')
    if (!canvasCtx) return

    canvasCtx.save()

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

    // 얼굴이 감지된 경우
    if (results.multiFaceLandmarks.length > 0) {
      // 메시망 그리기 코드 제거 (FaceMesh 시각화 없앰)

      // 오프셋 계산에는 원본 랜드마크 사용 (내부 계산은 원본 좌표로)
      const landmarks = results.multiFaceLandmarks[0]
      const leftEye = landmarks[33]
      const rightEye = landmarks[263]
      const noseTip = landmarks[1]
      const foreHead = landmarks[10]
      const chin = landmarks[152]

      const centerX = (leftEye.x + rightEye.x) / 2

      const horizontalOffset = (noseTip.x - centerX) * 100
      const normalizedNoseY = (noseTip.y - foreHead.y) / (chin.y - foreHead.y)
      const verticalOffset = (normalizedNoseY - 0.5) * 100

      // 얼굴 방향 계산
      const detectedDirection = calculateFaceDirection(
        horizontalOffset,
        verticalOffset,
      )

      // 감지된 방향을 현재 방향으로 설정
      if (detectedDirection !== currentDirection) {
        setCurrentDirection(detectedDirection)
        currentDirectionRef.current = detectedDirection
      }

      // 타겟 방향과 일치하는지 확인
      if (isCapturingRef.current && results.multiFaceLandmarks.length > 0) {
        // 1. 감지된 방향이 목표 방향과 일치하는지 체크
        const isMatchingDirection =
          currentDirectionRef.current === currentTargetDirectionRef.current

        // 2. 방향이 일치하고 카운트다운이 시작되지 않았으면 카운트다운 시작
        if (isMatchingDirection && captureCountdownRef.current === 0) {
          startCountdown()
        }
        // 3. 방향이 일치하지 않고 카운트다운이 진행 중이면 카운트다운 취소
        else if (
          !isMatchingDirection &&
          captureCountdownRef.current > 0 &&
          detectedDirection !== 'unknown'
        ) {
          resetCountdown()
        }
      }

      // 캔버스에 방향 텍스트 표시하는 코드 제거 (UI 클린업)
    } else {
      setCurrentDirection('unknown')
      if (captureCountdown > 0) {
        resetCountdown()
      }
    }

    canvasCtx.restore()
  }

  const isHandlingCountdownRef = useRef<boolean>(false)
  const [countdownProgress, setCountdownProgress] = useState<number>(0)
  const [isChangingDirection, setIsChangingDirection] = useState<boolean>(false)

  // 정확한 시간 측정을 위한 카운트다운 효과
  useEffect(() => {
    let animFrameId: number | null = null

    const updateCountdown = () => {
      // 방향 전환 중이면 카운트다운 즉시 중단
      if (isChangingDirection || countdownStartTimeRef.current === 0) {
        return
      }

      // 경과된 시간 계산 (밀리초)
      const elapsedTime = Date.now() - countdownStartTimeRef.current
      const remainingTime = Math.max(
        0,
        countdownDurationRef.current - elapsedTime,
      )

      // 프로그레스 계산 (0-100%)
      const progress =
        100 - (remainingTime / countdownDurationRef.current) * 100

      // 직접 DOM 조작으로 프로그레스바 업데이트 (더 빠른 반응성)
      const progressBar = document.getElementById('countdown-progress-bar')
      if (progressBar) {
        progressBar.style.width = `${progress}%`
      }

      // React 상태는 좀 더 낮은 빈도로 업데이트 (UI 부하 감소)
      if (Math.abs(progress - countdownProgress) > 5) {
        setCountdownProgress(progress)
      }

      // UI 업데이트와 ref 업데이트
      if (Math.abs(captureCountdownRef.current - remainingTime) > 100) {
        setCaptureCountdown(remainingTime)
        captureCountdownRef.current = remainingTime
      }

      // 카운트다운 완료 확인
      if (remainingTime <= 0 && !isHandlingCountdownRef.current) {
        isHandlingCountdownRef.current = true
        countdownStartTimeRef.current = 0
        setCaptureCountdown(0)
        captureCountdownRef.current = 0
        setCountdownProgress(0) // 즉시 0으로 리셋

        // 프로그레스바 DOM 직접 초기화 (중요!)
        if (progressBar) {
          progressBar.style.width = '0%'
        }

        // 약간 지연 후 완료 처리 (UI 업데이트 후)
        setTimeout(() => {
          if (!isChangingDirection) {
            // 재확인
            handleCountdownComplete()
          }
          isHandlingCountdownRef.current = false
        }, 50)
        return
      }

      // 다음 프레임 예약 (부드러운 애니메이션)
      if (remainingTime > 0 && !isChangingDirection) {
        animFrameId = requestAnimationFrame(updateCountdown)
      }
    }

    // 카운트다운이 활성화된 경우에만 애니메이션 프레임 시작
    if (captureCountdown > 0 && !isChangingDirection) {
      // 카운트다운 시작 시 진행률 초기화
      setCountdownProgress(0)
      animFrameId = requestAnimationFrame(updateCountdown)
    }

    return () => {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId)
      }
    }
  }, [captureCountdown, isChangingDirection])

  // 카운트다운 완료 처리를 별도 함수로 분리
  const handleCountdownComplete = () => {
    if (isChangingDirection) return
    // 캡처 실행 전에 방향이 일치하는지 최종 확인
    if (
      isCapturingRef.current &&
      currentDirectionRef.current === currentTargetDirection
    ) {
      // 카운트다운 관련 상태 완전히 초기화
      countdownStartTimeRef.current = 0
      setCaptureCountdown(0)
      captureCountdownRef.current = 0
      setCountdownProgress(0)

      // 즉시 캡처 진행
      captureImage(currentTargetDirection)
    }
  }

  // 특정 방향의 이미지 캡처
  const captureImage = (direction: FaceDirection) => {
    if (!canvasRef.current) return

    // 이미 캡처되었는지 확인
    if (capturedImages[direction]) {
      return
    }

    // 캡처 시점에 한 번 더 명시적으로 방향 확인
    if (currentDirectionRef.current !== direction) {
      resetCountdown()
      return
    }

    setIsChangingDirection(true)

    resetCountdown()
    setCountdownProgress(0)

    const progressBar = document.getElementById('countdown-progress-bar')
    if (progressBar) {
      progressBar.style.width = '0%'
    }

    // 캔버스에서 이미지 데이터 추출
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9)

    // 이미지가 추출되었는지 확인
    if (!imageData) {
      console.error('이미지 데이터 추출 실패')
      setIsChangingDirection(false)
      return
    }

    // 캡처된 이미지 저장
    setCapturedImages((prev) => {
      if (prev[direction]) {
        return prev
      }
      const updated = { ...prev, [direction]: imageData }

      // 모든 방향이 캡처되었는지 확인
      const isAllCaptured = requiredDirections.every(
        (dir) => updated[dir] !== undefined,
      )

      // 모든 방향 캡처 완료 시 즉시 처리
      if (isAllCaptured && direction === 'down') {
        setTimeout(() => {
          setIsCapturing(false)
          submitRegistration()
        }, 1000)
      }

      return updated
    })

    // 진행 상황 메시지 업데이트
    setMessage(`${direction} 방향 캡처 완료!`)
  }

  useEffect(() => {
    if (Object.keys(capturedImages).length > 0) {
      // 마지막으로 캡처된 방향 확인
      const lastDirection = Object.keys(capturedImages).pop() as FaceDirection
      if (lastDirection) {
        processNextDirection(lastDirection)
      }
    }
  }, [capturedImages])

  const currentTargetDirectionRef = useRef<FaceDirection>('front')

  useEffect(() => {
    currentTargetDirectionRef.current = currentTargetDirection

    resetCountdown()
    setCountdownProgress(0)

    const progressBar = document.getElementById('countdown-progress-bar')
    if (progressBar) {
      progressBar.style.width = '0%'
    }
  }, [currentTargetDirection])

  // 다음 방향 처리 로직
  const processNextDirection = (currentDirection: FaceDirection) => {
    const directionOrder: FaceDirection[] = [
      'front',
      'left',
      'right',
      'up',
      'down',
    ]

    const nextDirectionIndex =
      directionOrder.findIndex((dir) => dir === currentDirection) + 1

    resetCountdown()
    setCountdownProgress(0)

    const progressBar = document.getElementById('countdown-progress-bar')
    if (progressBar) {
      progressBar.style.width = '0%'
    }

    // 다음 타겟 방향 (순서대로)
    if (nextDirectionIndex < directionOrder.length) {
      const nextDirection = directionOrder[nextDirectionIndex]
      currentTargetDirectionRef.current = nextDirection

      setIsChangingDirection(true)

      setTimeout(() => {
        setCurrentTargetDirection(nextDirection)

        // 다음 방향으로 설정
        setTimeout(() => {
          setMessage(
            `다음은 ${nextDirection} 방향을 캡처해주세요. ${directionGuides[nextDirection]}`,
          )

          setIsChangingDirection(false)
        }, 300)
      }, 500)
    } else {
      // 모든 방향 캡처 완료
      setTimeout(() => {
        setIsCapturing(false)
        setIsChangingDirection(false)
        submitRegistration()
      }, 1000)
    }
  }

  useEffect(() => {
    if (captureCountdown === 0) {
      setCountdownProgress(0)

      // 프로그레스바 DOM 직접 업데이트
      const progressBar = document.getElementById('countdown-progress-bar')
      if (progressBar) {
        progressBar.style.width = '0%'
      }
    }
  }, [captureCountdown])

  const isSubmittingRef = useRef<boolean>(false)

  // 서버에 등록 데이터 제출
  const submitRegistration = async () => {
    const requiredDirections: FaceDirection[] = [
      'front',
      'left',
      'right',
      'up',
      'down',
    ]
    const missingDirections = requiredDirections.filter(
      (dir) => !capturedImages[dir],
    )

    if (missingDirections.length > 0) {
      setMessage(
        `다음 방향이 누락되었습니다: ${missingDirections.join(', ')}. 다시 시도해주세요.`,
      )
      return
    }

    if (isSubmittingRef.current) {
      return
    }
    isSubmittingRef.current = true

    setIsProcessing(true)
    setMessage('서버에 얼굴 정보를 등록 중입니다...')

    try {
      const response = await axios.post(`${apiUrl}/register`, {
        user_id: userId,
        face_images: capturedImages,
      })

      if (response.status === 200) {
        setMessage('얼굴 등록이 완료되었습니다!')
        onComplete(true, '얼굴 등록 성공')
      } else {
        throw new Error(response.data.detail || '등록 실패')
      }
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
    setCapturedImages({} as Record<FaceDirection, string>)
    setMessage('모든 방향의 얼굴을 캡처합니다. 먼저 정면을 바라봐주세요.')

    // 방향 카운터 및 프레임 카운터 초기화
    detectedDirectionCountRef.current = {
      front: 0,
      left: 0,
      right: 0,
      up: 0,
      down: 0,
      unknown: 0,
    }
    frameCounterRef.current = 0
  }

  // 진행 상황 업데이트
  useEffect(() => {
    const capturedCount = Object.keys(capturedImages).length
    const totalCount = requiredDirections.length
    setProgress((capturedCount / totalCount) * 100)
  }, [capturedImages])

  // 컴포넌트 마운트 시 카메라 초기화
  useEffect(() => {
    initCameraResources() // 카메라 리소스만 초기화

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      cleanupCameraResources()
    }
  }, [])

  // 카메라 리소스 초기화만 수행하는 함수
  const initCameraResources = async () => {
    if (!videoRef.current) return

    try {
      // FaceMesh 초기화
      faceMeshRef.current = new facemesh.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      // 모바일 성능 최적화 - 감지 신뢰도 낮추기
      const isMobile = window.innerWidth < 768
      const detectionConfidence = isMobile ? 0.2 : 0.3
      const trackingConfidence = isMobile ? 0.2 : 0.3

      // 설정 수정 - 모바일에서 더 낮은 감도 설정
      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: detectionConfidence,
        minTrackingConfidence: trackingConfidence,
      })

      faceMeshRef.current.onResults(onFaceMeshResults)

      // 카메라 객체만 생성하고 아직 시작하지 않음
      cameraRef.current = new camera.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current })
          }
        },
        width: canvasSize.width,
        height: canvasSize.height,
      })

      setMessage(
        '카메라가 준비되었습니다. 시작하려면 "시작" 버튼을 클릭하세요.',
      )
    } catch (err) {
      console.error('카메라 초기화 오류:', err)
      setMessage('카메라 접근에 실패했습니다. 권한을 확인해주세요.')
    }
  }

  // 카메라 리소스 정리 함수
  const cleanupCameraResources = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (cameraRef.current) {
      cameraRef.current.stop()
    }

    if (faceMeshRef.current) {
      faceMeshRef.current.close()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={containerRef}
        className="relative w-full bg-gray-100 rounded-lg overflow-hidden mb-4"
      >
        <video
          ref={videoRef}
          className="hidden absolute opacity-0 pointer-events-none"
          style={{ transform: 'scaleX(-1)', width: 0, height: 0 }}
        />
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={`w-full object-cover rounded-lg border-2 ${
            currentDirection !== 'unknown'
              ? 'border-green-500 shadow-lg shadow-green-200'
              : 'border-gray-300'
          } transition-all duration-300`}
        />

        {isCapturing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white p-3 rounded-lg text-center max-w-[90%]">
            <div className="text-base sm:text-lg font-semibold mb-1">
              <span
                className={
                  currentDirection === currentTargetDirection
                    ? 'text-green-400'
                    : 'text-white'
                }
              >
                현재: {currentDirection}
              </span>
              <span className="text-yellow-300 ml-2">
                목표: {currentTargetDirection}
              </span>
            </div>
            <div className="text-sm sm:text-base mb-2">
              {currentDirection === currentTargetDirection
                ? '✓ 방향 일치'
                : '✗ 방향 불일치'}
            </div>
            <div className="text-sm">
              {directionGuides[currentTargetDirection]}
            </div>
            {captureCountdown > 0 && !isChangingDirection && (
              <div className="mt-2 bg-green-900 bg-opacity-30 p-2 rounded">
                <div className="text-lg font-bold mb-1">
                  {Math.ceil(captureCountdown / 1000)}초 유지 중
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    id="countdown-progress-bar"
                    className="h-full bg-green-500"
                    style={{
                      width: `${countdownProgress}%`,
                      transition: 'none', // 트랜지션 효과 제거
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="my-4 text-center min-h-6 text-sm sm:text-base">
          {message}
        </div>

        <div className="flex justify-center gap-3 my-4">
          {!isCapturing && !isProcessing && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleStart}
              disabled={isProcessing}
            >
              시작
            </button>
          )}

          {isCapturing && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
              onClick={() => setIsCapturing(false)}
            >
              취소
            </button>
          )}
        </div>
      </div>

      {/* {Object.keys(capturedImages).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          {Object.entries(capturedImages).map(([direction, imageData]) => (
            <div key={direction} className="relative">
              <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-tr-sm rounded-bl-sm">
                {direction}
              </div>
              <img
                src={imageData}
                alt={`${direction} 얼굴`}
                className="w-full aspect-square object-cover rounded border border-gray-300"
              />
            </div>
          ))}
        </div>
      )} */}
    </div>
  )
}

export default FaceRegistration

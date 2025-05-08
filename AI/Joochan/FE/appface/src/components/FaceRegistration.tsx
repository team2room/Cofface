// src/components/FaceRegistration.tsx
import React, { useState, useRef, useEffect } from 'react'
import * as facemesh from '@mediapipe/face_mesh'
import * as camera from '@mediapipe/camera_utils'
import * as drawing from '@mediapipe/drawing_utils'
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

  const [currentTargetDirection, setCurrentTargetDirection] =
    useState<FaceDirection>('front')
  const [captureCountdown, setCaptureCountdown] = useState<number>(0)
  const isCapturingRef = useRef<boolean>(false)

  useEffect(() => {
    console.log(
      `[중요] 카운트다운 상태 변경: ${captureCountdown}, ref=${captureCountdownRef.current}`,
    )
  }, [captureCountdown])

  useEffect(() => {
    isCapturingRef.current = isCapturing
    console.log(`isCapturing ref 업데이트: ${isCapturingRef.current}`)
  }, [isCapturing])

  const currentDirectionRef = useRef<FaceDirection>('unknown')
  const captureCountdownRef = useRef<number>(0)

  useEffect(() => {
    currentDirectionRef.current = currentDirection
  }, [currentDirection])

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
    console.log(`isCapturing 상태 변경됨: ${isCapturing}`)

    if (isCapturing && cameraRef.current) {
      // 캡처 모드 활성화 시 카메라 시작
      console.log('카메라 시작 시도...')
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
        console.log('카메라 정지 시도...')
        cameraRef.current.stop()
        console.log('카메라 정지됨')
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

    // 로그 출력 (디버깅용)
    console.log(
      `수평 오프셋: ${horizontalOffset.toFixed(2)}, 수직 오프셋: ${verticalOffset.toFixed(2)}`,
    )

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

  // 카운트다운 상태와 ref 값을 함께 업데이트하는 헬퍼 함수
  const updateCountdown = (value: number) => {
    setCaptureCountdown(value)
    captureCountdownRef.current = value // 즉시 ref 업데이트
  }

  // 카운트다운 시작 함수 수정
  const startCountdown = () => {
    console.log(
      `카운트다운 시작 함수 호출됨 - ${currentTargetDirection} 방향 카운트다운 시작`,
    )
    // 명시적으로 콘솔에 출력해서 확인
    console.table({
      isCapturingRef,
      currentDirectionRef,
      currentTargetDirection,
      captureCountdown: captureCountdownRef.current,
      방향일치여부: currentDirectionRef.current === currentTargetDirection,
    })

    updateCountdown(60)
  }

  // 카운트다운 리셋 함수 수정
  const resetCountdown = () => {
    console.log('카운트다운 리셋 함수 호출됨')
    updateCountdown(0) // 함수를 통해 상태와 ref 모두 업데이트
  }

  // FaceMesh 결과 처리
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
      for (const landmarks of results.multiFaceLandmarks) {
        // 얼굴 특징점 좌표 반전
        const flippedLandmarks = flipLandmarks(landmarks)

        // 반전된 랜드마크로 메시 그리기
        drawing.drawConnectors(
          canvasCtx,
          flippedLandmarks,
          facemesh.FACEMESH_TESSELATION,
          { color: '#C0C0C070', lineWidth: 1 },
        )
        drawing.drawConnectors(
          canvasCtx,
          flippedLandmarks,
          facemesh.FACEMESH_RIGHT_EYE,
          { color: '#FF3030', lineWidth: 2 },
        )
        drawing.drawConnectors(
          canvasCtx,
          flippedLandmarks,
          facemesh.FACEMESH_LEFT_EYE,
          { color: '#30FF30', lineWidth: 2 },
        )
        drawing.drawConnectors(
          canvasCtx,
          flippedLandmarks,
          facemesh.FACEMESH_FACE_OVAL,
          { color: '#E0E0E0', lineWidth: 2 },
        )

        // 오프셋 계산에는 원본 랜드마크 사용 (내부 계산은 원본 좌표로)
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
          console.log('방향 변경됨:', detectedDirection)
        }

        // 디버그 정보 표시 (반전된 화면에 맞게)
        // renderDirectionInfo(canvasCtx, horizontalOffset, verticalOffset)

        // 타겟 방향과 일치하는지 확인
        if (isCapturingRef.current && results.multiFaceLandmarks.length > 0) {
          // 1. 감지된 방향이 목표 방향과 일치하는지 체크
          const isMatchingDirection =
            currentDirectionRef.current === currentTargetDirectionRef.current

          console.log(
            `현재상태: 방향=${currentDirectionRef.current}, 목표=${currentTargetDirectionRef.current}, ` +
              `일치=${isMatchingDirection}, ` +
              `카운트다운=${captureCountdownRef.current}, 캡처된방향=${Object.keys(capturedImages).join(', ')}`,
          )

          // 2. 방향이 일치하고 카운트다운이 시작되지 않았으면 카운트다운 시작
          if (isMatchingDirection && captureCountdownRef.current === 0) {
            console.log(
              `목표 방향(${currentDirectionRef.current}) 감지, 카운트다운 시작!`,
            )
            startCountdown() // 수정된 함수 호출
          }
          // 3. 방향이 일치하지 않고 카운트다운이 진행 중이면 카운트다운 취소
          else if (
            !isMatchingDirection &&
            captureCountdownRef.current > 0 &&
            detectedDirection !== 'unknown'
          ) {
            console.log(`방향 불일치: ${detectedDirection}, 카운트다운 리셋`)
            resetCountdown() // 수정된 함수 호출
          }
        }

        // 현재 상태 표시
        if (isCapturingRef.current) {
          // 현재 감지된 방향 표시
          canvasCtx.fillStyle = 'lightgreen'
          canvasCtx.fillText(`현재 방향: ${detectedDirection}`, 20, 120)

          // 카운트다운 표시
          if (captureCountdown > 0) {
            canvasCtx.fillText(
              `캡처 카운트다운: ${Math.ceil(captureCountdown / 30)}초`,
              20,
              150,
            )
          }

          // 목표 방향 표시
          canvasCtx.fillStyle = '#FFD700'
          canvasCtx.fillText(`목표 방향: ${currentTargetDirection}`, 20, 180)
        }
      }
    } else {
      setCurrentDirection('unknown')
      if (captureCountdown > 0) {
        setCaptureCountdown(0)
      }
    }

    canvasCtx.restore()
  }

  const flipLandmarks = (
    landmarks: facemesh.NormalizedLandmarkList,
  ): facemesh.NormalizedLandmarkList => {
    return landmarks.map((landmark) => ({
      x: 1 - landmark.x, // x 좌표 반전
      y: landmark.y, // y 좌표는 그대로
      z: landmark.z, // z 좌표는 그대로
    }))
  }

  const isHandlingCountdownRef = useRef<boolean>(false)

  useEffect(() => {
    let timerId: number | null = null

    if (captureCountdown > 0) {
      console.log(`카운트다운 시작/변경: ${captureCountdown}`)
      captureCountdownRef.current = captureCountdown

      timerId = window.setInterval(() => {
        setCaptureCountdown((prev) => {
          if (prev === 1 && !isHandlingCountdownRef.current) {
            console.log(`카운트다운 완료`)
            isHandlingCountdownRef.current = true
            if (timerId) clearInterval(timerId)

            // 별도 함수로 분리하여 캡처 로직 실행
            setTimeout(() => {
              handleCountdownComplete()
              isHandlingCountdownRef.current = false
            }, 50)
            return 0
          }
          return prev - 1
        })
      }, 33) // 약 30fps
    }

    return () => {
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [captureCountdown])

  // 카운트다운 완료 처리를 별도 함수로 분리
  const handleCountdownComplete = () => {
    // 캡처 실행 전에 방향이 일치하는지 최종 확인
    if (
      isCapturingRef.current &&
      currentDirectionRef.current === currentTargetDirection
    ) {
      console.log(
        `카운트다운 완료 후 방향 일치 확인: ${currentTargetDirection}`,
      )

      // 약간의 지연 후 캡처 실행 (UI 업데이트 후)
      window.setTimeout(() => {
        if (currentDirectionRef.current === currentTargetDirection) {
          captureImage(currentTargetDirection)
        } else {
          console.log('지연 확인 중 방향 변경 감지, 캡처 취소')
        }
      }, 100)
    } else {
      console.log('카운트다운 완료 시 방향 불일치, 캡처 취소')
    }
  }

  // 특정 방향의 이미지 캡처
  const captureImage = (direction: FaceDirection) => {
    if (!canvasRef.current) return

    // 이미 캡처되었는지 확인
    if (capturedImages[direction]) {
      console.log(`${direction} 방향은 이미 캡처되었습니다.`)
      return
    }

    // 캡처 시점에 한 번 더 명시적으로 방향 확인
    console.log(
      `캡처 직전 방향 확인: 목표=${direction}, 현재=${currentDirectionRef.current}`,
    )

    if (currentDirectionRef.current !== direction) {
      console.log(`방향 불일치로 캡처 취소`)
      resetCountdown()
      return
    }

    // 캔버스에서 이미지 데이터 추출
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9)

    // 이미지가 추출되었는지 확인
    if (!imageData) {
      console.error('이미지 데이터 추출 실패')
      return
    }

    console.log(`${direction} 방향 이미지 캡처 성공`)

    // 캡처된 이미지 저장
    setCapturedImages((prev) => {
      if (prev[direction]) {
        return prev
      }
      const updated = { ...prev, [direction]: imageData }
      console.log(`캡처된 방향 업데이트: ${Object.keys(updated).join(', ')}`)

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
        processNextDirection(lastDirection, capturedImages)
      }
    }
  }, [capturedImages])

  const currentTargetDirectionRef = useRef<FaceDirection>('front')

  useEffect(() => {
    currentTargetDirectionRef.current = currentTargetDirection
    console.log(`목표 방향 ref 업데이트: ${currentTargetDirectionRef.current}`)
  }, [currentTargetDirection])

  // 다음 방향 처리 로직을 별도 함수로 분리
  const processNextDirection = (
    currentDirection: FaceDirection,
    capturedImgs: Record<FaceDirection, string>,
  ) => {
    const directionOrder: FaceDirection[] = [
      'front',
      'left',
      'right',
      'up',
      'down',
    ]
    console.log(
      `다음 방향 처리 시작: 현재=${currentDirection}, 캡처된방향=${Object.keys(capturedImgs).join(', ')}`,
    )

    const nextDirectionIndex =
      directionOrder.findIndex((dir) => dir === currentDirection) + 1

    resetCountdown()

    // 다음 타겟 방향 (순서대로)
    if (nextDirectionIndex < directionOrder.length) {
      const nextDirection = directionOrder[nextDirectionIndex]
      console.log(`다음 방향으로 진행: ${nextDirection}`)

      currentTargetDirectionRef.current = nextDirection

      setTimeout(() => {
        setCurrentTargetDirection(nextDirection)
        console.log(
          `업데이트 후 목표 방향: 상태=${currentTargetDirection}, ref=${currentTargetDirectionRef.current}`,
        )

        // 다음 방향으로 설정
        setTimeout(() => {
          setMessage(
            `다음은 ${nextDirection} 방향을 캡처해주세요. ${directionGuides[nextDirection]}`,
          )
        }, 100)
      }, 500)
    } else {
      // 모든 방향 캡처 완료
      console.log('모든 방향 캡처 완료, 등록 진행')
      setTimeout(() => {
        setIsCapturing(false)
        submitRegistration()
      }, 1000)
    }
  }

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
      console.log(`누락된 방향이 있습니다: ${missingDirections.join(', ')}`)
      setMessage(
        `다음 방향이 누락되었습니다: ${missingDirections.join(', ')}. 다시 시도해주세요.`,
      )
      return
    }

    if (isSubmittingRef.current) {
      console.log('이미 제출이 진행 중입니다.')
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

      // 설정 수정 - 감도 높임
      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.3,
        minTrackingConfidence: 0.3,
      })

      faceMeshRef.current.onResults(onFaceMeshResults)

      // 카메라 객체만 생성하고 아직 시작하지 않음
      cameraRef.current = new camera.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current })
          }
        },
        width: 1280,
        height: 720,
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
    <div className="face-registration-container">
      <div className="video-container">
        <video
          ref={videoRef}
          style={{ display: 'none', transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          width="1280"
          height="720"
          className={`video-feed ${currentDirection !== 'unknown' ? 'face-detected' : ''}`}
        />

        {isCapturing && (
          <div className="direction-overlay">
            <div className="direction-indicator">
              <span
                className={
                  currentDirection === currentTargetDirection
                    ? 'matching-direction'
                    : ''
                }
              >
                현재: {currentDirection}
              </span>
              <span className="target-indicator">
                목표: {currentTargetDirection}
              </span>
              {/* 여기에 일치 여부 명시적 표시 추가 */}
              <div className="direction-match-status">
                {currentDirection === currentTargetDirection
                  ? '✓ 방향 일치'
                  : '✗ 방향 불일치'}
              </div>
            </div>
            <div className="direction-guide">
              {directionGuides[currentTargetDirection]}
            </div>
            {captureCountdown > 0 && (
              <div
                className="countdown-timer"
                style={{
                  backgroundColor: 'rgba(76, 175, 80, 0.3)',
                  padding: '10px',
                  borderRadius: '5px',
                }}
              >
                <div
                  className="timer-text"
                  style={{ fontSize: '22px', marginBottom: '8px' }}
                >
                  {Math.ceil(captureCountdown / 30)}초 유지 중
                </div>
                <div
                  className="timer-progress"
                  style={{
                    width: `${(captureCountdown / 60) * 100}%`,
                    height: '8px',
                    backgroundColor: '#4caf50',
                    transition: 'width 0.1s linear',
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="controls">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="message">{message}</div>

        <div className="buttons">
          {!isCapturing && !isProcessing && (
            <button
              className="start-button"
              onClick={handleStart}
              disabled={isProcessing}
            >
              시작
            </button>
          )}

          {isCapturing && (
            <button
              className="cancel-button"
              onClick={() => setIsCapturing(false)}
            >
              취소
            </button>
          )}
        </div>
      </div>

      <div className="preview-container">
        {Object.entries(capturedImages).map(([direction, imageData]) => (
          <div key={direction} className="preview-item">
            <div className="preview-label">{direction}</div>
            <img
              src={imageData}
              alt={`${direction} 얼굴`}
              className="preview-image"
            />
          </div>
        ))}
      </div>

      <style>
        {`
        .face-registration-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background-color: #f0f0f0;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .video-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 2px solid #ccc;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .video-feed.face-detected {
          border-color: #4caf50;
          box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
        }
        
        .direction-overlay {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0,.8);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: bold;
          text-align: center;
          max-width: 90%;
        }
        
        .direction-indicator {
          font-size: 20px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .direction-guide {
          font-size: 16px;
        }
        
        .controls {
          margin-bottom: 20px;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #4caf50;
          transition: width 0.3s ease;
        }
        
        .message {
          text-align: center;
          margin: 15px 0;
          min-height: 24px;
          font-size: 16px;
        }
        
        .buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin: 15px 0;
        }
        
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .start-button {
          background-color: #4caf50;
          color: white;
        }
        
        .start-button:hover {
          background-color: #388e3c;
        }
        
        .cancel-button {
          background-color: #f44336;
          color: white;
        }
        
        .cancel-button:hover {
          background-color: #d32f2f;
        }
        
        .preview-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        
        .preview-item {
          width: calc(20% - 8px);
          position: relative;
        }
        
        .preview-label {
          position: absolute;
          top: 0;
          left: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px 0 4px 0;
          font-size: 12px;
        }
        
        .preview-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .debug-info {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          max-width: 300px;
        }

        .target-indicator {
          color: #FFD700;
          margin-left: 5px;
        }

        .countdown-timer {
          margin-top: 10px;
          font-size: 18px;
          color: #4caf50;
          font-weight: bold;
        }

        .matching-direction {
          color: #4caf50;
          font-weight: bold;
        }

        .target-indicator {
          color: #FFD700;
          margin-left: 10px;
        }

        .countdown-timer {
          margin-top: 10px;
          text-align: center;
        }

        .timer-text {
          font-size: 18px;
          color: #4caf50;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .timer-progress {
          height: 5px;
          background-color: #4caf50;
          border-radius: 3px;
          transition: width 0.1s linear;
        }
        
        .direction-match-status {
          margin-top: 5px;
          font-size: 16px;
          font-weight: bold;
        }

        `}
      </style>
    </div>
  )
}

export default FaceRegistration

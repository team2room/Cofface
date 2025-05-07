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

// 얼굴 각도 추정 기준
// const ANGLE_THRESHOLDS = {
//   YAW: {
//     // 좌우 회전
//     front: 15, // 중앙에서 ±15도는 정면으로 간주
//     left: -35, // -35도 이하는 왼쪽으로 간주
//     right: 35, // 35도 이상은 오른쪽으로 간주
//   },
//   PITCH: {
//     // 상하 회전
//     front: 15, // 중앙에서 ±15도는 정면으로 간주
//     up: -30, // -30도 이하는 위쪽으로 간주
//     down: 30, // 30도 이상은 아래쪽으로 간주
//   },
// }

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

  useEffect(() => {
    console.log(
      `[중요] 카운트다운 상태 변경: ${captureCountdown}, ref=${captureCountdownRef.current}`,
    )
  }, [captureCountdown])

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

  const renderDirectionInfo = (
    canvasCtx: CanvasRenderingContext2D,
    horizontalOffset: number,
    verticalOffset: number,
  ) => {
    // 방향 텍스트
    canvasCtx.font = '20px Arial'
    canvasCtx.fillStyle = 'red'
    canvasCtx.fillText(`방향: ${currentDirection}`, 20, 30)

    // 오프셋 값 표시
    canvasCtx.font = '16px Arial'
    canvasCtx.fillStyle = 'white'
    canvasCtx.fillText(
      `수평: ${horizontalOffset.toFixed(1)}, 수직: ${verticalOffset.toFixed(1)}`,
      20,
      60,
    )

    // 캡처 상태 표시
    canvasCtx.fillStyle = 'yellow'
    const capturedCount = Object.keys(capturedImages).length
    const totalCount = requiredDirections.length
    canvasCtx.fillText(
      `캡처: ${capturedCount}/${totalCount} (${Object.keys(capturedImages).join(', ')})`,
      20,
      90,
    )
  }

  // MediaPipe FaceMesh 초기화
  const initFaceMesh = () => {
    faceMeshRef.current = new facemesh.FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })

    // 설정 수정 - 감도 높임
    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.3, // 감도 낮춤 (기본값 0.5)
      minTrackingConfidence: 0.3, // 감도 낮춤 (기본값 0.5)
    })

    faceMeshRef.current.onResults(onFaceMeshResults)
  }

  // 카운트다운 상태와 ref 값을 함께 업데이트하는 헬퍼 함수
  const updateCountdown = (value: number) => {
    setCaptureCountdown(value)
    captureCountdownRef.current = value // 즉시 ref 업데이트
  }

  // 카운트다운 시작 함수 수정
  const startCountdown = () => {
    console.log('카운트다운 시작 함수 호출됨')
    updateCountdown(60) // 함수를 통해 상태와 ref 모두 업데이트
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
        const flippedLandmarks = flipLandmarks(
          landmarks,
          canvasRef.current.width,
        )

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
        const centerY = (foreHead.y + chin.y) / 2

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
        }

        // 디버그 정보 표시 (반전된 화면에 맞게)
        renderDirectionInfo(canvasCtx, horizontalOffset, verticalOffset)

        // 타겟 방향과 일치하는지 확인
        if (isCapturing && results.multiFaceLandmarks.length > 0) {
          // 1. 감지된 방향이 목표 방향과 일치하는지 체크
          const isMatchingDirection =
            detectedDirection === currentTargetDirection

          console.log(
            `방향 비교: 감지=${detectedDirection}, 목표=${currentTargetDirection}, 일치=${isMatchingDirection}, 카운트다운=${captureCountdownRef.current}`,
          )

          // 2. 방향이 일치하고 카운트다운이 시작되지 않았으면 카운트다운 시작
          if (isMatchingDirection && captureCountdownRef.current === 0) {
            console.log(
              `목표 방향(${currentTargetDirection}) 감지, 카운트다운 시작!`,
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

        // 카운트다운 진행 중인 경우 링 그리기
        if (captureCountdown > 0) {
          drawCountdownRing(canvasCtx, flippedLandmarks, captureCountdown)
        }

        // 현재 상태 표시
        if (isCapturing) {
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
    width: number,
  ): facemesh.NormalizedLandmarkList => {
    return landmarks.map((landmark) => ({
      x: 1 - landmark.x, // x 좌표 반전
      y: landmark.y, // y 좌표는 그대로
      z: landmark.z, // z 좌표는 그대로
    }))
  }

  useEffect(() => {
    let timerId: number

    if (captureCountdown > 0) {
      console.log(`카운트다운 시작/변경: ${captureCountdown}`)

      // 즉시 ref 값도 업데이트 (중요!)
      captureCountdownRef.current = captureCountdown

      timerId = window.setInterval(() => {
        setCaptureCountdown((prev) => {
          const newValue = prev - 1
          console.log(`타이머에서 카운트다운 감소: ${prev} -> ${newValue}`)

          // 즉시 ref 값도 업데이트
          captureCountdownRef.current = newValue

          if (newValue <= 0) {
            console.log(`카운트다운 완료, 캡처 실행 예정`)
            clearInterval(timerId)

            // setTimeout 대신 즉시 실행 (0ms 딜레이)
            if (isCapturing && currentTargetDirection) {
              console.log(`${currentTargetDirection} 방향 캡처 실행`)
              captureImage(currentTargetDirection)
            }

            return 0
          }
          return newValue
        })
      }, 33) // 약 30fps
    }

    return () => {
      if (timerId) {
        console.log(`타이머 정리 (카운트다운: ${captureCountdown})`)
        clearInterval(timerId)
      }
    }
  }, [captureCountdown, isCapturing, currentTargetDirection])

  // 5. 카운트다운 링 그리기 함수
  const drawCountdownRing = (
    ctx: CanvasRenderingContext2D,
    landmarks: facemesh.NormalizedLandmarkList,
    countdown: number,
  ) => {
    // 얼굴 주변에 링 그리기
    const faceOvalPoints: { x: number; y: number }[] = [] // 얼굴 타원 경계 포인트 수집

    // FACEMESH_FACE_OVAL 랜드마크 인덱스
    const faceOvalIndices = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379,
      378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
      162, 21, 54, 103, 67, 109,
    ]

    // 얼굴 타원 포인트 수집
    faceOvalIndices.forEach((idx) => {
      faceOvalPoints.push({
        x: landmarks[idx].x * ctx.canvas.width,
        y: landmarks[idx].y * ctx.canvas.height,
      })
    })

    // 얼굴 중심 계산
    let centerX = 0
    let centerY = 0
    faceOvalPoints.forEach((point) => {
      centerX += point.x
      centerY += point.y
    })
    centerX /= faceOvalPoints.length
    centerY /= faceOvalPoints.length

    // 얼굴 크기 계산 (반지름)
    let radius = 0
    faceOvalPoints.forEach((point) => {
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2),
      )
      radius = Math.max(radius, distance)
    })

    // 링을 약간 크게 그리기 (얼굴보다 20% 크게)
    radius *= 1.2

    // 카운트다운 프로그레스 계산 (60 -> 0)
    const progress = countdown / 60

    // 링 그리기
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2 * progress)
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 5
    ctx.stroke()
  }

  // 캡처 이미지 반전 처리 함수
  const captureNonFlippedImage = (direction: FaceDirection) => {
    if (!canvasRef.current) return

    // 임시 캔버스 생성 (반전 없는 원본 이미지용)
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) return

    // 원본 캔버스와 동일한 크기로 설정
    tempCanvas.width = canvasRef.current.width
    tempCanvas.height = canvasRef.current.height

    // 반전되지 않은 원본 이미지 그리기
    tempCtx.save()
    tempCtx.scale(-1, 1) // 반전
    tempCtx.drawImage(
      canvasRef.current,
      -tempCanvas.width,
      0,
      tempCanvas.width,
      tempCanvas.height,
    )
    tempCtx.restore()

    // 이미지 데이터 추출
    return tempCanvas.toDataURL('image/jpeg', 0.9)
  }

  // 특정 방향의 이미지 캡처
  const captureImage = (direction: FaceDirection) => {
    if (!canvasRef.current) return

    // 이미 캡처되었는지 확인
    if (capturedImages[direction]) {
      console.log(`${direction} 방향은 이미 캡처되었습니다.`)
      return
    }

    // 캔버스에서 이미지 데이터 추출
    const imageData =
      captureNonFlippedImage(direction) ||
      canvasRef.current.toDataURL('image/jpeg', 0.9)

    // 캡처된 이미지 저장
    setCapturedImages((prev) => ({
      ...prev,
      [direction]: imageData,
    }))

    // 진행 상황 메시지 업데이트
    setMessage(`${direction} 방향 캡처 완료!`)

    // 다음 타겟 방향 설정
    const directionOrder: FaceDirection[] = [
      'front',
      'left',
      'right',
      'up',
      'down',
    ]

    const nextDirectionIndex =
      directionOrder.findIndex((dir) => dir === direction) + 1

    // 다음 타겟 방향 (순서대로)
    if (nextDirectionIndex < directionOrder.length) {
      const nextDirection = directionOrder[nextDirectionIndex]

      // 방향 카운터 초기화
      detectedDirectionCountRef.current = {
        front: 0,
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        unknown: 0,
      }
      frameCounterRef.current = 0

      // 다음 방향으로 설정
      setTimeout(() => {
        setCurrentTargetDirection(nextDirection)
        setMessage(
          `다음은 ${nextDirection} 방향을 캡처해주세요. ${directionGuides[nextDirection]}`,
        )
      }, 1000)
    } else {
      // 모든 방향 캡처 완료
      setTimeout(() => {
        setIsCapturing(false)
        submitRegistration()
      }, 1000)
    }
  }

  // 서버에 등록 데이터 제출
  const submitRegistration = async () => {
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
    }
  }

  // 카메라 초기화
  const initCamera = async () => {
    if (!videoRef.current) return

    try {
      // 기존 스트림 정리
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (cameraRef.current) {
        cameraRef.current.stop()
      }

      // FaceMesh 초기화
      initFaceMesh()

      // 카메라 유틸리티 설정
      cameraRef.current = new camera.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current })
          }
        },
        width: 1280,
        height: 720,
      })

      // 카메라 시작
      await cameraRef.current.start()

      setMessage(
        '카메라가 준비되었습니다. 시작하려면 "시작" 버튼을 클릭하세요.',
      )
    } catch (err) {
      console.error('카메라 초기화 오류:', err)
      setMessage('카메라 접근에 실패했습니다. 권한을 확인해주세요.')
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
    initCamera()

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
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
  }, [])

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
              <div className="countdown-timer">
                <div className="timer-text">
                  {Math.ceil(captureCountdown / 30)}초 유지
                </div>
                <div
                  className="timer-progress"
                  style={{ width: `${(captureCountdown / 60) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        <div className="debug-info">
          <p>현재 방향: {currentDirection}</p>
          <p>
            방향 카운터:{' '}
            {Object.entries(detectedDirectionCountRef.current)
              .map(([dir, count]) => `${dir}: ${count.toFixed(1)}`)
              .join(', ')}
          </p>
          <p>캡처된 방향: {Object.keys(capturedImages).join(', ')}</p>
        </div>
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

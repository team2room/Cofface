import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as mp from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import {
  CapturedImage,
  FaceDetectionState,
  RotationState,
} from '@/interfaces/FaceRegisterInterfaces'
import {
  calculateFaceRotation,
  checkFaceInCustomOval,
  getBorderStatusMessage,
  isCorrectOrientation,
} from '@/utils/captureUtils'
import { registerFace } from '@/features/register/services/captureService'
import { useAuthStore } from '@/stores/authStore'

// 얼굴 인식 로직
export function useFaceDetection() {
  const navigate = useNavigate()

  // 유저 아이디 - store에서 빼옴
  const authStore = useAuthStore()
  const name = authStore.user?.name
  const phoneNumber = authStore.user?.phoneNumber

  // 상태 관리
  const currentStateRef = useRef<FaceDetectionState>(FaceDetectionState.INIT)
  const [detectionState, setDetectionState] = useState<FaceDetectionState>(
    FaceDetectionState.INIT,
  )
  const [processing, setProcessing] = useState<boolean>(false)
  const [faceDetected, setFaceDetected] = useState<boolean>(false)
  const [stateTimer, setStateTimer] = useState<number>(0)
  const [timerProgress, setTimerProgress] = useState<number>(0)
  const [borderColor, setBorderColor] = useState<string>('#333')
  const [borderStatusMessage, setBorderStatusMessage] = useState<string>('')
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [_stateStable, setStateStable] = useState<boolean>(true)
  const [_rotation, setRotation] = useState<RotationState>({
    roll: 0,
    pitch: 0,
    yaw: 0,
  })
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [_faceWithinBounds, setFaceWithinBounds] = useState<boolean>(false)

  const [isRegistering, setIsRegistering] = useState<boolean>(false)
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  )

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const faceMeshRef = useRef<mp.FaceMesh | null>(null)
  const cameraRef = useRef<cam.Camera | null>(null)
  const lastStateTime = useRef<number>(0)
  const lastFrameRef = useRef<ImageData | null>(null)
  const timerRef = useRef<number | null>(null)
  const timerActiveRef = useRef<boolean>(false)
  const timerInProgressRef = useRef<boolean>(false)
  const isFirstMount = useRef<boolean>(true)

  // 타이머 관련 ref - 절대 시간 기반 타이머를 위해 추가
  const timerStartTimeRef = useRef<number>(0)
  const timerDurationRef = useRef<number>(3000) // 3초 (3000ms)

  // detectionState가 변경될 때마다 ref 값도 업데이트
  useEffect(() => {
    currentStateRef.current = detectionState
    console.log(
      `상태 변경됨 및 ref 업데이트: ${FaceDetectionState[detectionState]}`,
    )
  }, [detectionState])

  // 상태 변경 감지용 useEffect 추가
  useEffect(() => {
    console.log(`상태 변경됨: ${FaceDetectionState[detectionState]}`)
    // 상태가 변경될 때마다 stateStable을 항상 true로 설정
    setStateStable(true)
    lastStateTime.current = Date.now()
  }, [detectionState])

  useEffect(() => {
    // 앱 처음 마운트 시에만 INIT으로 설정
    if (isFirstMount.current) {
      console.log('컴포넌트 첫 마운트, 상태 초기화')
      setDetectionState(FaceDetectionState.INIT)
      isFirstMount.current = false
    }
  }, [])

  // border 색상이 변경될 때마다 상태 메시지 업데이트
  useEffect(() => {
    setBorderStatusMessage(getBorderStatusMessage(borderColor))
  }, [borderColor])

  useEffect(() => {
    // 카메라가 시작되고 비디오가 로드된 후 스타일 재조정
    if (videoRef.current && detectionState > FaceDetectionState.INIT) {
      const adjustVideoSize = () => {
        if (videoRef.current) {
          // 비디오와 컨테이너가 항상 1:1 비율을 유지하도록 함
          videoRef.current.style.width = '100%'
          videoRef.current.style.height = '100%'
          videoRef.current.style.objectFit = 'cover'
        }
      }

      // 비디오 로드될 때 한 번 더 조정
      videoRef.current.addEventListener('loadedmetadata', adjustVideoSize)

      // 초기화 직후에도 한번 실행
      adjustVideoSize()

      // 청소 함수
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener(
            'loadedmetadata',
            adjustVideoSize,
          )
        }
      }
    }
  }, [detectionState])

  // MediaPipe FaceMesh 모델 로드
  useEffect(() => {
    const loadMediaPipeModels = async (): Promise<void> => {
      try {
        // MediaPipe FaceMesh 초기화
        const faceMesh = new mp.FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          },
        })

        // 설정
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        // 결과 처리 콜백 설정
        faceMesh.onResults(onResults)

        // 참조 저장
        faceMeshRef.current = faceMesh

        console.log('MediaPipe 모델 로딩 완료')
        setModelsLoaded(true)
      } catch (error) {
        console.error('MediaPipe 모델 로딩 오류:', error)
        setLoadingError(
          `모델 로딩 오류: ${
            error instanceof Error ? error.message : String(error)
          }`,
        )
      }
    }

    loadMediaPipeModels()

    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close()
      }
      // 타이머가 활성화된 경우 정리
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // detectionState 변경 확인을 위한 useEffect 추가
  useEffect(() => {
    // 상태가 변경되면 새로운 상태에 맞는 UI 조정
    if (detectionState !== FaceDetectionState.INIT) {
      // 타이머 상태 리셋
      timerActiveRef.current = false
      timerInProgressRef.current = false
      setProcessing(false)
      setStateTimer(0)
      setTimerProgress(0)

      // 상태 안정화 시간 설정
      lastStateTime.current = Date.now()
      setStateStable(true)
    }
  }, [detectionState])

  // MediaPipe 결과 처리 함수
  const onResults = (results: mp.Results): void => {
    if (!canvasRef.current || !videoRef.current) return

    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext('2d')

    if (!canvasCtx) return

    const currentState = currentStateRef.current

    // 최근 프레임 저장 (캡처용)
    if (results.image) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = results.image.width
      tempCanvas.height = results.image.height
      const tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCtx.drawImage(
          results.image,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        )
        const imageData = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        )
        lastFrameRef.current = imageData
      }
    }

    // 캔버스 지우기
    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)

    // 비디오를 캔버스에 그리기
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height,
    )

    // 얼굴이 감지되었는지 확인
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0]

      // 이전 상태가 false였으면 로그 출력
      if (!faceDetected) {
        console.log('얼굴 감지 시작됨')
      }

      // 즉시 변수에 값 설정
      const faceDetectedNow = true
      setFaceDetected(faceDetectedNow)

      // 얼굴이 타원 안에 적절하게 위치하는지 확인 (새로운 함수 사용)
      const isFaceInOval = checkFaceInCustomOval(landmarks)
      setFaceWithinBounds(isFaceInOval)

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks)
      setRotation(rotationValues)

      // 방향이 올바른지 확인
      const isDirectionCorrect = isCorrectOrientation(
        rotationValues,
        currentState,
      )

      // 타이머가 진행 중일 때 방향 및 위치 확인
      if (timerInProgressRef.current) {
        const isFaceCorrectlyPositioned = isFaceInOval && isDirectionCorrect

        // 타이머가 진행 중인데 위치나 방향이 잘못된 경우
        if (!isFaceCorrectlyPositioned) {
          console.log('타이머 진행 중 위치/방향 불량으로 타이머 초기화')
          // 타이머 중지 및 상태 초기화
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          timerInProgressRef.current = false
          timerActiveRef.current = false
          setProcessing(false)
          setStateTimer(0)
          setTimerProgress(0)
        }
      }

      // 경계선 색상 설정
      if (stateTimer > 0) {
        setBorderColor('#4285F4') // 타이머 작동 중 (파란색)
      } else if (isDirectionCorrect && isFaceInOval) {
        setBorderColor('#00c853') // 올바른 방향 (초록색)
      } else if (isFaceInOval) {
        setBorderColor('#FFAB00') // 얼굴은 원 안에 있지만 방향이 맞지 않음 (주황색)
      } else {
        setBorderColor('#FFC107') // 얼굴이 원 밖에 있음 (노란색)
      }

      // 현재 상태에 따라 얼굴 방향 확인
      if (currentState > FaceDetectionState.INIT) {
        checkFaceOrientation(
          rotationValues,
          isFaceInOval,
          faceDetectedNow,
          currentState,
        )
      }
    } else {
      // 얼굴이 감지되지 않은 경우
      if (faceDetected) {
        console.log('얼굴 감지 중단됨')
      }

      setFaceDetected(false)
      setFaceWithinBounds(false)
      setBorderColor('#ff3d00') // 얼굴 미감지 (빨간색)

      // 타이머가 진행 중이었다면 중지
      if (timerInProgressRef.current) {
        console.log('얼굴 감지 중단으로 타이머 초기화')
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        timerInProgressRef.current = false
        timerActiveRef.current = false
        setProcessing(false)
        setStateTimer(0)
        setTimerProgress(0)
      }

      // 얼굴이 감지되지 않음 메시지
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      canvasCtx.fillRect(
        canvasElement.width / 2 - 150,
        canvasElement.height / 2 - 20,
        300,
        40,
      )
      canvasCtx.save()
      canvasCtx.scale(-1, 1)
      canvasCtx.fillStyle = 'red'
      canvasCtx.font = '18px "Suit", sans-serif'
      canvasCtx.textAlign = 'center'
      canvasCtx.fillText(
        '얼굴이 감지되지 않았습니다',
        -canvasElement.width / 2, // 좌표도 반전되므로 음수로 변경
        canvasElement.height / 2 + 7,
      )
    }

    canvasCtx.restore()
  }

  // 얼굴 방향 확인
  const checkFaceOrientation = (
    rotationValues: RotationState,
    inBounds: boolean,
    faceDetectedNow: boolean,
    currentState: FaceDetectionState,
  ): void => {
    // 타이머가 이미 진행 중이면 검사하지 않음
    if (timerInProgressRef.current) {
      return
    }

    // INIT 상태일 때는 체크하지 않음
    if (currentState === FaceDetectionState.INIT) {
      return
    }

    if (!faceDetectedNow) {
      return
    }

    // 타이머가 이미 활성화되어 있는지 확인
    if (timerActiveRef.current || processing) {
      return
    }

    if (!inBounds) {
      return
    }

    // 방향이 올바른지 확인
    const isCorrect = isCorrectOrientation(rotationValues, currentState)

    if (isCorrect) {
      console.log('✅ 모든 조건 만족! 타이머 시작')
      // 타이머 시작을 위한 함수 호출
      handleStateTimer()
    }
  }

  // 상태 타이머 처리 및 원형 게이지 업데이트 - 실제 시간 기반으로 변경
  const handleStateTimer = (): void => {
    // 이미 타이머가 진행 중이면 중복 호출 무시
    if (timerInProgressRef.current) {
      return
    }

    // 이미 처리 중이면 무시
    if (processing) {
      return
    }

    // 기존 타이머가 있으면 제거
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // 타이머 활성화 상태 설정
    timerActiveRef.current = true
    timerInProgressRef.current = true

    // 처리 중 상태 설정
    setProcessing(true)

    // 타이머 설정 - 실제 시간 기준
    const timerDuration = timerDurationRef.current // 3000ms (3초)
    const startTime = Date.now()
    timerStartTimeRef.current = startTime

    // 초기 타이머 상태 설정
    setStateTimer(3) // 시작은 3초부터
    setTimerProgress(0) // 진행률 0에서 시작

    // 타이머 인터벌 설정 (50ms마다 업데이트)
    const interval = setInterval(() => {
      if (!timerInProgressRef.current) {
        // 타이머가 중지되었다면
        clearInterval(interval)
        timerRef.current = null
        return
      }

      // 현재 경과 시간 계산
      const currentTime = Date.now()
      const elapsedTime = currentTime - startTime

      // 남은 시간 계산 (밀리초)
      const remainingTime = Math.max(0, timerDuration - elapsedTime)

      // 진행률 계산 (0.0 ~ 1.0)
      const progress = Math.min(1, elapsedTime / timerDuration)
      setTimerProgress(progress)

      // 초 단위 카운트다운 (3, 2, 1)
      const remainingSeconds = Math.ceil(remainingTime / 1000)
      setStateTimer(remainingSeconds)

      // 타이머 완료 확인
      if (remainingTime <= 0) {
        clearInterval(interval)
        timerRef.current = null

        // 타이머 완료 후 캡처 진행
        captureFace()

        // 상태 리셋
        setProcessing(false)
        setStateTimer(0)
        setTimerProgress(0)
        timerActiveRef.current = false
        timerInProgressRef.current = false
      }
    }, 50) // 50ms 간격으로 업데이트

    // 타이머 ID 저장
    timerRef.current = interval as unknown as number
  }

  // 얼굴 캡처
  const captureFace = (): void => {
    if (!lastFrameRef.current || !videoRef.current) return

    // 캡처용 캔버스 생성 및 크기 설정
    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas')
    }

    // 중요: 비디오와 동일한 비율로 캔버스 설정
    const videoWidth = videoRef.current.videoWidth
    const videoHeight = videoRef.current.videoHeight

    // 1:1 비율 유지하면서 화면에 맞게 조정
    const size = Math.max(videoWidth, videoHeight)
    hiddenCanvasRef.current.width = size
    hiddenCanvasRef.current.height = size

    const canvas = hiddenCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 이미지를 캔버스 중앙에 배치
    const imgData = lastFrameRef.current

    // 직접 캔버스에 비디오 프레임을 그리는 방식으로 변경
    if (videoRef.current) {
      // 비디오를 캔버스 전체에 그림
      ctx.drawImage(videoRef.current, 0, 0, size, size)

      // 좌우 반전 (selfie 모드 반영)
      ctx.save()
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      ctx.restore()
    } else {
      // 기존 방식 유지 (fallback)
      ctx.putImageData(imgData, 0, 0)
    }

    // 현재 상태에 따른 방향 결정
    let direction: string
    switch (currentStateRef.current) {
      case FaceDetectionState.FRONT_FACE:
        direction = 'front'
        break
      case FaceDetectionState.LEFT_FACE:
        direction = 'left'
        break
      case FaceDetectionState.RIGHT_FACE:
        direction = 'right'
        break
      case FaceDetectionState.UP_FACE:
        direction = 'up'
        break
      case FaceDetectionState.DOWN_FACE:
        direction = 'down'
        break
      default:
        direction = 'unknown'
    }

    // 캡처된 이미지 저장
    const capturedImage: CapturedImage = {
      state: currentStateRef.current,
      imageData: canvas.toDataURL('image/jpeg', 0.9), // 품질 설정 추가
      direction: direction,
    }

    // 이미지 배열에 추가
    setCapturedImages((prev) => [...prev, capturedImage])

    // 다음 상태로 이동
    moveToNextState()
  }

  // 다음 상태로 이동
  const moveToNextState = (): void => {
    // 현재 ref에서 상태 읽기
    const currentState = currentStateRef.current

    // 타이머 상태 리셋
    timerActiveRef.current = false
    timerInProgressRef.current = false

    let nextState: FaceDetectionState

    switch (currentState) {
      case FaceDetectionState.INIT:
        nextState = FaceDetectionState.FRONT_FACE
        break
      case FaceDetectionState.FRONT_FACE:
        nextState = FaceDetectionState.LEFT_FACE
        break
      case FaceDetectionState.LEFT_FACE:
        nextState = FaceDetectionState.RIGHT_FACE
        break
      case FaceDetectionState.RIGHT_FACE:
        nextState = FaceDetectionState.UP_FACE
        break
      case FaceDetectionState.UP_FACE:
        nextState = FaceDetectionState.DOWN_FACE
        break
      case FaceDetectionState.DOWN_FACE:
        // 모든 얼굴 각도 캡처 완료
        nextState = FaceDetectionState.COMPLETED

        // 카메라 중지
        if (cameraRef.current) {
          cameraRef.current.stop()
        }
        break
      default:
        nextState = detectionState // 변경 없음
        break
    }

    // 상태 변경
    if (nextState !== currentState) {
      // 함수형 업데이트 사용
      setDetectionState(nextState)

      // 상태 변경 후 안정화 시간 리셋
      lastStateTime.current = Date.now()
      setStateStable(true)

      // 타이머 상태 리셋
      setStateTimer(0)
      setTimerProgress(0)
    }
  }

  // 비디오 시작
  // useFaceDetection.tsx의 startVideo 함수 수정
  const startVideo = async (): Promise<void> => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      return Promise.reject('모델 또는 비디오 준비 안됨')
    }

    try {
      // 캔버스 크기 설정 - 일관성 있게 정사각형 비율로 설정
      if (canvasRef.current) {
        canvasRef.current.width = 480
        canvasRef.current.height = 480 // 정사각형으로 변경
      }

      // 카메라 설정 전에 비디오 요소 스타일 강제 설정
      if (videoRef.current) {
        videoRef.current.style.width = '100%'
        videoRef.current.style.height = '100%'
        videoRef.current.style.objectFit = 'cover'
      }

      // MediaPipe 카메라 설정
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current })
          }
        },
        width: 480,
        height: 480, // 정사각형으로 변경
        facingMode: 'user',
      })

      // 캡처된 이미지 초기화
      setCapturedImages([])

      // 카메라 시작
      await cameraRef.current.start()

      // 상태 즉시 변경
      setDetectionState(FaceDetectionState.FRONT_FACE)
      setStateStable(true)
      lastStateTime.current = Date.now()

      return Promise.resolve()
    } catch (error) {
      console.error('카메라 접근 오류:', error)
      setLoadingError(
        `카메라 접근 오류: ${error instanceof Error ? error.message : String(error)}`,
      )
      return Promise.reject(error)
    }
  }

  // 카메라 사용 시작
  const handleStartCamera = (): void => {
    startVideo()
      .then(() => {
        // 약간의 지연 후 상태 변경 (카메라가 완전히 초기화되도록)
        setTimeout(() => {
          setDetectionState(FaceDetectionState.FRONT_FACE)
          // 상태 안정화를 위한 타이머도 즉시 시작
          setStateStable(true)
          lastStateTime.current = Date.now()
        }, 1000)
      })
      .catch((error) => {
        console.error('카메라 시작 실패:', error)
      })
  }

  // 다시 시작 (재촬영)
  const handleRestartCapture = (): void => {
    if (cameraRef.current) {
      cameraRef.current.stop()
    }
    handleStartCamera()
  }

  // 진행 완료 처리
  const handleComplete = async (): Promise<void> => {
    if (capturedImages.length < 5) {
      console.error('모든 방향의 얼굴을 캡처해야 합니다')
      return
    }

    // userId가 없는 경우 처리
    if (!name || !phoneNumber) {
      console.error('사용자 정보를 찾을 수 없습니다')
      return
    }

    setIsRegistering(true)
    setRegistrationError(null)

    try {
      // 서버에 얼굴 등록 API 호출
      const result = await registerFace(name, phoneNumber, capturedImages)

      console.log('얼굴 등록 성공:', result)

      // 등록 성공 시 다음 페이지로 이동
      navigate('/register/face/confirm', {
        state: { success: true },
      })
    } catch (error) {
      console.error('얼굴 등록 실패:', error)
      // 등록 실패 시에도 일단 완료 페이지로 이동 (프로덕션에서는 적절한 에러 처리 필요)
      navigate('/register/face/confirm', {
        state: {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류가 발생했습니다',
        },
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return {
    // 상태
    detectionState,
    borderColor,
    borderStatusMessage,
    stateTimer,
    timerProgress,
    capturedImages,
    modelsLoaded,
    loadingError,
    isRegistering,
    registrationError,
    currentRotation: _rotation,

    // refs
    videoRef,
    canvasRef,

    // 함수
    handleStartCamera,
    handleRestartCapture,
    handleComplete,
  }
}

export default useFaceDetection

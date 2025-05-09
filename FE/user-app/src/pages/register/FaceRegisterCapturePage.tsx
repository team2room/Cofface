import CaptureHeader from '@/features/register/components/capture/CaptureHeader'
import { colors } from '@/styles/colors'
import { Text } from '@/styles/typography'
import { useState, useEffect, useRef } from 'react'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import * as mp from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import * as drawing from '@mediapipe/drawing_utils'
import { useNavigate } from 'react-router-dom'

// 얼굴인식 상태 열거형
enum FaceDetectionState {
  INIT = 0,
  FRONT_FACE = 1,
  LEFT_FACE = 2,
  RIGHT_FACE = 3,
  UP_FACE = 4,
  DOWN_FACE = 5,
  COMPLETED = 6,
}

// 3D 회전 상태 타입 정의
interface RotationState {
  roll: number
  pitch: number
  yaw: number
}

// 캡처된 이미지 타입 정의
interface CapturedImage {
  state: FaceDetectionState
  imageData: string
}

// 스타일 컴포넌트
const Container = tw.div`
  w-full max-w-screen-sm mx-auto flex flex-col min-h-screen bg-black
`
const HeaderWrapper = tw.div`
  sticky top-0 z-10 bg-black w-full
`
const ContentWrapper = tw.div`
  flex flex-col px-6 flex-1 pb-6
`

const CaptureContainer = tw.div`
  flex flex-col items-center w-full flex-1 relative
`

const StageIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
`

const ProgressStepsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
  width: 100%;
`

const ProgressStep = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 8px;
  margin: 0 5px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.completed
      ? colors.main
      : props.active
        ? colors.littleLight
        : 'rgba(255, 255, 255, 0.3)'};
  transition: background-color 0.3s ease;
`

const FaceCircle = styled.div<{ borderColor: string }>`
  position: relative;
  width: 280px;
  height: 280px;
  margin-bottom: 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid ${(props) => props.borderColor || '#333'};
  transition: border-color 0.3s ease;
`

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%) scaleX(-1);
`

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1); // 캔버스도 비디오와 동일하게 좌우 반전
`

const GuideLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`

const Message = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
`

const SubMessage = styled.div`
  font-size: 16px;
  text-align: center;
  margin-bottom: 16px;
  color: #aaa;
`

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background-color: ${colors.main};
  color: white;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #666;
  }
`

const TimerDisplay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
`

const StatusMessageContainer = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
`

// 타이머 원형 게이지 스타일 컴포넌트
const TimerCircleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`

const TimerCircleSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const TimerCirclePath = styled.circle<{ progress: number; color: string }>`
  fill: none;
  stroke: ${(props) => props.color};
  stroke-width: 8px;
  stroke-linecap: round;
  stroke-dasharray: 1570;
  stroke-dashoffset: ${(props) => 1570 * (1 - props.progress)};
  transition: stroke-dashoffset 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
`

// 얼굴 가이드라인 컴포넌트
const FaceGuideline = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
`

// 캡처된 이미지 그리드 스타일
const CapturedImagesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  width: 100%;
  margin: 0 auto 24px;
`

const CapturedImageContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid ${colors.main};
`

const CapturedImageLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
`

const CapturedImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

export function FaceRegisterCapturePage() {
  const navigate = useNavigate()
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
  const [stateStable, setStateStable] = useState<boolean>(true)
  const [rotation, setRotation] = useState<RotationState>({
    roll: 0,
    pitch: 0,
    yaw: 0,
  })
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [faceWithinBounds, setFaceWithinBounds] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceMeshRef = useRef<mp.FaceMesh | null>(null)
  const cameraRef = useRef<cam.Camera | null>(null)
  const lastStateTime = useRef<number>(0)
  const lastFrameRef = useRef<ImageData | null>(null)
  const timerRef = useRef<number | null>(null)
  const timerActiveRef = useRef<boolean>(false)
  const timerInProgressRef = useRef<boolean>(false)
  const isFirstMount = useRef<boolean>(true)

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

  // 메시지와 서브메시지 설정
  const getMessage = (): string => {
    if (loadingError) {
      return '카메라 또는 모델 로딩 오류가 발생했습니다'
    }

    switch (detectionState) {
      case FaceDetectionState.INIT:
        return modelsLoaded ? '얼굴 인식을 시작할게요' : '모델 로딩 중...'
      case FaceDetectionState.FRONT_FACE:
        return '정면을 바라봐주세요'
      case FaceDetectionState.LEFT_FACE:
        return '고개를 왼쪽으로 돌려주세요'
      case FaceDetectionState.RIGHT_FACE:
        return '고개를 오른쪽으로 돌려주세요'
      case FaceDetectionState.UP_FACE:
        return '고개를 들어 위를 바라봐주세요'
      case FaceDetectionState.DOWN_FACE:
        return '고개를 숙여 아래를 바라봐주세요'
      case FaceDetectionState.COMPLETED:
        return '얼굴 인식이 완료되었습니다!'
      default:
        return ''
    }
  }

  const getSubMessage = (): string => {
    if (loadingError) {
      return '페이지를 새로고침하거나 다시 시도해주세요'
    }

    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        return '얼굴이 원 안에 위치하도록 해주세요'
      case FaceDetectionState.LEFT_FACE:
        return '왼쪽으로 약 30도 정도 돌려주세요'
      case FaceDetectionState.RIGHT_FACE:
        return '오른쪽으로 약 30도 정도 돌려주세요'
      case FaceDetectionState.UP_FACE:
        return '위쪽으로 약 10도 정도 올려주세요'
      case FaceDetectionState.DOWN_FACE:
        return '아래쪽으로 약 10도 정도 내려주세요'
      case FaceDetectionState.COMPLETED:
        return '모든 방향에서 얼굴이 캡처되었습니다'
      default:
        return ''
    }
  }

  // 현재 단계 표시 텍스트
  const getStageText = (): string => {
    switch (detectionState) {
      case FaceDetectionState.INIT:
        return '준비 중'
      case FaceDetectionState.FRONT_FACE:
        return '정면 촬영 중 (1/5)'
      case FaceDetectionState.LEFT_FACE:
        return '왼쪽 촬영 중 (2/5)'
      case FaceDetectionState.RIGHT_FACE:
        return '오른쪽 촬영 중 (3/5)'
      case FaceDetectionState.UP_FACE:
        return '위쪽 촬영 중 (4/5)'
      case FaceDetectionState.DOWN_FACE:
        return '아래쪽 촬영 중 (5/5)'
      case FaceDetectionState.COMPLETED:
        return '촬영 완료'
      default:
        return ''
    }
  }

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
          refineLandmarks: true,
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

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close()
      }
    }
  }, [])

  // detectionState 변경 확인을 위한 useEffect 추가
  useEffect(() => {
    console.log(`상태가 변경됨: ${FaceDetectionState[detectionState]}`)

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

      console.log(`UI 업데이트: ${getMessage()} / ${getSubMessage()}`)
    }
  }, [detectionState])

  // border 색상이 변경될 때마다 상태 메시지 업데이트
  useEffect(() => {
    switch (borderColor) {
      case '#ff3d00':
        setBorderStatusMessage('얼굴이 감지되지 않았습니다')
        break
      case '#FFC107':
        setBorderStatusMessage('얼굴이 원 안에 들어오도록 위치하세요')
        break
      case '#FFAB00':
        setBorderStatusMessage('안내에 따라 고개를 천천히 돌려주세요')
        break
      case '#00c853':
        setBorderStatusMessage('위치와 방향이 정확합니다. 촬영 준비 완료')
        break
      case '#4285F4':
        setBorderStatusMessage('카운트다운 중입니다. 자세를 유지하세요')
        break
      default:
        setBorderStatusMessage('')
        break
    }
  }, [borderColor])

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

      // 얼굴이 원 안에 있는지 확인
      const isFaceInCircle = checkFaceInCircle(landmarks)
      setFaceWithinBounds(isFaceInCircle)

      // 얼굴 랜드마크 그리기 (간소화)
      drawing.drawConnectors(canvasCtx, landmarks, mp.FACEMESH_TESSELATION, {
        color: 'rgba(180, 180, 180, 0.3)',
        lineWidth: 1,
      })

      drawing.drawConnectors(canvasCtx, landmarks, mp.FACEMESH_FACE_OVAL, {
        color: '#E0E0E0',
        lineWidth: 2,
      })

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks)
      setRotation(rotationValues)

      // 현재 상태 표시 (디버깅)
      console.log('onResults 처리 중:', {
        detectionState: FaceDetectionState[detectionState],
        currentStateRef: FaceDetectionState[currentStateRef.current],
      })

      console.log('현재 처리 중인 상태:', FaceDetectionState[currentState])

      // 방향이 올바른지 확인
      const isDirectionCorrect = isCorrectOrientation(
        rotationValues,
        currentState,
      )

      console.log('상태 확인:', {
        state: FaceDetectionState[currentState],
        isFaceInCircle,
        isDirectionCorrect,
        roll: rotationValues.roll,
        pitch: rotationValues.pitch,
        yaw: rotationValues.yaw,
        processing,
        stateStable,
      })

      // 타이머가 진행 중일 때 방향 및 위치 확인
      if (timerInProgressRef.current) {
        const isFaceCorrectlyPositioned = isFaceInCircle && isDirectionCorrect

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
        console.log('타이머 작동 중 - 파란색')
      } else if (isDirectionCorrect && isFaceInCircle) {
        setBorderColor('#00c853') // 올바른 방향 (초록색)
        console.log('방향 및 위치 모두 정확 - 초록색')
      } else if (isFaceInCircle) {
        setBorderColor('#FFAB00') // 얼굴은 원 안에 있지만 방향이 맞지 않음 (주황색)
        console.log('위치만 정확, 방향 부정확 - 주황색')
      } else {
        setBorderColor('#FFC107') // 얼굴이 원 밖에 있음 (노란색)
        console.log('위치 부정확 - 노란색')
      }

      // 현재 상태에 따라 얼굴 방향 확인
      if (currentState > FaceDetectionState.INIT) {
        checkFaceOrientation(
          rotationValues,
          isFaceInCircle,
          faceDetectedNow,
          currentState,
        )
      }
    } else {
      // 이전 상태가 true였으면 로그 출력
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
      canvasCtx.fillStyle = 'red'
      canvasCtx.font = '18px "Suit", sans-serif'
      canvasCtx.textAlign = 'center'
      canvasCtx.fillText(
        '얼굴이 감지되지 않았습니다',
        canvasElement.width / 2,
        canvasElement.height / 2 + 7,
      )
    }

    // 가이드라인 그리기 (얼굴 원 위치 표시)
    canvasCtx.strokeStyle = faceWithinBounds
      ? 'rgba(224, 17, 95, 0.5)'
      : 'rgba(255, 171, 0, 0.5)'
    canvasCtx.lineWidth = 2
    canvasCtx.setLineDash([5, 5])
    canvasCtx.beginPath()
    canvasCtx.arc(
      canvasElement.width / 2,
      canvasElement.height / 2,
      canvasElement.width * 0.25,
      0,
      2 * Math.PI,
    )
    canvasCtx.stroke()

    canvasCtx.restore()
  }

  // 얼굴이 원 안에 있는지 확인
  const checkFaceInCircle = (landmarks: mp.NormalizedLandmarkList): boolean => {
    // 얼굴 중심점 (코 끝 랜드마크 사용)
    const nose = landmarks[1]

    // 정규화된 중심점 (0~1 범위)
    const center = {
      x: 0.5, // 중앙
      y: 0.5, // 중앙
    }

    // 원의 반지름 (정규화된 값)
    const radius = 0.35

    // 코와 중심 사이의 거리 계산
    const distance = Math.sqrt(
      Math.pow(nose.x - center.x, 2) + Math.pow(nose.y - center.y, 2),
    )

    const result = distance < radius
    console.log('원 위치 체크:', {
      distance: distance.toFixed(3),
      radius,
      result,
      noseX: nose.x.toFixed(3),
      noseY: nose.y.toFixed(3),
    })

    return result
  }

  // 얼굴 회전 계산 함수 (정수값으로 반환)
  const calculateFaceRotation = (
    landmarks: mp.NormalizedLandmarkList,
  ): RotationState => {
    // 주요 랜드마크 추출 (MediaPipe 인덱스)
    const noseTip = landmarks[1] // 코끝
    const leftEye = landmarks[33] // 왼쪽 눈
    const rightEye = landmarks[263] // 오른쪽 눈
    const leftCheek = landmarks[93] // 왼쪽 볼
    const rightCheek = landmarks[323] // 오른쪽 볼
    const forehead = landmarks[10] // 이마 중앙
    const chin = landmarks[152] // 턱 하단

    // Roll 계산 (Z축 회전) - 눈 사이의 각도
    const deltaY = rightEye.y - leftEye.y
    const deltaX = rightEye.x - leftEye.x
    const roll = (Math.atan2(deltaY, deltaX) * 180) / Math.PI

    // Pitch 계산 (X축 회전) - 이마-코-턱 관계
    // 정면에서 0도, 위를 보면 음수, 아래를 보면 양수
    const faceHeight = chin.y - forehead.y
    const nosePosY = (noseTip.y - forehead.y) / faceHeight

    let pitch = 0
    if (nosePosY < 0.48) {
      // 위를 볼 때 (nosePosY가 0.48보다 작으면 위를 보는 것)
      pitch = -((0.48 - nosePosY) * 100)
    } else if (nosePosY > 0.52) {
      // 아래를 볼 때 (nosePosY가 0.52보다 크면 아래를 보는 것)
      pitch = (nosePosY - 0.52) * 100
    }

    // Yaw 계산 (Y축 회전) - 코와 볼 사이의 관계
    // 정면에서 0도, 왼쪽을 보면 양수, 오른쪽을 보면 음수
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x)
    const nosePosX = (noseTip.x - leftCheek.x) / faceWidth

    let yaw = 0
    if (nosePosX < 0.48) {
      // 왼쪽을 볼 때 (nosePosX가 0.48보다 작으면 왼쪽을 보는 것)
      yaw = (0.48 - nosePosX) * 100
    } else if (nosePosX > 0.52) {
      // 오른쪽을 볼 때 (nosePosX가 0.52보다 크면 오른쪽을 보는 것)
      yaw = -((nosePosX - 0.52) * 100)
    }

    // 정수값으로 반환
    return {
      roll: Math.round(roll),
      pitch: Math.round(pitch),
      yaw: Math.round(yaw),
    }
  }

  // 현재 상태에 맞는 얼굴 방향인지 확인
  const isCorrectOrientation = (
    rotation: RotationState,
    state: FaceDetectionState,
  ): boolean => {
    // 디버그 정보 출력
    console.log('방향 체크 상세 값:', {
      state: FaceDetectionState[state],
      roll: rotation.roll,
      pitch: rotation.pitch,
      yaw: rotation.yaw,
    })

    // INIT 상태일 때는 항상 false 반환
    if (state === FaceDetectionState.INIT) {
      console.log('INIT 상태에서는 항상 방향 부정확으로 처리')
      return false
    }

    // 개선된 방향 체크 로직
    switch (state) {
      case FaceDetectionState.FRONT_FACE:
        // 정면: roll, pitch, yaw 모두 ±15도 이내
        const frontRollOK = Math.abs(rotation.roll) <= 20
        const frontPitchOK = Math.abs(rotation.pitch) <= 6
        const frontYawOK = Math.abs(rotation.yaw) <= 10

        const frontResult = frontRollOK && frontPitchOK && frontYawOK
        console.log('정면 방향 체크:', {
          result: frontResult,
          frontRollOK,
          frontPitchOK,
          frontYawOK,
        })
        return frontResult

      case FaceDetectionState.LEFT_FACE:
        // 왼쪽: yaw가 25~35도
        const leftRollOK = Math.abs(rotation.roll) <= 15
        const leftPitchOK = Math.abs(rotation.pitch) <= 15
        const leftYawOK = rotation.yaw >= 15 && rotation.yaw <= 35

        const leftResult = leftRollOK && leftPitchOK && leftYawOK
        console.log('왼쪽 방향 체크:', {
          result: leftResult,
          leftRollOK,
          leftPitchOK,
          leftYawOK,
        })
        return leftResult

      case FaceDetectionState.RIGHT_FACE:
        // 오른쪽: yaw가 -25~-35도
        const rightRollOK = Math.abs(rotation.roll) <= 15
        const rightPitchOK = Math.abs(rotation.pitch) <= 15
        const rightYawOK = rotation.yaw <= -15 && rotation.yaw >= -35

        const rightResult = rightRollOK && rightPitchOK && rightYawOK
        console.log('오른쪽 방향 체크:', {
          result: rightResult,
          rightRollOK,
          rightPitchOK,
          rightYawOK,
        })
        return rightResult

      case FaceDetectionState.UP_FACE:
        // 위: pitch가 -13~-9도
        const upRollOK = Math.abs(rotation.roll) <= 15
        const upPitchOK = rotation.pitch <= -2 && rotation.pitch >= -7
        const upYawOK = Math.abs(rotation.yaw) <= 15

        const upResult = upRollOK && upPitchOK && upYawOK
        console.log('위쪽 방향 체크:', {
          result: upResult,
          upRollOK,
          upPitchOK,
          upYawOK,
        })
        return upResult

      case FaceDetectionState.DOWN_FACE:
        // 아래: pitch가 9~13도
        const downRollOK = Math.abs(rotation.roll) <= 15
        const downPitchOK = rotation.pitch >= 9 && rotation.pitch <= 15
        const downYawOK = Math.abs(rotation.yaw) <= 15

        const downResult = downRollOK && downPitchOK && downYawOK
        console.log('아래쪽 방향 체크:', {
          result: downResult,
          downRollOK,
          downPitchOK,
          downYawOK,
        })
        return downResult

      default:
        return false
    }
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

    console.log('방향 체크 함수 호출됨', {
      faceDetectedNow,
      processing,
      stateStable,
      inBounds,
      state: FaceDetectionState[currentState],
      timerActive: timerActiveRef.current,
    })

    // INIT 상태일 때는 체크하지 않음
    if (currentState === FaceDetectionState.INIT) {
      console.log('INIT 상태에서는 방향 체크하지 않음')
      return
    }

    if (!faceDetectedNow) {
      console.log('얼굴 미감지로 인한 처리 불가')
      return
    }

    // 타이머가 이미 활성화되어 있는지 확인
    if (timerActiveRef.current || processing) {
      console.log('이미 타이머 활성화 상태로 인한 미작동')
      return
    }

    if (!inBounds) {
      console.log('얼굴이 원 밖에 위치하여 타이머 미작동')
      return
    }

    // 방향이 올바른지 확인
    const isCorrect = isCorrectOrientation(rotationValues, currentState)

    if (isCorrect) {
      console.log('✅ 모든 조건 만족! 타이머 시작')
      // 타이머 시작을 위한 함수 호출
      handleStateTimer()
    } else {
      console.log('❌ 방향 부정확으로 타이머 미작동')
    }
  }

  // 상태 타이머 처리 및 원형 게이지 업데이트
  const handleStateTimer = (): void => {
    // 이미 타이머가 진행 중이면 중복 호출 무시
    if (timerInProgressRef.current) {
      console.log('이미 타이머가 진행 중입니다. 중복 호출 무시')
      return
    }

    // 이미 처리 중이면 무시
    if (processing) {
      console.log('이미 처리 중으로 인한 타이머 미작동')
      return
    }

    console.log('타이머 시작 함수 호출됨')

    // 기존 타이머가 있으면 제거
    if (timerRef.current) {
      clearInterval(timerRef.current)
      console.log('기존 타이머 제거')
    }

    // 타이머 활성화 상태 설정
    timerActiveRef.current = true
    timerInProgressRef.current = true

    // 처리 중 상태 설정
    setProcessing(true)
    console.log('타이머 시작: 처리 중 상태 설정')

    // 3초 카운트다운
    let count = 3
    let progress = 0
    setStateTimer(count)
    setTimerProgress(progress)

    // 50ms 단위로 진행도 업데이트 (부드러운 애니메이션)
    const updateInterval = 50
    const totalDuration = 3000
    const totalSteps = totalDuration / updateInterval
    let currentStep = 0

    const interval = setInterval(() => {
      // 타이머 진행 중 얼굴 위치와 방향이 유효하지 않으면
      // onResults에서 timerInProgressRef.current = false로 설정됨
      if (!timerInProgressRef.current) {
        clearInterval(interval)
        timerRef.current = null
        console.log('타이머 중단: 얼굴 위치/방향 변경')
        setProcessing(false)
        setStateTimer(0)
        setTimerProgress(0)
        return
      }

      currentStep++
      progress = currentStep / totalSteps
      setTimerProgress(progress)

      if (currentStep % (totalSteps / 3) === 0) {
        // 1초마다 카운트 감소
        count--
        setStateTimer(count)
        console.log(`타이머 카운트: ${count}`)
      }

      if (currentStep >= totalSteps) {
        clearInterval(interval)
        timerRef.current = null
        console.log('타이머 완료: 얼굴 캡처 호출')

        // 타이머 완료 후 캡처 진행
        captureFace() // 카운트 완료 후 얼굴 캡처

        console.log('captureFace 호출 완료')

        // 상태 리셋
        setProcessing(false)
        setStateTimer(0)
        setTimerProgress(0)
        timerActiveRef.current = false
        timerInProgressRef.current = false
      }
    }, updateInterval)

    // 타이머 ID 저장
    timerRef.current = interval as unknown as number

    console.log('타이머 설정 완료')
  }

  // 얼굴 캡처
  const captureFace = (): void => {
    console.log(
      'captureFace 함수 시작, 현재 상태:',
      FaceDetectionState[detectionState],
    )
    console.log(
      'currentStateRef 값:',
      FaceDetectionState[currentStateRef.current],
    )

    if (!lastFrameRef.current) return

    // 캡처용 캔버스 생성
    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas')
      hiddenCanvasRef.current.width = 640
      hiddenCanvasRef.current.height = 480
    }

    const canvas = hiddenCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // 이미지 데이터를 캔버스에 그리기
    const imgData = lastFrameRef.current
    ctx.putImageData(imgData, 0, 0)

    // 캡처된 이미지 저장
    const capturedImage: CapturedImage = {
      state: detectionState,
      imageData: canvas.toDataURL('image/jpeg'),
    }

    // 이미지 배열에 추가
    setCapturedImages((prev) => [...prev, capturedImage])

    console.log('캡처 완료, 다음 상태로 이동 호출')
    console.log('이동 전 현재 상태:', FaceDetectionState[detectionState])

    // 다음 상태로 이동
    moveToNextState()
    console.log(
      'moveToNextState 호출 후, React 상태:',
      FaceDetectionState[detectionState],
    )
    console.log(
      'moveToNextState 호출 후, Ref 상태:',
      FaceDetectionState[currentStateRef.current],
    )

    // 이동 후 확인 (비동기 처리 때문에 setTimeout 사용)
    setTimeout(() => {
      console.log('이동 후 현재 상태:', FaceDetectionState[detectionState])
    }, 100)

    console.log('moveToNextState 호출 완료')
  }

  // 다음 상태로 이동
  const moveToNextState = (): void => {
    // 현재 ref에서 상태 읽기
    const currentState = currentStateRef.current
    console.log(
      'moveToNextState 함수 시작, 현재 상태:',
      FaceDetectionState[currentState],
    )

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
      console.log(
        `상태 변경 시도: ${FaceDetectionState[currentState]} -> ${FaceDetectionState[nextState]}`,
      )

      // 함수형 업데이트 사용
      setDetectionState((prevState) => {
        console.log(
          `상태 변경 실행: ${FaceDetectionState[prevState]} -> ${FaceDetectionState[nextState]}`,
        )
        return nextState
      })

      // 상태 변경 후 안정화 시간 리셋
      lastStateTime.current = Date.now()
      setStateStable(true)

      // 타이머 상태 리셋
      setStateTimer(0)
      setTimerProgress(0)
    }
  }

  // 비디오 시작
  const startVideo = async (): Promise<void> => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      console.warn('모델이나 비디오 엘리먼트가 준비되지 않았습니다')
      return Promise.reject('모델 또는 비디오 준비 안됨')
    }

    try {
      // 캔버스 크기 설정
      if (canvasRef.current) {
        canvasRef.current.width = 640
        canvasRef.current.height = 480
      }

      // MediaPipe 카메라 설정
      cameraRef.current = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 480,
        facingMode: 'user',
      })

      // 캡처된 이미지 초기화
      setCapturedImages([])

      // 카메라 시작
      await cameraRef.current.start()
      console.log('카메라 초기화 완료')

      // 상태 즉시 변경
      setDetectionState(FaceDetectionState.FRONT_FACE)
      setStateStable(true) // 안정화 상태 즉시 설정
      lastStateTime.current = Date.now()
      console.log('상태 즉시 변경됨: INIT → FRONT_FACE')

      return Promise.resolve()
    } catch (error) {
      console.error('카메라 접근 오류:', error)
      setLoadingError(
        `카메라 접근 오류: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
      return Promise.reject(error)
    }
  }

  // 카메라 사용 시작
  const handleStartCamera = (): void => {
    startVideo()
      .then(() => {
        console.log('카메라 시작 후 상태 강제 변경: INIT → FRONT_FACE')
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
  const handleComplete = (): void => {
    console.log('등록 프로세스 완료')
    navigate('/register/face/confirm', {
      state: {
        capturedImages: capturedImages.map((img) => img.imageData),
      },
    })
  }

  // 캡처된 이미지 렌더링
  const renderCapturedImages = () => {
    if (capturedImages.length === 0) return null

    const getStateLabel = (state: FaceDetectionState): string => {
      switch (state) {
        case FaceDetectionState.FRONT_FACE:
          return '정면'
        case FaceDetectionState.LEFT_FACE:
          return '좌측'
        case FaceDetectionState.RIGHT_FACE:
          return '우측'
        case FaceDetectionState.UP_FACE:
          return '위'
        case FaceDetectionState.DOWN_FACE:
          return '아래'
        default:
          return ''
      }
    }

    return (
      <CapturedImagesGrid>
        {capturedImages.map((img, index) => (
          <CapturedImageContainer key={index}>
            <CapturedImg src={img.imageData} alt={`captured-${index}`} />
            <CapturedImageLabel>{getStateLabel(img.state)}</CapturedImageLabel>
          </CapturedImageContainer>
        ))}
      </CapturedImagesGrid>
    )
  }

  // 단계 표시기 렌더링
  const renderProgressSteps = () => {
    const steps = [
      FaceDetectionState.FRONT_FACE,
      FaceDetectionState.LEFT_FACE,
      FaceDetectionState.RIGHT_FACE,
      FaceDetectionState.UP_FACE,
      FaceDetectionState.DOWN_FACE,
    ]

    return (
      <ProgressStepsContainer>
        {steps.map((step, index) => (
          <ProgressStep
            key={index}
            active={detectionState === step}
            completed={detectionState > step}
          />
        ))}
      </ProgressStepsContainer>
    )
  }

  // 안내 가이드라인 컴포넌트
  const renderGuidelines = (): JSX.Element | null => {
    switch (detectionState) {
      case FaceDetectionState.FRONT_FACE:
        return (
          <FaceGuideline>
            {/* 정면 안내 - 얼굴 윤곽 원과 십자선 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                height: '80%',
                width: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                width: '80%',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateY(-50%)',
              }}
            />
          </FaceGuideline>
        )

      case FaceDetectionState.LEFT_FACE:
        return (
          <FaceGuideline>
            {/* 왼쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateY(30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '25%',
                width: '25%',
                height: '2px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '25%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateY(-50%) rotate(-45deg)',
              }}
            />
          </FaceGuideline>
        )

      case FaceDetectionState.RIGHT_FACE:
        return (
          <FaceGuideline>
            {/* 오른쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateY(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '25%',
                height: '2px',
                backgroundColor: 'white',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '25%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderRight: '2px solid white',
                transform: 'translateY(-50%) rotate(45deg)',
              }}
            />
          </FaceGuideline>
        )

      case FaceDetectionState.UP_FACE:
        return (
          <FaceGuideline>
            {/* 위쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderTop: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(45deg)',
              }}
            />
          </FaceGuideline>
        )

      case FaceDetectionState.DOWN_FACE:
        return (
          <FaceGuideline>
            {/* 아래쪽 회전 안내 */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '50%',
                width: '70%',
                height: '70%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                transform: 'translateX(-50%) rotateX(-30deg)',
                perspective: '500px',
              }}
            />

            {/* 회전 방향 화살표 */}
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                height: '25%',
                width: '2px',
                backgroundColor: 'white',
                transform: 'translateX(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '25%',
                left: '50%',
                width: '10px',
                height: '10px',
                borderBottom: '2px solid white',
                borderLeft: '2px solid white',
                transform: 'translateX(-50%) rotate(-45deg)',
              }}
            />
          </FaceGuideline>
        )

      default:
        return null
    }
  }

  return (
    <Container>
      <HeaderWrapper>
        <CaptureHeader />
      </HeaderWrapper>

      <ContentWrapper>
        <CaptureContainer>
          {/* 상단에 현재 단계 표시 */}
          {detectionState !== FaceDetectionState.INIT && (
            <StageIndicator>
              <Text variant="body2" weight="bold" color="white">
                {getStageText()}
              </Text>
              {detectionState !== FaceDetectionState.COMPLETED &&
                renderProgressSteps()}
            </StageIndicator>
          )}

          <Message>{getMessage()}</Message>
          <SubMessage>{getSubMessage()}</SubMessage>

          {detectionState !== FaceDetectionState.COMPLETED && (
            <FaceCircle borderColor={borderColor}>
              <VideoContainer>
                <Video ref={videoRef} autoPlay playsInline muted />
                <Canvas ref={canvasRef} width={640} height={480} />

                {/* 가이드라인 렌더링 */}
                {renderGuidelines()}

                <GuideLine>
                  {stateTimer > 0 && <TimerDisplay>{stateTimer}</TimerDisplay>}
                </GuideLine>

                {/* 타이머 원형 게이지 */}
                {stateTimer > 0 && (
                  <TimerCircleContainer>
                    <TimerCircleSVG viewBox="0 0 500 500">
                      <TimerCirclePath
                        cx="250"
                        cy="250"
                        r="248"
                        progress={timerProgress}
                        color={colors.main}
                      />
                    </TimerCircleSVG>
                  </TimerCircleContainer>
                )}
              </VideoContainer>
            </FaceCircle>
          )}

          {/* 완료 화면 - 캡처된 이미지들 */}
          {detectionState === FaceDetectionState.COMPLETED &&
            renderCapturedImages()}

          {/* 하단에 상태 메시지 표시 */}
          {detectionState !== FaceDetectionState.INIT &&
            detectionState !== FaceDetectionState.COMPLETED && (
              <StatusMessageContainer>
                <Text variant="body1" weight="medium" color="white">
                  {borderStatusMessage}
                </Text>
              </StatusMessageContainer>
            )}

          {detectionState === FaceDetectionState.INIT && !loadingError && (
            <ActionButton onClick={handleStartCamera} disabled={!modelsLoaded}>
              {modelsLoaded ? '카메라 켜기' : '모델 로딩 중...'}
            </ActionButton>
          )}

          {detectionState === FaceDetectionState.COMPLETED && (
            <>
              <ActionButton onClick={handleComplete}>
                인식 완료 및 계속하기
              </ActionButton>
              <ActionButton
                onClick={handleRestartCapture}
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.main}`,
                  marginTop: '12px',
                }}
              >
                다시 촬영하기
              </ActionButton>
            </>
          )}

          {loadingError && (
            <ActionButton onClick={() => window.location.reload()}>
              다시 시도하기
            </ActionButton>
          )}
        </CaptureContainer>
      </ContentWrapper>
    </Container>
  )
}

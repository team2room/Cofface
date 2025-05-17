// HeadMotionTracker.tsx
import React, { useState, useEffect, useRef } from 'react'
import * as mp from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import { MotionDetector } from './MotionDetector'
import { calculateFaceRotation } from '../../../components/FaceRecognition/utils'
import {
  Container,
  ContentWrapper,
  CameraColumn,
  InfoColumn,
  Message,
  SubMessage,
  Button,
  FaceCircle,
  VideoContainer,
  Video,
  Canvas,
  GuideLine,
  DebugPanelContainer,
  DebugCanvasContainer,
  DebugCanvas,
  DebugValue,
} from '../../../components/FaceRecognition/styles'

interface HeadMotionTrackerProps {
  onMotionDetected?: (motionType: string, data: any) => void
  debug?: boolean
}

const HeadMotionTracker: React.FC<HeadMotionTrackerProps> = ({
  onMotionDetected = () => {},
  debug = true,
}) => {
  // 상태 선언
  const [faceDetected, setFaceDetected] = useState<boolean>(false)
  const [rotation, setRotation] = useState({ roll: 0, pitch: 0, yaw: 0 })
  const [borderColor, setBorderColor] = useState<string>('#333')
  const [detectedMotion, setDetectedMotion] = useState<string | null>(null)
  const [processingFps, setProcessingFps] = useState<number>(0)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    [],
  )
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')

  // Refs 선언
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const debugCanvasRef = useRef<HTMLCanvasElement>(null)
  const faceMeshRef = useRef<mp.FaceMesh | null>(null)
  const cameraRef = useRef<cam.Camera | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const motionDetectorRef = useRef<MotionDetector>(new MotionDetector())
  const fpsCounterRef = useRef<{ frames: number; lastTimestamp: number }>({
    frames: 0,
    lastTimestamp: 0,
  })

  // 사용 가능한 카메라 장치 가져오기
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        )
        console.log('사용 가능한 카메라 장치:', videoDevices)
        setAvailableCameras(videoDevices)

        // 첫 번째 카메라를 기본값으로 설정
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error('카메라 장치 목록 가져오기 오류:', error)
      }
    }

    getCameras()
  }, [])

  useEffect(() => {
    if (cameraActive) {
      console.log('카메라 ID 변경 감지됨, 카메라 재시작')
      stopCamera()
      startCamera()
    }
  }, [selectedCameraId])

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      )
      console.log('[카메라 리스트]')
      videoDevices.forEach((device, i) => {
        console.log(`${i + 1}. ${device.label} - ${device.deviceId}`)
      })
    })
  }, [])

  // MediaPipe 모델 로드
  useEffect(() => {
    const loadMediaPipeModels = async (): Promise<void> => {
      try {
        console.log('MediaPipe 모델 로딩 시작...')

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
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        // 결과 처리 콜백 설정
        faceMesh.onResults(onResults)
        faceMeshRef.current = faceMesh

        console.log('MediaPipe 모델 로딩 완료')
        setModelsLoaded(true)
      } catch (error) {
        console.error('MediaPipe 모델 로딩 오류:', error)
      }
    }

    loadMediaPipeModels()

    return () => {
      stopCamera()
    }
  }, [])

  // MediaPipe 결과 처리 함수
  const onResults = (results: mp.Results): void => {
    if (!canvasRef.current) return

    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext('2d')

    if (!canvasCtx) return

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

      // 얼굴 감지 설정
      setFaceDetected(true)

      // 얼굴 랜드마크 그리기 (간소화)
      canvasCtx.strokeStyle = '#E0E0E0'
      canvasCtx.lineWidth = 2

      // 눈 그리기
      // 왼쪽 눈
      canvasCtx.beginPath()
      ;[33, 133, 160, 159, 158, 144, 145, 153, 33].forEach((index, i) => {
        const point = landmarks[index]
        if (i === 0) {
          canvasCtx.moveTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height,
          )
        } else {
          canvasCtx.lineTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height,
          )
        }
      })
      canvasCtx.stroke()

      // 오른쪽 눈
      canvasCtx.beginPath()
      ;[263, 362, 387, 386, 385, 373, 374, 380, 263].forEach((index, i) => {
        const point = landmarks[index]
        if (i === 0) {
          canvasCtx.moveTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height,
          )
        } else {
          canvasCtx.lineTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height,
          )
        }
      })
      canvasCtx.stroke()

      // 입 그리기
      canvasCtx.beginPath()
      ;[
        61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17,
        84, 181, 91, 146, 61,
      ].forEach((index, i) => {
        const point = landmarks[index]
        if (i === 0) {
          canvasCtx.moveTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height,
          )
        } else {
          canvasCtx.lineTo(
            point.x * canvasElement.width,
            point.y * canvasElement.height,
          )
        }
      })
      canvasCtx.stroke()

      // 3D 방향 계산 (roll, pitch, yaw)
      const rotationValues = calculateFaceRotation(landmarks)
      setRotation(rotationValues)

      // 디버그 캔버스 업데이트
      updateDebugCanvas(rotationValues)

      // 모션 감지
      const timestamp = Date.now()
      const motionEvent = motionDetectorRef.current.addMeasurement(
        rotationValues,
        timestamp,
      )
      if (motionEvent) {
        console.log(`모션 감지: ${motionEvent.type}`, motionEvent)
        setDetectedMotion(motionEvent.type)

        // 상위 컴포넌트에 이벤트 알림
        onMotionDetected(motionEvent.type, motionEvent)
      }

      // 경계선 색상 설정
      if (motionEvent) {
        setBorderColor('#4285F4') // 모션 감지 시 (파란색)
      } else {
        setBorderColor('#00c853') // 정상 감지 (초록색)
      }

      // FPS 업데이트
      updateFps()
    } else {
      // 얼굴 미감지 시
      setFaceDetected(false)
      setBorderColor('#ff3d00') // 얼굴 미감지 (빨간색)

      // 텍스트 표시
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      canvasCtx.fillRect(
        canvasElement.width / 2 - 150,
        canvasElement.height / 2 - 20,
        300,
        40,
      )
      canvasCtx.fillStyle = 'red'
      canvasCtx.font = '18px "Noto Sans KR", sans-serif'
      canvasCtx.textAlign = 'center'
      canvasCtx.fillText(
        '얼굴이 감지되지 않았습니다',
        canvasElement.width / 2,
        canvasElement.height / 2 + 7,
      )
    }

    // 가이드라인 그리기 (얼굴 원 위치 표시)
    canvasCtx.strokeStyle = faceDetected
      ? 'rgba(0, 200, 83, 0.5)'
      : 'rgba(255, 171, 0, 0.5)'
    canvasCtx.lineWidth = 2
    canvasCtx.setLineDash([5, 5])
    canvasCtx.beginPath()
    canvasCtx.arc(
      canvasElement.width / 2,
      canvasElement.height / 2,
      canvasElement.width * 0.25, // 얼굴 크기 기준
      0,
      2 * Math.PI,
    )
    canvasCtx.stroke()

    canvasCtx.restore()
  }

  // FPS 업데이트 함수
  const updateFps = () => {
    const now = performance.now()
    fpsCounterRef.current.frames++

    // 1초마다 FPS 업데이트
    if (now - fpsCounterRef.current.lastTimestamp >= 1000) {
      setProcessingFps(fpsCounterRef.current.frames)
      fpsCounterRef.current.frames = 0
      fpsCounterRef.current.lastTimestamp = now
    }
  }

  // 디버그 캔버스 업데이트 (3D 회전 시각화)
  const updateDebugCanvas = (rotationValues: {
    roll: number
    pitch: number
    yaw: number
  }): void => {
    if (!debugCanvasRef.current) return

    const canvas = debugCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 제목
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '14px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Face Rotation Debug', canvas.width / 2, 15)

    // 각도 값 표시 (roll, pitch, yaw) - 정수로 표시
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'

    // Roll (Z축 회전)
    ctx.fillStyle = '#FF8080'
    ctx.fillText(`Roll: ${rotationValues.roll}°`, 10, 35)
    const rollStatus = Math.abs(rotationValues.roll) < 15 ? 'OK' : 'NG'
    ctx.fillText(rollStatus, canvas.width - 30, 35)

    // Pitch (X축 회전)
    ctx.fillStyle = '#80FF80'
    ctx.fillText(`Pitch: ${rotationValues.pitch}°`, 10, 55)
    const pitchStatus = Math.abs(rotationValues.pitch) < 15 ? 'OK' : 'NG'
    ctx.fillText(pitchStatus, canvas.width - 30, 55)

    // Yaw (Y축 회전)
    ctx.fillStyle = '#8080FF'
    ctx.fillText(`Yaw: ${rotationValues.yaw}°`, 10, 75)
    const yawStatus = Math.abs(rotationValues.yaw) < 15 ? 'OK' : 'NG'
    ctx.fillText(yawStatus, canvas.width - 30, 75)

    // 3D 얼굴 시각화
    const centerX = canvas.width / 2
    const centerY = 135
    const radius = 35

    // 얼굴 타원 그리기
    ctx.save()
    ctx.translate(centerX, centerY)

    // Roll 회전 (z축 회전)
    ctx.rotate((rotationValues.roll * Math.PI) / 180)

    // Yaw에 따른 타원 스케일링 - 절대값으로 계산하여 음수 방지
    // 수정: Math.abs 적용 및 값의 범위 제한
    const yawFactor = Math.max(
      0.1,
      Math.cos(
        Math.min(
          Math.PI / 2 - 0.1,
          Math.abs((rotationValues.yaw * Math.PI) / 180),
        ),
      ),
    )

    // Pitch에 따른 타원 스케일링 - 절대값으로 계산하여 음수 방지
    // 수정: Math.abs 적용 및 값의 범위 제한
    const pitchFactor = Math.max(
      0.1,
      Math.cos(
        Math.min(
          Math.PI / 2 - 0.1,
          Math.abs((rotationValues.pitch * Math.PI) / 180),
        ),
      ),
    )

    // 얼굴 윤곽 그리기
    ctx.beginPath()
    ctx.ellipse(
      0,
      0,
      radius * yawFactor, // 항상 양수 보장
      radius * pitchFactor, // 항상 양수 보장
      0,
      0,
      2 * Math.PI,
    )
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()

    // 코 그리기 (방향 표시) - 각도 제한 추가
    const noseLength = 15
    ctx.beginPath()
    ctx.moveTo(0, -5)

    // yaw와 pitch 각도를 제한하여 안전한 값 사용
    const limitedYaw =
      Math.min(
        Math.PI / 2 - 0.1,
        Math.abs((rotationValues.yaw * Math.PI) / 180),
      ) * Math.sign(rotationValues.yaw)
    const limitedPitch =
      Math.min(
        Math.PI / 2 - 0.1,
        Math.abs((rotationValues.pitch * Math.PI) / 180),
      ) * Math.sign(rotationValues.pitch)

    const noseEndX = noseLength * Math.sin(limitedYaw)
    const noseEndY = noseLength * Math.sin(limitedPitch)

    ctx.lineTo(noseEndX, noseEndY)
    ctx.strokeStyle = '#FFFF00'
    ctx.lineWidth = 3
    ctx.stroke()

    // 눈 그리기 - 수정된 yawFactor와 pitchFactor 사용
    const eyeOffsetX = 15 * yawFactor
    const eyeOffsetY = -10 * pitchFactor
    const eyeWidth = Math.max(1, 8 * yawFactor) // 최소 1 픽셀 보장
    const eyeHeight = Math.max(1, 5 * pitchFactor) // 최소 1 픽셀 보장

    // 왼쪽 눈
    ctx.beginPath()
    ctx.ellipse(-eyeOffsetX, eyeOffsetY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI)
    ctx.fillStyle = '#80FFFF'
    ctx.fill()

    // 오른쪽 눈
    ctx.beginPath()
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI)
    ctx.fillStyle = '#80FFFF'
    ctx.fill()

    // 입 그리기
    const mouthWidth = Math.max(1, 20 * yawFactor) // 최소 1 픽셀 보장
    const mouthHeight = Math.max(1, 5 * pitchFactor) // 최소 1 픽셀 보장

    ctx.beginPath()
    ctx.ellipse(0, 15 * pitchFactor, mouthWidth, mouthHeight, 0, 0, Math.PI)
    ctx.strokeStyle = '#FF8080'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()

    // 모션 디버깅 정보
    if (detectedMotion) {
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.font = '16px monospace'
      ctx.fillText(
        `감지된 모션: ${detectedMotion}`,
        canvas.width / 2,
        canvas.height - 10,
      )
    }
  }

  // 카메라 시작
  const startCamera = async (): Promise<void> => {
    if (!modelsLoaded || !faceMeshRef.current || !videoRef.current) {
      console.warn('모델이나 비디오 엘리먼트가 준비되지 않았습니다')
      return
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      // MediaPipe 수동 프레임 처리 루프
      const process = async () => {
        if (videoRef.current && faceMeshRef.current) {
          await faceMeshRef.current.send({ image: videoRef.current })
        }
        requestAnimationFrame(process)
      }

      requestAnimationFrame(process)
      setCameraActive(true)
      console.log('카메라 스트림 시작 완료')
    } catch (err) {
      console.error('카메라 시작 실패:', err)
    }
  }

  // 카메라 중지
  const stopCamera = (): void => {
    if (cameraRef.current) {
      cameraRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    setCameraActive(false)
    setBorderColor('#333')
  }

  return (
    <Container>
      <Message>머리 움직임 감지 시스템</Message>
      <SubMessage>
        {!modelsLoaded
          ? '모델 로딩 중...'
          : '얼굴을 카메라에 위치시키고 머리를 좌우로 흔들어 보세요.'}
      </SubMessage>

      <ContentWrapper>
        <CameraColumn>
          <FaceCircle borderColor={borderColor}>
            <VideoContainer>
              <Video ref={videoRef} autoPlay playsInline muted />
              <Canvas ref={canvasRef} width={640} height={480} />
              <GuideLine />
            </VideoContainer>
          </FaceCircle>

          {/* 카메라 선택 드롭다운 추가 */}
          {availableCameras.length > 1 && (
            <div
              style={{ marginBottom: '10px', width: '100%', maxWidth: '400px' }}
            >
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  marginBottom: '10px',
                }}
              >
                {availableCameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label ||
                      `카메라 ${availableCameras.indexOf(camera) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '400px',
              flexDirection: 'column',
            }}
          >
            {!cameraActive ? (
              <Button
                onClick={startCamera}
                disabled={!modelsLoaded}
                style={{ width: '100%' }}
              >
                {modelsLoaded ? '카메라 켜기' : '모델 로딩 중...'}
              </Button>
            ) : (
              <Button
                onClick={stopCamera}
                style={{ backgroundColor: '#555', width: '100%' }}
              >
                카메라 끄기
              </Button>
            )}
          </div>

          {detectedMotion && (
            <div
              style={{
                margin: '20px 0',
                padding: '15px',
                backgroundColor: 'rgba(66, 133, 244, 0.2)',
                color: '#4285F4',
                borderRadius: '5px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              감지된 모션: {detectedMotion}
            </div>
          )}
        </CameraColumn>

        {debug && (
          <InfoColumn>
            {/* 디버그 패널 */}
            <DebugPanelContainer>
              <h3 style={{ margin: '0 0 15px 0' }}>얼굴 회전 디버깅</h3>
              <DebugCanvasContainer>
                <DebugCanvas ref={debugCanvasRef} width={300} height={180} />
              </DebugCanvasContainer>

              <div
                style={{
                  borderBottom: '1px solid #555',
                  paddingBottom: '5px',
                  marginBottom: '10px',
                }}
              >
                <strong>현재 정보</strong>
              </div>

              <DebugValue>
                <span>얼굴 감지:</span>
                <span>{faceDetected ? '✓' : '✗'}</span>
              </DebugValue>

              <DebugValue>
                <span>선택된 카메라:</span>
                <span>
                  {availableCameras.find((c) => c.deviceId === selectedCameraId)
                    ?.label ||
                    `카메라 ID: ${selectedCameraId.substring(0, 8)}...`}
                </span>
              </DebugValue>

              <DebugValue>
                <span>처리 FPS:</span>
                <span>{processingFps}</span>
              </DebugValue>

              <div
                style={{
                  borderBottom: '1px solid #555',
                  paddingBottom: '5px',
                  margin: '10px 0',
                }}
              >
                <strong>회전 값</strong>
              </div>

              <DebugValue>
                <span>Roll (Z축):</span>
                <span>{rotation.roll}°</span>
              </DebugValue>
              <DebugValue>
                <span>Pitch (X축):</span>
                <span>{rotation.pitch}°</span>
              </DebugValue>
              <DebugValue>
                <span>Yaw (Y축):</span>
                <span>{rotation.yaw}°</span>
              </DebugValue>

              <div
                style={{
                  borderBottom: '1px solid #555',
                  paddingBottom: '5px',
                  margin: '10px 0',
                }}
              >
                <strong>모션 감지 설정</strong>
              </div>

              <DebugValue>
                <span>측정값 저장 개수:</span>
                <span>{motionDetectorRef.current.getHistoryLength()}</span>
              </DebugValue>
              <DebugValue>
                <span>Yaw 변화 임계값:</span>
                <span>{motionDetectorRef.current.getYawThreshold()}°</span>
              </DebugValue>
              <DebugValue>
                <span>속도 임계값:</span>
                <span>
                  {motionDetectorRef.current.getVelocityThreshold()}°/ms
                </span>
              </DebugValue>
            </DebugPanelContainer>

            <div
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid #555',
                borderRadius: '8px',
                padding: '15px',
                marginTop: '20px',
                color: 'white',
              }}
            >
              <h3 style={{ margin: '0 0 15px 0' }}>모션 가이드</h3>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p>
                  • <strong>좌우 빠른 회전</strong>: 머리를 좌우로 빠르게
                  회전하세요.
                </p>
                <p>
                  • <strong>머리 흔들기</strong>: 고개를 좌우로 여러 번
                  흔드세요.
                </p>
                <p>
                  • <strong>고개 끄덕임</strong>: 고개를 위아래로 끄덕이세요.
                </p>
              </div>
            </div>
          </InfoColumn>
        )}
      </ContentWrapper>
    </Container>
  )
}

export default HeadMotionTracker

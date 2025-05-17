// components/HeadShaking/KioskMotionTracker.tsx
import React, { useState, useEffect } from 'react'
import BackgroundMotionTracker from './BackgroundMotionTracker'
import { useMotion } from '../MotionContext'

interface KioskMotionTrackerProps {
  onFaceDetected?: (detected: boolean) => void
  debug?: boolean
}

const KioskMotionTracker: React.FC<KioskMotionTrackerProps> = ({
  onFaceDetected,
  debug = false,
}) => {
  const { isActive, lastMotion } = useMotion()
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')

  // 사용 가능한 카메라 장치 가져오기
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput',
        )

        console.log(
          '[KioskMotionTracker] 사용 가능한 카메라 장치:',
          videoDevices,
        )
        setCameras(videoDevices)

        // 첫 번째 카메라를 기본값으로 설정
        if (videoDevices.length > 0 && !selectedCamera) {
          setSelectedCamera(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error(
          '[KioskMotionTracker] 카메라 장치 목록 가져오기 오류:',
          error,
        )
      }
    }

    getCameras()
  }, [])

  if (!debug) {
    // 디버그 모드가 아닌 경우 BackgroundMotionTracker만 렌더링
    return (
      <BackgroundMotionTracker
        active={isActive}
        cameraId={selectedCamera}
        onFaceDetected={onFaceDetected}
      />
    )
  }

  // 디버그 모드인 경우 디버깅 요소 함께 렌더링
  return (
    <div>
      <BackgroundMotionTracker
        active={isActive}
        cameraId={selectedCamera}
        onFaceDetected={onFaceDetected}
      />

      {/* 디버그 정보 */}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          borderRadius: '5px',
          color: '#fff',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '300px',
        }}
      >
        <div>
          <strong>모션 감지:</strong> {isActive ? '활성화됨' : '비활성화됨'}
        </div>
        {lastMotion && (
          <div style={{ color: '#4fc3f7' }}>
            <strong>최근 감지된 모션:</strong> {lastMotion}
          </div>
        )}

        <div style={{ marginTop: '10px' }}>
          <strong>카메라 선택:</strong>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            style={{
              width: '100%',
              marginTop: '5px',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              padding: '3px',
            }}
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `카메라 ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default KioskMotionTracker

// DebugPanel.tsx
import React from 'react'
import {
  DebugPanelContainer,
  DebugCanvasContainer,
  DebugCanvas,
  DebugValue,
} from './styles'
import { FaceDetectionState, RotationState } from './types'

interface DebugPanelProps {
  detectionState: FaceDetectionState
  faceDetected: boolean
  faceWithinBounds: boolean
  stateStable: boolean
  rotation: RotationState
  debugCanvasRef: React.RefObject<HTMLCanvasElement>
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  detectionState,
  faceDetected,
  faceWithinBounds,
  stateStable,
  rotation,
  debugCanvasRef,
}) => {
  return (
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
        <span>현재 상태:</span>
        <span>
          {FaceDetectionState[detectionState]} ({detectionState})
        </span>
      </DebugValue>

      <DebugValue>
        <span>얼굴 감지:</span>
        <span>{faceDetected ? '✓' : '✗'}</span>
      </DebugValue>

      <DebugValue>
        <span>위치 정확:</span>
        <span>{faceWithinBounds ? '✓' : '✗'}</span>
      </DebugValue>

      <DebugValue>
        <span>상태 안정화:</span>
        <span>{stateStable ? '✓' : '✗'}</span>
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

      <div style={{ marginTop: '15px', fontSize: '13px', color: '#aaa' }}>
        <div>정면: 모든 값이 ±15° 이내</div>
        <div>좌측: Yaw +25~45°, Roll ±15° 이내</div>
        <div>우측: Yaw -25~-45°, Roll ±15° 이내</div>
        <div>위쪽: Pitch -25~-45°, Roll ±15° 이내</div>
        <div>아래쪽: Pitch +25~45°, Roll ±15° 이내</div>
      </div>
    </DebugPanelContainer>
  )
}

export default DebugPanel

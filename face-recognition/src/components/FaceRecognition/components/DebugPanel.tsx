import React, { useRef, useEffect } from 'react';
import { FaceDetectionState, RotationState } from '../types';
import {
  DebugPanel as StyledDebugPanel,
  DebugCanvasContainer,
  DebugCanvas,
  DebugValue,
} from '../styles';

interface DebugPanelProps {
  detectionState: FaceDetectionState;
  faceDetected: boolean;
  faceWithinBounds: boolean;
  stateStable: boolean;
  rotation: RotationState;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  detectionState,
  faceDetected,
  faceWithinBounds,
  stateStable,
  rotation,
}) => {
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  // 디버그 캔버스 업데이트 (3D 회전 시각화)
  useEffect(() => {
    updateDebugCanvas(rotation);
  }, [rotation]);

  const updateDebugCanvas = (rotationValues: RotationState): void => {
    if (!debugCanvasRef.current) return;

    const canvas = debugCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 제목
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Face Rotation Debug', canvas.width / 2, 15);

    // 각도 값 표시 (roll, pitch, yaw) - 정수로 표시
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    // Roll (Z축 회전)
    ctx.fillStyle = '#FF8080';
    ctx.fillText(`Roll: ${rotationValues.roll}°`, 10, 35);
    const rollStatus = Math.abs(rotationValues.roll) < 15 ? 'OK' : 'NG';
    ctx.fillText(rollStatus, canvas.width - 30, 35);

    // Pitch (X축 회전)
    ctx.fillStyle = '#80FF80';
    ctx.fillText(`Pitch: ${rotationValues.pitch}°`, 10, 55);

    let pitchStatus = 'NG';
    if (
      detectionState === FaceDetectionState.UP_FACE &&
      rotationValues.pitch < -25
    ) {
      pitchStatus = 'OK';
    } else if (
      detectionState === FaceDetectionState.DOWN_FACE &&
      rotationValues.pitch > 25
    ) {
      pitchStatus = 'OK';
    } else if (Math.abs(rotationValues.pitch) < 15) {
      pitchStatus = 'OK';
    }
    ctx.fillText(pitchStatus, canvas.width - 30, 55);

    // Yaw (Y축 회전)
    ctx.fillStyle = '#8080FF';
    ctx.fillText(`Yaw: ${rotationValues.yaw}°`, 10, 75);

    let yawStatus = 'NG';
    if (
      detectionState === FaceDetectionState.LEFT_FACE &&
      rotationValues.yaw > 25
    ) {
      yawStatus = 'OK';
    } else if (
      detectionState === FaceDetectionState.RIGHT_FACE &&
      rotationValues.yaw < -25
    ) {
      yawStatus = 'OK';
    } else if (Math.abs(rotationValues.yaw) < 15) {
      yawStatus = 'OK';
    }
    ctx.fillText(yawStatus, canvas.width - 30, 75);

    // 현재 상태 표시
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `현재 상태: ${FaceDetectionState[detectionState]} (${detectionState}/6)`,
      canvas.width / 2,
      95
    );

    // 3D 얼굴 시각화 (간략하게 구현)
    const centerX = canvas.width / 2;
    const centerY = 135;
    const radius = 35;

    // 얼굴 타원 그리기
    ctx.save();
    ctx.translate(centerX, centerY);

    // Roll 회전 (z축 회전)
    ctx.rotate((rotationValues.roll * Math.PI) / 180);

    // Yaw에 따른 타원 스케일링
    const yawFactor = Math.cos((rotationValues.yaw * Math.PI) / 180);
    // Pitch에 따른 타원 스케일링
    const pitchFactor = Math.cos((rotationValues.pitch * Math.PI) / 180);

    // 얼굴 윤곽 그리기
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      radius * yawFactor,
      radius * pitchFactor,
      0,
      0,
      2 * Math.PI
    );
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 코 그리기 (방향 표시)
    const noseLength = 15;

    ctx.beginPath();
    ctx.moveTo(0, -5);
    const noseEndX =
      noseLength * Math.sin((rotationValues.yaw * Math.PI) / 180);
    const noseEndY =
      noseLength * Math.sin((rotationValues.pitch * Math.PI) / 180);
    ctx.lineTo(noseEndX, noseEndY);
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 눈 그리기
    const eyeOffsetX = 15 * yawFactor;
    const eyeOffsetY = -10 * pitchFactor;
    const eyeWidth = 8 * yawFactor;
    const eyeHeight = 5 * pitchFactor;

    // 왼쪽 눈
    ctx.beginPath();
    ctx.ellipse(
      -eyeOffsetX,
      eyeOffsetY,
      eyeWidth,
      eyeHeight,
      0,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = '#80FFFF';
    ctx.fill();

    // 오른쪽 눈
    ctx.beginPath();
    ctx.ellipse(eyeOffsetX, eyeOffsetY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#80FFFF';
    ctx.fill();

    // 입 그리기
    const mouthWidth = 20 * yawFactor;
    const mouthHeight = 5 * pitchFactor;
    ctx.beginPath();
    ctx.ellipse(0, 15 * pitchFactor, mouthWidth, mouthHeight, 0, 0, Math.PI);
    ctx.strokeStyle = '#FF8080';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  return (
    <StyledDebugPanel>
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

      <div
        style={{ marginTop: '15px', fontSize: '13px', color: '#aaa' }}
      >
        <div>정면: 모든 값이 ±15° 이내</div>
        <div>좌측: Yaw +25~45°, Roll ±15° 이내</div>
        <div>우측: Yaw -25~-45°, Roll ±15° 이내</div>
        <div>위쪽: Pitch -25~-45°, Roll ±15° 이내</div>
        <div>아래쪽: Pitch +25~45°, Roll ±15° 이내</div>
      </div>
    </StyledDebugPanel>
  );
};
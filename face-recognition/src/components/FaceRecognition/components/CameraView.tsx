import React from 'react';
import { FaceDetectionState } from '../types';
import { FaceGuideline } from './FaceGuideline';
import { TimerCircle } from './TimerCircle';
import {
  FaceCircle,
  VideoContainer,
  Video,
  Canvas,
  GuideLine,
  TimerDisplay,
} from '../styles';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  detectionState: FaceDetectionState;
  borderColor: string;
  stateTimer: number;
  timerProgress: number;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  detectionState,
  borderColor,
  stateTimer,
  timerProgress,
}) => {
  return (
    <FaceCircle borderColor={borderColor}>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline muted />
        <Canvas ref={canvasRef} width={640} height={480} />

        {/* 가이드라인 렌더링 */}
        <FaceGuideline detectionState={detectionState} />

        <GuideLine>
          {stateTimer > 0 && <TimerDisplay>{stateTimer}</TimerDisplay>}
        </GuideLine>

        {/* 타이머 원형 게이지 */}
        {stateTimer > 0 && (
          <TimerCircle progress={timerProgress} color="#4285F4" />
        )}
      </VideoContainer>
    </FaceCircle>
  );
};
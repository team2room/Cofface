// CameraView.tsx
import React from 'react';
import { 
  FaceCircle, 
  VideoContainer, 
  Video, 
  Canvas, 
  GuideLine 
} from './styles';
import { FaceDetectionState } from './types';
import FaceGuidelines from './FaceGuidelines';
import TimerCircle from './TimerCircle';

interface CameraViewProps {
  detectionState: FaceDetectionState;
  borderColor: string;
  stateTimer: number;
  timerProgress: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CameraView: React.FC<CameraViewProps> = ({
  detectionState,
  borderColor,
  stateTimer,
  timerProgress,
  videoRef,
  canvasRef
}) => {
  return (
    <FaceCircle borderColor={borderColor}>
      <VideoContainer>
        <Video ref={videoRef} autoPlay playsInline muted />
        <Canvas ref={canvasRef} width={640} height={480} />
        
        {/* 가이드라인 컴포넌트 */}
        <FaceGuidelines detectionState={detectionState} />
        
        <GuideLine>
          {/* 타이머 컴포넌트 */}
          <TimerCircle 
            stateTimer={stateTimer} 
            timerProgress={timerProgress} 
          />
        </GuideLine>
      </VideoContainer>
    </FaceCircle>
  );
};

export default CameraView;
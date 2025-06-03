// ProgressSteps.tsx
import React from 'react';
import { ProgressStepsContainer, ProgressStep } from './styles';
import { FaceDetectionState } from './types';

interface ProgressStepsProps {
  detectionState: FaceDetectionState;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ detectionState }) => {
  const steps = [
    FaceDetectionState.FRONT_FACE,
    FaceDetectionState.LEFT_FACE,
    FaceDetectionState.RIGHT_FACE,
    FaceDetectionState.UP_FACE,
    FaceDetectionState.DOWN_FACE,
  ];

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
  );
};

export default ProgressSteps;
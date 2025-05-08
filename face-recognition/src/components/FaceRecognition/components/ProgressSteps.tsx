import React from 'react';
import { FaceDetectionState } from '../types';
import { ProgressStepsContainer, ProgressStep } from '../styles';

interface ProgressStepsProps {
  currentState: FaceDetectionState;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentState }) => {
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
          active={currentState === step}
          completed={currentState > step}
        />
      ))}
    </ProgressStepsContainer>
  );
};
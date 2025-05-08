import React from 'react';
import {
  TimerCircleContainer,
  TimerCircleSVG,
  TimerCirclePath
} from '../styles';

interface TimerCircleProps {
  progress: number;
  color: string;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({ progress, color }) => {
  return (
    <TimerCircleContainer>
      <TimerCircleSVG viewBox='0 0 500 500'>
        <TimerCirclePath
          cx='250'
          cy='250'
          r='248'
          progress={progress}
          color={color}
        />
      </TimerCircleSVG>
    </TimerCircleContainer>
  );
};
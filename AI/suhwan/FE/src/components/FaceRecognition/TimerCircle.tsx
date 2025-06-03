// TimerCircle.tsx
import React from 'react';
import { 
  TimerCircleContainer, 
  TimerCircleSVG, 
  TimerCirclePath, 
  TimerDisplay 
} from './styles';

interface TimerCircleProps {
  timerProgress: number;
  stateTimer: number;
}

const TimerCircle: React.FC<TimerCircleProps> = ({ timerProgress, stateTimer }) => {
  if (stateTimer <= 0) return null;
  
  return (
    <>
      <TimerDisplay>{stateTimer}</TimerDisplay>
      <TimerCircleContainer>
        <TimerCircleSVG viewBox='0 0 500 500'>
          <TimerCirclePath
            cx='250'
            cy='250'
            r='248'
            progress={timerProgress}
            color='#4285F4'
          />
        </TimerCircleSVG>
      </TimerCircleContainer>
    </>
  );
};

export default TimerCircle;
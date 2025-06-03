// src/components/face-registration/CountdownTimer.tsx

import React from 'react'
import { type CountdownTimerProps } from '../../types/face'

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  countdown,
  progress,
  isActive,
}) => {
  // 초 단위로 변환
  const seconds = Math.ceil(countdown / 1000)

  if (!isActive || countdown <= 0) return null

  return (
    <div className="flex flex-col items-center mt-2 mb-4">
      <div className="text-lg font-bold mb-1">{seconds}초 유지 중</div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
        <div
          id="countdown-progress-bar"
          className="bg-green-500 h-2.5 rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default CountdownTimer

// src/components/face-registration/DirectionGuide.tsx

import React from 'react'
import { type DirectionGuideProps } from '../../types/face'

const DirectionGuide: React.FC<DirectionGuideProps> = ({
  currentDirection,
  targetDirection,
  directionGuide,
}) => {
  // 방향 일치 여부 확인
  const isMatching = currentDirection === targetDirection

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-500">현재 방향:</div>
        <div className="font-bold text-blue-600">{currentDirection}</div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-500">목표 방향:</div>
        <div className="font-bold text-green-600">{targetDirection}</div>
      </div>

      <div className="flex items-center mt-3">
        <div
          className={`text-lg font-medium ${isMatching ? 'text-green-500' : 'text-red-500'}`}
        >
          {isMatching ? '✓ 방향 일치' : '✗ 방향 불일치'}
        </div>
      </div>

      <div className="mt-3 text-center text-gray-700">{directionGuide}</div>
    </div>
  )
}

export default DirectionGuide

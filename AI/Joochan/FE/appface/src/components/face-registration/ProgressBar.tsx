// src/components/face-registration/ProgressBar.tsx

import React from 'react'
import { type ProgressBarProps } from '../../types/face'

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <div className="w-full mt-4 mb-2">
      {label && (
        <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-right mt-1 text-gray-500">
        {Math.round(progress)}%
      </div>
    </div>
  )
}

export default ProgressBar

// src/components/face-registration/CapturedImages.tsx

import React from 'react'
import { type CapturedImagesProps } from '../../types/face'

const CapturedImagesView: React.FC<CapturedImagesProps> = ({
  images,
  showPreview = true,
}) => {
  if (!showPreview || Object.keys(images).length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">캡처된 이미지</h3>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(images).map(([direction, imageData]) => (
          <div key={direction} className="flex flex-col items-center">
            <img
              src={imageData}
              alt={`${direction} 방향`}
              className="w-full h-auto rounded border border-gray-300"
            />
            <span className="text-xs mt-1">{direction}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CapturedImagesView

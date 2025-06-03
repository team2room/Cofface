// src/components/face-registration/CameraView.tsx
import React from 'react'
import { type CameraViewProps } from '../../types/face'

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  containerRef,
  canvasSize,
  isCapturing,
}) => {
  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto overflow-hidden rounded-lg shadow-lg"
    >
      {/* 비디오 요소 (화면에 표시되지 않음) */}
      <video
        ref={videoRef}
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          display: 'none',
        }}
        playsInline
        autoPlay
        muted
      />

      {/* 캔버스 (실제 표시되는 요소) */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-auto"
      />

      {/* 캡처 중 표시 오버레이 */}
      {isCapturing && (
        <div className="absolute top-0 left-0 right-0 p-2 bg-blue-500 bg-opacity-70 text-white text-center text-sm">
          얼굴 캡처 중...
        </div>
      )}
    </div>
  )
}

export default CameraView

import React from 'react'
// , { useState, useRef, useEffect }
// import * as facemesh from '@mediapipe/face_mesh'
// import * as camera from '@mediapipe/camera_utils'
// import * as drawing from '@mediapipe/drawing_utils'
// import axios from 'axios'

interface FaceVerificationProps {
  apiUrl?: string
  onVerificationComplete: (
    success: boolean,
    userId?: string,
    confidence?: number,
  ) => void
  autoStart?: boolean
  timeout?: number
}

const FaceVerification: React.FC<FaceVerificationProps> = ({
  apiUrl,
  onVerificationComplete,
  autoStart,
  timeout,
}) => {
  console.log(apiUrl)
  console.log(autoStart)
  console.log(timeout)
  return (
    <div>
      <h2>얼굴 인증</h2>
      <p>이 기능은 아직 구현 중입니다.</p>
      <button onClick={() => onVerificationComplete(false)}>돌아가기</button>
    </div>
  )
}

export default FaceVerification

// src/services/faceRecognition.ts

import axios from 'axios'
import { type CapturedImages, type FaceDirection } from '../types/face'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// 얼굴 등록 API
const registerFace = async (userId: string, faceImages: CapturedImages) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      user_id: userId,
      face_images: faceImages,
    })
    return response.data
  } catch (error) {
    console.error('얼굴 등록 중 오류:', error)
    throw error
  }
}

// 얼굴 인증 API
const verifyFace = async (faceImage: string, userId?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify`, {
      user_id: userId,
      face_image: faceImage,
    })
    return response.data
  } catch (error) {
    console.error('얼굴 인증 중 오류:', error)
    throw error
  }
}

// 얼굴 방향 계산 유틸리티 함수
const calculateFaceDirection = (
  horizontalOffset: number,
  verticalOffset: number,
): FaceDirection => {
  // 반전된 화면에 맞게 horizontalOffset 부호 변경
  horizontalOffset = -horizontalOffset

  // 방향 판별 로직
  if (
    horizontalOffset >= -3 &&
    horizontalOffset <= 3 &&
    verticalOffset >= -3 &&
    verticalOffset <= 12
  ) {
    return 'front'
  } else if (
    horizontalOffset < -3 &&
    verticalOffset >= -3 &&
    verticalOffset <= 12
  ) {
    return 'left'
  } else if (
    horizontalOffset > 3 &&
    verticalOffset >= -3 &&
    verticalOffset <= 12
  ) {
    return 'right'
  } else if (
    horizontalOffset >= -3 &&
    horizontalOffset <= 3 &&
    verticalOffset < -3
  ) {
    return 'up'
  } else if (
    horizontalOffset >= -3 &&
    horizontalOffset <= 3 &&
    verticalOffset > 12
  ) {
    return 'down'
  } else {
    return 'unknown'
  }
}

// 얼굴 인식 서비스 객체
const faceRecognitionService = {
  registerFace,
  verifyFace,
  calculateFaceDirection,
}

export default faceRecognitionService

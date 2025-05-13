import axios from 'axios'
import {
  CapturedImage,
  FaceDetectionState,
} from '@/interfaces/FaceRegisterInterfaces'

//TODO - api 연결시 수정해야 함

// API 기본 설정
const API_BASE_URL = 'http://localhost:8000' // 백엔드 서버 주소
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 얼굴 등록 함수
export const registerFace = async (
  userId: string,
  capturedImages: CapturedImage[],
): Promise<any> => {
  console.log('등록 시작: 사용자 ID', userId)
  console.log('캡처된 이미지 수:', capturedImages.length)
  console.log(
    '캡처된 이미지 상태:',
    capturedImages.map((img) => FaceDetectionState[img.state]),
  )

  try {
    // 캡처된 이미지를 방향별로 매핑 (정수 키를 사용)
    const directionMap: { [key: number]: string } = {
      1: 'front', // FaceDetectionState.FRONT_FACE는 1
      2: 'left', // FaceDetectionState.LEFT_FACE는 2
      3: 'right', // FaceDetectionState.RIGHT_FACE는 3
      4: 'up', // FaceDetectionState.UP_FACE는 4
      5: 'down', // FaceDetectionState.DOWN_FACE는 5
    }

    // API 요청 형식에 맞게 데이터 변환
    const faceImages: Record<string, string> = {}

    capturedImages.forEach((img) => {
      const direction = directionMap[img.state]
      if (direction) {
        // 이미지가 'data:image/jpeg;base64,' 형식인지 확인
        if (
          img.imageData.startsWith('data:image/') &&
          img.imageData.includes('base64,')
        ) {
          faceImages[direction] = img.imageData
        } else {
          console.error(
            `${direction} 방향 이미지 형식이 잘못됨:`,
            img.imageData.substring(0, 50) + '...',
          )
        }
      }
    })

    // 모든 방향(5개)이 있는지 확인
    const requiredDirections = ['front', 'left', 'right', 'up', 'down']
    const missingDirections = requiredDirections.filter(
      (dir) => !faceImages[dir],
    )

    if (missingDirections.length > 0) {
      throw new Error(
        `다음 방향의 얼굴 이미지가 누락되었습니다: ${missingDirections.join(', ')}`,
      )
    }

    // API 요청 전송
    const response = await api.post('/register', {
      user_id: userId,
      face_images: faceImages,
    })

    return response.data
  } catch (error) {
    console.error('얼굴 등록 API 호출 중 오류 발생:', error)
    throw error
  }
}

// 얼굴 인증 함수
export const verifyFace = async (rgbImage: string): Promise<any> => {
  try {
    const response = await api.post('/verify', {
      rgb_image: rgbImage,
    })
    return response.data
  } catch (error) {
    console.error('얼굴 인증 API 호출 중 오류 발생:', error)
    throw error
  }
}

// 서버 상태 확인 함수
export const checkServerHealth = async (): Promise<any> => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('서버 상태 확인 중 오류 발생:', error)
    throw error
  }
}

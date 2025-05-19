import { FaceRecognitionResponse } from '@/interfaces/UserInterface'
import axios from 'axios'

export const newFaceRecogRequest =
  async (): Promise<FaceRecognitionResponse> => {
    try {
      const response = await axios.post('http://localhost:8080/recognize')
      const { phone_number, success, genderage } = response.data
      console.log('얼굴 인식 응답:', response.data)
      return { phone_number, success, genderage }
    } catch (error: any) {
      console.error('얼굴 인식 에러:', error)
      throw new Error('얼굴 인식 요청 실패')
    }
  }

export const faceRecogRequest = async (): Promise<{
  phone_number: string
}> => {
  try {
    const response = await axios.post('http://localhost:8080/recognize')
    console.log('회원 얼굴 인식 성공')
    return response.data
  } catch (error: any) {
    console.error('얼굴 인식 에러')
    throw new Error('얼굴 인식 요청 실패')
  }
}

export const genderAgeRequest = async (): Promise<{
  age: number
  gender: string
}> => {
  try {
    const response = await axios.post('http://localhost:8080/genderage')
    console.log('비회원 얼굴 인식 성공')
    const { age, gender } = response.data
    return { age, gender }
  } catch (error: any) {
    console.error('비회원 얼굴 인식 실패')
    throw new Error('비회원 얼굴 분석 요청 실패')
  }
}

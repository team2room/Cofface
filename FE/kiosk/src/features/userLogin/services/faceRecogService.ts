import axios from 'axios'

export const faceRecogRequest = async (): Promise<{
  phone_number: string
}> => {
  try {
    const response = await axios.post('http://localhost:8080/recognize')
    console.log('얼굴 인식 응답 성공')
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
    console.log('비회원 얼굴 분석 응답', response.data)
    const { age, gender } = response.data
    return { age, gender }
  } catch (error: any) {
    console.error('비회원 얼굴 분석 실패')
    throw new Error('비회원 얼굴 분석 요청 실패')
  }
}

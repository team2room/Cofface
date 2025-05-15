import axios from 'axios'

export const faceRecogRequest = async (): Promise<{
  phone_number: string
}> => {
  try {
    const response = await axios.post('http://localhost:8080/recognize')
    console.log('[✅ 얼굴 인식 응답]', response.data)
    return response.data
  } catch (error: any) {
    console.error('[❌ 얼굴 인식 에러]', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    })
    throw new Error('얼굴 인식 요청 실패')
  }
}

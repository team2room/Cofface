import { FACE_URL } from '@/config'
import { CheckingUserInfo } from './../../../interfaces/HomeInterfaces'
import { VisitedStoreInfo } from '@/interfaces/HomeInterfaces'
import apiRequester from '@/services/api'
import axios from 'axios'

export const getVisitedStoreInfo = async (): Promise<VisitedStoreInfo[]> => {
  try {
    const response = await apiRequester.get('/api/stores/visited')
    console.log('방문 매장 정보 조회', response.data.data)
    return response.data.data
  } catch (error) {
    console.error('Visited Store 정보 조회 중 오류 발생:', error)
    throw error
  }
}

export const checkRegistered = async (
  checkingUserInfo: CheckingUserInfo,
): Promise<any> => {
  try {
    const response = await axios.post(
      `${FACE_URL}/check-registration`,
      checkingUserInfo,
    )
    return response.data.is_registered
  } catch (error) {
    console.error('얼굴 등록 여부 조회 중 오류 발생:', error)
    throw error
  }
}

import { VisitedStoreInfo } from '@/interfaces/HomeInterfaces'
import apiRequester from '@/services/api'

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

//TODO - 얼굴/결제 등록 여부 api 필요함

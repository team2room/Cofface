import {
  CardCompanyProps,
  CardInfoProps,
  CardRegisterRequestProps,
} from '@/interfaces/PayRegisterInterfaces'
import apiRequester from '@/services/api'

export const registerCard = async (
  cardRegisterData: CardRegisterRequestProps,
): Promise<any> => {
  try {
    const response = await apiRequester.post(
      '/api/auto-payments/register',
      cardRegisterData,
    )
    return response.data
  } catch (error) {
    console.error('카드 등록 중 오류 발생:', error)
  }
}

export const getCardInfo = async (): Promise<CardInfoProps[]> => {
  try {
    const response = await apiRequester.get('/api/auto-payments/cards')
    return response.data.data
  } catch (error) {
    console.error('카드 정보 조회 중 오류 발생:', error)
    throw error
  }
}

export const getCardCompany = async (
  cardNumber: string,
): Promise<CardCompanyProps> => {
  try {
    const response = await apiRequester.get(
      `/api/auto-payments/card-company-info?cardNumber=${cardNumber}`,
    )
    return response.data.data
  } catch (error) {
    console.error('카드사 정보 조회 중 오류 발생:', error)
    throw error
  }
}

export const deleteCard = async (paymentInfoId: number): Promise<any> => {
  try {
    const response = await apiRequester.delete(
      `/api/auto-payments/card?paymentInfoId=${paymentInfoId}`,
    )
    return response.data
  } catch (error) {
    console.error('카드 삭제 중 오류 발생:', error)
    throw error
  }
}

export const changeDefaultCard = async (
  paymentInfoId: number,
): Promise<any> => {
  try {
    const response = await apiRequester.put('api/auto-payments/default-card', {
      paymentInfoId: paymentInfoId,
    })
    return response.data
  } catch (error) {
    console.error('대표카드 변경 중 오류 발생:', error)
    throw error
  }
}

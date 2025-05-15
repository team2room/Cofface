// 카드 등록 요청
export interface CardRegisterRequestProps {
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  isDefault: boolean
}

// 카드사 조회 응답
export interface CardCompanyProps {
  brand: string
  type: string
  imageUrl: string
}

// 카드정보 조회 응답
export interface CardInfoProps {
  paymentInfoId: number
  userId: string
  cardNumber: string
  cardExpiry: string
  isDefault: boolean
  brand: string
  type: string
  imageUrl: string
}

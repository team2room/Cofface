// 카드 등록 요청
export interface CardRegisterRequestProps {
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  isDefault: boolean
}

// {
//     "cardNumber" : "1234-5678-9876-5432",
//     "cardExpiry" : "05/25", // 월/년
//     "cardCvc" : "000",
//     "isDefault" : true // 기본 결제 카드 등록 여부
// }

// 카드사 조회 응답
export interface CardCompanyProps {
  brand: string
  type: string
  imageUrl: string
}

// 카드정보 조회 응답
export interface CardInfoProps {
  paymentInfoId: string
  userId: string
  cardNumber: string
  cardExpiry: string
  isDefault: boolean
}

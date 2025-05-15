// 쿠폰
export interface CouponInfo {
  stampId: number
  storeId: number
  stampCount: number
  lastOrderId: number
  stampsRequired: number
  discountAmount: number
  couponCount: number
  remainingStamps: number
}

// 모든 구매 정보
export interface PayOptionItem {
  optionItemId: number
  quantity: number
}

export interface PayMenuOrder {
  menuId: number
  quantity: number
  options?: PayOptionItem[]
}

export interface PayData {
  kioskId: number
  totalAmount: number
  isStampUsed: boolean
  isTakeout: boolean
  age: number
  gender: string
  weather: string
  paymentInfoId: number | null
  menuOrders: PayMenuOrder[]
}

// 일반 결제
export interface PreparePayResponse {
  orderId: string
  orderNumber: string
}

export interface ConfirmPayRequest {
  paymentKey: string
  orderId: string
  amount: number
  paymentType: 'CARD' | 'TRANSFER' | 'MOBILE' | 'VIRTUAL_ACCOUNT'
}

export interface ConfirmPayResponse {
  orderId: number
  orderNumber: string
  paymentKey: string
  status: string
  amount: number
}

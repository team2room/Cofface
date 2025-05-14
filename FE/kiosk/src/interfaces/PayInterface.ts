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
  paymentInfoId: number | null
  menuOrders: PayMenuOrder[]
}

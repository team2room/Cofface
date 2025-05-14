// 최근 주문 내역 조회
export interface RecentOrderInfo {
  orderId: number
  userId: string
  kioskId: number
  totalAmount: number
  orderDate: string
  isStampUsed: boolean
  orderStatus: string
  isTakeout: boolean
  orderSummary: string
  menuDetails?: string
}

// 카페별 사용자 주문 Top 5
export interface TopOrderMenuInfo {
  menuId: number
  menuName: string
  totalCount: number
  totalOrders: number
}

// 매장별 스탬프 정보 조회
export interface StampInfo {
  stampId: number // 스탬프 아이디
  storeId: number // 매장 아이디
  stampCount: number // 스탬프 수
  lastOrderId: number // 마지막 주문 아이디
  stampsRequired: number // 목표 스탬프 수
  discountAmount: number // 쿠폰 할인금액
  couponCount: number // 보유 쿠폰 수
  remainingStamps: number // 쿠폰까지 남은 스탬프 수
}

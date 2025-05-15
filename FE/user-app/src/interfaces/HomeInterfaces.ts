// 방문 매장 정보 조회
export interface VisitedStoreInfo {
  storeId: number
  storeName: string
  address: string
  contactNumber: string
  businessHours: string
  visitCount: number
  lastVisitDate: string
}

// 홈 메인버튼 인터페이스
export interface HomeMainButtonProps {
  title: string
  content: string
  src: string
  onClick?: () => void
}

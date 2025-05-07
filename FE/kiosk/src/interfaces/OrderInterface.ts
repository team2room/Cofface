export interface MenuItem {
  name: string
  price: number
  image?: string
}

export interface MenuCardProps {
  item: MenuItem
  boxShadowColor: string
}

export interface RecommendSectionProps {
  recentMenus: MenuItem[]
  customMenus: MenuItem[]
}

export interface OrderItem {
  name: string
  price: number
  quantity: number
}

export interface OrderSectionProps {
  orders: OrderItem[]
}

// 옵션 모달에서 사용되는 인터페이스
export interface MenuOption {
  optionCategory: string
  isRequired: boolean
  optionNames: string[]
  additionalPrices: number[]
  optionIds: number[]
  maxSelections: number
}

export interface MenuData {
  menuName: string
  price: number
  imageUrl: string
  description: string
  options: MenuOption[]
}

export interface OptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void
  onConfirm?: () => void
  menu: MenuData
}

// 옵션 포함 주문 정보
export interface OrderOption {
  name: string
  price: number // 0이면 추가금 없음
}

export interface RealOrderItem {
  name: string
  quantity: number
  basePrice: number
  options: OrderOption[]
}

// 메뉴 관련
export interface MenuItem {
  menuId: number
  menuName: string
  price: number
  categoryId: number
  categoryName: string
  isSoldOut: boolean
  imageUrl: string
  description: string
}

export interface MenuCardProps {
  item: MenuItem
  boxShadowColor: string
}

export interface RecommendSectionProps {
  recentMenus: MenuItem[]
  customMenus: MenuItem[]
}

// 메뉴 카테고리
export interface Category {
  categoryId: number
  categoryName: string
  displayOrder: number
  isActive: boolean
}

// 선택 상품
export interface OrderItem {
  name: string
  price: number
  quantity: number
}

export interface OrderSectionProps {
  orders: OrderItem[]
}

// 옵션 모달 관련
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

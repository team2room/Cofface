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

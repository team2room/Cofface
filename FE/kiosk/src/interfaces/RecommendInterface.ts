export interface RecommendationOption {
  optionCategory: string
  isRequired: boolean
  optionNames: string[]
  additionalPrices: number[]
  optionIds: number[]
  isDefault: boolean[]
  maxSelections: number
}

export interface MenuItem {
  menuId: number
  menuName: string
  price: number
  categoryId: number
  categoryName: string
  isSoldOut: boolean
  imageUrl: string
  options: RecommendationOption[]
  description: string
  keyword1: string
  keyword2: string
  orderCount: number | null
  percentage: number | null
  additionalInfo: Record<string, string>
}

export interface RecommendationGroup {
  recommendationType: number
  recommendationReason: string
  menus: MenuItem[]
}

export interface RecommendationResponse {
  status: number
  success: boolean
  message: string
  data: {
    recommendedMenus: RecommendationGroup[]
    currentWeather: string
  }
}

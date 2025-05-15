export interface MenuCategoryProps {
  categoryId: number
  categoryName: string
  menus: MenuItemProps[]
}

export interface MenuItemProps {
  menuId: number
  menuName: string
  imageUrl: string
  categoryId: number
}

export interface OptionCategoryProps {
  categoryId: number
  categoryName: string
  optionItems: OptionItemProps[]
}

export interface OptionItemProps {
  itemId: number
  optionName: string
  additionPrice: number
}

export interface SurveyRequestProps {
  preferredMenuIds: number[]
  preferredOptions: PreferredOptionProps[]
}

export interface PreferredOptionProps {
  categoryId: number
  itemId: number
}

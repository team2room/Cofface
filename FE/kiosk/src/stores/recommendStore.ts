import { RecommendationGroup } from '@/interfaces/RecommendInterface'
import { create } from 'zustand'

interface RecommendationState {
  recommendedMenus: RecommendationGroup[]
  setRecommendedMenus: (data: RecommendationGroup[]) => void
  toggleOption: (
    menuId: number,
    optionCategory: string,
    optionIndex: number,
  ) => void
  resetRecommendedMenus: () => void
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  recommendedMenus: [],

  setRecommendedMenus: (data) => {
    console.log('스토어에 추천 메뉴 설정:', data)
    set({ recommendedMenus: data })
  },

  toggleOption: (menuId, optionCategory, optionIndex) =>
    set((state) => {
      const updatedMenus = state.recommendedMenus.map((group) => ({
        ...group,
        menus: group.menus.map((menu) => {
          if (menu.menuId !== menuId) return menu

          return {
            ...menu,
            options: menu.options.map((opt) => {
              if (opt.optionCategory !== optionCategory) return opt

              const updatedDefaults = opt.optionNames.map(
                (_, idx) => idx === optionIndex,
              )

              return {
                ...opt,
                isDefault: updatedDefaults,
              }
            }),
          }
        }),
      }))

      return { recommendedMenus: updatedMenus }
    }),

  resetRecommendedMenus: () => set({ recommendedMenus: [] }),
}))

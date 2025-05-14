import { create } from 'zustand'
import { VisitedStoreInfo } from '@/interfaces/HomeInterfaces'
import { getVisitedStoreInfo } from '@/features/home/services/homeService'

interface VisitedStoreState {
  visitedStores: VisitedStoreInfo[]
  selectedStore: VisitedStoreInfo | null
  isLoading: boolean
  error: string | null

  // 액션
  fetchVisitedStores: () => Promise<void>
  selectStore: (storeId: number) => void
}

export const useVisitedStoreStore = create<VisitedStoreState>((set, get) => ({
  visitedStores: [],
  selectedStore: null,
  isLoading: false,
  error: null,

  fetchVisitedStores: async () => {
    set({ isLoading: true, error: null })
    try {
      const stores = await getVisitedStoreInfo()
      set({
        visitedStores: stores,
        // 기본적으로 첫 번째 방문 매장 선택 (있을 경우)
        selectedStore: stores.length > 0 ? stores[0] : null,
        isLoading: false,
      })
    } catch (error) {
      console.error('방문 매장 정보 조회 실패:', error)
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : '방문 매장 정보 조회 중 오류가 발생했습니다.',
      })
    }
  },

  selectStore: (storeId: number) => {
    const { visitedStores } = get()
    const store = visitedStores.find((store) => store.storeId === storeId)
    if (store) {
      set({ selectedStore: store })
    }
  },
}))

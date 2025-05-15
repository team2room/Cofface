import { create } from 'zustand'
import { VisitedStoreInfo } from '@/interfaces/HomeInterfaces'
import { getVisitedStoreInfo } from '@/features/home/services/homeService'
import { persist } from 'zustand/middleware'

interface VisitedStoreState {
  visitedStores: VisitedStoreInfo[]
  selectedStore: VisitedStoreInfo | null
  isLoading: boolean
  error: string | null

  // 액션
  fetchVisitedStores: () => Promise<void>
  selectStore: (storeId: number) => void
}

export const useVisitedStoreStore = create<VisitedStoreState>()(
  persist(
    (set, get) => ({
      visitedStores: [],
      selectedStore: null, // 초기값은 null로 설정
      isLoading: false,
      error: null,

      fetchVisitedStores: async () => {
        set({ isLoading: true, error: null })
        try {
          const stores = await getVisitedStoreInfo()
          console.log(
            '[VisitedStoreStore] 방문 매장 정보 로드 완료:',
            stores.length,
            '개 매장',
          )

          set({
            visitedStores: stores,
            // selectedStore는 변경하지 않음 (기존 선택 유지 또는 null 상태 유지)
            isLoading: false,
          })
        } catch (error) {
          console.error('[VisitedStoreStore] 방문 매장 정보 조회 실패:', error)
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
        console.log(`[VisitedStoreStore] 매장 ID: ${storeId} 선택 시도`)

        const store = visitedStores.find((store) => store.storeId === storeId)
        if (store) {
          console.log(`[VisitedStoreStore] 매장 '${store.storeName}' 선택됨`)
          set({ selectedStore: store })
        } else {
          console.warn(`[VisitedStoreStore] 매장 ID: ${storeId}를 찾을 수 없음`)
        }
      },
    }),
    {
      name: 'store-storage',
    },
  ),
)

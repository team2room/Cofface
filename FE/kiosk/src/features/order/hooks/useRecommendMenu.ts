import { useEffect, useState } from 'react'
import { getRecommendMenus } from '../services/recommendMenuService'
import { useUserStore } from '@/stores/loginStore'

export const useRecommendMenu = (storeId: number) => {
  const { isMember, guestInfo, weather } = useUserStore()

  const [recentMenus, setRecentMenus] = useState([])
  const [customMenus, setCustomMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        let data

        if (isMember) {
          data = await getRecommendMenus(storeId)
        } else {
          data = await getRecommendMenus(
            storeId,
            guestInfo?.age,
            guestInfo?.gender,
          )
        }

        setRecentMenus(data.frequentMenus)
        setCustomMenus(data.recommendedMenus)
      } catch (err: any) {
        setError(err?.message ?? '에러 발생')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [storeId])

  return { recentMenus, customMenus, loading, error }
}

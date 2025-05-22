import { RecommendationResponse } from '@/interfaces/RecommendInterface'
import { useEffect, useState } from 'react'
import { fetchRecommendation } from '../services/newRecommendService'
import { useUserStore } from '@/stores/loginStore'

export const useRecommend = (storeId: number) => {
  const { isMember, weather, guestInfo } = useUserStore()

  const [data, setData] = useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const baseParams = {
          storeId,
          weather: weather?.dominant ?? '',
        }

        const guestParams =
          !isMember &&
          guestInfo?.age !== undefined &&
          guestInfo?.gender !== undefined
            ? {
                age: guestInfo.age,
                gender: guestInfo.gender,
              }
            : {}

        const res = await fetchRecommendation({
          ...baseParams,
          ...guestParams,
        })

        setData(res)
      } catch (err) {
        console.log(err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [storeId, weather])

  return { data, loading, error }
}

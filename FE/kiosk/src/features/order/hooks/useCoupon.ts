import { useUserStore } from '@/stores/loginStore'
import { useEffect, useState } from 'react'
import { getCouponInfo } from '../services/couponService'
import { CouponInfo } from '@/interfaces/PayInterface'

export const useCouponInfo = (storeId: number) => {
  const { isMember } = useUserStore()
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)

  useEffect(() => {
    const fetch = async () => {
      if (!isMember) {
        setLoading(false)
        return
      }

      try {
        const data = await getCouponInfo(storeId)
        setCouponInfo(data)
      } catch (err: any) {
        setError(err?.message ?? '쿠폰 정보를 가져오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [storeId, isMember])

  return { couponInfo, loading, error }
}

import { CouponInfo } from '@/interfaces/PayInterface'
import api from '@/lib/axios'

export const getCouponInfo = async (storeId: number): Promise<CouponInfo> => {
  const response = await api.get(`/api/stamps/store`, {
    params: { storeId },
  })
  return response.data.data
}

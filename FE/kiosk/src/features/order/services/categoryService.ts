import api from '@/lib/axios'
import { Category } from '@/interfaces/OrderInterface'

export const getCategory = async (storeId: number): Promise<Category[]> => {
  const response = await api.get('/api/kiosk/categories', {
    params: { storeId },
  })
  return response.data.data
}

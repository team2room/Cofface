import { MenuItem } from '@/interfaces/OrderInterface'
import api from '@/lib/axios'

export const getAllMenus = async (storeId: number): Promise<MenuItem[]> => {
  const response = await api.get('/api/kiosk/menus', {
    params: {
      storeId,
    },
  })
  return response.data.data
}

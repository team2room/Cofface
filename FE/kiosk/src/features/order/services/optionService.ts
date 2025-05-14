import { MenuItemDetail } from '@/interfaces/OrderInterface'
import api from '@/lib/axios'

export const getMenuOption = async (
  menuId: number,
): Promise<MenuItemDetail> => {
  const res = await api.get(`/api/kiosk/menus/${menuId}`)
  return res.data.data
}

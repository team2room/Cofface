import { useCallback } from 'react'
import { userLogout } from '../services/logoutService'
import { useUserStore } from '@/stores/loginStore'
import { useOrderStore } from '@/stores/orderStore'
import { usePayStore } from '@/stores/payStore'

export const useLogout = () => {
  const reset = useUserStore((state) => state.reset)
  const clearOrders = useOrderStore((state) => state.clearOrders)
  const resetPayData = usePayStore((state) => state.resetPayData)

  const logout = useCallback(
    async (kioskId: number) => {
      try {
        await userLogout(kioskId)
      } catch (err) {
        console.error('로그아웃 실패:', err)
      } finally {
        reset()
        clearOrders()
        resetPayData()
      }
    },
    [reset],
  )

  return { logout }
}

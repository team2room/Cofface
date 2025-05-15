import { useCallback } from 'react'
import { userLogout } from '../services/logoutService'
import { useUserStore } from '@/stores/loginStore'

export const useLogout = () => {
  const reset = useUserStore((state) => state.reset)

  const logout = useCallback(
    async (kioskId: number) => {
      try {
        await userLogout(kioskId)
      } catch (err) {
        console.error('로그아웃 실패:', err)
      } finally {
        reset()
      }
    },
    [reset],
  )

  return { logout }
}

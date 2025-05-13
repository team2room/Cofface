import { useUserStore } from '@/stores/loginStore'
import { useCallback } from 'react'
import { extendSession } from '../services/extendSessionService'

export const useExtendSession = () => {
  const user = useUserStore((state) => state.user)
  const setLogin = useUserStore((state) => state.setLogin)

  const extend = useCallback(
    async (kioskId: number) => {
      const { accessToken } = await extendSession(kioskId)

      if (user) {
        setLogin(accessToken, user)
      }
    },
    [user, setLogin],
  )

  return { extend }
}

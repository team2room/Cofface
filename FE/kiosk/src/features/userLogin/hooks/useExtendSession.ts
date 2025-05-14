import { useUserStore } from '@/stores/loginStore'
import { useCallback } from 'react'
import { extendSession } from '../services/extendSessionService'

export const useExtendSession = () => {
  const user = useUserStore((state) => state.user)
  const loginMethod = useUserStore((state) => state.loginMethod)
  const setLogin = useUserStore((state) => state.setLogin)

  const extend = useCallback(
    async (kioskId: number) => {
      const { accessToken } = await extendSession(kioskId)

      if (user && loginMethod) {
        setLogin(accessToken, user, loginMethod)
      }
    },
    [user, setLogin],
  )

  return { extend }
}

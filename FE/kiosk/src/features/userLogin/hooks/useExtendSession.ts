import { useUserStore } from '@/stores/loginStore'
import { useCallback } from 'react'
import { extendSession } from '../services/extendSessionService'

export const useExtendSession = () => {
  const user = useUserStore((state) => state.user)
  const hasAutoPayment = useUserStore((state) => state.hasAutoPayment)
  const loginMethod = useUserStore((state) => state.loginMethod)
  const setLogin = useUserStore((state) => state.setLogin)

  const extend = useCallback(
    async (kioskId: number) => {
      const { accessToken } = await extendSession(kioskId)

      if (hasAutoPayment && user && loginMethod) {
        setLogin(hasAutoPayment, accessToken, user, loginMethod)
      }
    },
    [user, setLogin],
  )

  return { extend }
}

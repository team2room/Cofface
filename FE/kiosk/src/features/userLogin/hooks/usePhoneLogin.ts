import { useCallback } from 'react'
import { phoneLogin } from '../services/phoneLoginService'
import { useUserStore } from '@/stores/loginStore'

export const usePhoneLogin = () => {
  const setLogin = useUserStore((state) => state.setLogin)

  const login = useCallback(
    async (phoneNumber: string) => {
      const { accessToken, user } = await phoneLogin({
        phoneNumber,
      })
      setLogin(accessToken, user)
    },
    [setLogin],
  )

  return { login }
}

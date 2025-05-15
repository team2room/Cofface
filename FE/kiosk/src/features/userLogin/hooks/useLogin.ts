import { useCallback } from 'react'
import { phoneLogin } from '../services/phoneLoginService'
import { useUserStore } from '@/stores/loginStore'

export const useLogin = () => {
  const setLogin = useUserStore((state) => state.setLogin)

  const phoneNumLogin = useCallback(
    async (phoneNumber: string) => {
      const { accessToken, user } = await phoneLogin({
        phoneNumber,
      })
      setLogin(accessToken, user, 'phone')
    },
    [setLogin],
  )

  const faceLogin = useCallback(
    async (phoneNumber: string) => {
      const { accessToken, user } = await phoneLogin({ phoneNumber })
      setLogin(accessToken, user, 'face')
    },
    [setLogin],
  )

  return { phoneNumLogin, faceLogin }
}

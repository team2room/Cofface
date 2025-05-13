import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userInfoProps } from '@/interfaces/LoginInterfaces'
import {
  loginRequest,
  loginConfirm,
  refreshTokens,
} from '@/features/login/services/authService'
import { setCookie, getCookie, removeCookie } from '@/utils/cookieAuth'

interface AuthState {
  user: userInfoProps | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initialized: boolean

  initialize: () => Promise<void>

  login: (
    name: string,
    idNumberFront: string,
    idNumberGender: string,
    phoneNumber: string,
    telecomProvider: string,
  ) => Promise<string>

  verifyLogin: (
    verificationId: string,
    phoneNumber: string,
    verificationCode: string,
    name: string,
    idNumberFront: string,
    idNumberGender: string,
    password: string,
  ) => Promise<void>

  refreshToken: () => Promise<void>

  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initialized: false,

      initialize: async () => {
        const refreshTokenValue = getCookie('refreshToken')

        // 리프레시 토큰이 없으면 초기화만 하고 종료
        if (!refreshTokenValue) {
          set({ initialized: true })
          return
        }

        set({ isLoading: true })

        try {
          // 리프레시 토큰으로 인증 시도
          await get().refreshToken()
          set({ initialized: true, isLoading: false })
        } catch (error) {
          set({
            isLoading: false,
            initialized: true,
            isAuthenticated: false,
            user: null,
          })
        }
      },

      login: async (
        name,
        idNumberFront,
        idNumberGender,
        phoneNumber,
        telecomProvider,
      ) => {
        set({ isLoading: true, error: null })
        try {
          const response = await loginRequest({
            name,
            idNumberFront,
            idNumberGender,
            phoneNumber,
            telecomProvider,
          })

          set({ isLoading: false })
          return response.verificationId
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : '인증 요청 중 오류가 발생했습니다.',
          })
          throw error
        }
      },

      verifyLogin: async (
        verificationId,
        phoneNumber,
        verificationCode,
        name,
        idNumberFront,
        idNumberGender,
        password,
      ) => {
        set({ isLoading: true, error: null })
        try {
          const response = await loginConfirm({
            verificationId,
            phoneNumber,
            verificationCode,
            name,
            idNumberFront,
            idNumberGender,
            password,
          })

          // 토큰 저장
          const expiresDate = new Date()
          expiresDate.setSeconds(expiresDate.getSeconds() + response.expiresIn)

          setCookie('accessToken', response.accessToken, {
            path: '/',
            expires: expiresDate,
            sameSite: 'strict',
          })

          setCookie('refreshToken', response.refreshToken, {
            path: '/',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일
            sameSite: 'strict',
          })

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : '로그인 인증 중 오류가 발생했습니다.',
          })
          throw error
        }
      },

      refreshToken: async () => {
        const currentRefreshToken = getCookie('refreshToken')

        if (!currentRefreshToken) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const response = await refreshTokens(currentRefreshToken)

          // 새 액세스 토큰 저장
          const expiresDate = new Date()
          expiresDate.setSeconds(expiresDate.getSeconds() + response.expiresIn)

          setCookie('accessToken', response.accessToken, {
            path: '/',
            expires: expiresDate,
            sameSite: 'strict',
          })

          set({
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // 리프레시 토큰이 만료되었거나 유효하지 않은 경우
          removeCookie('accessToken')
          removeCookie('refreshToken')

          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : '세션이 만료되었습니다. 다시 로그인해주세요.',
          })
        }
      },

      logout: () => {
        removeCookie('accessToken')
        removeCookie('refreshToken')

        set({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

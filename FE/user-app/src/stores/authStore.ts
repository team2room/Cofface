import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userInfoProps } from '@/interfaces/LoginInterfaces'
import {
  loginRequest,
  loginConfirm,
  refreshTokens,
  logoutRequest,
} from '@/features/login/services/authService'
import { setCookie, getCookie, removeCookie } from '@/utils/cookieAuth'

interface AuthState {
  user: userInfoProps | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initialized: boolean
  isNewUser: boolean

  // 상태 직접 설정 가능하도록 함수 추가
  setState: (state: Partial<AuthState>) => void

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
      isNewUser: false, // API 응답에 의존하는 값이므로 초기값 설정은 크게 중요하지 않음

      // 상태를 직접 업데이트할 수 있는 함수 추가
      setState: (state: Partial<AuthState>) => {
        set(state)
      },

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

          console.log('로그인 응답 데이터:', response)

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

          // 응답에서 isNewUser 값을 명시적으로 확인하여 set
          const isUserNew = response.isNewUser === true // === true를 사용하여 확실히 불리언으로 변환
          console.log('신규 사용자 여부:', isUserNew)

          set({
            isNewUser: isUserNew,
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

      logout: async () => {
        try {
          // 백엔드 로그아웃 API 호출
          await logoutRequest(getCookie('refreshToken'))

          // 쿠키 제거
          removeCookie('accessToken')
          removeCookie('refreshToken')

          // 스토어 상태 초기화
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isNewUser: false, // 로그아웃 시 isNewUser도 초기화
          })

          // localStorage에서 모든 zustand 저장소 데이터 제거
          Object.keys(localStorage).forEach((key) => {
            if (key.endsWith('-storage')) {
              localStorage.removeItem(key)
            }
          })

          return Promise.resolve()
        } catch (error) {
          console.log('로그아웃 중 에러', error)

          // 오류가 발생해도 쿠키는 제거
          removeCookie('accessToken')
          removeCookie('refreshToken')

          // 스토어 상태 초기화
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isNewUser: false, // 로그아웃 시 isNewUser도 초기화
          })

          // localStorage에서 모든 zustand 저장소 데이터 제거
          Object.keys(localStorage).forEach((key) => {
            if (key.endsWith('-storage')) {
              localStorage.removeItem(key)
            }
          })

          return Promise.reject(error)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isNewUser: state.isNewUser, // 이 값도 유지
      }),
    },
  ),
)

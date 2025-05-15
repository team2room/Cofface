import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useState, useCallback } from 'react'

export function useAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const authStore = useAuthStore()

  // 로컬 상태
  const [loginInfo, setLoginInfo] = useState({
    name: '',
    idNumberFront: '',
    idNumberGender: '',
    phoneNumber: '',
    telecomProvider: '',
    verificationId: '',
  })

  // 인증번호 요청
  const requestVerification = useCallback(
    async (
      name: string,
      idNumberFront: string,
      idNumberGender: string,
      phoneNumber: string,
      telecomProvider: string,
    ) => {
      try {
        const verificationId = await authStore.login(
          name,
          idNumberFront,
          idNumberGender,
          phoneNumber,
          telecomProvider,
        )

        // 로그인 정보 저장
        const newLoginInfo = {
          name,
          idNumberFront,
          idNumberGender,
          phoneNumber,
          telecomProvider,
          verificationId,
        }

        setLoginInfo(newLoginInfo)

        // 인증번호 확인 페이지로 이동
        navigate('/login/confirm', { state: newLoginInfo })

        return verificationId
      } catch (error) {
        console.error('인증번호 요청 실패:', error)
        throw error
      }
    },
    [authStore, navigate],
  )

  // 인증번호 확인 및 로그인 완료
  const confirmLogin = useCallback(
    async (
      verificationId: string,
      phoneNumber: string,
      verificationCode: string,
      name: string,
      idNumberFront: string,
      idNumberGender: string,
      password: string,
    ) => {
      try {
        await authStore.verifyLogin(
          verificationId,
          phoneNumber,
          verificationCode,
          name,
          idNumberFront,
          idNumberGender,
          password,
        )

        // 로그인 성공 시 원래 접근하려던 페이지로 이동하거나 홈으로 이동
        const from = location.state?.from?.pathname || '/home'
        navigate(from, { replace: true })
      } catch (error) {
        console.error('로그인 확인 실패:', error)
        throw error
      }
    },
    [authStore, navigate, location],
  )

  // 인증번호 재전송
  const resendVerification = useCallback(
    async (
      name: string,
      idNumberFront: string,
      idNumberGender: string,
      phoneNumber: string,
      telecomProvider: string,
    ) => {
      try {
        const verificationId = await authStore.login(
          name,
          idNumberFront,
          idNumberGender,
          phoneNumber,
          telecomProvider,
        )

        // 새 인증 ID 저장
        setLoginInfo((prev) => ({
          ...prev,
          verificationId,
        }))

        return verificationId
      } catch (error) {
        console.error('인증번호 재전송 실패:', error)
        throw error
      }
    },
    [authStore],
  )

  // 로그아웃
  const logout = useCallback(async () => {
    authStore.logout()
    navigate('/login', { replace: true })
  }, [authStore, navigate])

  // 로그인 작업 수행
  const requireAuth = useCallback(
    (callback: () => void) => {
      if (authStore.isAuthenticated) {
        callback()
      } else {
        navigate('/login', { state: { from: location } })
      }
    },
    [authStore.isAuthenticated, navigate, location],
  )

  return {
    // 상태
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    loginInfo,

    // 액션
    requestVerification,
    confirmLogin,
    resendVerification,
    logout,
    requireAuth,
    refreshToken: authStore.refreshToken,
    initialize: authStore.initialize,
  }
}

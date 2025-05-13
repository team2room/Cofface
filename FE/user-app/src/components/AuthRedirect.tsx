import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCookie } from '@/utils/cookieAuth'
import { useAuthStore } from '@/stores/authStore'
import LoadingMessage from './LoadingMessage'

export const AuthRedirect = () => {
  const { isAuthenticated, isLoading, initialized, initialize, refreshToken } =
    useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // 초기화되지 않았으면 초기화 수행
      if (!initialized) {
        await initialize()
      }

      // 액세스 토큰이 없지만 리프레시 토큰이 있는 경우 토큰 갱신 시도
      const accessToken = getCookie('accessToken')
      const refreshTokenValue = getCookie('refreshToken')

      if (!accessToken && refreshTokenValue) {
        await refreshToken()
      }

      setChecking(false)
    }

    checkAuth()
  }, [initialize, initialized, refreshToken])

  // 체크 중이거나 초기화 중이거나 로딩 중이면 로딩 표시
  if (checking || !initialized || isLoading) {
    return <LoadingMessage />
  }

  // 인증되었으면 홈으로, 아니면 로그인 페이지로 리다이렉트
  return isAuthenticated ? (
    <Navigate to="/home" replace />
  ) : (
    <Navigate to="/login" replace />
  )
}

export default AuthRedirect

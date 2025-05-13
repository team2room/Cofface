import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCookie } from '@/utils/cookieAuth'
import { useAuthStore } from '@/stores/authStore'
import LoadingMessage from './LoadingMessage'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, initialized, initialize, refreshToken } =
    useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // 초기화되지 않았으면 초기화 수행
    if (!initialized) {
      initialize()
    }

    // 액세스 토큰이 없지만 리프레시 토큰이 있는 경우
    const accessToken = getCookie('accessToken')
    const refreshTokenValue = getCookie('refreshToken')

    if (!accessToken && refreshTokenValue && !isAuthenticated) {
      refreshToken()
    }
  }, [isAuthenticated, refreshToken, initialized, initialize])

  // 초기화되지 않았거나 로딩 중이면 로딩 표시
  if (!initialized || isLoading) {
    return <LoadingMessage />
  }

  // 인증되지 않았으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>
}

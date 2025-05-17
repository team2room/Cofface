// services/AuthService.ts
import MotionApiService from './MotionApiService'

interface User {
  id: string
  name: string
  // 필요한 사용자 정보...
}

class AuthService {
  private static isAuthenticated: boolean = false
  private static currentUser: User | null = null

  // 로그인 상태 확인
  public static isLoggedIn(): boolean {
    return this.isAuthenticated
  }

  // 현재 사용자 정보
  public static getCurrentUser(): User | null {
    return this.currentUser
  }

  // 로그인 처리
  public static login(user: User): void {
    this.isAuthenticated = true
    this.currentUser = user
    console.log(`[AuthService] 로그인 성공: ${user.name}`)

    // 로그인 시 모션 감지 활성화
    MotionApiService.setActive(true)

    // 로그인 이벤트 발생 (필요시 커스텀 이벤트 사용)
    this.dispatchAuthEvent('login', user)
  }

  // 로그아웃 처리
  public static logout(): void {
    console.log('[AuthService] 로그아웃')
    this.isAuthenticated = false

    // 로그아웃 시 모션 감지 비활성화
    MotionApiService.setActive(false)

    // 로그아웃 이벤트 발생
    this.dispatchAuthEvent('logout', this.currentUser)
    this.currentUser = null
  }

  // 인증 이벤트 발생 (로그인/로그아웃)
  private static dispatchAuthEvent(
    type: 'login' | 'logout',
    user: User | null,
  ): void {
    const event = new CustomEvent('auth_state_change', {
      detail: { type, user },
    })
    window.dispatchEvent(event)
  }

  // 로그인 상태 변경 리스너 등록
  public static addAuthStateListener(callback: (event: any) => void): void {
    window.addEventListener('auth_state_change', callback)
  }

  // 로그인 상태 변경 리스너 제거
  public static removeAuthStateListener(callback: (event: any) => void): void {
    window.removeEventListener('auth_state_change', callback)
  }
}

export default AuthService

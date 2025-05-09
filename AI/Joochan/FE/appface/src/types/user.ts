// src/types/user.ts

// 사용자 기본 정보 타입
export interface User {
  id: string
  name: string
  isRegistered: boolean
}

// 사용자 인증 결과 타입
export interface AuthResult {
  success: boolean
  userId?: string
  confidence?: number
  message?: string
}

// 사용자 등록 상태 타입 (enum 대신 as const 사용)
export const UserRegistrationStatus = {
  NONE: 'none',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

// 타입 추출
export type UserRegistrationStatus =
  (typeof UserRegistrationStatus)[keyof typeof UserRegistrationStatus]

// 사용자 프로필 타입 (확장 가능)
export interface UserProfile extends User {
  email?: string
  phone?: string
  lastLogin?: Date
  registrationDate?: Date
}

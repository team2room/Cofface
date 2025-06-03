// src/services/api.ts

import axios from 'axios'

export type ServerStatus = 'online' | 'offline' | 'checking'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 서버 상태 확인 API
const checkServerStatus = async (): Promise<ServerStatus> => {
  try {
    const response = await apiClient.get('/health')
    return response.data.status === 'healthy' ? 'online' : 'offline'
  } catch (error) {
    console.error('서버 상태 확인 중 오류:', error)
    return 'offline'
  }
}

// 사용자 API
const getUserInfo = async (userId: string) => {
  try {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('사용자 정보 조회 중 오류:', error)
    throw error
  }
}

// API 서비스 객체
const apiService = {
  checkServerStatus,
  getUserInfo,
  // 다른 API 메서드들 추가 가능
}

export default apiService

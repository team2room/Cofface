import {
  LoginRequestProps,
  LoginConfirmProps,
  LoginResponseProps,
  LoginConfirmResponseProps,
  RefreshTokenResponseProps,
} from '@/interfaces/LoginInterfaces'
import { BASE_URL } from '@/config'
import axios from 'axios'
import apiRequester from '@/services/api'

export const loginRequest = async (
  loginRequestProps: LoginRequestProps,
): Promise<LoginResponseProps> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/verify/request`,
      loginRequestProps,
    )
    return response.data.data
  } catch (error) {
    console.error('인증번호 요청 중 오류 발생:', error)
    throw error
  }
}

export const loginConfirm = async (
  loginConfirmProps: LoginConfirmProps,
): Promise<LoginConfirmResponseProps> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/verify/confirm`,
      loginConfirmProps,
    )
    return response.data.data
  } catch (error) {
    console.error('로그인 중 오류 발생:', error)
    throw error
  }
}

export const refreshTokens = async (
  refreshToken: string,
): Promise<RefreshTokenResponseProps> => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      refreshToken: refreshToken,
    })
    return response.data.data
  } catch (error) {
    console.error('토큰 리프레시 중 오류 발생:', error)
    throw error
  }
}

export const logoutRequest = async (refreshToken: string): Promise<any> => {
  try {
    const response = await apiRequester.post('/api/auth/logout', {
      refreshToken: refreshToken,
    })
    return response.data
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error)
    throw error
  }
}

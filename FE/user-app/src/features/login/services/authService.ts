import {
  LoginRequestProps,
  LoginConfirmProps,
  LoginResponseProps,
  LoginConfirmResponseProps,
  RefreshTokenResponseProps,
} from '@/interfaces/LoginInterfaces'
import { BASE_URL } from '@/config'
import axios from 'axios'

export const loginRequest = async (
  loginRequestProps: LoginRequestProps,
): Promise<LoginResponseProps> => {
  const response = await axios.post(
    `${BASE_URL}/api/auth/verify/request`,
    loginRequestProps,
  )
  console.log('인증번호 요청 응답:', response.data.data)
  return response.data.data
}

export const loginConfirm = async (
  loginConfirmProps: LoginConfirmProps,
): Promise<LoginConfirmResponseProps> => {
  const response = await axios.post(
    `${BASE_URL}/api/auth/verify/confirm`,
    loginConfirmProps,
  )
  console.log('로그인 응답:', response.data)
  return response.data.data
}

export const refreshTokens = async (
  refreshToken: string,
): Promise<RefreshTokenResponseProps> => {
  const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
    refreshToken: refreshToken,
  })
  return response.data.data
}

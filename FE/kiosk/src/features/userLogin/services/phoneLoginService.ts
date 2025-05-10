import api from '@/lib/axios'

export interface PhoneLoginRequest {
  phoneNumber: string
}

export interface PhoneLoginResponse {
  accessToken: string
  user: {
    id: string
    name: string
    phoneNumber: string
    birthDate: string
    gender: string
  }
}

export const phoneLogin = async (
  body: PhoneLoginRequest,
): Promise<PhoneLoginResponse> => {
  const response = await api.post('/api/auth/kiosk/phone-login', body)
  const { accessToken, user } = response.data.data
  return { accessToken, user }
}

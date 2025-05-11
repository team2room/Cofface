import api from '@/lib/axios'

export interface ExtendSessionResponse {
  accessToken: string
  expiresIn: number
  tokenType: string
}

export const extendSession = async (
  kioskId: number,
): Promise<ExtendSessionResponse> => {
  const res = await api.post('/api/auth/kiosk/extend-session', { kioskId })
  return res.data.data
}

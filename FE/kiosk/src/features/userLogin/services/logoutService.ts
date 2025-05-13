import api from '@/lib/axios'

export const userLogout = async (kioskId: number): Promise<void> => {
  await api.post('/api/auth/kiosk/logout', { kioskId })
}

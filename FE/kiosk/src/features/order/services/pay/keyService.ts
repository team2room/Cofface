import { ClientKeyResponse } from '@/interfaces/PayInterface'
import api from '@/lib/axios'

export const getClientKey = async (): Promise<ClientKeyResponse> => {
  const response = await api.get<{ data: ClientKeyResponse }>(
    '/api/payments/client-key',
  )
  return response.data.data
}

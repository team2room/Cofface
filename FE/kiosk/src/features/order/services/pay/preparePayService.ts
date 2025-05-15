import api from '@/lib/axios'
import { PayData, PreparePayResponse } from '@/interfaces/PayInterface'

export const postPreparePay = async (
  payData: PayData,
): Promise<PreparePayResponse> => {
  const response = await api.post<{ data: PreparePayResponse }>(
    '/api/payments/prepare',
    payData,
  )
  return response.data.data
}

import {
  ConfirmPayRequest,
  ConfirmPayResponse,
} from '@/interfaces/PayInterface'
import api from '@/lib/axios'

export const postConfirmPay = async (
  payload: ConfirmPayRequest,
): Promise<ConfirmPayResponse> => {
  const response = await api.post<{ data: ConfirmPayResponse }>(
    '/api/payments/confirm',
    payload,
  )
  return response.data.data
}

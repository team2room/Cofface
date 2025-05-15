import { useState } from 'react'
import { postConfirmPay } from '../../services/pay/confirmPayService'
import {
  ConfirmPayRequest,
  ConfirmPayResponse,
} from '@/interfaces/PayInterface'

export const useConfirmPay = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConfirmPayResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const confirmPay = async (payload: ConfirmPayRequest) => {
    setLoading(true)
    try {
      const response = await postConfirmPay(payload)
      setResult(response)
    } catch (err: any) {
      setError(err?.message ?? '결제 승인 실패')
    } finally {
      setLoading(false)
    }
  }

  return { loading, result, error, confirmPay }
}

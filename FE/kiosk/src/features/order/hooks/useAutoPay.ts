import { useState } from 'react'
import { usePayStore } from '@/stores/payStore'
import { postAutoPay } from '../services/autoPayService'
import { PayData } from '@/interfaces/PayInterface'

export const useAutoPay = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | any>(null)
  const [error, setError] = useState<null | string>(null)

  const startPayment = async () => {
    setLoading(true)
    try {
      const payData = usePayStore.getState() as PayData
      console.log('try 진입', payData)
      const res = await postAutoPay(payData)
      setResult(res)
    } catch (err: any) {
      setError(err?.message ?? '결제 실패')
    } finally {
      setLoading(false)
    }
  }

  return { loading, result, error, startPayment }
}

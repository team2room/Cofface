import { useState } from 'react'
import { usePayStore } from '@/stores/payStore'
import { PayData, PreparePayResponse } from '@/interfaces/PayInterface'
import { postPreparePay } from '../../services/pay/preparePayService'

export const usePreparePay = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PreparePayResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const store = usePayStore.getState()
  const payData: PayData = {
    kioskId: store.kioskId!,
    totalAmount: store.totalAmount!,
    isStampUsed: store.isStampUsed!,
    isTakeout: store.isTakeout!,
    age: store.age!,
    gender: store.gender!,
    weather: store.weather!,
    paymentInfoId: store.paymentInfoId ?? null,
    menuOrders: store.menuOrders!,
  }

  const preparePay = async () => {
    setLoading(true)
    try {
      const res = await postPreparePay(payData)
      setResult(res)
    } catch (err: any) {
      setError(err?.message ?? '결제 준비 실패')
    } finally {
      setLoading(false)
    }
  }

  return { loading, result, error, preparePay }
}

import { useState } from 'react'
import { usePayResultStore, usePayStore } from '@/stores/payStore'
import { postAutoPay } from '../services/autoPayService'
import { PayData } from '@/interfaces/PayInterface'

export const useAutoPay = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | any>(null)
  const [error, setError] = useState<null | string>(null)
  const setOrderId = usePayResultStore((s) => s.setOrderId)

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

  const startPayment = async () => {
    setLoading(true)
    try {
      const res = await postAutoPay(payData)
      console.log(res.orderNumber)
      setOrderId(res.orderNumber)
      setResult(res)
    } catch (err: any) {
      setError(err?.message ?? '결제 실패')
    } finally {
      setLoading(false)
    }
  }

  return { loading, result, error, startPayment }
}

import { PayData, PayMenuOrder } from '@/interfaces/PayInterface'
import { create } from 'zustand'

interface PayStoreState extends Partial<PayData> {
  setInitialPayData: (data: {
    menuOrders: PayMenuOrder[]
    totalAmount: number
    kioskId: number
    age: number
    gender: string
    weather: string
  }) => void
  setTotalAmount: (amount: number) => void
  setIsTakeout: (isTakeout: boolean) => void
  setIsStampUsed: (isStampUsed: boolean) => void
  setPaymentInfoId: (id: number | null) => void
  resetPayData: () => void
}

export const usePayStore = create<PayStoreState>((set) => ({
  kioskId: 1,
  totalAmount: 0,
  isStampUsed: false,
  isTakeout: false,
  age: 0,
  gender: '여성',
  weather: '맑음',
  paymentInfoId: null,
  menuOrders: [],

  setInitialPayData: ({
    menuOrders,
    totalAmount,
    kioskId,
    age,
    gender,
    weather,
  }) => set({ menuOrders, totalAmount, kioskId, age, gender, weather }),
  setTotalAmount: (amount) => set({ totalAmount: amount }),
  setIsTakeout: (isTakeout) => set({ isTakeout }),
  setIsStampUsed: (isStampUsed) => set({ isStampUsed }),
  setPaymentInfoId: (id) => set({ paymentInfoId: id }),
  resetPayData: () =>
    set({
      totalAmount: 0,
      isStampUsed: false,
      isTakeout: false,
      age: 0,
      gender: '여성',
      weather: '맑음',
      paymentInfoId: null,
      menuOrders: [],
    }),
}))

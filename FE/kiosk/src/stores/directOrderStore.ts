import { OrderItem } from '@/interfaces/OrderInterface'
import { create } from 'zustand'

interface DirectOrderState {
  directOrder: OrderItem | null
  setDirectOrder: (item: OrderItem) => void
  resetDirectOrder: () => void
}

export const useDirectOrderStore = create<DirectOrderState>((set) => ({
  directOrder: null,
  setDirectOrder: (item) => set({ directOrder: item }),
  resetDirectOrder: () => set({ directOrder: null }),
}))

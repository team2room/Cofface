import { OrderItemReal } from '@/interfaces/OrderInterface'
import { create } from 'zustand'

interface OrderState {
  orders: OrderItemReal[]
  addOrder: (item: OrderItemReal) => void
  removeOrder: (index: number) => void
  updateQuantity: (index: number, quantity: number) => void
  clearOrders: () => void
  getTotal: () => number
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],

  addOrder: (item) =>
    set((state) => ({
      orders: [...state.orders, item],
    })),

  removeOrder: (index) =>
    set((state) => ({
      orders: state.orders.filter((_, i) => i !== index),
    })),

  updateQuantity: (index, quantity) =>
    set((state) => {
      if (quantity < 1) return state
      const updatedOrders = [...state.orders]
      updatedOrders[index] = {
        ...updatedOrders[index],
        quantity,
      }
      return { orders: updatedOrders }
    }),

  clearOrders: () => set({ orders: [] }),

  getTotal: () => {
    return get().orders.reduce(
      (sum, order) => sum + order.totalPrice * order.quantity,
      0,
    )
  },
}))

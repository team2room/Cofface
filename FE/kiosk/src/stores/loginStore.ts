import { create } from 'zustand'

type LoginStore = {
  phoneNumber: string
  setPhoneNumber: (num: string) => void
  resetPhoneNumber: () => void
}

export const useLoginStore = create<LoginStore>((set) => ({
  phoneNumber: '',
  setPhoneNumber: (num) => set({ phoneNumber: num }),
  resetPhoneNumber: () => set({ phoneNumber: '' }),
}))

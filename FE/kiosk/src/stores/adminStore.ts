import { create } from 'zustand'
import { setCookie, getCookie, removeCookie } from '@/lib/cookie'

const ADMIN_TOKEN = 'adminToken'

interface AdminState {
  token: string | null
  setToken: (token: string) => void
  reset: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  token: getCookie(ADMIN_TOKEN) ?? null,
  setToken: (token) => {
    setCookie(ADMIN_TOKEN, token)
    set({ token })
  },
  reset: () => {
    removeCookie(ADMIN_TOKEN)
    set({ token: null })
  },
}))

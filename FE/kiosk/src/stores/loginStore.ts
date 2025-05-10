import { create } from 'zustand'
import { User } from '@/interfaces/userInterface'
import { getCookie, removeCookie, setCookie } from '@/lib/cookie'

// 전화번호 로그인 시 사용
interface LoginStore {
  phoneNumber: string
  setPhoneNumber: (num: string) => void
  resetPhoneNumber: () => void
}

export const useLoginStore = create<LoginStore>((set) => ({
  phoneNumber: '',
  setPhoneNumber: (num) => set({ phoneNumber: num }),
  resetPhoneNumber: () => set({ phoneNumber: '' }),
}))

// 유저 정보 저장
const USER_TOKEN = 'userToken'

interface UserState {
  user: User | null
  token: string | null
  setLogin: (token: string, user: User) => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: getCookie(USER_TOKEN) ?? null,

  setLogin: (token, user) => {
    setCookie(USER_TOKEN, token, { path: '/' })
    set({ token, user })
  },

  reset: () => {
    removeCookie(USER_TOKEN)
    set({ token: null, user: null })
  },
}))

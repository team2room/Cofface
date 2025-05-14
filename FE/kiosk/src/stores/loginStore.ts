import { create } from 'zustand'
import { getCookie, removeCookie, setCookie } from '@/lib/cookie'
import { User } from '@/interfaces/UserInterface'

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
  isMember: boolean | null
  loginMethod: 'face' | 'phone' | null
  setLogin: (token: string, user: User, loginMethod: 'face' | 'phone') => void
  setGuest: () => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: getCookie(USER_TOKEN) ?? null,
  isMember: null,
  loginMethod: null,

  setLogin: (token, user, loginMethod) => {
    setCookie(USER_TOKEN, token, { path: '/' })
    set({ token, user, isMember: true, loginMethod })
  },

  setGuest: () => {
    set({ user: null, token: null, isMember: false, loginMethod: null })
  },

  reset: () => {
    removeCookie(USER_TOKEN)
    set({ token: null, user: null })
  },
}))

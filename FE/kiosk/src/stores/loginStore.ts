import { create } from 'zustand'
import { getCookie, removeCookie, setCookie } from '@/lib/cookie'
import { GuestInfo, User, WeatherInfo } from '@/interfaces/UserInterface'

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
  hasAutoPayment: boolean | null
  loginMethod: 'face' | 'phone' | null
  guestInfo: GuestInfo | null
  weather: WeatherInfo | null
  setLogin: (
    hasAutoPayment: boolean,
    token: string,
    user: User,
    loginMethod: 'face' | 'phone',
  ) => void
  setGuestInfo: (guestInfo: GuestInfo) => void
  setWeather: (weather: WeatherInfo) => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: getCookie(USER_TOKEN) ?? null,
  isMember: null,
  hasAutoPayment: null,
  loginMethod: null,
  guestInfo: null,
  weather: null,

  setLogin: (hasAutoPayment, token, user, loginMethod) => {
    setCookie(USER_TOKEN, token, { path: '/' })
    set({ hasAutoPayment, token, user, isMember: true, loginMethod })
  },

  setGuestInfo: (guestInfo) => set({ guestInfo }),

  setWeather: (weather) => set({ weather }),

  reset: () => {
    removeCookie(USER_TOKEN)
    set({
      token: null,
      user: null,
      isMember: null,
      hasAutoPayment: null,
      loginMethod: null,
      guestInfo: null,
    })
  },
}))

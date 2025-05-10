import axios, { AxiosInstance } from 'axios'
import { BASE_URL } from '@/config'
import { getCookie } from './cookie'

// axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL as string,
  timeout: 5000,
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = getCookie('adminToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // ormData가 아닐 경우만 자동 설정
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json;charset=utf-8'
    }

    return config
  },
  (error) => Promise.reject(error),
)

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log('API Error:', err)
    return Promise.reject(err)
  },
)

export default api

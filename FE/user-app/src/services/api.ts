import { BASE_URL } from '@/config'
import { refreshTokens } from '@/features/login/services/authService'
import { getCookie, setCookie } from '@/utils/cookieAuth'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

const TOKEN_NAME = 'accessToken'

// axios 인스턴스 생성
const apiRequester: AxiosInstance = axios.create({
  //NOTE - 목 api 때문에,, 나중에 수정하기
  // baseURL: BASE_URL as string
  baseURL: process.env.NODE_ENV === 'development' ? '' : (BASE_URL as string),
  timeout: 5000,
})

// 요청 인터셉터
apiRequester.interceptors.request.use(
  (config) => {
    const accessToken = getCookie(TOKEN_NAME)

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // 기본적으로는 JSON 유지, 폼 데이터는 명시적으로 설정
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json;charset=utf-8'
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터
apiRequester.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    // 401 에러이고 토큰 만료이며 이미 재시도 하지 않은 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = getCookie('refreshToken')

        // 리프레시 토큰이 없으면 로그아웃 처리
        if (!refreshToken) {
          // 여기서 로그아웃 로직을 호출하거나 로그인 페이지로 리다이렉트할 수 있음
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // 토큰 갱신 요청
        const response = await refreshTokens(refreshToken)

        // 새 액세스 토큰 저장
        const expiresDate = new Date()
        expiresDate.setSeconds(expiresDate.getSeconds() + response.expiresIn)

        setCookie('accessToken', response.accessToken, {
          path: '/',
          expires: expiresDate,
          sameSite: 'strict',
        })

        // 헤더에 새 토큰 설정
        apiRequester.defaults.headers.common['Authorization'] =
          `Bearer ${response.accessToken}`

        // 기존 요청의 헤더에도 새 토큰 설정
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] =
            `Bearer ${response.accessToken}`
        } else {
          originalRequest.headers = {
            Authorization: `Bearer ${response.accessToken}`,
          }
        }

        // 원래 요청 재시도
        return apiRequester(originalRequest)
      } catch (refreshError) {
        console.error('토큰 리프레시 실패:', refreshError)
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // 그 외 다른 에러는 그대로 반환
    return Promise.reject(error)
  },
)

export default apiRequester

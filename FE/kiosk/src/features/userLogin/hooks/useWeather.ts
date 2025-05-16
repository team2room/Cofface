import { fetchWeather } from '../services/weatherService'
import { useUserStore } from '@/stores/loginStore'

export const useWeather = async () => {
  try {
    const weather = await fetchWeather()
    useUserStore.getState().setWeather(weather)
  } catch (err) {
    console.log('날씨 정보 조회 실패')
    console.log(err)
  }
}

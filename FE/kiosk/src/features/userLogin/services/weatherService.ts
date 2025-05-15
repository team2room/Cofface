import { WeatherInfo } from '@/interfaces/UserInterface'
import axios from 'axios'

export const fetchWeather = async (): Promise<WeatherInfo> => {
  try {
    const response = await axios.get('http://localhost:8080/weather')
    console.log('날씨 정보', response.data.weather)
    return response.data.weather
  } catch (error: any) {
    console.error('날씨 정보 에러')
    throw new Error('날씨 정보 조회 실패')
  }
}

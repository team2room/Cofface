import api from '@/lib/axios'
import { RecommendationResponse } from '@/interfaces/RecommendInterface'

interface FetchRecommendationParams {
  storeId: number
  weather: string
  age?: number
  gender?: string
}

export const fetchRecommendation = async ({
  storeId,
  weather,
  age,
  gender,
}: FetchRecommendationParams): Promise<RecommendationResponse> => {
  const params: Record<string, string | number> = { storeId, weather }

  if (age !== undefined) {
    params.age = age
  }

  if (gender !== undefined) {
    params.gender = gender
  }

  const response = await api.get<RecommendationResponse>(
    '/api/kiosk/recommendation/advanced',
    { params },
  )
  return response.data
}

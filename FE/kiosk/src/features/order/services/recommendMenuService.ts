import api from '@/lib/axios'

export const getRecommendMenus = async (
  storeId: number,
  age?: number,
  gender?: string,
) => {
  const params: any = { storeId }

  // 비회원일 경우 추가 파라미터 포함
  if (age !== undefined && gender !== undefined) {
    params.age = age
    params.gender = gender
  }

  const res = await api.get(`/api/kiosk/home`, { params })
  return res.data.data
}

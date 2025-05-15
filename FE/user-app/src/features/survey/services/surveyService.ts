import {
  MenuCategoryProps,
  OptionCategoryProps,
  SurveyRequestProps,
} from '@/interfaces/SurveyInterfaces'
import apiRequester from '@/services/api'

export const getSurveyMenus = async (): Promise<MenuCategoryProps[]> => {
  try {
    const response = await apiRequester.get('/api/kiosk/preferences/menus')
    return response.data.data
  } catch (error) {
    console.error('Survey Menu 정보 조회 중 오류 발생:', error)
    throw error
  }
}

export const getSurveyOptions = async (): Promise<OptionCategoryProps[]> => {
  try {
    const response = await apiRequester.get('/api/kiosk/preferences/options')
    return response.data.data
  } catch (error) {
    console.error('Survey Option 정보 조회 중 오류 발생:', error)
    throw error
  }
}

export const requestSurvey = async (
  surveyRequestProps: SurveyRequestProps,
): Promise<any> => {
  try {
    const response = await apiRequester.post(
      '/api/kiosk/preferences/save',
      surveyRequestProps,
    )
    return response.data
  } catch (error) {
    console.error('Survey 요청 중 오류 발생:', error)
    throw error
  }
}

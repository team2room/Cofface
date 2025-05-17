import apiRequester from '@/services/api'
import { requestNotificationPermission } from '@/utils/firebaseUtils'

export const registerDeviceToken = async (): Promise<boolean> => {
  try {
    // FCM 토큰 가져오기
    const token = await requestNotificationPermission()

    if (!token) {
      return false
    }

    // 토큰을 로컬 스토리지에 저장
    localStorage.setItem('fcm_token', token)

    // 서버에 토큰 등록
    const response = await apiRequester.post('/api/fcm/register-token', {
      token: token,
      deviceInfo: 'web',
    })

    console.log('토큰등록 응답:', response.data)
    return response.data.success
  } catch (error) {
    console.error('FCM 토큰 등록 실패:', error)
    return false
  }
}

// export const unregisterDeviceToken = async (
//   token: string,
// ): Promise<boolean> => {
//   try {
//     const response = await apiRequester.post(
//       '/api/notifications/unregister-device',
//       {
//         token,
//       },
//     )

//     return response.data.success
//   } catch (error) {
//     console.error('FCM 토큰 등록 해제 실패:', error)
//     return false
//   }
// }

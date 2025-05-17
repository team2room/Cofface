import { messaging, VAPID_KEY } from '@/firebaseConfig'
import { getToken, onMessage } from 'firebase/messaging'

// FCM 토큰 가져오기
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    // 브라우저에 알림 권한 요청
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      console.log('퍼미션 okay')
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      })

      console.log('FCM 토큰:', token)
      return token
    } else {
      console.log('알림 권한이 거부되었습니다.')
      return null
    }
  } catch (error) {
    console.error('FCM 토큰 발급 중 오류:', error)
    return null
  }
}

// 포그라운드 메시지 수신 핸들러 등록
export const registerForegroundMessageHandler = (
  callback: (payload: any) => void,
) => {
  return onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지 수신:', payload)
    callback(payload)
  })
}

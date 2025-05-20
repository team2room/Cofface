import apiRequester from '@/services/api'
import {
  registerServiceWorker,
  requestNotificationPermission,
} from '@/utils/firebaseUtils'
import { getMessaging, onMessage, MessagePayload } from 'firebase/messaging'
import { app } from '@/firebaseConfig'

const messaging = getMessaging(app)

// 함수로 리스너 등록을 분리하여 나중에 명시적으로 호출할 수 있게 합니다
export const initNotificationListeners = () => {
  console.log('Foreground 알림 리스너 초기화 중...')

  onMessage(messaging, (payload: MessagePayload) => {
    console.log('Foreground 알림 수신:', payload)

    // notification 객체가 없을 수 있으므로 옵셔널 체이닝 사용
    const notificationTitle = payload.notification?.title || '알림'
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icons/mstile-150x150.png', // 아이콘 추가
    }

    if (Notification.permission === 'granted') {
      // 브라우저 알림 표시
      const notification = new Notification(
        notificationTitle,
        notificationOptions,
      )

      // 선택적: 알림 클릭 이벤트 처리
      notification.onclick = () => {
        console.log('알림 클릭됨')
        window.focus()
        notification.close()
      }
    }
  })
}

export const registerDeviceToken = async (): Promise<boolean> => {
  try {
    // 서비스 워커 등록 먼저 진행
    registerServiceWorker()

    // FCM 토큰 가져오기
    const token = await requestNotificationPermission()

    if (!token) {
      console.log('FCM 토큰 획득 실패')
      return false
    }

    // 토큰을 로컬 스토리지에 저장
    localStorage.setItem('fcm_token', token)

    // Foreground 알림 리스너 등록
    initNotificationListeners()

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

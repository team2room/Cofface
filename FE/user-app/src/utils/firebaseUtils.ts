import { messaging } from '@/firebaseConfig'
import { getToken, onMessage } from 'firebase/messaging'

// FCM 토큰 가져오기
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    console.log('알림 권한 요청 시작')

    // Service Worker 등록 확인
    if (!('serviceWorker' in navigator)) {
      console.error('이 브라우저는 Service Worker를 지원하지 않습니다.')
      return null
    }

    // 알림 권한 요청
    const permission = await Notification.requestPermission()
    console.log('알림 권한 상태:', permission)

    if (permission !== 'granted') {
      console.log('알림 권한이 거부되었습니다.')
      return null
    }

    // Service Worker 등록 확인
    let swRegistration
    try {
      swRegistration = await navigator.serviceWorker.getRegistration()
      if (!swRegistration) {
        console.warn('Service Worker가 등록되지 않았습니다. 등록을 시도합니다.')
        swRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          {
            scope: '/',
          },
        )
      }
    } catch (swError) {
      console.error('Service Worker 등록 확인 중 오류:', swError)
    }

    // 환경 변수에서 VAPID 키 확인
    const vapidKey = import.meta.env.VITE_VAPID_KEY
    if (!vapidKey) {
      console.error('VAPID 키가 설정되지 않았습니다.')
      return null
    }

    // FCM 토큰 요청
    const tokenOptions = {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    }

    console.log('FCM 토큰 요청 시작:', tokenOptions)
    const token = await getToken(messaging, tokenOptions)

    if (token) {
      console.log('FCM 토큰 발급 성공:', token)
      return token
    } else {
      console.log('FCM 토큰을 발급받지 못했습니다.')
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
  try {
    return onMessage(messaging, (payload) => {
      console.log('포그라운드 메시지 수신:', payload)

      // 브라우저 알림 표시 (포그라운드에서는 onMessage 이벤트만 발생하므로 직접 알림 표시)
      if (payload.notification && Notification.permission === 'granted') {
        const notificationTitle = payload.notification.title || '새 알림'
        const notificationBody = payload.notification.body || ''

        const notification = new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/icons/mstile-150x150.png',
          data: payload.data,
        })

        notification.onclick = (event) => {
          event.preventDefault()
          window.focus()
          notification.close()

          // 데이터에 URL이 있으면 해당 URL로 이동
          if (payload.data?.url) {
            window.location.href = payload.data.url
          }
        }
      }

      // 콜백 호출
      callback(payload)
    })
  } catch (error) {
    console.error('포그라운드 메시지 핸들러 등록 중 오류:', error)
    return null
  }
}

import { messaging, VAPID_KEY } from '@/firebaseConfig'
import { getToken } from 'firebase/messaging'

// FCM 토큰 가져오기
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    // 브라우저에 알림 권한 요청
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      console.log('알림 권한 허용됨')

      // 이미 서비스 워커가 등록되어 있는지 확인
      await registerServiceWorker()

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      })

      console.log('FCM 토큰 발급 성공:', token)
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

// 서비스워커 등록 - 이전 방식으로 되돌리기
export const registerServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    console.error('이 브라우저는 서비스 워커를 지원하지 않습니다.')
    return false
  }

  try {
    // 기존 서비스 워커 확인 및 제거
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      if (
        registration.active &&
        registration.active.scriptURL.includes('firebase-messaging-sw.js')
      ) {
        console.log('기존 Firebase 서비스 워커가 있습니다:', registration)
        return true // 이미 등록된 서비스 워커가 있으면 성공으로 처리
      }
    }

    // 직접 서비스 워커 등록 (이전 방식)
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    )
    console.log('Service Worker가 scope에 등록되었습니다:', registration.scope)
    return true
  } catch (err) {
    console.error('Service Worker 등록 실패:', err)
    return false
  }
}

// // 기존 함수는 참조용으로 유지 (사용하지 않음)
// export const ensureServiceWorkerRegistered =
//   async (): Promise<ServiceWorkerRegistration | null> => {
//     // 기존 코드...
//     if ('serviceWorker' in navigator) {
//       try {
//         // 이미 등록된 서비스 워커 확인
//         const registrations = await navigator.serviceWorker.getRegistrations()
//         const existingWorker = registrations.find(
//           (reg) =>
//             reg.active &&
//             reg.active.scriptURL.includes('firebase-messaging-sw.js'),
//         )

//         if (existingWorker) {
//           console.log(
//             'Firebase 서비스 워커가 이미 등록되어 있습니다:',
//             existingWorker,
//           )
//           return existingWorker
//         }

//         // 등록된 서비스 워커가 없으면 새로 등록
//         const registration = await navigator.serviceWorker.register(
//           '/firebase-messaging-sw.js',
//         )
//         console.log('Firebase 서비스 워커 등록 성공:', registration.scope)
//         return registration
//       } catch (err) {
//         console.error('Firebase 서비스 워커 등록 실패:', err)
//         return null
//       }
//     }
//     return null
//   }

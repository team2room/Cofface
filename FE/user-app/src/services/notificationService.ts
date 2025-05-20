import apiRequester from '@/services/api'
import {
  registerServiceWorker,
  requestNotificationPermission,
} from '@/utils/firebaseUtils'
import { getMessaging, onMessage, MessagePayload } from 'firebase/messaging'
import { app } from '@/firebaseConfig'

const messaging = getMessaging(app)

// 리스너 등록 여부를 확인하는 플래그
let listenerRegistered = false

// 처리된 메시지 ID를 추적하는 Set (중복 방지용)
const processedMessageIds = new Set<string>()

// 디바이스 감지 함수
const isAndroid = (): boolean => {
  return /android/i.test(navigator.userAgent)
}

// 메시지 ID 생성 함수
function generateMessageId(payload: MessagePayload): string {
  // 페이로드의 고유한 특성을 사용하여 ID 생성
  const notificationTitle =
    payload.notification?.title || payload.data?.title || ''
  const notificationBody =
    payload.notification?.body || payload.data?.body || ''
  const timestamp = Date.now()

  return `${notificationTitle}-${notificationBody}-${timestamp}`
}

// 알림 데이터 추출 함수 (모든 플랫폼 호환)
function extractNotificationData(payload: MessagePayload) {
  console.log('Payload 분석:', payload)

  // 기본값 설정
  const result = {
    title: '알림',
    body: '',
    icon: '/icons/mstile-150x150.png',
    tag: 'fcm-notification-' + Date.now(),
  }

  // 안드로이드일 경우 data 객체 우선
  if (isAndroid()) {
    // Data 객체에서 정보 추출
    if (payload.data) {
      if (payload.data.title) result.title = payload.data.title as string
      if (payload.data.body) result.body = payload.data.body as string
      if (payload.data.icon) result.icon = payload.data.icon as string
    }

    // data에 정보가 없으면 notification에서 보충
    if (
      (!result.title || result.title === '알림') &&
      payload.notification?.title
    ) {
      result.title = payload.notification.title
    }
    if (!result.body && payload.notification?.body) {
      result.body = payload.notification.body
    }
  } else {
    // 안드로이드가 아닌 기기일 경우 notification 객체 우선
    if (payload.notification) {
      if (payload.notification.title) result.title = payload.notification.title
      if (payload.notification.body) result.body = payload.notification.body
    }

    // notification에 정보가 없으면 data에서 보충
    if ((!result.title || result.title === '알림') && payload.data?.title) {
      result.title = payload.data.title as string
    }
    if (!result.body && payload.data?.body) {
      result.body = payload.data.body as string
    }
  }

  console.log('추출된 알림 데이터:', result)
  return result
}

// 함수로 리스너 등록을 분리하여 나중에 명시적으로 호출할 수 있게 합니다
export const initNotificationListeners = () => {
  if (listenerRegistered) {
    console.log('알림 리스너가 이미 등록되어 있습니다.')
    return
  }

  console.log('Foreground 알림 리스너 초기화 중...')

  onMessage(messaging, async (payload: MessagePayload) => {
    console.log('Foreground 알림 수신:', payload)
    console.log('payload.data:', payload.data)
    console.log('payload.notification:', payload.notification)

    // 현재 앱이 포커스 상태인지 확인
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      // 메시지 ID 생성 (중복 검사용)
      const messageId = generateMessageId(payload)

      // 이미 처리한 메시지인지 확인
      if (processedMessageIds.has(messageId)) {
        console.log('이미 처리된 메시지입니다. 중복 알림을 표시하지 않습니다.')
        return
      }

      // 메시지 ID 추가 (중복 방지)
      processedMessageIds.add(messageId)

      // 일정 시간 후 메시지 ID 제거 (메모리 관리)
      setTimeout(() => {
        processedMessageIds.delete(messageId)
      }, 5000) // 5초 후 제거 (시간은 조절 가능)

      // 알림 데이터 추출
      const notificationData = extractNotificationData(payload)

      if (Notification.permission === 'granted') {
        try {
          // 서비스 워커를 통해 알림 표시
          const registration = await navigator.serviceWorker.ready

          await registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: '/icons/favicon-32x32.png',
            tag: 'fcm-notification', // 태그를 고정하여 같은 태그의 알림은 업데이트
            requireInteraction: true,
          })

          console.log('서비스 워커를 통해 알림이 생성되었습니다.')
        } catch (error) {
          console.error('서비스 워커 알림 생성 중 오류:', error)

          // 서비스 워커 사용 실패 시 일반 알림 시도
          try {
            const notification = new Notification(notificationData.title, {
              body: notificationData.body,
              icon: notificationData.icon,
              tag: 'fcm-notification', // 태그를 고정
            })

            notification.onclick = () => {
              console.log('알림 클릭됨')
              window.focus()
              notification.close()
            }

            console.log('일반 Notification API로 알림이 생성되었습니다.')
          } catch (fallbackError) {
            console.error('모든 알림 생성 방법 실패:', fallbackError)
          }
        }
      } else {
        console.warn('알림 권한이 없습니다:', Notification.permission)
      }
    } else {
      console.log(
        '앱이 포커스되지 않았습니다. 서비스 워커에서 알림을 처리합니다.',
      )
      // 포커스되지 않은 경우, 서비스 워커가 처리하도록 함
    }
  })

  // 리스너 등록 완료 표시
  listenerRegistered = true
}

export const registerDeviceToken = async (): Promise<boolean> => {
  try {
    // 서비스 워커 등록 먼저 진행
    const swRegistered = await registerServiceWorker()
    if (!swRegistered) {
      console.error('서비스 워커 등록 실패')
      return false
    }

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

    // 디바이스 정보 확인
    const deviceType = isAndroid() ? 'android' : 'web'

    // 서버에 토큰 등록
    const response = await apiRequester.post('/api/fcm/register-token', {
      token: token,
      deviceInfo: deviceType,
      userAgent: navigator.userAgent,
    })

    console.log('토큰등록 응답:', response.data)
    return response.data.success
  } catch (error) {
    console.error('FCM 토큰 등록 실패:', error)
    return false
  }
}

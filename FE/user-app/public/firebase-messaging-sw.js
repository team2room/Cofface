// 디버깅을 위한 로그
console.log('Firebase Messaging Service Worker 로딩 중...');

self.addEventListener('install', event => {
  console.log('Service Worker 설치 중...');
  self.skipWaiting(); // 새 서비스 워커가 즉시 활성화되도록 함
});

self.addEventListener('activate', event => {
  console.log('Service Worker 활성화됨');
  event.waitUntil(self.clients.claim()); // 모든 클라이언트에 대한 제어권 즉시 획득
});

// Firebase 스크립트 로드
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBWiJizxqL9FJ-HFaPDjjAtDe7dH5i9-Eg",
  authDomain: "orderme-9ec2c.firebaseapp.com",
  projectId: "orderme-9ec2c",
  storageBucket: "orderme-9ec2c.firebasestorage.app",
  messagingSenderId: "39700042171",
  appId: "1:39700042171:web:16834f683b44047131b49e",
  measurementId: "G-1FDNSFS8ZJ"
});

const messaging = firebase.messaging();
console.log('Firebase Messaging 초기화 완료.');

// 알림 데이터 추출 함수 (모든 플랫폼 호환)
function extractNotificationData(payload) {
  console.log('Payload 분석:', payload);
  
  // 기본값 설정
  let result = {
    title: '알림',
    body: '',
    icon: '/icons/mstile-150x150.png',
    tag: 'fcm-notification-' + Date.now()
  };
  
  // Data 객체에서 정보 추출 (안드로이드를 위해)
  if (payload.data) {
    console.log('Data 객체 발견:', payload.data);
    
    if (payload.data.title) result.title = payload.data.title;
    if (payload.data.body) result.body = payload.data.body;
    if (payload.data.icon) result.icon = payload.data.icon;
  }
  
  // Notification 객체에서 정보 추출 (iOS/웹을 위해)
  if (payload.notification) {
    console.log('Notification 객체 발견:', payload.notification);
    
    // 아직 제목이나 내용이 설정되지 않았다면 notification에서 가져옴
    if (!result.title || result.title === '알림') {
      result.title = payload.notification.title || result.title;
    }
    if (!result.body) {
      result.body = payload.notification.body || result.body;
    }
    if (payload.notification.icon) {
      result.icon = payload.notification.icon;
    }
  }
  
  console.log('추출된 알림 데이터:', result);
  return result;
}

// 백그라운드 메시지 처리 수정
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);
  
  // 이미 푸시 이벤트에서 처리할 것이므로 여기서는 아무것도 하지 않음
  console.log('백그라운드 메시지는 push 이벤트에서 처리됩니다.');
});

// 푸시 이벤트 처리 (웹 푸시 API를 통해 직접 들어오는 푸시용)
self.addEventListener('push', function(event) {
  console.log('푸시 이벤트 수신:', event);
  
  // 클라이언트 상태 확인 후 알림 표시
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clients) => {
      // 열려 있는 창이 있고 포커스된 상태인지 확인
      const hasFocusedClients = clients.some(client => client.focused);
      
      if (hasFocusedClients) {
        // 페이지가 포커스 상태면 foreground 알림이 처리할 것이므로 여기서는 처리하지 않음
        console.log('페이지가 포커스 상태임 - 백그라운드 알림 표시하지 않음');
        return;
      }
      
      // 페이지가 없거나 포커스되지 않은 경우에만 알림 표시
      if (event.data) {
        try {
          // 데이터 파싱 시도
          let payload;
          try {
            payload = event.data.json();
          } catch (e) {
            console.error('JSON 파싱 실패:', e);
            payload = {
              data: {
                title: '새 알림',
                body: event.data.text()
              }
            };
          }
          
          console.log('Push 이벤트에서 수신한 데이터:', payload);
          
          // 알림 데이터 추출
          const notificationData = extractNotificationData(payload);
          
          // 알림 표시
          return self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: '/icons/favicon-32x32.png',
            tag: notificationData.tag,
            requireInteraction: true
          });
        } catch (error) {
          console.error('푸시 데이터 처리 중 오류:', error);
          
          // 오류 발생 시 기본 알림 표시
          return self.registration.showNotification('새 알림', {
            body: '알림 내용을 확인하려면 클릭하세요.',
            icon: '/icons/mstile-150x150.png'
          });
        }
      }
    })
  );
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', function(event) {
  console.log('알림 클릭됨:', event);
  
  // 알림 닫기
  event.notification.close();
  
  // 알림 클릭 시 앱 포커스
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // 이미 열린 창이 있는지 확인
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        // 이미 열린 창이 있으면 포커스
        if ('focus' in client) {
          return client.focus();
        }
      }
      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
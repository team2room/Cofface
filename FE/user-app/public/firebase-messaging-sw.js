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

console.log('[firebase-messaging-sw.js] Firebase 메시징 초기화 완료');

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);
  
  try {
    // 알림 데이터 확인
    const notificationTitle = payload.notification?.title || '새 알림';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icons/mstile-150x150.png',
      data: payload.data,
      badge: '/favicon.ico',
      tag: 'notification-' + Date.now(), // 고유 태그 생성
      vibrate: [200, 100, 200]
    };

    // 알림 표시
    self.registration.showNotification(notificationTitle, notificationOptions);
  } catch (error) {
    console.error('[firebase-messaging-sw.js] 알림 표시 중 오류:', error);
  }
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 알림 클릭:', event);
  
  event.notification.close();
  
  // 클릭 시 열 URL (기본값은 루트)
  const urlToOpen = event.notification.data?.url || '/';
  
  // 클라이언트 창 포커스 또는 새 창 열기
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // 열린 창이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker 설치됨');
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker 활성화됨');
  clients.claim();
});
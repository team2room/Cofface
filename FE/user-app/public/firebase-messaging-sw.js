// 디버깅을 위한 로그
console.log('Firebase Messaging Service Worker 로딩 중...');

self.addEventListener('install', event => {
  console.log('Service Worker 설치 중...');
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  console.log('Service Worker 활성화됨');
  event.waitUntil(self.clients.claim());
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
    tag: 'fcm-notification' // 고정 태그 사용
  };
  
  // Data 객체에서 정보 추출
  if (payload.data) {
    console.log('Data 객체 발견:', payload.data);
    
    if (payload.data.title) result.title = payload.data.title;
    if (payload.data.body) result.body = payload.data.body;
    if (payload.data.icon) result.icon = payload.data.icon;
  }
  
  // Notification 객체에서 정보 추출
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
    
    // 태그가 있으면 사용
    if (payload.notification.tag) {
      result.tag = payload.notification.tag;
    }
  }
  
  console.log('추출된 알림 데이터:', result);
  return result;
}

// 1. push 이벤트를 명시적으로 방지 (가장 중요)
self.addEventListener('push', function(event) {
  console.log('푸시 이벤트 수신 - 무시됨:', event);
  // push 이벤트 처리 중지
  event.stopImmediatePropagation();
  // 필요한 경우에만 아래 코드 사용
  event.waitUntil(Promise.resolve());
});

// 2. FCM의 백그라운드 처리 사용 (이 방식으로만 알림 표시)
messaging.onBackgroundMessage(function(payload) {
  console.log('백그라운드 메시지 수신:', payload);
  
  // 앱 상태 확인
  return self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((clients) => {
    const hasFocusedClients = clients.some(client => client.focused);
    
    if (hasFocusedClients) {
      console.log('페이지가 포커스 상태임 - 알림 표시하지 않음');
      return;
    }
    
    // 알림 데이터 추출
    const notificationData = extractNotificationData(payload);
    
    // 알림 표시
    return self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: '/icons/favicon-32x32.png',
      tag: 'fcm-notification', // 고정 태그 사용
      requireInteraction: true
    });
  });
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
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

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/mstile-150x150.png', // 앱 아이콘으로 변경하세요
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

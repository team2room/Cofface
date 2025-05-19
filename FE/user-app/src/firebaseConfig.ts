export const VAPID_KEY = import.meta.env.VITE_VAPID_KEY

import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

// Firebase 기본 설정
const firebaseConfig = {
  apiKey: 'AIzaSyBWiJizxqL9FJ-HFaPDjjAtDe7dH5i9-Eg',
  authDomain: 'orderme-9ec2c.firebaseapp.com',
  projectId: 'orderme-9ec2c',
  storageBucket: 'orderme-9ec2c.firebasestorage.app',
  messagingSenderId: '39700042171',
  appId: '1:39700042171:web:16834f683b44047131b49e',
  measurementId: 'G-1FDNSFS8ZJ',
}

// Firebase 초기화
export const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

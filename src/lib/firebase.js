
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyDMeEr-jHqTGuHN6fkiDpEzbEIJXFz4Q5w",
  authDomain: "h-store-b9d60.firebaseapp.com",
  projectId: "h-store-b9d60",
  storageBucket: "h-store-b9d60.firebasestorage.app",
  messagingSenderId: "219903387607",
  appId: "1:219903387607:web:71af15e06cfc584dc08d92",
  measurementId: "G-2GRDMCFZP9"
};


const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

export async function requestNotificationPermission() {
  let permission = Notification.permission

  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }

  if (permission !== 'granted') {
    console.log('المستخدم لم يسمح بالإشعارات')
    return null
  }

  const token = await getToken(messaging, {
    vapidKey: "BBD8cuM_9oFwKL9IBjNQonPgq5Yq5QIkCqCyc28Dt3YPp8q-VkmcOazpxM1r7ZEY9O45S13q7MF3m7qlvtE9pY8"
  })

  console.log('Token:', token)

  return token
}
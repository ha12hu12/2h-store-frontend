importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDMeEr-jHqTGuHN6fkiDpEzbEIJXFz4Q5w",
  authDomain: "h-store-b9d60.firebaseapp.com",
  projectId: "h-store-b9d60",
  storageBucket: "h-store-b9d60.firebasestorage.app",
  messagingSenderId: "219903387607",
  appId: "1:219903387607:web:71af15e06cfc584dc08d92",
  measurementId: "G-2GRDMCFZP9"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo.png'
  })
})
// public/sw.js

self.addEventListener('install', (event) => {
  console.log('Service Worker: تم التثبيت')
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: تم التفعيل')
})

self.addEventListener('push', (event) => {
  console.log('Service Worker: جاء إشعار')
})
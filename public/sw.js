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
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const url = event.notification.data?.url

  if (url) {
    event.waitUntil(
      clients.openWindow(url)
    )
  }
})
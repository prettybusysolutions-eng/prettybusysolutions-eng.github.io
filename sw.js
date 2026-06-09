const CACHE_NAME = 'greenops-beta-shell-v4'
const BUILD_ASSETS = [
  "/assets/app-C2pJ6Lla.css",
  "/assets/app-CJsHSLtL.js",
  "/assets/backend-Cx1JcNYw.js",
  "/assets/closeoutQueue-B7xDrKvx.js",
  "/assets/iphoneCloseoutHarness-6BLwdLn7.js",
  "/assets/stagingCloseoutRunner-CK5-IkdS.js"
]
const SHELL_ASSETS = [
  '/',
  '/staging-closeout-runner.html',
  '/iphone-closeout-harness.html',
  '/manifest.webmanifest',
  '/runner-manifest.webmanifest',
  '/favicon.svg',
  ...BUILD_ASSETS,
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          return response
        })
        .catch(async () => (await caches.match(event.request)) ?? caches.match('/')),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then(async (cached) => {
      if (cached) return cached
      const response = await fetch(event.request)
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
      }
      return response
    }),
  )
})

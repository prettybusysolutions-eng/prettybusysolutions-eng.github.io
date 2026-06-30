const CACHE_NAME = 'greenops-beta-shell-v10'
const CACHE_PREFIX = 'greenops-beta-shell-'
const BUILD_ASSETS = [
  "/assets/app-CPvTWcvP.css",
  "/assets/app-D7KHlgD1.js",
  "/assets/backend-DhM4QHrd.js",
  "/assets/closeoutQueue-CF06agHr.js",
  "/assets/iphoneCloseoutHarness-D03K1wME.js",
  "/assets/stagingCloseoutRunner-BJ3FuMVs.js"
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
      .then(async (keys) => {
        const oldShellCaches = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        await self.clients.claim()
        if (oldShellCaches.length === 0) return

        const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        await Promise.all(
          clients.map((client) => {
            if (!client.url.startsWith(self.location.origin)) return undefined
            return client.navigate(client.url)
          }),
        )
      }),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GREENOPS_SKIP_WAITING') self.skipWaiting()
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

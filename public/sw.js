/* global clients */
// Hand-written service worker. Bump CACHE when the shell/precache list changes.
// Hashed /assets/* never change under the same name, so cache-first is safe;
// navigations are network-first so a new deploy (new index.html) is picked up
// whenever the device is online.
const CACHE = 'masl-log-v1'
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon-180.png',
]
const NAV_TIMEOUT_MS = 3000

// Fetch /index.html and cache every script/stylesheet/icon it references.
async function warmAssets(cache) {
  const res = await fetch('/index.html', { cache: 'no-cache' })
  if (!res.ok) return
  const html = await res.text()
  const urls = new Set()
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)) {
    const u = new URL(m[1], self.location.origin)
    if (u.origin === self.location.origin) urls.add(u.pathname)
  }
  const fetchAndCache = async (url) => {
    try {
      // Hashed asset names never change content, so skip anything already cached.
      const cached = await cache.match(url)
      if (cached && url.startsWith('/assets/')) return url.endsWith('.js') ? cached.text() : undefined
      const r = await fetch(url)
      if (!r.ok) return
      await cache.put(url, r.clone())
      return url.endsWith('.js') ? r.text() : undefined
    } catch {
      /* offline or missing: runtime cache will fill later */
    }
  }
  const scripts = await Promise.all([...urls].map(fetchAndCache))
  // Lazy chunks (e.g. PDF export) are only named inside the entry JS; warm those too.
  const lazy = new Set()
  for (const js of scripts) {
    for (const m of (js || '').matchAll(/assets\/[\w.-]+\.(?:js|css)/g)) lazy.add('/' + m[0])
  }
  await Promise.all([...lazy].filter((u) => !urls.has(u)).map(fetchAndCache))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).then(() => warmAssets(cache)))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => clients.claim()),
  )
})

async function handleNavigation(request) {
  const cache = await caches.open(CACHE)
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NAV_TIMEOUT_MS)),
    ])
    if (res.ok) {
      cache.put('/index.html', res.clone())
      warmAssets(cache).catch(() => {})
    }
    return res
  } catch {
    return (await cache.match('/index.html')) || (await cache.match('/')) || Response.error()
  }
}

async function handleStatic(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res.ok) cache.put(request, res.clone())
  return res
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/logos/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest' ||
    /\.(?:js|css|png|jpe?g|svg|webp|woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith(handleStatic(request))
  }
})

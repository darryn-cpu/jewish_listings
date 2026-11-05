const CACHE = "jbd-shell-v1"
const PRECACHE = ["/", "/manifest.webmanifest", "/icon-192.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin || event.request.method !== "GET") return
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/v1/admin")) return
  if (url.pathname === "/api/v1/config/metadata") {
    event.respondWith(networkThenCache(event.request))
    return
  }
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/") || Response.error()))
  }
})

async function networkThenCache(request) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    return cached || Response.error()
  }
}

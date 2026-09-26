/* Lebenskompass – Offline-Speicher. Bei jeder neuen Etappe die Nummer erhöhen. */
const CACHE = "lebenskompass-e6";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Sofort aus dem Speicher antworten, im Hintergrund still aktualisieren */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const key = e.request.mode === "navigate" ? "./index.html" : e.request;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const hit = await c.match(key, { ignoreSearch: true });
      const net = fetch(e.request).then(r => { if (r && r.ok) c.put(key, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || new Response("Offline", { status: 503 });
    })
  );
});

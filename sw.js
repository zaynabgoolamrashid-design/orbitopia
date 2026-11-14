/* Orbitopia service worker: works offline after first visit. Live DONKI calls always go to the network. */
const CACHE = "orbitopia-v7";
const FILES = ["./", "index.html", "css/style.css", "js/i18n.js", "js/data.js", "js/content.js", "js/icons.js", "js/art.js", "js/guide.js", "js/voice.js", "js/engine.js", "js/app.js",
  "fonts/nunito-latin-600-normal.woff2", "fonts/nunito-latin-700-normal.woff2", "fonts/nunito-latin-800-normal.woff2", "fonts/nunito-latin-900-normal.woff2", "icons/icon-192.png", "icons/icon-512.png", "manifest.webmanifest"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // never cache NASA live data
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

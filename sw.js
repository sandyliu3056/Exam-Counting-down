/* 簡易離線快取：加到 iPhone 主畫面後，沒網路也能打開 */
const CACHE = 'tve-exam-v25';
const ASSETS = ['./', './index.html', './style.css', './app.js', './data.js', './library.js', './highfreq.js', './worldmap.js', './daily.js', './reading-zh.js', './reading-library.js', './translate.js', './mcq.js', './cloze.js', './img/banner.svg', './img/banner-static.svg', './i18n.js', './manifest.json', './icons/favicon.svg', './icons/icon-32.png', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});

/* 簡易離線快取：加到 iPhone 主畫面後，沒網路也能打開 */
const CACHE = 'tve-exam-v63';
const ASSETS = ['./', './index.html', './style.css', './app.js', './data.js', './library.js', './highfreq.js', './worldmap.js', './daily.js', './reading-zh.js', './reading-library.js', './translate.js', './mcq.js', './cloze.js', './cities.js', './supabase-config.js', './img/banner.svg', './img/banner-static.svg', './i18n.js', './speech.js', './roots.html', './roots.css', './roots.js', './roots-data.js', './grammar.html', './grammar.css', './grammar.js', './grammar-data.js', './manifest.json', './icons/favicon.svg', './icons/icon-32.png', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // only the site's own files and its fonts: API calls (Supabase, news sources) carry private or live data
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin && !/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});

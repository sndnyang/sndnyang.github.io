/* 旅迹 Service Worker — 缓存优先策略，防止手机后台被杀后重新加载 */
const CACHE_NAME = 'lüji-v1';

/* 预缓存的核心资源 */
const PRECACHE = [
  '/trip.html',
  '/icon.svg',
  '/manifest.json',
];

/* ====== 安装：预缓存核心资源 ====== */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  /* 跳过等待，立即激活 */
  self.skipWaiting();
});

/* ====== 激活：清理旧版本缓存 ====== */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ====== 请求拦截策略 ====== */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  /* 高德地图 API / 外部资源：网络优先，失败用缓存兜底 */
  if (
    url.hostname.includes('amap.com') ||
    url.hostname.includes('alicdn.com') ||
    url.protocol === 'chrome-extension:'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          /* 缓存成功响应的高德资源 */
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* 本站资源：缓存优先，缓存未命中再走网络并更新缓存 */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        });
        /* 有缓存立即返回，同时后台刷新；无缓存等网络 */
        return cached || networkFetch;
      })
    );
  }
});

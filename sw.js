'use strict';
/*
 * Bench Boost offline helper.
 * - Network first: when there is a connection you always get the newest version.
 * - With no connection (school Wi-Fi drops, a bus ride), the last saved copy is used instead.
 * - Only files from this site are saved. Sign-in and database requests go straight to the network, untouched.
 * - No student names or answers are ever saved here; this only keeps the app's own files.
 */
const CACHE = 'benchboost-v1';
const CORE = ['./', 'index.html', 'app.css', 'app.js', 'auth.js', 'storage.js', 'theme-init.js', 'theme.js', 'accessibility.js',
  'topics.js', 'units.js', 'questions.js', 'standards.js', 'generators.js', 'learn.js', 'learn-screens.js', 'mastery.js',
  'quiz.js', 'games.js', 'explore.js', 'teacher.js', 'supabase-js-2.117.2.umd.js', 'manifest.webmanifest',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
  'atkinson-hyperlegible-latin-400-normal.woff2', 'atkinson-hyperlegible-latin-700-normal.woff2',
  'baloo-2-latin-600-normal.woff2', 'baloo-2-latin-700-normal.woff2', 'baloo-2-latin-800-normal.woff2'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE)
    .then(function(c){ return Promise.all(CORE.map(function(u){ return c.add(new Request(u, { cache:'reload' })).catch(function(){}); })); })
    .then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys()
    .then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); })
    .then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;               /* sign-in, database, anything outside this site: untouched */
  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.ok){ const copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
      return res;
    }).catch(function(){
      return caches.match(req, { ignoreSearch:true }).then(function(hit){
        return hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error());
      });
    })
  );
});

/* Purrminders service worker: works offline, and receives things shared from other apps */
const CACHE='bloopville-v22',VOICE='bloopville-voice-v1';
const SHELL=['./','index.html','config.js','manifest.webmanifest','icon-192.png','icon-512.png','https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==VOICE).map(k=>caches.delete(k)))));self.clients.claim()});
try{importScripts('config.js')}catch(e){}
const COPY=(self.BLOOPVILLE_CONFIG&&self.BLOOPVILLE_CONFIG.copyId)||'me';
function keepShare(rec){return new Promise((res,rej)=>{const r=indexedDB.open('bloopville-share-'+COPY,1);r.onupgradeneeded=()=>r.result.createObjectStore('pending');
  r.onsuccess=()=>{const t=r.result.transaction('pending','readwrite');t.objectStore('pending').put(rec,'last');t.oncomplete=res;t.onerror=()=>rej(t.error)};r.onerror=()=>rej(r.error)})}
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
  if(r.method==='POST'&&u.origin===location.origin&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{try{const f=await r.formData(),file=f.get('photo');
      await keepShare({title:String(f.get('title')||''),text:String(f.get('text')||''),url:String(f.get('url')||''),file:file&&file.size?file:null,at:Date.now()})}catch(err){}
      return Response.redirect(new URL('./?share=1',r.url).href,303)})());return}
  if(r.method!=='GET')return;
  /* pages: fresh from the network when online (so updates show at once), saved copy when offline */
  if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const c2=res.clone();caches.open(CACHE).then(c=>c.put('./',c2));return res}).catch(async()=>(await caches.match(r,{ignoreSearch:true}))||(await caches.match('./'))));return}
  /* Kathleen's voice and the speech runtime never change for a given version: download once, then always from the phone */
  if((u.origin===location.origin&&/\/voice\//.test(u.pathname))||/cdn\.jsdelivr\.net|unpkg\.com|onnxruntime-web/.test(u.href)){
    e.respondWith(caches.open(VOICE).then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res&&res.ok)c.put(r,res.clone());return res}));return}
  if(u.origin!==location.origin&&!/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host))return;
  e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(r,{ignoreSearch:u.origin===location.origin&&u.pathname.endsWith('/')});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}))});
/* tapping a cat notification opens (or brings back) the app */
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs)if('focus' in c)return c.focus();return self.clients.openWindow('./')}))});

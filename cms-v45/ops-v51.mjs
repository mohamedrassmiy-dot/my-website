import fs from 'node:fs';
import path from 'node:path';

const root=process.argv[2]||'release';
const assets=path.join(root,'assets');
const cssFile=path.join(assets,'styles.css');
const siteJsFile=path.join(assets,'site.js');
const adminJsFile=path.join(assets,'admin.js');

const cookieCss=String.raw`
/* Rassmiy cookie consent v5.1 */
.cookie-consent{position:fixed;z-index:4000;inset-inline:16px;bottom:max(16px,env(safe-area-inset-bottom));max-width:720px;margin-inline:auto;background:#fff;color:#102d49;border:1px solid #dce6f0;border-radius:20px;box-shadow:0 22px 70px rgba(3,25,50,.24);padding:18px}
.cookie-consent[hidden],.cookie-preferences[hidden]{display:none!important}
.cookie-consent h2{font-size:19px;margin:0 0 7px}.cookie-consent p{margin:0;color:#60758c;line-height:1.7;font-size:14px}
.cookie-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.cookie-actions button,.cookie-settings-link{appearance:none;border:1px solid #d7e2ed;background:#fff;color:#123d63;border-radius:11px;padding:10px 14px;font-weight:800;cursor:pointer}
.cookie-actions .cookie-accept{background:#0f3553;color:#fff;border-color:#0f3553}.cookie-actions .cookie-reject{background:#f7fafc}
.cookie-preferences{margin-top:14px;padding-top:14px;border-top:1px solid #e5ecf3}.cookie-choice{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 0}.cookie-choice span{display:block;font-weight:800}.cookie-choice small{display:block;color:#6b7f92;margin-top:3px}
.cookie-settings-link{padding:7px 10px;font-size:12px;margin-top:10px}
.company-linkedin{display:inline-flex;align-items:center;gap:6px}
@media(max-width:620px){.cookie-consent{inset-inline:10px;padding:15px;border-radius:16px}.cookie-actions{display:grid;grid-template-columns:1fr}.cookie-actions button{width:100%}}
`;

let css=fs.readFileSync(cssFile,'utf8');
if(!css.includes('Rassmiy cookie consent v5.1')) css+='\n'+cookieCss+'\n';
fs.writeFileSync(cssFile,css);

const cookieJs=String.raw`
;(()=>{
  if(window.__RASSMIY_COOKIE_V51__) return;
  window.__RASSMIY_COOKIE_V51__=true;
  const STORAGE='rassmiy_cookie_consent_v1';
  const COOKIE='rassmiy_consent';
  const lang=(document.documentElement.lang||'ar').toLowerCase();
  const ar=lang.startsWith('ar');
  const copy=ar?{
    title:'خصوصيتك مهمة لنا',
    body:'نستخدم ملفات ضرورية لتشغيل الموقع، ويمكنك اختيار السماح بملفات التحليلات لتحسين الأداء وتجربة الاستخدام.',
    accept:'قبول الكل',reject:'رفض الاختياري',prefs:'تخصيص',save:'حفظ الاختيارات',
    necessary:'ملفات ضرورية',necessaryDesc:'مطلوبة لتشغيل الموقع والأمان ولا يمكن تعطيلها.',
    analytics:'التحليلات',analyticsDesc:'تساعدنا على فهم استخدام الموقع وتحسينه.',
    settings:'إعدادات ملفات الارتباط'
  }:{
    title:'Your privacy matters',
    body:'We use necessary cookies to run the site. You can optionally allow analytics cookies to help us improve performance and usability.',
    accept:'Accept all',reject:'Reject optional',prefs:'Customize',save:'Save choices',
    necessary:'Necessary cookies',necessaryDesc:'Required for site operation and security and cannot be disabled.',
    analytics:'Analytics',analyticsDesc:'Helps us understand site usage and improve the experience.',
    settings:'Cookie settings'
  };

  const read=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'null')}catch{return null}};
  const write=(v)=>{try{localStorage.setItem(STORAGE,JSON.stringify(v))}catch{};document.cookie=COOKIE+'='+encodeURIComponent(v.analytics?'analytics':'necessary')+'; Path=/; Max-Age=31536000; SameSite=Lax; Secure';};
  const activate=(category)=>{
    document.querySelectorAll('script[type="text/plain"][data-cookie-category="'+category+'"]').forEach(old=>{
      if(old.dataset.activated==='1') return;
      const s=document.createElement('script');
      [...old.attributes].forEach(a=>{if(!['type','data-cookie-category'].includes(a.name))s.setAttribute(a.name,a.value)});
      s.text=old.textContent||''; old.dataset.activated='1'; old.after(s);
    });
  };
  const apply=(v)=>{if(v?.analytics)activate('analytics');window.dispatchEvent(new CustomEvent('rassmiy:consent',{detail:v||{necessary:true,analytics:false}}));};
  const shell=document.createElement('section'); shell.className='cookie-consent'; shell.setAttribute('role','dialog'); shell.setAttribute('aria-live','polite'); shell.hidden=true;
  shell.innerHTML='<h2>'+copy.title+'</h2><p>'+copy.body+'</p><div class="cookie-preferences" hidden><div class="cookie-choice"><div><span>'+copy.necessary+'</span><small>'+copy.necessaryDesc+'</small></div><input type="checkbox" checked disabled aria-label="'+copy.necessary+'"></div><div class="cookie-choice"><div><span>'+copy.analytics+'</span><small>'+copy.analyticsDesc+'</small></div><input class="cookie-analytics-toggle" type="checkbox" aria-label="'+copy.analytics+'"></div></div><div class="cookie-actions"><button type="button" class="cookie-accept">'+copy.accept+'</button><button type="button" class="cookie-reject">'+copy.reject+'</button><button type="button" class="cookie-prefs">'+copy.prefs+'</button><button type="button" class="cookie-save" hidden>'+copy.save+'</button></div>';
  document.body.appendChild(shell);
  const prefs=shell.querySelector('.cookie-preferences'), toggle=shell.querySelector('.cookie-analytics-toggle'), save=shell.querySelector('.cookie-save');
  const closeWith=(analytics)=>{const v={necessary:true,analytics:!!analytics,updatedAt:new Date().toISOString()};write(v);apply(v);shell.hidden=true;};
  shell.querySelector('.cookie-accept').onclick=()=>closeWith(true);
  shell.querySelector('.cookie-reject').onclick=()=>closeWith(false);
  shell.querySelector('.cookie-prefs').onclick=()=>{prefs.hidden=false;save.hidden=false;shell.querySelector('.cookie-prefs').hidden=true};
  save.onclick=()=>closeWith(toggle.checked);
  const open=()=>{const v=read();toggle.checked=!!v?.analytics;prefs.hidden=false;save.hidden=false;shell.querySelector('.cookie-prefs').hidden=true;shell.hidden=false};
  window.RassmiyCookies={open,consent:read};
  const saved=read(); if(saved) apply(saved); else shell.hidden=false;
  const footer=document.querySelector('footer');
  if(footer&&!footer.querySelector('.cookie-settings-link')){const b=document.createElement('button');b.type='button';b.className='cookie-settings-link';b.textContent=copy.settings;b.onclick=open;footer.appendChild(b)}
})();
`;
let siteJs=fs.readFileSync(siteJsFile,'utf8');
if(!siteJs.includes('__RASSMIY_COOKIE_V51__')) siteJs+='\n'+cookieJs+'\n';
fs.writeFileSync(siteJsFile,siteJs);

const adminCacheJs=String.raw`
;(()=>{
  if(window.__RASSMIY_CACHE_FLUSH_V51__)return;window.__RASSMIY_CACHE_FLUSH_V51__=true;
  const init=()=>{
    if(!location.pathname.startsWith('/admin')||!new URLSearchParams(location.search).has('section')||new URLSearchParams(location.search).get('section')!=='settings')return;
    const main=document.querySelector('.cms-main'); if(!main||document.querySelector('[data-cache-flush-card]'))return;
    const ar=(document.documentElement.lang||'ar').startsWith('ar')||document.documentElement.dir==='rtl';
    const card=document.createElement('section');card.className='panel narrow';card.setAttribute('data-cache-flush-card','');
    card.innerHTML='<div class="panel-head"><div><h2>'+(ar?'Cache Flush — مسح الكاش':'Cache Flush')+'</h2><p>'+(ar?'يمسح Cache المتصفح للموقع ويجبر تحميل أحدث ملفات CSS وJavaScript بعد التحديثات.':'Clears this browser\'s site cache and forces the latest CSS/JavaScript after updates.')+'</p></div></div><button type="button" class="primary-btn" data-cache-flush>'+(ar?'مسح الكاش الآن':'Flush cache now')+'</button><p class="muted" data-cache-status></p>';
    main.appendChild(card);
    const btn=card.querySelector('[data-cache-flush]'),status=card.querySelector('[data-cache-status]');
    btn.onclick=async()=>{btn.disabled=true;status.textContent=ar?'جاري مسح الكاش…':'Flushing cache…';try{if('caches'in window){for(const k of await caches.keys())await caches.delete(k)}sessionStorage.setItem('rassmiy_cache_flush',Date.now().toString());await fetch('/cache-flush.html?ts='+Date.now(),{cache:'reload',credentials:'same-origin'});status.textContent=ar?'تم مسح الكاش. سيتم تحديث الصفحة الآن.':'Cache cleared. Reloading…';setTimeout(()=>location.replace(location.pathname+location.search+'&cache='+Date.now()),450)}catch(e){status.textContent=ar?'تم تنظيف الكاش المحلي. حدّث الصفحة يدويًا.':'Local cache cleared. Please reload manually.';btn.disabled=false}};
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
`;
let adminJs=fs.readFileSync(adminJsFile,'utf8');
if(!adminJs.includes('__RASSMIY_CACHE_FLUSH_V51__')) adminJs+='\n'+adminCacheJs+'\n';
fs.writeFileSync(adminJsFile,adminJs);

// Static footer: add the requested company LinkedIn page without duplicating it.
for(const lang of ['ar','en']){
  const dir=path.join(root,lang); if(!fs.existsSync(dir))continue;
  for(const name of fs.readdirSync(dir).filter(x=>x.endsWith('.html'))){
    const file=path.join(dir,name); let html=fs.readFileSync(file,'utf8');
    if(html.includes('</footer>')&&!html.includes('linkedin.com/company/rassmiy-marketing/')){
      const label=lang==='ar'?'Rassmiy Marketing على LinkedIn':'Rassmiy Marketing on LinkedIn';
      html=html.replace('</footer>',`<a class="company-linkedin" href="https://www.linkedin.com/company/rassmiy-marketing/" target="_blank" rel="noopener noreferrer">${label}</a></footer>`);
      fs.writeFileSync(file,html);
    }
  }
}

// Browser cache flush endpoint. Netlify adds Clear-Site-Data via netlify.toml.
fs.writeFileSync(path.join(root,'cache-flush.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cache Flush</title></head><body><p>Cache flush completed.</p><script>if('caches'in window)caches.keys().then(k=>Promise.all(k.map(x=>caches.delete(x))));</script></body></html>`);

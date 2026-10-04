import fs from 'node:fs';import path from 'node:path';
const root=process.argv[2]||'release',appFile=path.join(root,'netlify/functions/app.mjs'),siteJsFile=path.join(root,'assets/site.js'),adminJsFile=path.join(root,'assets/admin.js');
let app=fs.readFileSync(appFile,'utf8');

// Only /admin is a login surface. Remove legacy/client login/dashboard pages and links.
for(const lang of ['ar','en'])for(const n of ['login.html','dashboard.html']){const f=path.join(root,lang,n);if(fs.existsSync(f))fs.rmSync(f);}
for(const lang of ['ar','en']){const dir=path.join(root,lang);if(!fs.existsSync(dir))continue;for(const n of fs.readdirSync(dir).filter(x=>x.endsWith('.html'))){const f=path.join(dir,n);let h=fs.readFileSync(f,'utf8');h=h.replace(/<a[^>]+href=["'][^"']*(?:login|dashboard)\.html[^"']*["'][^>]*>[\s\S]*?<\/a>/gi,'');fs.writeFileSync(f,h);}}

// Security helpers: CAPTCHA verification + bounded attack/event recorder.
if(!app.includes('RASSMIY_SECURITY_V61')){
 const anchor='function adminContent(state,session,url){';
 if(!app.includes(anchor))throw new Error('security anchor missing');
 const helper=`// RASSMIY_SECURITY_V61
const SECURITY_MAX_EVENTS=500;
function securityIp(req){return String(req.headers.get('x-nf-client-connection-ip')||req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,80)}
function recordSecurityEvent(state,req,type,severity='medium',detail=''){
 state.security_events=Array.isArray(state.security_events)?state.security_events:[];
 state.security_events.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),type:String(type).slice(0,80),severity:String(severity).slice(0,20),ip:securityIp(req),path:new URL(req.url).pathname.slice(0,300),ua:String(req.headers.get('user-agent')||'').slice(0,300),detail:String(detail||'').slice(0,500)});
 state.security_events=state.security_events.slice(0,SECURITY_MAX_EVENTS);
}
async function verifyRecaptchaV61(token,req){
 const secret=process.env.RECAPTCHA_SECRET_KEY||'';
 if(!secret)return {ok:true,mode:'honeypot-only'};
 if(!token)return {ok:false,reason:'missing-token'};
 try{const body=new URLSearchParams({secret,response:String(token),remoteip:securityIp(req)});const r=await fetch('https://www.google.com/recaptcha/api/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});const j=await r.json();return {ok:!!j.success,reason:j['error-codes']?.join(',')||''};}catch{return {ok:false,reason:'verification-error'};}
}
`;
 app=app.replace(anchor,helper+anchor);
}

// Harden lead endpoint without consuming the request twice: inject checks immediately after its existing form parser.
const leadAnchor="if(path==='/api/lead'";
const lp=app.indexOf(leadAnchor);
if(lp<0)throw new Error('lead route missing');
if(!app.slice(lp,lp+5000).includes('RASSMIY_LEAD_GUARD_V61')){
 const fp=app.indexOf('const f=await form(req);',lp);
 if(fp<0||fp>lp+5000)throw new Error('lead form parser missing');
 const line='const f=await form(req);';
 const guard=`const f=await form(req); // RASSMIY_LEAD_GUARD_V61
    if(String(f.website||'').trim()){recordSecurityEvent(state,req,'lead-honeypot','high','bot filled hidden field');await saveState(state);return text('Rejected',400);}
    const cap=await verifyRecaptchaV61(f['g-recaptcha-response']||f.recaptcha_token||'',req);
    if(!cap.ok){recordSecurityEvent(state,req,'recaptcha-failed','medium',cap.reason);await saveState(state);return text('CAPTCHA verification failed',400);}
`;
 app=app.slice(0,fp)+guard+app.slice(fp+line.length);
}

// Block common automated probes and record them.
if(!app.includes('RASSMIY_ATTACK_GUARD_V61')){
 const health="if(path==='/api/health')";
 const hp=app.indexOf(health);if(hp<0)throw new Error('health route missing');
 const guard=`// RASSMIY_ATTACK_GUARD_V61
  const rawUrl=String(req.url||'');
  const attackPattern=/(?:\\.env(?:[/?]|$)|wp-admin|wp-login|phpmyadmin|\\.git(?:[/?]|$)|etc\\/passwd|%2e%2e|\\.\\.\\/|<script|union(?:%20|\\s)+select|information_schema)/i;
  if(attackPattern.test(rawUrl)){recordSecurityEvent(state,req,'automated-probe','high',rawUrl.slice(0,500));await saveState(state);return text('Forbidden',403,undefined,{'Cache-Control':'no-store'});}
  `;
 app=app.slice(0,hp)+guard+app.slice(hp);
}

// Authenticated security event feed for the admin UI.
if(!app.includes("path==='/api/security-events'")){
 const health="if(path==='/api/health')",hp=app.indexOf(health);
 const route=`if(path==='/api/security-events' && req.method==='GET'){if(!session)return text('Unauthorized',401);return text(JSON.stringify({events:(state.security_events||[]).slice(0,200)}),200,'application/json; charset=utf-8',{'Cache-Control':'no-store'});}
  `;
 app=app.slice(0,hp)+route+app.slice(hp);
}
fs.writeFileSync(appFile,app);

// Add honeypot + optional Google reCAPTCHA widget to every public lead form.
const siteKey=String(process.env.RECAPTCHA_SITE_KEY||'').trim();
for(const lang of ['ar','en']){const dir=path.join(root,lang);if(!fs.existsSync(dir))continue;for(const n of fs.readdirSync(dir).filter(x=>x.endsWith('.html'))){const f=path.join(dir,n);let h=fs.readFileSync(f,'utf8');if(!h.includes('action="/api/lead"'))continue;if(!h.includes('name="website"'))h=h.replace(/(<form[^>]+action=["']\/api\/lead["'][^>]*>)/i,'$1<input class="hp-field" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">');if(siteKey&&!h.includes('g-recaptcha')){h=h.replace(/(<\/form>)/i,'<div class="g-recaptcha" data-sitekey="'+siteKey.replace(/"/g,'&quot;')+'"></div>$1');if(!h.includes('recaptcha/api.js'))h=h.replace('</body>','<script src="https://www.google.com/recaptcha/api.js" async defer></script></body>');}fs.writeFileSync(f,h);}}
let css=fs.readFileSync(path.join(root,'assets/styles.css'),'utf8');if(!css.includes('Rassmiy security v6.1')){css+='\n/* Rassmiy security v6.1 */\n.hp-field{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}.security-event{display:grid;grid-template-columns:150px 110px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid #e5ecf3}.security-high{color:#b42318;font-weight:900}@media(max-width:620px){.security-event{grid-template-columns:1fr}}\n';fs.writeFileSync(path.join(root,'assets/styles.css'),css);}

// Admin Attack Record panel.
let admin=fs.readFileSync(adminJsFile,'utf8');if(!admin.includes('__RASSMIY_SECURITY_ADMIN_V61__'))admin+=`
;(()=>{if(window.__RASSMIY_SECURITY_ADMIN_V61__)return;window.__RASSMIY_SECURITY_ADMIN_V61__=true;
const ar=()=>document.documentElement.dir==='rtl'||(document.documentElement.lang||'ar').startsWith('ar');
async function init(){if(!location.pathname.startsWith('/admin'))return;const main=document.querySelector('.cms-main');if(!main||document.querySelector('[data-security-record]'))return;const box=document.createElement('section');box.className='panel';box.setAttribute('data-security-record','');box.innerHTML='<div class="panel-head"><div><h2>'+(ar()?'سجل الهجمات والأمان':'Attack & Security Record')+'</h2><p>'+(ar()?'يسجل محاولات الاستكشاف الآلي وCAPTCHA/Honeypot مع الوقت والمسار وIP.':'Records automated probes and CAPTCHA/honeypot failures with time, path and IP.')+'</p></div><button type="button" class="secondary-btn" data-refresh-security>'+(ar()?'تحديث':'Refresh')+'</button></div><div data-security-list></div>';main.appendChild(box);const load=async()=>{const list=box.querySelector('[data-security-list]');try{const r=await fetch('/api/security-events',{cache:'no-store',credentials:'same-origin'});if(!r.ok){box.remove();return}const d=await r.json(),events=d.events||[];list.innerHTML=events.length?events.map(e=>'<div class="security-event"><span>'+new Date(e.at).toLocaleString()+'</span><span class="security-'+e.severity+'">'+e.severity+'</span><span><b>'+String(e.type||'')+'</b> · '+String(e.ip||'')+' · '+String(e.path||'')+'</span></div>').join(''):'<p class="muted">'+(ar()?'لا توجد أحداث أمنية مسجلة.':'No security events recorded.')+'</p>'}catch{list.innerHTML='<p class="muted">Security log unavailable.</p>'}};box.querySelector('[data-refresh-security]').onclick=load;load()}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init()})();
`;fs.writeFileSync(adminJsFile,admin);

// Security manifest for QA/operations.
fs.writeFileSync(path.join(root,'security-v61.json'),JSON.stringify({version:'6.1',adminOnlyLogin:true,recaptchaConfigured:!!siteKey,honeypot:true,attackRecording:true,probeBlocking:true,securityEventLimit:500},null,2));

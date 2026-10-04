import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'release';
const base = 'https://rassmiy-marketing.netlify.app';
const stylesPath = path.join(root,'assets','styles.css');
const jsPath = path.join(root,'assets','site.js');

const mobileCss = String.raw`
/* Rassmiy public mobile navigation v4.6 */
.mobile-toggle{display:none;appearance:none;border:1px solid #dbe4ee;background:#fff;color:#082b55;width:46px;height:46px;border-radius:14px;align-items:center;justify-content:center;font-size:23px;font-weight:900;cursor:pointer;box-shadow:0 6px 18px rgba(8,43,85,.07)}
.mobile-nav-panel{display:none}
@media(max-width:980px){
  .topbar{position:sticky;top:0;z-index:1000;background:#fff;border-bottom:1px solid #e4ebf3}
  .nav{height:72px;gap:12px;position:relative}
  .brand img{width:48px;height:48px}
  .menu{display:none!important}
  .nav-actions{margin-inline-start:auto;gap:8px}
  .nav-actions .desktop-action,.nav-actions>.btn{display:none!important}
  .nav-actions>.lang{display:inline-flex;min-width:48px;height:46px;align-items:center;justify-content:center;padding:0 12px}
  .mobile-toggle{display:inline-flex!important}
  .mobile-nav-panel{position:absolute;top:72px;inset-inline:0;background:#fff;border:1px solid #e4ebf3;border-radius:0 0 22px 22px;box-shadow:0 24px 45px rgba(8,43,85,.16);padding:16px;z-index:1001;max-height:calc(100vh - 88px);overflow:auto}
  .mobile-nav-panel.open{display:block}
  .mobile-nav-panel nav{display:grid;gap:4px}
  .mobile-nav-panel nav a{padding:13px 14px;border-radius:12px;color:#082b55;font-weight:800;border:0}
  .mobile-nav-panel nav a:hover,.mobile-nav-panel nav a.active{background:#f0f6fb;color:#ff7a19}
  .mobile-nav-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid #e4ebf3}
  .mobile-nav-actions .btn{width:100%;justify-content:center;min-height:46px}
  body.public-menu-open{overflow:hidden}
}
@media(max-width:620px){
  .nav{height:68px}.mobile-nav-panel{top:68px}
  .brand img{width:44px;height:44px}.brand-copy{display:none}
  .nav-actions>.lang{height:42px;min-width:44px}.mobile-toggle{width:42px;height:42px;border-radius:12px}
  .mobile-nav-actions{grid-template-columns:1fr}
  .hero-grid{padding-top:38px}
  .hero h1{font-size:clamp(34px,10vw,46px);line-height:1.12}
  .hero p{font-size:17px;line-height:1.9}
  .hero-ctas .btn{flex:1;min-width:145px;text-align:center;justify-content:center}
}
`;
let styles = fs.readFileSync(stylesPath,'utf8');
if(!styles.includes('Rassmiy public mobile navigation v4.6')) styles += '\n'+mobileCss+'\n';
fs.writeFileSync(stylesPath,styles);

const js = String.raw`(()=>{
  const init=()=>{
    document.querySelectorAll('.topbar .nav').forEach(nav=>{
      let toggle=nav.querySelector('[data-public-menu-toggle]');
      let panel=nav.querySelector('[data-public-menu]');
      const actions=nav.querySelector('.nav-actions');
      const desktopMenu=nav.querySelector('.menu');
      if(!toggle){
        toggle=document.createElement('button');
        toggle.type='button'; toggle.className='mobile-toggle'; toggle.setAttribute('data-public-menu-toggle',''); toggle.setAttribute('aria-expanded','false'); togggle.setAttribute('aria-label',document.documentElement.lang==='ar'?'فتج القائمة':'Open menu'); toggle.textContent='☰';
        actions?.appendChild(toggle);
      }
      if(!panel){
        panel=document.createElement('div'); panel.className='mobile-nav-panel'; panel.setAttribute('data-public-menu','');
        const n=document.createElement('nav');
        desktopMenu?.querySelectorAll('a').forEach(a=>n.appendChild(a.cloneNode(true)));
        panel.appendChild(n);
        const ma=document.createElement('div'); ma.className='mobile-nav-actions';
        actions?.querySelectorAll('a.btn').forEach(a=>{const c=a.cloneNode(true);c.classList.remove('desktop-action');ma.appendChild(c)});
        panel.appendChild(ma); nav.appendChild(panel);
      }
      const setOpen=open=>{ panel.classList.toggle('open',open); toggle.setAttribute('aria-expanded',open?'true':'false'); toggle.textContent=open?'×':'☰'; document.body.classList.toggle('public-menu-open',open); };
      toggle.addEventListener('click',e=>{e.preventDefault();setOpen(!panel.classList.contains('open'))});
      panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
      document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
      window.addEventListener('resize',()=>{if(innerWidth>980)setOpen(false)},{passive:true});
    });
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
`;
fs.writeFileSync(jsPath,js);

function injectSeo(file,lang,name){
  let html=fs.readFileSync(file,'utf8');
  if(!/<head[\s>]/i.test(html)) return;
  const lower=name.toLowerCase();
  const isPrivate=['login.html','dashboard.html'].includes(lower);
  const counterpartLang=lang==='ar'?'en':'ar';
  let pathName=`/${lang}/${name}`;
  let counterpart=`/${counterpartLang}/${name}`;
  if(lower==='articles.html'){ pathName=`/${lang}/articles`; counterpart=`/${counterpartLang}/articles`; }
  const canonical=base+pathName;
  const altOther=base+counterpart;
  const altSame=canonical;
  const xDefault=lang==='en'?canonical:altOther;
  html=html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi,'');
  html=html.replace(/<meta\s+name=["']robots["'][^>]*>/gi,'');
  html=html.replace(/<meta\s+name=["']googlebot["'][^>]*>/gi,'');
  const robots=isPrivate?'noindex,nofollow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  const tags=`\n<meta name="robots" content="${robots}">\n<meta name="googlebot" content="${robots}">\n<link rel="canonical" href="${canonical}">\n<link rel="alternate" hreflang="${lang}" href="${altSame}">\n<link rel="alternate" hreflang="${counterpartLang}" href="${altOther}">\n<link rel="alternate" hreflang="x-default" href="${xDefault}">\n<meta property="og:url" content="${canonical}">\n<meta property="og:locale" content="${lang==='ar'?'ar_SA':'en_US'}">\n<meta property="og:locale:alternate" content="${lang==='ar'?'en_US':'ar_SA'}">\n`;
  html=html.replace(/<\/head>/i,tags+'</head>');
  if(!html.includes('/assets/site.js')) html=html.replace(/<\/body>/i,'<script defer src="/assets/site.js"></script></body>');
  fs.writeFileSync(file,html);
}
for(const lang of ['ar','en']){
  const dir=path.join(root,lang);
  if(!fs.existsSync(dir)) continue;
  for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.html'))) injectSeo(path.join(dir,name),lang,name);
}

// Root is only a language jump page; keep it out of the index and make the target explicit.
const rootIndex=path.join(root,'index.html');
if(fs.existsSync(rootIndex)){
  let h=fs.readFileSync(rootIndex,'utf8');
  if(!/name=["']robots["']/i.test(h)) h=h.replace(/<head>/i,'<head><meta name="robots" content="noindex,follow"><link rel="canonical" href="'+base+'/en/index.html">');
  fs.writeFileSync(rootIndex,h);
}

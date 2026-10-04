import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'release';
const base = 'https://rassmiy-marketing.netlify.app';
const stylesPath = path.join(root,'assets','styles.css');
const jsPath = path.join(root,'assets','site.js');

const mobileCss = String.raw`
/* Rassmiy public responsive navigation v4.7 */
html,body{max-width:100%;overflow-x:clip}
body{min-width:0}
.container{max-width:1180px}
.mobile-toggle{display:none;appearance:none;border:1px solid #dbe4ee;background:#fff;color:#082b55;width:46px;height:46px;border-radius:14px;align-items:center;justify-content:center;font-size:23px;line-height:1;font-weight:900;cursor:pointer;box-shadow:0 6px 18px rgba(8,43,85,.07);flex:0 0 auto}
.mobile-nav-panel{display:none}
.mobile-nav-backdrop{display:none}
@media(max-width:980px){
  .container{width:min(100% - 28px,1180px)}
  .topbar{position:sticky;top:0;z-index:1000;background:rgba(255,255,255,.98);backdrop-filter:blur(16px);border-bottom:1px solid #e4ebf3}
  .nav{height:72px;min-width:0;gap:10px;position:relative}
  .brand{min-width:0;flex:1 1 auto;gap:10px}
  .brand img{width:48px;height:48px;flex:0 0 48px}
  .brand-copy{min-width:0}
  .menu{display:none!important}
  .nav-actions{margin-inline-start:auto;gap:8px;flex:0 0 auto}
  .nav-actions .desktop-action,.nav-actions>a.btn{display:none!important}
  .nav-actions>.lang{display:inline-flex;min-width:48px;height:46px;align-items:center;justify-content:center;padding:0 12px}
  .mobile-toggle{display:inline-flex!important}
  .mobile-nav-backdrop{position:fixed;inset:72px 0 0;background:rgba(3,20,42,.48);backdrop-filter:blur(3px);z-index:998}
  .mobile-nav-backdrop.open{display:block}
  .mobile-nav-panel{position:fixed;top:72px;inset-inline:0;bottom:0;background:#fff;z-index:999;padding:18px 18px max(24px,env(safe-area-inset-bottom));overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
  .mobile-nav-panel.open{display:block}
  .mobile-nav-panel nav{display:grid;gap:6px;max-width:720px;margin-inline:auto}
  .mobile-nav-panel nav a{display:flex;align-items:center;min-height:52px;padding:13px 16px;border-radius:14px;color:#082b55;font-weight:800;font-size:16px;border:1px solid transparent}
  .mobile-nav-panel nav a:hover,.mobile-nav-panel nav a.active{background:#f0f6fb;color:#ff7a19;border-color:#e2edf7}
  .mobile-nav-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:720px;margin:18px auto 0;padding-top:18px;border-top:1px solid #e4ebf3}
  .mobile-nav-actions .btn{display:flex!important;width:100%;justify-content:center;min-height:50px;margin:0}
  body.public-menu-open{overflow:hidden;touch-action:none}

  .hero-grid{grid-template-columns:1fr!important;min-height:auto!important;gap:30px!important;padding:54px 0 42px!important}
  .hero h1{font-size:clamp(42px,7vw,56px);line-height:1.08;overflow-wrap:anywhere}
  .hero p{font-size:18px;line-height:1.85;max-width:760px}
  .analytics-card{max-width:720px;width:100%;margin-inline:auto;transform:none!important}
  .cards,.articles{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .portfolio-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .two-col,.login-wrap{grid-template-columns:1fr!important}
  .section-head{gap:14px}
  .page-hero{padding:68px 0 48px}
  .page-hero h1{font-size:clamp(38px,7vw,50px)}
  .footer-grid{grid-template-columns:1.5fr 1fr 1fr}
}
@media(max-width:720px){
  .container{width:calc(100% - 24px)}
  .cards,.articles,.portfolio-grid,.form-grid{grid-template-columns:1fr!important}
  .section{padding:54px 0!important}
  .section-head{align-items:flex-start!important;flex-direction:column!important}
  .section-head h2{font-size:clamp(30px,8vw,38px)!important}
  .footer-grid{grid-template-columns:1fr!important;gap:22px}
  .service-card,.article-card,.case-card,.panel{padding:20px}
}
@media(max-width:620px){
  .container{width:calc(100% - 22px)}
  .nav{height:68px;gap:7px}
  .mobile-nav-panel{top:68px;padding-inline:14px}
  .mobile-nav-backdrop{inset:68px 0 0}
  .brand img{width:44px;height:44px;flex-basis:44px;border-radius:12px}
  .brand-copy{display:none!important}
  .nav-actions>.lang{height:42px;min-width:44px;padding:0 10px;border-radius:12px}
  .mobile-toggle{width:42px;height:42px;border-radius:12px}
  .mobile-nav-actions{grid-template-columns:1fr}

  .hero-grid{padding:40px 0 34px!important;gap:24px!important}
  .hero h1{font-size:clamp(34px,10.2vw,44px)!important;line-height:1.12!important;letter-spacing:-.025em;margin:8px 0 16px!important}
  .hero p{font-size:16.5px!important;line-height:1.9!important;margin:0}
  .hero-ctas{display:grid!important;grid-template-columns:1fr 1fr;gap:10px!important;margin:22px 0!important}
  .hero-ctas .btn{width:100%;min-width:0;padding:13px 12px;text-align:center;justify-content:center}
  .stats{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;margin-top:24px!important}
  .stat{border:1px solid rgba(255,255,255,.16)!important;background:rgba(255,255,255,.055);border-radius:14px;padding:12px 8px!important;text-align:center;min-width:0}
  .stat b{font-size:clamp(20px,6vw,27px)!important;line-height:1.15;white-space:nowrap}
  .stat span{font-size:11px!important;line-height:1.35;display:block;margin-top:5px}
  .analytics-card{padding:16px;border-width:6px;border-radius:22px}
  .mini-grid{gap:8px}.metric{padding:12px}.metric strong{font-size:23px}.chart{height:120px}
  .page-hero{padding:52px 0 38px!important}.page-hero h1{font-size:clamp(34px,9vw,42px)!important}.page-hero p{font-size:16px!important}
  .section{padding:48px 0!important}
  .btn{min-height:46px}
  .footer{padding:34px 0}
}
@media(max-width:430px){
  .hero-ctas{grid-template-columns:1fr!important}
  .stats{gap:6px!important}
  .stat{padding:10px 6px!important}
  .stat b{font-size:20px!important}
  .stat span{font-size:10px!important}
  .mobile-nav-panel nav a{font-size:15.5px;min-height:50px}
}
`;
let styles = fs.readFileSync(stylesPath,'utf8');
styles = styles.replace(/\/\* Rassmiy public mobile navigation v4\.6 \*\/[\s\S]*?(?=\/\* Rassmiy public responsive navigation v4\.7 \*\/|$)/,'');
if(!styles.includes('Rassmiy public responsive navigation v4.7')) styles += '\n'+mobileCss+'\n';
fs.writeFileSync(stylesPath,styles);

const js = String.raw`(()=>{
  const init=()=>{
    document.querySelectorAll('.topbar .nav').forEach((nav,index)=>{
      let toggle=nav.querySelector('[data-public-menu-toggle]');
      let panel=nav.querySelector('[data-public-menu]');
      const actions=nav.querySelector('.nav-actions');
      const desktopMenu=nav.querySelector('.menu');
      if(!actions) return;
      if(!toggle){
        toggle=document.createElement('button');
        toggle.type='button';
        toggle.className='mobile-toggle';
        toggle.setAttribute('data-public-menu-toggle','');
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label',document.documentElement.lang==='ar'?'فتح القائمة':'Open menu');
        toggle.innerHTML='<span aria-hidden="true">☰</span>';
        actions.appendChild(toggle);
      }
      if(!panel){
        panel=document.createElement('div');
        panel.className='mobile-nav-panel';
        panel.setAttribute('data-public-menu','');
        const n=document.createElement('nav');
        desktopMenu?.querySelectorAll('a').forEach(a=>n.appendChild(a.cloneNode(true)));
        panel.appendChild(n);
        const ma=document.createElement('div');
        ma.className='mobile-nav-actions';
        actions.querySelectorAll('a.btn').forEach(a=>{const c=a.cloneNode(true);c.classList.remove('desktop-action');ma.appendChild(c)});
        panel.appendChild(ma);
        nav.appendChild(panel);
      }
      if(!panel.id) panel.id='mobile-nav-'+index;
      toggle.setAttribute('aria-controls',panel.id);
      let backdrop=document.querySelector('[data-public-menu-backdrop="'+index+'"]');
      if(!backdrop){
        backdrop=document.createElement('div');
        backdrop.className='mobile-nav-backdrop';
        backdrop.setAttribute('data-public-menu-backdrop',String(index));
        document.body.appendChild(backdrop);
      }
      const setOpen=open=>{
        panel.classList.toggle('open',open);
        backdrop.classList.toggle('open',open);
        toggle.setAttribute('aria-expanded',open?'true':'false');
        toggle.innerHTML=open?'<span aria-hidden="true">×</span>':'<span aria-hidden="true">☰</span>';
        document.body.classList.toggle('public-menu-open',open);
        if(open){const first=panel.querySelector('a');setTimeout(()=>first?.focus({preventScroll:true}),30)}
      };
      toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setOpen(!panel.classList.contains('open'))});
      backdrop.addEventListener('click',()=>setOpen(false));
      panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open')){setOpen(false);toggle.focus()}});
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
  html=html.replace(/<meta\s+name=[#']robots["'][^>]*>/gi,'');
  html=html.replace(/<meta\s+name=[#']googlebot["'][^>]*>/gi,'');
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

const rootIndex=path.join(root,'index.html');
if(fs.existsSync(rootIndex)){
  let h=fs.readFileSync(rootIndex,'utf8');
  if(!/name=["']robots["']/i.test(h)) h=h.replace(/<head>/i,'<head><meta name="robots" content="noindex,follow"><link rel="canonical" href="'+base+'/en/index.html">');
  fs.writeFileSync(rootIndex,h);
}

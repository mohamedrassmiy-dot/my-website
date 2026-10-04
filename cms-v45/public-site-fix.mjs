import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'release';
const base = 'https://rassmiy-marketing.netlify.app';
const stylesPath = path.join(root,'assets','styles.css');
const jsPath = path.join(root,'assets','site.js');

const mobileCss = String.raw`
/* Rassmiy public responsive navigation v5.0 */
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
  .mobile-nav-backdrop{position:fixed;inset:72px 0 0;background:rgba(3,20,42,.58);z-index:1998}
  .mobile-nav-backdrop.open{display:block}
  .mobile-nav-panel{position:fixed;top:72px;left:0;right:0;bottom:0;width:100%;height:calc(100dvh - 72px);background:#fff;z-index:1999;padding:16px 16px max(28px,env(safe-area-inset-bottom));overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;box-sizing:border-box}
  .mobile-nav-panel.open{display:block}
  .mobile-nav-panel nav{display:grid;gap:8px;max-width:720px;margin:0 auto;padding:0}
  .mobile-nav-panel nav a{display:flex!important;visibility:visible!important;opacity:1!important;align-items:center;min-height:52px;padding:13px 16px;border-radius:14px;color:#082b55!important;background:#fff;font-weight:800;font-size:16px;border:1px solid #e7edf4;text-decoration:none}
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
  .mobile-nav-panel{top:68px;height:calc(100dvh - 68px);padding-inline:14px}
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
if(!styles.includes('Rassmiy public responsive navigation v5.0')) styles += '\n'+mobileCss+'\n';
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
        if(n.querySelectorAll('a').length < 4){
          const ar=document.documentElement.lang==='ar';
          const links=ar
            ? [['الرئيسية','/ar/index.html'],['من أنا','/ar/about.html'],['الخدمات','/ar/services.html'],['الأعمال','/ar/portfolio.html'],['المقالات','/ar/articles'],['تواصل معي','/ar/contact.html']]
            : [['Home','/en/index.html'],['About','/en/about.html'],['Services','/en/services.html'],['Portfolio','/en/portfolio.html'],['Articles','/en/articles'],['Contact','/en/contact.html']];
          n.replaceChildren(...links.map(([label,href])=>{const a=document.createElement('a');a.href=href;a.textContent=label;return a;}));
        }
        panel.appendChild(n);
        const ma=document.createElement('div');
        ma.className='mobile-nav-actions';
        actions.querySelectorAll('a.btn').forEach(a=>{const c=a.cloneNode(true);c.classList.remove('desktop-action');ma.appendChild(c)});
        panel.appendChild(ma);
        document.body.appendChild(panel);
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
  if(lower==='index.html' && lang==='ar'){ pathName='/'; counterpart='/en/index.html'; }
  if(lower==='index.html' && lang==='en'){ counterpart='/'; }
  const canonical=base+pathName;
  const altOther=base+counterpart;
  const altSame=canonical;
  const xDefault=lower==='index.html'?base+'/':(lang==='en'?canonical:altOther);
  html=html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi,'');
  html=html.replace(/<link\s+rel=["']alternate["'][^>]*>/gi,'');
  html=html.replace(/<meta\s+property=["']og:url["'][^>]*>/gi,'');
  html=html.replace(/<meta\s+property=["']og:locale(?::alternate)?["'][^>]*>/gi,'');
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
const arHome=path.join(root,'ar','index.html');
if(fs.existsSync(arHome)){
  let h=fs.readFileSync(arHome,'utf8');
  h=h
    .replaceAll('../assets/','/assets/')
    .replace(/href="\.\.\/en\/index\.html"/g,'href="/en/index.html"')
    .replace(/href="index\.html"/g,'href="/"')
    .replace(/href="about\.html"/g,'href="/ar/about.html"')
    .replace(/href="services\.html"/g,'href="/ar/services.html"')
    .replace(/href="portfolio\.html"/g,'href="/ar/portfolio.html"')
    .replace(/href="contact\.html"/g,'href="/ar/contact.html"')
    .replace(/href="article-seo\.html"/g,'href="/ar/article-seo.html"');
  h=h.replace(/<meta\s+http-equiv=["']refresh["'][^>]*>/gi,'');
  fs.writeFileSync(rootIndex,h);
}

// Portfolio and contact refresh — sourced from Mohamed's supplied CV.
const socialPersonal='https://www.linkedin.com/in/mohamedrassmiy';
const socialBrand='https://www.linkedin.com/posts/rassmiy-marketing_rassmiymarketing-seo-aesaevaebaeyaeuabraetaevaezaeraepaesabraepaesaeqaevaet-activity-7511335677968703488-rR74?utm_source=share&utm_medium=member_ios&rcm=ACoAADX1g_EBa1ytxUmm3xI9QE0F-90xrU5giwQ';
const whatsapp='https://wa.me/966536741442';
const projects=[
 {id:'ecommerce',tag:'E-COMMERCE',ar:['تطوير تجربة التجارة الإلكترونية','شركة المستقبل لمواد البناء','إدارة تطوير المتجر والموقع، وتنظيم عرض المنتجات والمحتوى ومسار العميل، بالتنسيق مع فرق المبيعات والمنتجات والعمليات.','تخطيط رحلة العميل وتحسين تجربة التصفح|تحسين عرض المنتجات ووصفها وظهورها في البحث|مواءمة المتجر مع الحملات والتنسيق التشغيلي','تجربة متجر تدعم اكتشاف المنتجات وتسهّل الانتقال إلى الاستفسار والشراء.'],en:['E-commerce experience development','Al Mustaqbal Building Materials Company','Managed store and website development, product presentation, content and the customer journey in collaboration with sales, product and operations teams.','Customer journey and browsing experience planning|Product merchandising, content and search visibility|Campaign alignment and operational coordination','A store experience designed to support product discovery, enquiries and purchasing.']},
 {id:'seo',tag:'SEO & CONTENT',ar:['SEO ومحتوى يدعمان اكتشاف المنتجات','المواقع والمتاجر الإلكترونية','تحسين ظهور المنتجات والخدمات من خلال تنظيم المحتوى، وتحسين صفحات الموقع والمتجر، وربط المحتوى باحتياجات العملاء.','مراجعة تنظيم الصفحات ومحتوى المنتجات|كتابة وتحسين المحتوى المتوافق مع البحث|متابعة الظهور والأداء وتحديد فرص التحسين','صفحات أوضح للعميل ومحتوى يساعده على الوصول إلى المنتج أو الخدمة المناسبة.'],en:['SEO and content for product discovery','Websites and e-commerce stores','Improved product and service visibility through content planning, website and store optimisation, and content aligned with customer needs.','Page structure and product content review|Search-focused content creation and optimisation|Visibility monitoring and improvement recommendations','Clearer pages and content that help customers discover relevant products and services.']},
 {id:'campaigns',tag:'PAID MEDIA',ar:['إدارة الحملات والإعلانات المدفوعة','Easy Digits Solutions ومشروعات التسويق','تخطيط وتنفيذ الحملات الرقمية، وإدارة المحتوى والاستهداف، ومتابعة الأداء بالتنسيق مع العملاء والوكالات والفرق المعنية.','تخطيط الحملات والمحتوى الإعلاني|الاستهداف والمتابعة عبر Google وMeta وTikTok|تقارير الأداء وتوصيات تحسين الإنفاق','قرارات تسويقية تربط الإنفاق بأهداف اكتساب العملاء والوعي بالعلامة.'],en:['Digital campaigns and paid media','Easy Digits Solutions and marketing projects','Planned and executed digital campaigns, content and audience targeting, with performance follow-up across clients, agencies and internal teams.','Campaign and advertising content planning|Audience targeting and monitoring across Google, Meta and TikTok|Performance reporting and spend recommendations','Marketing decisions that connect spend to customer acquisition and brand awareness objectives.']},
 {id:'events',tag:'EVENTS & ACTIVATION',ar:['الفعاليات وإطلاق العلامات التجارية','شركة المستقبل لمواد البناء','إدارة وتنسيق الفعاليات والمعارض وتنشيط العلامة، من التخطيط والمواد التسويقية إلى متابعة الموردين والفرق الداخلية.','تخطيط الفعالية ومواءمتها مع أهداف العلامة|تنسيق الموردين والتجهيزات والفرق الداخلية|تجهيز مواد العرض والمطبوعات والأصول الترويجية','تجربة علامة متكاملة تدعم التواصل مع العملاء وتمكّن فرق المبيعات.'],en:['Events and brand activation','Al Mustaqbal Building Materials Company','Managed and coordinated events, exhibitions and brand activations, from planning and marketing collateral to vendor and internal-team coordination.','Event planning aligned with brand objectives|Supplier, installation and internal-team coordination|Display, print and promotional asset preparation','A coordinated brand experience that supports customer engagement and sales teams.']},
 {id:'catalogues',tag:'BRAND & PRINT',ar:['الكتالوجات والهوية والمواد التسويقية','شركة المستقبل لمواد البناء','تجهيز الكتالوجات وبروفايل الشركة والمطبوعات والستاندات واللوحات، والمساهمة في مشروعات تطوير تموضع العلامة.','تنظيم معلومات المنتجات في كتالوجات واضحة|إعداد بروفايل الشركة والمواد الداعمة للمبيعات|التنسيق مع الأقسام والموردين لمراجعة وتنفيذ المواد','مواد متسقة تعرّف بالمنتجات وتدعم العرض التجاري والتواصل مع العملاء.'],en:['Catalogues, branding and sales collateral','Al Mustaqbal Building Materials Company','Prepared catalogues, company profiles, printed materials, product stands and signage, and contributed to brand-positioning projects.','Clear product information and catalogue organisation|Company profiles and sales-support materials|Cross-functional review and supplier coordination','Consistent collateral that explains products and supports commercial conversations.']},
 {id:'education',tag:'SOCIAL & EDUCATION',ar:['التسويق الرقمي للخدمات التعليمية','Future Pathways وDimois Training Institute','إدارة محتوى المنصات التعليمية والسوشيال ميديا، وتحسين الظهور في البحث، وتنفيذ ومتابعة الحملات للخدمات التدريبية.','تخطيط المحتوى وإدارة القنوات الاجتماعية|محتوى للخدمات التعليمية والتدريبية|استهداف الجمهور ومتابعة الحملات الرقمية','تواصل رقمي منتظم يوضح الخدمات ويساعد على جذب الاستفسارات المناسبة.'],en:['Digital marketing for education services','Future Pathways and Dimois Training Institute','Managed educational-platform and social content, search visibility, and campaign execution and follow-up for training services.','Content planning and social-channel management|Education and training service content|Audience targeting and campaign follow-up','Consistent digital communication that explains services and supports relevant enquiries.']}
];
function svgVisual(id){
 const base='<rect width="800" height="460" fill="#082b55"/><circle cx="690" cy="45" r="200" fill="#123d6a"/><circle cx="60" cy="450" r="160" fill="#103a60"/>';
 const frame='<rect x="100" y="66" width="600" height="328" rx="20" fill="#f3f7fc"/><rect x="100" y="66" width="600" height="42" rx="20" fill="#dbe5ef"/><circle cx="127" cy="88" r="5" fill="#ff7a19"/><circle cx="145" cy="88" r="5" fill="#91a8bd"/><circle cx="163" cy="88" r="5" fill="#91a8bd"/>';
 let shapes='';
 if(id==='ecommerce'){shapes=frame+'<rect x="130" y="132" width="190" height="226" rx="12" fill="#082b55"/><rect x="148" y="154" width="120" height="12" rx="6" fill="#ff7a19"/><rect x="148" y="184" width="148" height="8" rx="4" fill="#87a6c6"/>'+[345,510].map(x=>`<rect x="${x}" y="132" width="140" height="145" rx="12" fill="#e3ebf5"/><rect x="${x+35}" y="163" width="70" height="72" rx="12" fill="#ff7a19"/><rect x="${x}" y="295" width="113" height="9" rx="4" fill="#91a8bd"/><rect x="${x}" y="319" width="95" height="29" rx="8" fill="#082b55"/>`).join('');}
 if(id==='seo'){shapes=frame+'<rect x="141" y="142" width="412" height="44" rx="22" fill="#dce6f2"/><circle cx="518" cy="162" r="10" fill="none" stroke="#082b55" stroke-width="4"/><path d="m526 170 9 9" stroke="#082b55" stroke-width="4"/>'+[218,271,324].map(y=>`<rect x="146" y="${y}" width="260" height="11" rx="5" fill="#082b55"/><rect x="146" y="${y+20}" width="350" height="7" rx="3" fill="#a5b7ca"/>`).join('')+'<path d="m536 329 40-35 25 10 40-53" fill="none" stroke="#ff7a19" stroke-width="9" stroke-linecap="round"/>';}
 if(id==='campaigns'){shapes=frame+'<rect x="134" y="138" width="194" height="220" rx="12" fill="#e0e9f3"/><circle cx="231" cy="212" r="51" fill="#ff7a19"/><path d="m214 190 43 23-43 24z" fill="#fff"/>'+[98,145,184,218].map((h,i)=>`<rect x="${370+i*64}" y="${358-h}" width="39" height="${h}" rx="8" fill="${i===3?'#ff7a19':'#234d78'}"/>`).join('');}
 if(id==='events'){shapes='<rect x="130" y="87" width="540" height="220" rx="10" fill="#eaf1f7"/><rect x="205" y="126" width="390" height="130" rx="8" fill="#123f6d"/><path d="m360 214 40-53 40 53" stroke="#ff7a19" stroke-width="14" fill="none"/><path d="m130 318 540 0 48 66-636 0z" fill="#567a9e"/>'+[190,330,470,610].map(x=>`<circle cx="${x}" cy="341" r="15" fill="#ff7a19"/><rect x="${x-22}" y="358" width="44" height="49" rx="14" fill="#1b486f"/>`).join('');}
 if(id==='catalogues'){shapes='<g transform="rotate(-11 310 220)"><rect x="153" y="85" width="236" height="306" rx="10" fill="#e9eff6"/><rect x="176" y="113" width="186" height="128" rx="8" fill="#ff7a19"/><rect x="177" y="263" width="137" height="12" rx="6" fill="#082b55"/><rect x="177" y="289" width="163" height="7" rx="3" fill="#8aa4bf"/></g><g transform="rotate(10 515 220)"><rect x="407" y="85" width="236" height="306" rx="10" fill="#e9eff6"/><rect x="432" y="112" width="183" height="118" rx="8" fill="#234d78"/><rect x="432" y="253" width="132" height="12" rx="6" fill="#ff7a19"/><rect x="432" y="281" width="165" height="7" rx="3" fill="#8aa4bf"/></g>';}
 if(id==='education'){shapes='<rect x="130" y="88" width="399" height="281" rx="16" fill="#edf3f8"/><rect x="154" y="114" width="350" height="165" rx="10" fill="#234d78"/><path d="m304 158 59 35-59 35z" fill="#ff7a19"/><rect x="154" y="301" width="241" height="12" rx="6" fill="#91a8bd"/><rect x="567" y="61" width="110" height="331" rx="24" fill="#dce7f2"/><rect x="580" y="96" width="84" height="164" rx="8" fill="#ff7a19"/><rect x="580" y="283" width="67" height="8" rx="4" fill="#91a8bd"/><rect x="580" y="304" width="81" height="8" rx="4" fill="#91a8bd"/>';}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="460" viewBox="0 0 800 460">${base}${shapes}</svg>`;
}
fs.mkdirSync(path.join(root,'assets','portfolio'),{recursive:true});
for(const p of projects)fs.writeFileSync(path.join(root,'assets','portfolio',p.id+'.svg'),svgVisual(p.id));
const portfolioCss=`
/* CV-backed portfolio refresh */
.work-intro{max-width:780px}.work-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.work-actions a{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;padding:13px 20px;border-radius:12px;background:#fff;color:#082b55;border:1px solid #dbe5ef;font-weight:800}.work-actions a.whatsapp{background:#128c58;color:#fff;border-color:#128c58}.work-note{font-size:13px!important;opacity:.8;margin-top:20px!important}.work-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}.work-card{border:1px solid #e0e8f0;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 14px 32px rgba(8,43,85,.055)}.work-card img{display:block;width:100%;height:auto;aspect-ratio:800/460;object-fit:cover}.work-card-body{padding:28px}.work-tag{font-size:11px;letter-spacing:.16em;font-weight:800;color:#c05a12}.work-card h2{font-size:25px;line-height:1.5;margin:9px 0}.work-client{font-weight:700;font-size:13px;color:#5c738c}.work-card p,.work-card li{font-size:15px;line-height:1.95}.work-card ul{padding-inline-start:22px}.work-value{padding:15px;background:#f1f6fb;border-radius:12px}.work-card a{font-weight:800;color:#995019}.work-band{background:#082b55;color:white;border-radius:24px;padding:36px;margin-top:38px}.work-band h2{color:#fff;font-size:30px}.work-band p{max-width:720px;line-height:1.9}.work-hero-image{width:100%;max-height:420px;object-fit:cover;border-radius:22px;margin-top:28px}.social-contact{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.social-contact a{color:inherit;border:1px solid rgba(128,155,185,.5);border-radius:9px;padding:9px 12px;font-size:13px;text-decoration:none}.whatsapp-floating{position:fixed;bottom:22px;right:22px;z-index:999;background:#128c58;color:#fff!important;padding:14px 21px;border-radius:40px;text-decoration:none;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.22)}.work-mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.work-mini{display:block;background:white;border:1px solid #e0e8f0;border-radius:18px;overflow:hidden;color:#082b55;text-decoration:none}.work-mini img{width:100%;display:block}.work-mini div{padding:18px}.work-mini h3{margin:0 0 8px}.work-mini p{font-size:14px;line-height:1.8}.work-mini span{font-size:13px;color:#995019;font-weight:800}
@media(max-width:760px){.work-grid,.work-mini-grid{grid-template-columns:1fr}.work-card-body{padding:22px}.work-band{padding:24px}.work-actions{gap:8px}.work-actions a{font-size:14px;flex:1 1 180px}.whatsapp-floating{bottom:14px;right:14px;padding:12px 17px;font-size:14px}}
`;
fs.appendFileSync(stylesPath,portfolioCss);
fs.copyFileSync(new URL('./portfolio-hero.png',import.meta.url),path.join(root,'assets','portfolio','hero.png'));
function contactLinks(lang){const ar=lang==='ar';return `<a class="whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer">${ar?'تواصل عبر واتساب':'Chat on WhatsApp'}</a><a href="${socialPersonal}" target="_blank" rel="noopener noreferrer">${ar?'حسابي الشخصي على LinkedIn':'My LinkedIn profile'}</a><a href="${socialBrand.replaceAll('&','&amp;')}" target="_blank" rel="noopener noreferrer">Rassmiy Marketing · LinkedIn</a>`;}
for(const lang of ['ar','en']){
 const ar=lang==='ar';
 const cards=projects.map(p=>{const t=p[lang];return `<article class="work-card" id="${p.id}"><img src="/assets/portfolio/${p.id}.svg" width="800" height="460" alt="${ar?'رسم توضيحي — ':'Concept illustration — '}${t[0]}" loading="lazy" decoding="async"><div class="work-card-body"><span class="work-tag">${p.tag}</span><h2>${t[0]}</h2><div class="work-client">${t[1]}</div><p>${t[2]}</p><h3>${ar?'نطاق عملي':'My contribution'}</h3><ul>${t[3].split('|').map(x=>`<li>${x}</li>`).join('')}</ul><p class="work-value"><strong>${ar?'القيمة المستهدفة:':'Intended value:'}</strong> ${t[4]}</p><a href="${whatsapp}?text=${encodeURIComponent(ar?'مرحباً محمد، أرغب في مناقشة مشروع '+t[0]:'Hi Mohamed, I would like to discuss '+t[0])}" target="_blank" rel="noopener noreferrer">${ar?'ناقش معي مشروعاً مشابهاً ←':'Discuss a similar project →'}</a></div></article>`;}).join('');
 const portfolioBody=`<section class="page-hero"><div class="container"><div class="kicker">${ar?'أعمال محمد علي رسمي':'MOHAMED ALI RASSMIY · PORTFOLIO'}</div><h1>${ar?'استراتيجية وتنفيذ يربطان التسويق بأهداف الأعمال':'Marketing strategy and execution, connected to business goals'}</h1><p class="work-intro">${ar?'خبرة تتجاوز 5 سنوات في التسويق الرقمي، والتجارة الإلكترونية، وتحسين محركات البحث، والحملات والفعاليات. هذه نماذج من نطاق عملي ومساهماتي عبر قطاعات مواد البناء، والتعليم، وخدمات التسويق.':'5+ years across digital marketing, e-commerce, SEO, campaigns and events. Explore selected contributions across building materials, education and marketing services.'}</p><div class="work-actions">${contactLinks(lang)}</div><img class="work-hero-image" src="/assets/portfolio/hero.png" width="1672" height="941" alt="${ar?'تصور توضيحي للتسويق الرقمي والتجارة الإلكترونية والمحتوى':'Concept illustration of digital marketing, e-commerce and content'}" fetchpriority="high"><p class="work-note">${ar?'الصور توضيحية للمجالات والمخرجات؛ المحتوى يعرض نطاق العمل دون نسب نمو أو نتائج رقمية غير موثقة.':'Images are conceptual illustrations of work areas and deliverables. Descriptions outline contributions without unverified numerical results.'}</p></div></section><section class="section soft"><div class="container"><div class="work-grid">${cards}</div><div class="work-band"><div class="kicker">${ar?'لنبدأ مشروعك':'LET’S BUILD YOUR NEXT PROJECT'}</div><h2>${ar?'هل تحتاج خطة تسويق قابلة للتنفيذ؟':'Need a marketing plan you can execute?'}</h2><p>${ar?'أرسل لي نبذة عن نشاطك، والجمهور المستهدف، والتحدي الحالي. نناقش أولويات التسويق والمحتوى والقنوات المناسبة وخطوات التنفيذ.':'Share your business, audience and current challenge. We can discuss marketing priorities, content, suitable channels and practical next steps.'}</p><div class="work-actions">${contactLinks(lang)}</div></div></div></section>`;
 const file=path.join(root,lang,'portfolio.html');
 if(!fs.existsSync(file))throw new Error('Portfolio source missing: '+file);
 let html=fs.readFileSync(file,'utf8');
 const marker=html.indexOf('<section class="page-hero"');const end=html.indexOf('<footer',marker);
 if(marker<0||end<0)throw new Error('Portfolio layout signature missing');
 html=html.slice(0,marker)+portfolioBody+html.slice(end);
 html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${ar?'أعمال محمد علي رسمي | تسويق رقمي وتجارة إلكترونية':'Mohamed Ali Rassmiy Portfolio | Digital Marketing & E-commerce'}</title>`);
 html=html.replace(/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${ar?'أعمال محمد علي رسمي في التسويق الرقمي، SEO، التجارة الإلكترونية، الحملات، الفعاليات والكتالوجات. تواصل عبر واتساب ولينكدإن لمناقشة مشروعك.':'Explore Mohamed Ali Rassmiy’s digital marketing, SEO, e-commerce, campaigns, events and catalogue work. Connect on WhatsApp or LinkedIn.'}">`);
 fs.writeFileSync(file,html);
 for(const name of fs.readdirSync(path.join(root,lang)).filter(n=>n.endsWith('.html'))){
  const f=path.join(root,lang,name);let h=fs.readFileSync(f,'utf8');
  if(!h.includes('class="social-contact"'))h=h.replace(/<\/footer>/i,`<div class="container social-contact" aria-label="${ar?'روابط التواصل':'Contact links'}">${contactLinks(lang)}</div></footer>`);
  if(!h.includes('whatsapp-floating'))h=h.replace(/<\/body>/i,`<a class="whatsapp-floating" href="${whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="${ar?'تواصل مع محمد علي رسمي عبر واتساب':'Contact Mohamed Ali Rassmiy on WhatsApp'}">${ar?'واتساب · تواصل معي':'WhatsApp · Let’s talk'}</a></body>`);
  if(name==='index.html'){
   const homeCards=projects.map(p=>`<a class="work-mini" href="/${lang}/portfolio.html#${p.id}"><img src="/assets/portfolio/${p.id}.svg" width="800" height="460" loading="lazy" alt="${ar?'رسم توضيحي — ':'Concept illustration — '}${p[lang][0]}"><div><h3>${p[lang][0]}</h3><p>${p[lang][1]}</p><span>${ar?'استعرض نطاق العمل ←':'Explore my contribution →'}</span></div></a>`).join('');
   h=h.replace(/<div class="portfolio-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,`<div class="work-mini-grid">${homeCards}</div></div></section>`);
  }
  fs.writeFileSync(f,h);
 }
}
// Root homepage mirrors Arabic after the refreshed content is written.
let refreshedRoot=fs.readFileSync(path.join(root,'ar','index.html'),'utf8').replaceAll('../assets/','/assets/').replace(/href="\.\.\/en\/index\.html"/g,'href="/en/index.html"').replace(/href="index\.html"/g,'href="/"');
for(const name of ['about','services','portfolio','contact','article-seo'])refreshedRoot=refreshedRoot.replaceAll(`href="${name}.html"`,`href="/ar/${name}.html"`);
fs.writeFileSync(rootIndex,refreshedRoot);

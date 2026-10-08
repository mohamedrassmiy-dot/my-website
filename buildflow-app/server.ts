
const port=Number(Bun.env.PORT||3000);
const wa=(Bun.env.WHATSAPP_NUMBER||"966500000000").replace(/\D/g,"");
const adminUser=Bun.env.ADMIN_USER||"admin";
const adminSecret=Bun.env.ADMIN_SECRET||"buildflow";
const leadsFile="/data/leads.json"; let leads:any[]=[]; try{const f=Bun.file(leadsFile); if(await f.exists()) leads=await f.json();}catch{} async function saveLeads(){await Bun.write(leadsFile,JSON.stringify(leads,null,2));}
let cats:any={tile:"أدوات البلاط",paint:"أدوات الدهان",gypsum:"أدوات الجبس بورد",adhesive:"لواصق ومواد مساعدة",hand:"عدد يدوية",light:"معدات خفيفة",protect:"مستلزمات حماية وتنظيف"};
let products:any[]=[
 {slug:"tile-spacers-1mm",name:"فواصل بلاط 1 مم",cat:"tile",price:8,desc:"فواصل بلاط بلاستيكية لضبط المسافات بين البلاط أثناء التركيب."},
 {slug:"tile-spacers-2mm",name:"فواصل بلاط 2 مم",cat:"tile",price:8,desc:"فواصل بلاط مناسبة لتركيب السيراميك والبورسلان بتباعد منتظم."},
 {slug:"tile-leveling-wedge",name:"إسفين تسوية بلاط",cat:"tile",price:18,desc:"إسفين يساعد على تسوية البلاط وتقليل الفروقات أثناء التركيب."},
 {slug:"manual-tile-cutter",name:"قاطع بلاط يدوي",cat:"tile",price:249,desc:"أداة لقطع البلاط والسيراميك بدقة أثناء أعمال التركيب."},
 {slug:"rubber-mallet",name:"مطرقة مطاط",cat:"tile",price:29,desc:"مطرقة مطاطية تستخدم في ضبط البلاط بدون كسر أو خدش."},
 {slug:"notched-trowel",name:"مشط لاصق",cat:"tile",price:22,desc:"مشط يستخدم لتوزيع لاصق البلاط بشكل متساوٍ."},
 {slug:"spirit-level",name:"ميزان ماء",cat:"hand",price:35,desc:"أداة لضبط الاستقامة والتوازن في أعمال التركيب."},
 {slug:"tile-cleaning-sponge",name:"إسفنجة تنظيف بلاط",cat:"protect",price:12,desc:"إسفنجة لتنظيف البلاط وإزالة بقايا اللاصق."},
 {slug:"paint-roller-9",name:"رول دهان 9 بوصة",cat:"paint",price:19,desc:"رول دهان مناسب لتغطية الجدران والأسطح الداخلية."},
 {slug:"paint-brush-3",name:"فرشاة دهان 3 بوصة",cat:"paint",price:14,desc:"فرشاة دهان للاستخدام في الزوايا والحواف والتفاصيل."},
 {slug:"paint-tray",name:"صينية دهان",cat:"paint",price:15,desc:"صينية تستخدم مع الرول لتوزيع الدهان بسهولة."},
 {slug:"masking-tape",name:"شطرطون حماية",cat:"protect",price:9,desc:"شريط حماية يستخدم أثناء الدهان والتشطيب."},
 {slug:"protective-sheet",name:"مشمع حماية",cat:"protect",price:25,desc:"مشمع لحماية الأرضيات والأثاث أثناء التشطيب."},
 {slug:"putty-knife",name:"سكينة معجون",cat:"paint",price:17,desc:"أداة لفرد المعجون ومعالجة عيوب الجدران."},
 {slug:"sandpaper",name:"ورق صنفرة",cat:"paint",price:6,desc:"ورق صنفرة لتنعيم الأسطح قبل الدهان."},
 {slug:"roller-extension-pole",name:"عمود تمديد رول",cat:"paint",price:42,desc:"عمود يستخدم مع رول الدهان للوصول إلى الأماكن العالية."},
 {slug:"silicone-gun",name:"مسدس سيليكون",cat:"hand",price:28,desc:"أداة تستخدم لتطبيق السيليكون والمواد اللاصقة."},
 {slug:"measuring-tape",name:"متر قياس",cat:"hand",price:18,desc:"أداة قياس أساسية لأعمال البناء والتشطيب."},
 {slug:"screwdriver",name:"مفك",cat:"hand",price:16,desc:"مفك للاستخدام في أعمال التركيب والصيانة."},
 {slug:"pliers",name:"زرادية",cat:"hand",price:24,desc:"أداة يدوية للشد والقص والمساعدة في أعمال الصيانة."},
 {slug:"drywall-screws",name:"براغي جبس بورد",cat:"gypsum",price:32,desc:"براغي مخصصة لأعمال تثبيت ألواح الجبس بورد."},
 {slug:"gypsum-joint-tape",name:"شريط فواصل جبس",cat:"gypsum",price:21,desc:"شريط يستخدم لمعالجة فواصل ألواح الجبس بورد."},
 {slug:"gypsum-corner-bead",name:"زاوية حماية جبس",cat:"gypsum",price:14,desc:"زاوية حماية تستخدم لحماية حواف الجبس بورد."},
 {slug:"tin-snips",name:"مقص صاج",cat:"hand",price:39,desc:"أداة لقص الصاج والمعادن الخفيفة."},
 {slug:"mixing-bucket",name:"دلو خلط",cat:"protect",price:18,desc:"دلو يستخدم لخلط المواد اللاصقة والمعجون."}
];
let projects:any[]=[
 {slug:"tile-installation",name:"تركيب بلاط",desc:"سلة مقترحة لأعمال تركيب البلاط والسيراميك.",items:["tile-spacers-1mm","tile-spacers-2mm","tile-leveling-wedge","manual-tile-cutter","rubber-mallet","notched-trowel","spirit-level","tile-cleaning-sponge","mixing-bucket","masking-tape"]},
 {slug:"room-painting",name:"دهان غرفة",desc:"كل ما يحتاجه فني الدهان من أدوات وتجهيز وحماية.",items:["paint-roller-9","paint-brush-3","paint-tray","masking-tape","protective-sheet","putty-knife","sandpaper","roller-extension-pole"]},
 {slug:"gypsum-board",name:"جبس بورد",desc:"أدوات التثبيت والتشطيب والقياس لأعمال الجبس بورد.",items:["drywall-screws","gypsum-joint-tape","gypsum-corner-bead","putty-knife","measuring-tape","spirit-level","screwdriver","tin-snips"]},
 {slug:"roof-waterproofing",name:"عزل سطح",desc:"سلة أولية لأعمال العزل والصيانة وتجهيز الموقع.",items:["protective-sheet","masking-tape","mixing-bucket","putty-knife","measuring-tape","spirit-level"]},
 {slug:"bathroom-maintenance",name:"صيانة حمام",desc:"مستلزمات أساسية لأعمال الصيانة والترميم الخفيف داخل الحمامات.",items:["silicone-gun","masking-tape","putty-knife","measuring-tape","screwdriver","pliers","protective-sheet"]},
 {slug:"apartment-finishing",name:"تشطيب شقة",desc:"مجموعة بداية لمراحل التشطيب والقياس والحماية وأعمال البلاط والدهان.",items:["measuring-tape","spirit-level","paint-roller-9","paint-brush-3","paint-tray","masking-tape","protective-sheet","putty-knife","sandpaper","silicone-gun","tile-spacers-1mm","tile-leveling-wedge","rubber-mallet","notched-trowel","mixing-bucket"]}
];
const catalogFile="/data/catalog.json";
const settingsFile="/data/settings.json";
let siteSettings:any={site_name:"BuildFlow",default_title:"مواد البناء والتشطيب توصلك للموقع",default_meta:"منصة توريد ذكية لمواد وأدوات البناء والتشطيب في السعودية",default_city:"الرياض",whatsapp:wa};
try{
  const f=Bun.file(catalogFile);
  if(await f.exists()){
    const saved=await f.json();
    if(saved&&Array.isArray(saved.products)&&saved.products.length)products=saved.products;
    if(saved&&Array.isArray(saved.projects)&&saved.projects.length)projects=saved.projects;
    if(saved&&saved.categories&&typeof saved.categories==="object")cats=saved.categories;
  }
}catch(e){console.error("catalog_load_error",String(e))}
try{
  const f=Bun.file(settingsFile);
  if(await f.exists()){
    const saved=await f.json();
    if(saved&&typeof saved==="object")siteSettings={...siteSettings,...saved};
    if(siteSettings.whatsapp)wa=String(siteSettings.whatsapp).replace(/\D/g,"");
  }
}catch(e){console.error("settings_load_error",String(e))}
async function saveCatalog(){await Bun.write(catalogFile,JSON.stringify({products,projects,categories:cats},null,2))}
async function saveSettings(){siteSettings.whatsapp=wa;await Bun.write(settingsFile,JSON.stringify(siteSettings,null,2))}
const esc=(s:any)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const css=`
:root{--g:#173f35;--o:#ef7d22;--bg:#f5f8f6;--ink:#17201d;--mut:#68746f}*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Arial,"Noto Sans Arabic",sans-serif;direction:rtl}
a{text-decoration:none;color:inherit}.wrap{width:min(1160px,92%);margin:auto}.top{background:#fff;border-bottom:1px solid #e1e9e5;position:sticky;top:0;z-index:20}
.nav{height:72px;display:flex;align-items:center;gap:20px}.brand{display:flex;align-items:center;gap:10px;font-size:24px;font-weight:900;color:var(--g)}.mark{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--g),var(--o));color:#fff}
.menu{display:flex;gap:16px;align-items:center;margin-inline-start:auto}.btn{display:inline-block;padding:12px 18px;border:0;border-radius:11px;font-weight:800;cursor:pointer}.primary{background:var(--o);color:#fff}.green{background:var(--g);color:#fff}.ghost{background:#fff;border:1px solid #ccd9d3}
.hero{padding:60px 0;background:linear-gradient(#fff,#edf6f2)}.hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center}
h1{font-size:clamp(34px,5vw,60px);line-height:1.1;color:var(--g);margin:0 0 18px}h2{font-size:30px;color:var(--g)}p{line-height:1.8}.badge{display:inline-block;padding:7px 11px;border-radius:999px;background:#e6f2ed;color:var(--g);font-weight:800}
.section{padding:50px 0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card,.panel{background:#fff;border:1px solid #e2ebe7;border-radius:17px;padding:18px;box-shadow:0 8px 30px #173f3510}.card h3{color:var(--g)}.muted{color:var(--mut)}.price{font-size:22px;font-weight:900;color:var(--g)}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.kpi{background:#fff;border:1px solid #e3ebe7;border-radius:14px;padding:18px;text-align:center}.kpi b{display:block;color:var(--g);font-size:22px}
form{display:grid;gap:12px}input,select,textarea{width:100%;padding:13px;border:1px solid #cbd8d2;border-radius:10px;font:inherit;background:#fff}textarea{min-height:110px}
table{width:100%;border-collapse:collapse;background:#fff}th,td{padding:12px;border-bottom:1px solid #edf1ef;text-align:right}.footer{background:#102f28;color:#eaf4f0;padding:32px 0;margin-top:40px}.wa{position:fixed;left:18px;bottom:18px;background:#25D366;color:#fff;padding:13px 16px;border-radius:999px;font-weight:900;box-shadow:0 8px 24px #0002}
@media(max-width:820px){.menu a:not(.primary){display:none}.hero-grid,.grid,.grid3,.kpis{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.hero-grid,.grid,.grid3,.kpis{grid-template-columns:1fr}.wrap{width:94%}}
`;
function layout(title:string,body:string,desc="منصة توريد ذكية لمواد وأدوات البناء والتشطيب في السعودية"){
 const msg=encodeURIComponent("مرحبًا، أريد الاستفسار عبر BuildFlow");
 return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | BuildFlow</title><meta name="description" content="${esc(desc)}"><meta property="og:title" content="${esc(title)} | BuildFlow"><meta property="og:description" content="${esc(desc)}"><style>${css}</style></head><body>
 <header class="top"><div class="wrap nav"><a class="brand" href="/"><span class="mark">BF</span>BuildFlow</a><nav class="menu"><a href="/projects">المشاريع</a><a href="/products">المنتجات</a><a href="/contractors">للمقاولين</a><a href="/suppliers">للموردين</a><a href="/about">من نحن</a><a href="/contact">تواصل</a><a class="btn primary" href="https://wa.me/${wa}?text=${msg}">اطلب عبر واتساب</a></nav></div></header>
 ${body}<a class="wa" href="https://wa.me/${wa}?text=${msg}">واتساب</a><footer class="footer"><div class="wrap"><b>BuildFlow</b><p>مواد مشروعك توصلك للموقع — الرياض، المملكة العربية السعودية.</p></div></footer></body></html>`;
}
const btn=(href:string,label:string,cl="primary")=>`<a class="btn ${cl}" href="${href}">${label}</a>`;
const productCards=(arr=products)=>`<div class="grid">${arr.map(p=>`<article class="card"><span class="badge">${esc(cats[p.cat as keyof typeof cats])}</span><h3><a href="/products/${p.slug}">${esc(p.name)}</a></h3><p class="muted">${esc(p.desc)}</p><div class="price">${p.price} ر.س</div>${btn("/products/"+p.slug,"عرض المنتج","green")}</article>`).join("")}</div>`;
const projectCards=()=>`<div class="grid3">${projects.map(p=>`<article class="card"><span class="badge">${p.items.length} منتجات مقترحة</span><h3>${p.name}</h3><p>${p.desc}</p>${btn("/projects/"+p.slug,"عرض السلة","green")}</article>`).join("")}</div>`;
function home(){return layout("مواد البناء والتشطيب توصلك للموقع",`
<section class="hero"><div class="wrap hero-grid"><div><span class="badge">منصة توريد ذكية للسعودية</span><h1>مواد البناء والتشطيب توصلك للموقع</h1><p>اختر نوع الشغل، راجع السلة المقترحة، عدّل الكميات وأرسل طلبك أو اطلب عرض سعر.</p><div style="display:flex;gap:10px;flex-wrap:wrap">${btn("/projects","اختر مشروعك")}${btn("/contractors","سجل كمقاول","green")}${btn("/suppliers","انضم كمورد","ghost")}</div></div><div class="panel"><span class="badge">سلة ذكية</span><h2>تركيب بلاط</h2><p>فواصل بلاط × 5</p><p>إسفين تسوية × 4</p><p>قاطع بلاط × 1</p>${btn("/projects/tile-installation","عرض السلة")}</div></div></section>
<section class="section"><div class="wrap"><div class="kpis"><div class="kpi"><b>حسب المشروع</b>بدل البحث منتج منتج</div><div class="kpi"><b>سلة ذكية</b>اقتراحات عملية</div><div class="kpi"><b>للموقع</b>توصيل حسب المدينة</div><div class="kpi"><b>واتساب</b>تحويل سريع للطلب</div></div></div></section>
<section class="section"><div class="wrap"><h2>اختر مشروعك وابدأ الطلب</h2>${projectCards()}</div></section><section class="section"><div class="wrap"><h2>منتجات يطلبها الفنيون يوميًا</h2>${productCards()}</div></section>`)}
function projectsPage(){return layout("المشاريع",`<main class="section"><div class="wrap"><h1>اطلب موادك حسب نوع المشروع</h1><p>اختر نوع الشغل وشاهد السلة المقترحة ثم أرسل الطلب أو اطلب عرض سعر.</p>${projectCards()}</div></main>`)}
function projectPage(slug:string){const p=projects.find(x=>x.slug===slug);if(!p)return null;const items=p.items.map(s=>products.find(x=>x.slug===s)).filter(Boolean) as any[];const msg=encodeURIComponent("مرحبًا، أريد طلب سلة مشروع من BuildFlow:\nنوع المشروع: "+p.name+"\nالمدينة: الرياض\n"+items.map(x=>x.name+" - الكمية: 1").join("\n"));return layout(p.name,`<main class="section"><div class="wrap"><span class="badge">سلة ذكية</span><h1>سلة مواد وأدوات ${p.name}</h1><p>${p.desc}</p><table><tr><th>المنتج</th><th>التصنيف</th><th>الكمية</th></tr>${items.map(x=>`<tr><td><a href="/products/${x.slug}">${x.name}</a></td><td>${cats[x.cat as keyof typeof cats]}</td><td>1</td></tr>`).join("")}</table><div style="margin-top:18px"><a class="btn primary" href="https://wa.me/${wa}?text=${msg}">إرسال عبر واتساب</a> ${btn("/request-quotation","طلب عرض سعر","green")}</div></div></main>`)}
function productsPage(){return layout("المنتجات",`<main class="section"><div class="wrap"><h1>منتجات مواد وأدوات البناء والتشطيب</h1>${productCards()}</div></main>`)}
function productPage(slug:string){const p=products.find(x=>x.slug===slug);if(!p)return null;const msg=encodeURIComponent("مرحبًا، أريد طلب المنتج من BuildFlow:\nالمنتج: "+p.name+"\nالكمية: 1\nالمدينة: الرياض");return layout(p.name,`<main class="section"><div class="wrap hero-grid"><div><span class="badge">${cats[p.cat as keyof typeof cats]}</span><h1>${p.name}</h1><p>${p.desc}</p><div class="price">${p.price} ر.س</div><p>الحالة: متوفر</p><a class="btn primary" href="https://wa.me/${wa}?text=${msg}">اطلب عبر واتساب</a></div><div class="panel"><h2>مناسب للموقع</h2><p>متاح مبدئيًا في الرياض مع التوسع لباقي مدن المملكة.</p>${btn("/request-quotation","طلب عرض سعر","green")}</div></div></main>`)}
function formPage(type:string){
 const cfg:any={contractor:["حساب خاص للفنيين والمقاولين","/lead/contractor","سجل الآن"],supplier:["انضم كمورد في BuildFlow","/lead/supplier","انضم كمورد"],quote:["طلب عرض سعر","/lead/quote","إرسال الطلب"],contact:["تواصل معنا","/lead/contact","إرسال الرسالة"]}[type];
 return layout(cfg[0],`<main class="section"><div class="wrap" style="max-width:760px"><h1>${cfg[0]}</h1><div class="panel"><form method="post" action="${cfg[1]}"><input name="name" placeholder="الاسم" required><input name="phone" placeholder="رقم الجوال" required><select name="city"><option>الرياض</option><option>جدة</option><option>الدمام</option><option>مكة</option><option>المدينة</option></select>${type==="supplier"?'<input name="company" placeholder="اسم الشركة"><input name="categories" placeholder="التصنيفات المتوفرة">':""}${type==="quote"?'<input name="project" placeholder="نوع المشروع"><textarea name="products" placeholder="المنتجات والكميات"></textarea>':""}<textarea name="notes" placeholder="ملاحظات"></textarea><button class="btn primary">${cfg[2]}</button></form></div></div></main>`)}
function about(){return layout("عن BuildFlow",`<main class="section"><div class="wrap"><h1>عن BuildFlow</h1><div class="panel"><p>BuildFlow منصة توريد ذكية تربط احتياجات مواقع البناء والتشطيب بطريقة منظمة تعتمد على نوع المشروع والسلة الذكية والطلب للموقع.</p><h2>المهمة</h2><p>تسهيل توريد مواد البناء والتشطيب للفنيين والمقاولين وأصحاب المنازل.</p><h2>الرؤية</h2><p>أن تصبح BuildFlow منصة التشغيل الأولى لمشتريات مواقع التشطيب والبناء الصغيرة والمتوسطة في السعودية.</p></div></div></main>`)}
function authorized(req:Request){const h=req.headers.get("authorization")||"";if(!h.startsWith("Basic "))return false;try{const [u,p]=atob(h.slice(6)).split(":");return u===adminUser&&p===adminSecret}catch{return false}}
function admin(){return layout("لوحة التحكم",`<main class="section"><div class="wrap"><h1>لوحة تحكم BuildFlow</h1><div class="kpis"><div class="kpi"><b>${products.length}</b>منتجات</div><div class="kpi"><b>${projects.length}</b>مشاريع</div><div class="kpi"><b>${leads.filter(x=>x.type==="quote").length}</b>عروض سعر</div><div class="kpi"><b>${leads.length}</b>Leads</div></div><section class="section"><h2>أحدث الطلبات</h2><table><tr><th>النوع</th><th>الاسم</th><th>الجوال</th><th>المدينة</th></tr>${leads.slice().reverse().map(x=>`<tr><td>${x.type}</td><td>${esc(x.data.name||x.data.company||"")}</td><td>${esc(x.data.phone||"")}</td><td>${esc(x.data.city||"")}</td></tr>`).join("")||'<tr><td colspan="4">لا توجد بيانات بعد.</td></tr>'}</table></section></div></main>`)}
async function form(req:Request){return Object.fromEntries(new URLSearchParams(await req.text()))}
const html=(s:string,status=200,headers:any={})=>new Response(s,{status,headers:{"content-type":"text/html; charset=utf-8",...headers}});
const server=Bun.serve({port,hostname:"0.0.0.0",async fetch(req){
 const url=new URL(req.url),p=url.pathname;
 if(p==="/api/health")return Response.json({ok:true,service:"buildflow",version:"0.3.0"});
 if(p==="/robots.txt")return new Response("User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: "+url.origin+"/sitemap.xml\n",{headers:{"content-type":"text/plain; charset=utf-8"}});
 if(p==="/sitemap.xml"){const urls=["/","/projects","/products","/contractors","/suppliers","/about","/contact","/request-quotation",...projects.map(x=>"/projects/"+x.slug),...products.map(x=>"/products/"+x.slug)];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(x=>"<url><loc>"+url.origin+x+"</loc></url>").join("")+"</urlset>",{headers:{"content-type":"application/xml; charset=utf-8"}})}
 if(p==="/admin"){if(!authorized(req))return new Response("BuildFlow Admin",{status:401,headers:{"WWW-Authenticate":'Basic realm="BuildFlow Admin"'}});return html(admin())}
 if(p.startsWith("/lead/")&&req.method==="POST"){const data=await form(req);leads.push({type:p.split("/").pop(),data,created_at:new Date().toISOString()});await saveLeads();return html(layout("تم الاستلام",'<main class="section"><div class="wrap"><div class="panel"><h1>تم الاستلام بنجاح</h1><p>سيتم التواصل معك قريبًا.</p>'+btn("/","العودة للرئيسية","green")+'</div></div></main>'))}
 if(req.method!=="GET")return new Response("Not Found",{status:404});
 if(p==="/")return html(home());
 if(p==="/projects")return html(projectsPage());
 if(p.startsWith("/projects/")){const x=projectPage(p.slice(10));return x?html(x):new Response("Not Found",{status:404})}
 if(p==="/products")return html(productsPage());
 if(p.startsWith("/products/")){const x=productPage(p.slice(10));return x?html(x):new Response("Not Found",{status:404})}
 if(p==="/contractors")return html(formPage("contractor"));
 if(p==="/suppliers")return html(formPage("supplier"));
 if(p==="/request-quotation")return html(formPage("quote"));
 if(p==="/contact")return html(formPage("contact"));
 if(p==="/about")return html(about());
 return html(layout("404","<main class='section'><div class='wrap'><h1>الصفحة غير موجودة</h1></div></main>"),404);
}});
console.log("BuildFlow online",server.port);

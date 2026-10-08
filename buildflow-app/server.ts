
const port=Number(Bun.env.PORT||3000);
let wa=(Bun.env.WHATSAPP_NUMBER||"966500000000").replace(/\D/g,"");
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
try{if(!(await Bun.file(catalogFile).exists()))await saveCatalog()}catch(e){console.error("catalog_seed_error",String(e))}
try{if(!(await Bun.file(settingsFile).exists()))await saveSettings()}catch(e){console.error("settings_seed_error",String(e))}

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
function projectPage(slug:string){const p=projects.find(x=>x.slug===slug);if(!p)return null;const items=p.items.map((s:string)=>products.find(x=>x.slug===s)).filter(Boolean) as any[];const seoTitle=p.seo_title||p.name,meta=p.meta_description||p.desc;return layout(seoTitle,`<main class="section"><div class="wrap"><span class="badge">سلة ذكية</span><h1>سلة مواد وأدوات ${esc(p.name)}</h1><p>${esc(p.desc)}</p><div style="overflow:auto"><table id="smartCart"><tr><th>اختيار</th><th>المنتج</th><th>التصنيف</th><th>الكمية</th></tr>${items.map(x=>`<tr><td><input class="inc" type="checkbox" checked style="width:auto"></td><td><a href="/products/${x.slug}" data-product="${esc(x.name)}">${esc(x.name)}</a></td><td>${esc(cats[x.cat]||x.cat)}</td><td><input class="qty" type="number" min="1" value="1" style="max-width:90px"></td></tr>`).join("")}</table></div><label style="display:block;margin-top:16px">المدينة<select id="cartCity"><option>الرياض</option><option>جدة</option><option>الدمام</option><option>الخبر</option><option>مكة</option><option>المدينة</option><option>خميس مشيط</option><option>أبها</option><option>القصيم</option></select></label><label style="display:block;margin-top:12px">ملاحظات<textarea id="cartNotes" placeholder="موقع التوصيل أو أي ملاحظات"></textarea></label><div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap"><a id="waCart" class="btn primary" href="#">إرسال الطلب عبر واتساب</a> ${btn("/request-quotation?project="+encodeURIComponent(p.name),"طلب عرض سعر","green")} ${btn("/products","إضافة منتجات أخرى","ghost")}</div><script>(()=>{const b=document.getElementById("waCart");function build(){const rows=[...document.querySelectorAll("#smartCart tr")].slice(1);const lines=rows.filter(r=>r.querySelector(".inc").checked).map(r=>{const n=r.querySelector("[data-product]").textContent.trim(),q=r.querySelector(".qty").value;return n+" - الكمية: "+q});const city=document.getElementById("cartCity").value,notes=document.getElementById("cartNotes").value;const m="مرحبًا، أريد طلب سلة مشروع من BuildFlow:\nنوع المشروع: ${p.name}\nالمدينة: "+city+"\nالمنتجات:\n"+lines.join("\n")+"\nملاحظات: "+notes;b.href="https://wa.me/${wa}?text="+encodeURIComponent(m)}document.addEventListener("input",build);document.addEventListener("change",build);build()})()</script></div></main>`,meta)}
function productsPage(url?:URL){const q=String(url?.searchParams.get("q")||"").trim(),cat=String(url?.searchParams.get("category")||"");let arr=products;if(q)arr=arr.filter(x=>String(x.name).includes(q)||String(x.desc).includes(q));if(cat)arr=arr.filter(x=>x.cat===cat);return layout("المنتجات",`<main class="section"><div class="wrap"><h1>منتجات مواد وأدوات البناء والتشطيب</h1><form method="get" action="/products" style="grid-template-columns:2fr 1fr auto;margin-bottom:20px"><input name="q" value="${esc(q)}" placeholder="ابحث عن منتج"><select name="category"><option value="">كل التصنيفات</option>${Object.entries(cats).map(([k,v])=>`<option value="${esc(k)}" ${cat===k?"selected":""}>${esc(v)}</option>`).join("")}</select><button class="btn green">بحث</button></form>${productCards(arr)}${arr.length?"":'<div class="panel">لا توجد نتائج مطابقة.</div>'}</div></main>`)}
function productPage(slug:string){const p=products.find(x=>x.slug===slug);if(!p)return null;const msg=encodeURIComponent("مرحبًا، أريد طلب المنتج من BuildFlow:\nالمنتج: "+p.name+"\nالكمية: 1\nالمدينة: الرياض");return layout(p.seo_title||p.name,`<main class="section"><div class="wrap hero-grid"><div><span class="badge">${cats[p.cat as keyof typeof cats]}</span><h1>${p.name}</h1><p>${p.desc}</p><div class="price">${p.price} ر.س</div><p>الحالة: متوفر</p><a class="btn primary" href="https://wa.me/${wa}?text=${msg}">اطلب عبر واتساب</a></div><div class="panel"><h2>مناسب للموقع</h2><p>متاح مبدئيًا في الرياض مع التوسع لباقي مدن المملكة.</p>${btn("/request-quotation","طلب عرض سعر","green")}</div></div></main>`,p.meta_description||p.desc)}
function formPage(type:string){
 const cfg:any={contractor:["حساب خاص للفنيين والمقاولين","/lead/contractor","سجل الآن"],supplier:["انضم كمورد في BuildFlow","/lead/supplier","انضم كمورد"],quote:["طلب عرض سعر","/lead/quote","إرسال الطلب"],contact:["تواصل معنا","/lead/contact","إرسال الرسالة"]}[type];
 return layout(cfg[0],`<main class="section"><div class="wrap" style="max-width:760px"><h1>${cfg[0]}</h1><div class="panel"><form method="post" action="${cfg[1]}"><input name="name" placeholder="الاسم" required><input name="phone" placeholder="رقم الجوال" required><select name="city"><option>الرياض</option><option>جدة</option><option>الدمام</option><option>مكة</option><option>المدينة</option></select>${type==="supplier"?'<input name="company" placeholder="اسم الشركة"><input name="categories" placeholder="التصنيفات المتوفرة">':""}${type==="quote"?'<input name="project" placeholder="نوع المشروع"><textarea name="products" placeholder="المنتجات والكميات"></textarea>':""}<textarea name="notes" placeholder="ملاحظات"></textarea><button class="btn primary">${cfg[2]}</button></form></div></div></main>`)}
function about(){return layout("عن BuildFlow",`<main class="section"><div class="wrap"><h1>عن BuildFlow</h1><div class="panel"><p>BuildFlow منصة توريد ذكية تربط احتياجات مواقع البناء والتشطيب بطريقة منظمة تعتمد على نوع المشروع والسلة الذكية والطلب للموقع.</p><h2>المهمة</h2><p>تسهيل توريد مواد البناء والتشطيب للفنيين والمقاولين وأصحاب المنازل.</p><h2>الرؤية</h2><p>أن تصبح BuildFlow منصة التشغيل الأولى لمشتريات مواقع التشطيب والبناء الصغيرة والمتوسطة في السعودية.</p></div></div></main>`)}

const adminSessions=new Map<string,{csrf:string,created:number}>();
function cookieValue(req:Request,name:string){for(const part of (req.headers.get("cookie")||"").split(";")){const i=part.indexOf("=");if(i>0&&part.slice(0,i).trim()===name)return decodeURIComponent(part.slice(i+1).trim())}return ""}
function basicAuthorized(req:Request){const h=req.headers.get("authorization")||"";if(!h.startsWith("Basic "))return false;try{const [u,p]=atob(h.slice(6)).split(":");return u===adminUser&&p===adminSecret}catch{return false}}
function adminSession(req:Request){const t=cookieValue(req,"bf_admin");const s=adminSessions.get(t);if(!s)return null;if(Date.now()-s.created>12*60*60*1000){adminSessions.delete(t);return null}return {token:t,...s}}
function adminAuthorized(req:Request){return !!adminSession(req)||basicAuthorized(req)}
function csrfOk(req:Request,data:any){const s=adminSession(req);return !!s&&String(data.csrf||"")===s.csrf}
function adminNav(){return '<div class="adminbar"><a class="btn green" href="/admin">Dashboard</a><a class="btn ghost" href="/admin/products">Products</a><a class="btn ghost" href="/admin/categories">Categories</a><a class="btn ghost" href="/admin/projects">Projects</a><a class="btn ghost" href="/admin/smart-carts">Smart Carts</a><a class="btn ghost" href="/admin/leads?type=quote">Orders / RFQ</a><a class="btn ghost" href="/admin/leads?type=contractor">Contractors</a><a class="btn ghost" href="/admin/leads?type=supplier">Suppliers</a><a class="btn ghost" href="/admin/leads?type=contact">Messages</a><a class="btn ghost" href="/admin/settings">SEO & Settings</a><a class="btn ghost" href="/admin/logout">Logout</a></div>'}
function adminLogin(msg=""){return layout("دخول الإدارة",`<main class="section"><div class="wrap" style="max-width:560px"><h1>دخول إدارة BuildFlow</h1>${msg?'<div class="panel" style="border-right:4px solid var(--o);margin-bottom:12px">'+esc(msg)+'</div>':""}<div class="panel"><form method="post" action="/admin/login"><input name="email" type="text" placeholder="البريد الإلكتروني أو اسم المستخدم" required><input name="password" type="password" placeholder="كلمة المرور" required><button class="btn green">دخول</button></form></div></div></main>`)}
function adminHome(){return layout("لوحة التحكم",`<main class="section"><div class="wrap"><h1>لوحة تحكم BuildFlow</h1>${adminNav()}<div class="kpis"><div class="kpi"><b>${products.length}</b>منتجات</div><div class="kpi"><b>${projects.length}</b>مشاريع</div><div class="kpi"><b>${leads.filter(x=>x.type==="quote").length}</b>طلبات عروض السعر</div><div class="kpi"><b>${leads.length}</b>إجمالي Leads</div></div><section class="section"><h2>أحدث الطلبات والـ Leads</h2>${leadTable(leads.slice().reverse().slice(0,15))}</section></div></main>`)}
function leadTable(rows:any[]){return `<div style="overflow:auto"><table><tr><th>النوع</th><th>الاسم</th><th>الجوال</th><th>المدينة</th><th>الحالة</th><th>التاريخ</th></tr>${rows.map(x=>`<tr><td>${esc(x.type)}</td><td>${esc(x.data?.name||x.data?.company||"")}</td><td>${esc(x.data?.phone||"")}</td><td>${esc(x.data?.city||"")}</td><td>${esc(x.status||"New")}</td><td>${esc((x.created_at||"").slice(0,16).replace("T"," "))}</td></tr>`).join("")||'<tr><td colspan="6">لا توجد بيانات بعد.</td></tr>'}</table></div>`}
function adminProducts(){return layout("إدارة المنتجات",`<main class="section"><div class="wrap"><h1>إدارة المنتجات</h1>${adminNav()}<p>${btn("/admin/product/new","إضافة منتج","primary")}</p><div style="overflow:auto"><table><tr><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>المخزون</th><th>إجراء</th></tr>${products.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(cats[p.cat]||p.cat)}</td><td>${esc(p.price)} ر.س</td><td>${esc(p.stock||"متوفر")}</td><td><a href="/admin/product/edit?slug=${encodeURIComponent(p.slug)}">تعديل</a></td></tr>`).join("")}</table></div></div></main>`)}
function adminProductForm(p:any,csrf:string,isNew=false){p=p||{};return layout(isNew?"إضافة منتج":"تعديل منتج",`<main class="section"><div class="wrap" style="max-width:850px"><h1>${isNew?"إضافة منتج":"تعديل منتج"}</h1>${adminNav()}<div class="panel"><form method="post" action="/admin/product/save"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="old_slug" value="${esc(p.slug||"")}"><label>اسم المنتج<input name="name" value="${esc(p.name||"")}" required></label><label>Slug<input name="slug" dir="ltr" value="${esc(p.slug||"")}" required></label><label>التصنيف<select name="cat">${Object.entries(cats).map(([k,v])=>`<option value="${esc(k)}" ${p.cat===k?"selected":""}>${esc(v)}</option>`).join("")}</select></label><label>السعر<input name="price" type="number" step="0.01" min="0" value="${esc(p.price??0)}"></label><label>حالة المخزون<select name="stock"><option ${(p.stock||"متوفر")==="متوفر"?"selected":""}>متوفر</option><option ${p.stock==="غير متوفر"?"selected":""}>غير متوفر</option><option ${p.stock==="حسب الطلب"?"selected":""}>حسب الطلب</option></select></label><label>الوصف<textarea name="desc" required>${esc(p.desc||"")}</textarea></label><h2>SEO</h2><label>SEO Title<input name="seo_title" value="${esc(p.seo_title||p.name||"")}"></label><label>Meta Description<textarea name="meta_description">${esc(p.meta_description||p.desc||"")}</textarea></label><label>Focus Keywords<input name="focus_keywords" value="${esc(p.focus_keywords||"")}"></label><button class="btn green">حفظ المنتج</button></form>${!isNew?`<form method="post" action="/admin/product/delete" style="margin-top:12px"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="slug" value="${esc(p.slug||"")}"><button class="btn ghost" onclick="return confirm('حذف المنتج؟')">حذف المنتج</button></form>`:""}</div></div></main>`)}
function adminCategories(csrf:string){return layout("إدارة التصنيفات",`<main class="section"><div class="wrap"><h1>إدارة التصنيفات</h1>${adminNav()}<div class="grid3">${Object.entries(cats).map(([k,v])=>`<div class="card"><h3>${esc(v)}</h3><p class="muted">${esc(k)}</p><form method="post" action="/admin/category/save"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="old_key" value="${esc(k)}"><input name="key" value="${esc(k)}" required><input name="name" value="${esc(v)}" required><button class="btn green">حفظ</button></form></div>`).join("")}<div class="card"><h3>تصنيف جديد</h3><form method="post" action="/admin/category/save"><input type="hidden" name="csrf" value="${esc(csrf)}"><input name="key" placeholder="key مثل waterproofing" required><input name="name" placeholder="الاسم العربي" required><button class="btn primary">إضافة</button></form></div></div></div></main>`)}
function adminProjects(){return layout("إدارة المشاريع",`<main class="section"><div class="wrap"><h1>إدارة المشاريع والسلال الذكية</h1>${adminNav()}<p>${btn("/admin/project/new","إضافة مشروع","primary")}</p><div style="overflow:auto"><table><tr><th>المشروع</th><th>Slug</th><th>عدد المنتجات</th><th>إجراء</th></tr>${projects.map(p=>`<tr><td>${esc(p.name)}</td><td dir="ltr">${esc(p.slug)}</td><td>${p.items?.length||0}</td><td><a href="/admin/project/edit?slug=${encodeURIComponent(p.slug)}">تعديل السلة</a></td></tr>`).join("")}</table></div></div></main>`)}
function adminProjectForm(p:any,csrf:string,isNew=false){p=p||{};return layout(isNew?"إضافة مشروع":"تعديل مشروع",`<main class="section"><div class="wrap" style="max-width:900px"><h1>${isNew?"إضافة مشروع":"تعديل مشروع وسلته الذكية"}</h1>${adminNav()}<div class="panel"><form method="post" action="/admin/project/save"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="old_slug" value="${esc(p.slug||"")}"><label>اسم المشروع<input name="name" value="${esc(p.name||"")}" required></label><label>Slug<input name="slug" dir="ltr" value="${esc(p.slug||"")}" required></label><label>الوصف<textarea name="desc" required>${esc(p.desc||"")}</textarea></label><label>منتجات السلة - Slugs مفصولة بفاصلة<textarea name="items" dir="ltr">${esc((p.items||[]).join(","))}</textarea></label><h2>SEO</h2><label>SEO Title<input name="seo_title" value="${esc(p.seo_title||p.name||"")}"></label><label>Meta Description<textarea name="meta_description">${esc(p.meta_description||p.desc||"")}</textarea></label><label>Focus Keywords<input name="focus_keywords" value="${esc(p.focus_keywords||"")}"></label><button class="btn green">حفظ المشروع</button></form>${!isNew?`<form method="post" action="/admin/project/delete" style="margin-top:12px"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="slug" value="${esc(p.slug||"")}"><button class="btn ghost" onclick="return confirm('حذف المشروع؟')">حذف المشروع</button></form>`:""}</div></div></main>`)}
function adminLeads(type:string,csrf:string){const rows=type?leads.filter(x=>x.type===type):leads;return layout("إدارة الطلبات والـ Leads",`<main class="section"><div class="wrap"><h1>إدارة الطلبات والـ Leads</h1>${adminNav()}<div style="overflow:auto"><table><tr><th>النوع</th><th>الاسم</th><th>الجوال</th><th>المدينة</th><th>الحالة</th><th>تحديث</th></tr>${rows.slice().reverse().map(x=>`<tr><td>${esc(x.type)}</td><td>${esc(x.data?.name||x.data?.company||"")}</td><td>${esc(x.data?.phone||"")}</td><td>${esc(x.data?.city||"")}</td><td>${esc(x.status||"New")}</td><td><form method="post" action="/admin/lead/status" style="display:flex;grid-template-columns:1fr auto;gap:6px"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="id" value="${esc(x.id||x.created_at)}"><select name="status">${["New","Contacted","Qualified","Quoted","Confirmed","Converted","Rejected","Cancelled"].map(s=>`<option ${(x.status||"New")===s?"selected":""}>${s}</option>`).join("")}</select><button class="btn green">حفظ</button></form></td></tr>`).join("")||'<tr><td colspan="6">لا توجد بيانات.</td></tr>'}</table></div></div></main>`)}
function adminSettings(csrf:string){return layout("SEO وإعدادات الموقع",`<main class="section"><div class="wrap" style="max-width:850px"><h1>SEO وإعدادات الموقع</h1>${adminNav()}<div class="panel"><form method="post" action="/admin/settings/save"><input type="hidden" name="csrf" value="${esc(csrf)}"><label>Site Name<input name="site_name" value="${esc(siteSettings.site_name||"BuildFlow")}"></label><label>Default SEO Title<input name="default_title" value="${esc(siteSettings.default_title||"")}"></label><label>Default Meta Description<textarea name="default_meta">${esc(siteSettings.default_meta||"")}</textarea></label><label>المدينة الافتراضية<input name="default_city" value="${esc(siteSettings.default_city||"الرياض")}"></label><label>رقم واتساب بصيغة دولية<input name="whatsapp" dir="ltr" value="${esc(wa)}"></label><button class="btn green">حفظ الإعدادات</button></form></div></div></main>`)}
async function form(req:Request){return Object.fromEntries(new URLSearchParams(await req.text()))}
const html=(s:string,status=200,headers:any={})=>new Response(s,{status,headers:{"content-type":"text/html; charset=utf-8",...headers}});
const server=Bun.serve({port,hostname:"0.0.0.0",async fetch(req){
 const url=new URL(req.url),p=url.pathname;
 if(p==="/api/health"){const checks={products:products.length>=25,projects:projects.length>=6,categories:Object.keys(cats).length>=7,volume:true};try{checks.volume=await Bun.file("/data").exists()||await Bun.file(catalogFile).exists()}catch{checks.volume=false}const ok=Object.values(checks).every(Boolean);return Response.json({ok,service:"buildflow",version:"0.5.0",checks,counts:{products:products.length,projects:projects.length,categories:Object.keys(cats).length,leads:leads.length}},{status:ok?200:503})}
 if(p==="/robots.txt")return new Response("User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: "+url.origin+"/sitemap.xml\n",{headers:{"content-type":"text/plain; charset=utf-8"}});
 if(p==="/sitemap.xml"){const urls=["/","/projects","/products","/contractors","/suppliers","/about","/contact","/request-quotation",...projects.map(x=>"/projects/"+x.slug),...products.map(x=>"/products/"+x.slug)];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(x=>"<url><loc>"+url.origin+x+"</loc></url>").join("")+"</urlset>",{headers:{"content-type":"application/xml; charset=utf-8"}})}
 if(p==="/admin/login"&&req.method==="GET"){if(adminSession(req))return new Response("",{status:303,headers:{location:"/admin"}});return html(adminLogin())}
 if(p==="/admin/login"&&req.method==="POST"){
   const data:any=await form(req);
   if(String(data.email||"")!==String(adminUser)||String(data.password||"")!==String(adminSecret))return html(adminLogin("بيانات الدخول غير صحيحة."),401);
   const token=crypto.randomUUID(),csrf=crypto.randomUUID();adminSessions.set(token,{csrf,created:Date.now()});
   return new Response("",{status:303,headers:{location:"/admin","set-cookie":"bf_admin="+encodeURIComponent(token)+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200"}});
 }
 if(p==="/admin/logout"){const t=cookieValue(req,"bf_admin");if(t)adminSessions.delete(t);return new Response("",{status:303,headers:{location:"/admin/login","set-cookie":"bf_admin=; Path=/; Max-Age=0"}})}
 if(p.startsWith("/admin")){
   const session=adminSession(req);
   if(!session)return new Response("",{status:303,headers:{location:"/admin/login"}});
   if(p==="/admin"&&req.method==="GET")return html(adminHome());
   if(p==="/admin/products"&&req.method==="GET")return html(adminProducts());
   if(p==="/admin/product/new"&&req.method==="GET")return html(adminProductForm(null,session.csrf,true));
   if(p==="/admin/product/edit"&&req.method==="GET")return html(adminProductForm(products.find(x=>x.slug===url.searchParams.get("slug")),session.csrf,false));
   if(p==="/admin/categories"&&req.method==="GET")return html(adminCategories(session.csrf));
   if((p==="/admin/projects"||p==="/admin/smart-carts")&&req.method==="GET")return html(adminProjects());
   if(p==="/admin/project/new"&&req.method==="GET")return html(adminProjectForm(null,session.csrf,true));
   if(p==="/admin/project/edit"&&req.method==="GET")return html(adminProjectForm(projects.find(x=>x.slug===url.searchParams.get("slug")),session.csrf,false));
   if(p==="/admin/leads"&&req.method==="GET")return html(adminLeads(url.searchParams.get("type")||"",session.csrf));
   if(p==="/admin/settings"&&req.method==="GET")return html(adminSettings(session.csrf));
   if(req.method==="POST"){
     const data:any=await form(req);
     if(!csrfOk(req,data))return new Response("Forbidden",{status:403});
     if(p==="/admin/product/save"){
       const slug=String(data.slug||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
       if(!slug||!String(data.name||"").trim())return new Response("Invalid product",{status:400});
       const product:any={slug,name:String(data.name).trim(),cat:String(data.cat||"hand"),price:Number(data.price||0),stock:String(data.stock||"متوفر"),desc:String(data.desc||"").trim(),seo_title:String(data.seo_title||"").trim(),meta_description:String(data.meta_description||"").trim(),focus_keywords:String(data.focus_keywords||"").trim()};
       const old=String(data.old_slug||"");
       const idx=products.findIndex(x=>x.slug===old||x.slug===slug);
       if(idx>=0)products[idx]=product;else products.push(product);
       if(old&&old!==slug)for(const pr of projects)pr.items=(pr.items||[]).map((x:string)=>x===old?slug:x);
       await saveCatalog();return new Response("",{status:303,headers:{location:"/admin/products"}});
     }
     if(p==="/admin/product/delete"){
       const slug=String(data.slug||"");products=products.filter(x=>x.slug!==slug);for(const pr of projects)pr.items=(pr.items||[]).filter((x:string)=>x!==slug);await saveCatalog();return new Response("",{status:303,headers:{location:"/admin/products"}});
     }
     if(p==="/admin/category/save"){
       const key=String(data.key||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-"),old=String(data.old_key||"").trim(),name=String(data.name||"").trim();
       if(!key||!name)return new Response("Invalid category",{status:400});
       if(old&&old!==key){for(const pr of products)if(pr.cat===old)pr.cat=key;delete cats[old]}cats[key]=name;await saveCatalog();return new Response("",{status:303,headers:{location:"/admin/categories"}});
     }
     if(p==="/admin/project/save"){
       const slug=String(data.slug||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
       const project:any={slug,name:String(data.name||"").trim(),desc:String(data.desc||"").trim(),items:String(data.items||"").split(",").map((x:string)=>x.trim()).filter(Boolean),seo_title:String(data.seo_title||"").trim(),meta_description:String(data.meta_description||"").trim(),focus_keywords:String(data.focus_keywords||"").trim()};
       if(!slug||!project.name)return new Response("Invalid project",{status:400});
       const old=String(data.old_slug||""),idx=projects.findIndex(x=>x.slug===old||x.slug===slug);if(idx>=0)projects[idx]=project;else projects.push(project);await saveCatalog();return new Response("",{status:303,headers:{location:"/admin/projects"}});
     }
     if(p==="/admin/project/delete"){projects=projects.filter(x=>x.slug!==String(data.slug||""));await saveCatalog();return new Response("",{status:303,headers:{location:"/admin/projects"}})}
     if(p==="/admin/lead/status"){
       const id=String(data.id||""),lead=leads.find(x=>String(x.id||x.created_at)===id);if(lead)lead.status=String(data.status||"New");await saveLeads();return new Response("",{status:303,headers:{location:"/admin/leads"}});
     }
     if(p==="/admin/settings/save"){
       siteSettings.site_name=String(data.site_name||"BuildFlow").trim();siteSettings.default_title=String(data.default_title||"").trim();siteSettings.default_meta=String(data.default_meta||"").trim();siteSettings.default_city=String(data.default_city||"الرياض").trim();wa=String(data.whatsapp||"").replace(/\D/g,"");await saveSettings();return new Response("",{status:303,headers:{location:"/admin/settings"}});
     }
   }
   return new Response("Not Found",{status:404});
 }
 if(p.startsWith("/lead/")&&req.method==="POST"){const data=await form(req);leads.push({id:crypto.randomUUID(),type:p.split("/").pop(),status:"New",data,created_at:new Date().toISOString()});await saveLeads();return html(layout("تم الاستلام",'<main class="section"><div class="wrap"><div class="panel"><h1>تم الاستلام بنجاح</h1><p>سيتم التواصل معك قريبًا.</p>'+btn("/","العودة للرئيسية","green")+'</div></div></main>'))}
 if(req.method!=="GET")return new Response("Not Found",{status:404});
 if(p==="/")return html(home());
 if(p==="/projects")return html(projectsPage());
 if(p.startsWith("/projects/")){const x=projectPage(p.slice(10));return x?html(x):new Response("Not Found",{status:404})}
 if(p==="/products")return html(productsPage(url));
 if(p.startsWith("/products/")){const x=productPage(p.slice(10));return x?html(x):new Response("Not Found",{status:404})}
 if(p==="/contractors")return html(formPage("contractor"));
 if(p==="/suppliers")return html(formPage("supplier"));
 if(p==="/request-quotation")return html(formPage("quote"));
 if(p==="/contact")return html(formPage("contact"));
 if(p==="/about")return html(about());
 return html(layout("404","<main class='section'><div class='wrap'><h1>الصفحة غير موجودة</h1></div></main>"),404);
}});
console.log("BuildFlow online",server.port);

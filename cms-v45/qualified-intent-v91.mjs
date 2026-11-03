import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2]||'release', mark='<!-- QUALIFIED_INTENT_V91 -->';
const notes=[
 {file:'ar/pages/b2b-lead-generation/index.html',heading:'ما المقصود بتوليد العملاء المحتملين عبر الإنترنت للشركات؟',
  answer:'توليد العملاء المحتملين عبر الإنترنت يعني الوصول إلى شركات لديها احتياج فعلي، وتوجيهها من نتائج البحث أو الحملات إلى صفحة خدمة واضحة ثم طلب عرض سعر يمكن لفريق المبيعات متابعته. لا تُعدّ الزيارة أو نقرة واتساب وحدها فرصة بيع مؤهلة.',
  points:[['قبل بدء الحملة','حدد العميل المثالي: النشاط، منطقة الخدمة، وحجم الاحتياج ونوع القرار المطلوب.'],['بعد إرسال الطلب','سجل الخدمة المطلوبة ووسيلة الرد ومرحلة متابعة المبيعات، مع فصل الطلب الحقيقي عن نقرات الأزرار.'],['قبل زيادة الميزانية','قارن نسبة الطلبات المؤهلة ومصادرها، وليس عدد الزيارات وحده.']],
  link:'/ar/contact.html?service=b2b-leads',linkText:'ناقش خطة توليد عملاء B2B' },
 {file:'en/pages/b2b-lead-generation/index.html',heading:'What does B2B lead generation in Saudi Arabia actually mean?',
  answer:'B2B lead generation connects buyers with a clear business need to a relevant service page and an enquiry or quotation request. Effective measurement separates page visits, contact clicks, submitted requests and sales-qualified opportunities.',
  points:[['Before launch','Define the ideal company, region, enquiry criteria and buying stage.'],['After an enquiry','Capture the requested service, a reply method and sales follow-up status.'],['Before scaling','Compare qualified leads by source rather than optimizing for raw traffic alone.']],
  link:'/en/contact.html?service=b2b-leads',linkText:'Discuss a B2B lead-generation plan' },
 {file:'en/pages/seo-consultant-riyadh/index.html',heading:'SEO services in Riyadh versus an SEO consultant: which do you need?',
  answer:'SEO services in Riyadh can include indexability checks, commercial landing pages, content planning, internal linking and performance reporting. An SEO consultant helps diagnose priorities and guide delivery. Choose the scope based on your site, resources and conversion goals rather than a ranking guarantee.',
  points:[['Your site has very low impressions','Review indexing, search intent, page quality and gaps in existing services before creating new pages.'],['Your pages appear but receive few clicks','Segment search queries by ranking position, then test titles and descriptions where visibility is already meaningful.'],['You receive visitors without enquiries','Improve the service offer, contact journey and measurement of completed requests.']],
  link:'/en/pages/seo-services/',linkText:'Explore SEO services for Saudi businesses' },
 {file:'ar/pages/seo-services/index.html',heading:'متى تختار خدمات تحسين محركات البحث SEO في السعودية؟',
  answer:'إذا كانت صفحات خدماتك لا تظهر للكلمات التي يبحث عنها عملاؤك، يبدأ العمل بتدقيق الفهرسة والكلمات التجارية والروابط الداخلية، ثم تحسين الصفحات الحالية. إذا ظهر الموقع دون استفسارات، تُراجع تجربة الصفحة وطلب التواصل قبل توسيع المحتوى.',
  points:[['ضعف الظهور','ابدأ بالكلمات التجارية المرتبطة بالخدمة والمدينة والجمهور، وحدد صفحة أساسية لكل نية بحث.'],['ضعف CTR','افحص ترتيب النتائج أولًا، ثم العنوان والوصف ومدى توافقهما مع طلب العميل.'],['ضعف التحويل','بسّط نموذج التواصل، وقدّم وصفًا واضحًا لنطاق التنفيذ ومخرجاته.']],
  link:'/ar/contact.html?service=seo-aeo',linkText:'اطلب مراجعة SEO لخدمات شركتك' }
];
let enriched=0;
for(const c of notes){
 const f=path.join(root,c.file);
 assert.ok(fs.existsSync(f),'Commercial landing page missing: '+c.file);
 let html=fs.readFileSync(f,'utf8');
 if(!html.includes('</main>')){
   assert.ok(html.includes('class="page-hero"')&&html.includes('<footer'),'Missing expected legacy structure: '+c.file);
   html=html.replace('<section class="page-hero">','<main id="main-content"><section class="page-hero">');
   html=html.replace('<footer','</main><footer');
 }
 assert.match(html,/<main\b[^>]*>[\s\S]*?<\/main>/i,c.file+' main missing');
 assert.ok(!html.includes(mark),c.file+' duplicate content marker');
 const li=c.points.map(p=>'<li><strong>'+p[0]+'</strong><p>'+p[1]+'</p></li>').join('');
 const htmlBlock=mark+'<section class="rassmiy-v91-commercial"><div class="container"><article class="prose"><h2>'+c.heading+'</h2><p>'+c.answer+'</p><ul>'+li+'</ul><p><a href="'+c.link+'">'+c.linkText+'</a></p></article></div></section>';
 html=html.replace('</main>',htmlBlock+'</main>');
 fs.writeFileSync(f,html);
 enriched++;
}
for(const lang of ['ar','en']){
 const file=path.join(root,lang,'contact.html');
 let html=fs.readFileSync(file,'utf8');
 assert.ok(html.includes('data-rassmiy-lead-form="1"'),'Existing live lead form missing: '+lang);
 assert.ok(!html.includes('id="rassmiy-contact-check"'),'Double validation UI: '+lang);
 const msg='<p id="rassmiy-contact-check" class="rassmiy-contact-alert" role="alert" hidden></p>';
 html=html.replace(/<form\b[^>]*data-rassmiy-lead-form="1"[^>]*>/i,found=>msg+found);
 assert.ok(html.includes('id="rassmiy-contact-check"'),'Validation status UI missing: '+lang);
 html=html.replace(/<input\b(?=[^>]*name="phone")([^>]*)>/i,(all,attr)=>{
  if(/\btype=/.test(attr))return all;
  return '<input type="tel" autocomplete="tel" inputmode="tel"'+attr+'>';
 });
 fs.writeFileSync(file,html);
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let attached=0;
const src='/assets/qualified-intent-v91.js';
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 const relative=path.relative(root,file).replaceAll('\\','/');
 if(relative.startsWith('admin/')||relative==='cache-flush.html')continue;
 let html=fs.readFileSync(file,'utf8');
 if(!html.includes('</body>')||html.includes(src))continue;
 html=html.replace('</body>','<script defer src="'+src+'"></script></body>');
 fs.writeFileSync(file,html);
 attached++;
}
const target=path.join(root,'assets','qualified-intent-v91.js');
fs.copyFileSync('cms-v45/qualified-intent-v91.js',target);
fs.appendFileSync(path.join(root,'assets','styles.css'),'\n'+[
 '/* QUALIFIED_INTENT_V91: concise buyer-intent answers and contact quality validation */',
 '.rassmiy-v91-commercial{padding:clamp(1.4rem,4vw,2.5rem) 0;margin-block:2rem;background:rgba(127,127,127,.045)}',
 '.rassmiy-v91-commercial h2{line-height:1.5}',
 '.rassmiy-v91-commercial p,.rassmiy-v91-commercial li{line-height:1.85}',
 '.rassmiy-v91-commercial li{margin-block:.6rem}',
 '.rassmiy-v91-commercial a{text-decoration:underline;text-underline-offset:3px}',
 '.rassmiy-contact-alert{padding:.75rem 1rem;border:2px solid currentColor;border-radius:.5rem;font-weight:600}'
 ].join('\n')+'\n');
console.log('QUALIFIED_INTENT_V91=PASS enriched='+enriched+' contact_forms=2 scripts='+attached);

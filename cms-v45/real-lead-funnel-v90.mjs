import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2]||'release';
let contactPages=0,relatedArticles=0;
for(const lang of ['ar','en']){
 const file=path.join(root,lang,'contact.html');
 let html=fs.readFileSync(file,'utf8');
 assert.match(html,/<form\b[^>]*action="\/api\/lead"[^>]*>/i,'Expected real lead API form '+lang);
 assert.ok(html.includes('name="source"')&&html.includes('name="page_url"'),'Tracking fields missing '+lang);
 assert.ok(html.includes('name="message"'),'Lead message missing '+lang);
 if(html.includes('id="rassmiy-service-choice"'))throw Error('Already patched '+lang);
 const info=lang==='ar'
  ? '<div id="rassmiy-service-choice" class="rassmiy-lead-choice" aria-live="polite" hidden></div><p class="rassmiy-lead-notice">وضح احتياجك في النموذج، وسنستخدم بياناتك للرد على طلبك. ويمكنك التواصل عبر واتساب.</p>'
  : '<div id="rassmiy-service-choice" class="rassmiy-lead-choice" aria-live="polite" hidden></div><p class="rassmiy-lead-notice">Share your requirements and contact details so we can respond to your enquiry. WhatsApp is also available.</p>';
 html=html.replace(/<form\b[^>]*action="\/api\/lead"[^>]*>/i,m=>info+m.replace('<form','<form data-rassmiy-lead-form="1"'));
 html=html.replace('</body>','<script defer src="/assets/contact-funnel-v90.js"></script></body>');
 fs.writeFileSync(file,html);
 contactPages++;
}
const targets=[
 {lang:'ar',slugs:['اختيار-شركة-تسويق-السعودية','choose-marketing-company-saudi','marketing-services-budget-saudi'],main:'/ar/services.html',name:'خدمات التسويق الإلكتروني للشركات',other:'/ar/pages/marketing-agency-riyadh/',otherName:'كيف تختار وكالة تسويق في الرياض'},
 {lang:'ar',slugs:['مستشار-seo-ام-شركة-seo','كيف-تختار-مستشار-seo'],main:'/ar/pages/seo-services/',name:'خدمات تحسين محركات البحث في الرياض',other:'/ar/services.html',otherName:'خدمات التسويق الإلكتروني'},
 {lang:'en',slugs:['choose-marketing-company-saudi'],main:'/en/services.html',name:'Digital marketing services in Riyadh',other:'/en/pages/marketing-agency-riyadh/',otherName:'Marketing agency approach'},
 {lang:'en',slugs:['seo-consultant-vs-agency-riyadh','seo-checklist-saudi-business'],main:'/en/pages/seo-services/',name:'SEO services in Saudi Arabia',other:'/en/services.html',otherName:'Marketing services'},
 {lang:'en',slugs:['ecommerce-cro-saudi','ecommerce-growth-strategy-saudi-arabia'],main:'/en/pages/ecommerce-marketing/',name:'E-commerce marketing and CRO',other:'/en/services.html',otherName:'Digital marketing services'}
];
for(const t of targets){
 const dir=path.join(root,t.lang,'articles');
 if(!fs.existsSync(dir))continue;
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const slug=ent.isDirectory()?ent.name:ent.name.replace(/\.html$/,'');
  if(!t.slugs.some(x=>slug.includes(x)))continue;
  const file=ent.isDirectory()?path.join(dir,ent.name,'index.html'):path.join(dir,ent.name);
  if(!fs.existsSync(file))continue;
  let h=fs.readFileSync(file,'utf8');
  if(h.includes('<!-- RELEVANT_SERVICE_LINKS_V90 -->')||!h.includes('</main>'))continue;
  const ar=t.lang==='ar';
  const block='<!-- RELEVANT_SERVICE_LINKS_V90 --><section class="rassmiy-related"><div class="container"><h2>'+
   (ar?'خدمات مرتبطة بهذا الدليل':'Services related to this guide')+'</h2><p>'+
   (ar?'إذا كان هدفك تطبيق ما قرأته في نشاطك، راجع نطاق الخدمة أو اطلب مراجعة تسويقية.':'Turn this guidance into a scoped plan: review the matching services before requesting a consultation.')+'</p><p><a href="'+t.main+'">'+t.name+'</a> · <a href="'+t.other+'">'+t.otherName+'</a></p></div></section>';
  fs.writeFileSync(file,h.replace('</main>',block+'</main>'));
  relatedArticles++;
 }
}
assert.ok(relatedArticles>=2,'Expected at least two real relevant articles to be linked');
fs.copyFileSync('cms-v45/contact-funnel-v90.js',path.join(root,'assets/contact-funnel-v90.js'));
const css=[
 '/* Real lead conversion journey: no fabricated proof. */',
 '.rassmiy-lead-choice{margin:1rem 0;padding:.85rem 1rem;border:1px solid currentColor;border-radius:.65rem;font-weight:650;line-height:1.65}',
 '.rassmiy-lead-notice{font-size:.95rem;line-height:1.75;max-width:70ch}',
 '.rassmiy-related{padding:1.5rem 0;margin-block:2rem;background:rgba(127,127,127,.05)}',
 '.rassmiy-related a{text-decoration:underline;text-underline-offset:3px}'
].join('\n');
fs.appendFileSync(path.join(root,'assets/styles.css'),'\n'+css+'\n');
console.log('REAL_LEAD_FUNNEL_V90=PASS contact='+contactPages+' related_articles='+relatedArticles);

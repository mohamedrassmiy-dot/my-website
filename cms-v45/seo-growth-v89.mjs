import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2]||'release';
const marker='<!-- GROWTH_89 -->';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=[
 {paths:['index.html','ar/index.html'],lang:'ar',intent:'marketing-company',
  title:'شركة تسويق في الرياض | SEO وإعلانات ونمو | Rassmiy Marketing',
  desc:'شركة تسويق رقمي في الرياض: SEO وإعلانات جوجل وميتا ونمو المتاجر. تعرّف على الخدمات واطلب مراجعة تسويقية تناسب شركتك.',
  hero:'هل تبحث عن شركة تسويق في الرياض؟ نربط SEO والإعلانات والمحتوى والتحليلات بهدف تجاري واضح، ونقترح نطاقًا يناسب احتياج شركتك.',
  heading:'كيف تختار خدمات التسويق المناسبة لنشاطك؟',
  rows:[['شركات B2B','ربط البحث التجاري وصفحات الخدمات بطلبات عروض أسعار وفرص مبيعات مؤهلة.'],['المتاجر الإلكترونية','تحسين ظهور المنتجات والفئات والحملات وتجربة الطلب وقياس التحويل.'],['الخدمات المحلية','تحديد نية البحث في الرياض وتوضيح ما تقدمه الشركة وطريقة التواصل.']],
  cta:'اطلب مراجعة تسويقية',more:'استعرض خدمات التسويق',note:'نركز على فرص الأعمال المؤهلة، وليس زيارات لا تخدم أهدافك.'
 },
 {paths:['en/index.html'],lang:'en',intent:'marketing-company',
  title:'Marketing Company Riyadh | SEO, Ads & Growth | Rassmiy',
  desc:'Marketing company in Riyadh focused on SEO, Google Ads, paid social and e-commerce growth. Explore services and request a scoped marketing review.',
  hero:'Looking for a marketing company in Riyadh? Connect SEO, advertising, content and analytics to a measurable commercial objective.',
  heading:'Which marketing approach fits your business?',
  rows:[['B2B','Connect commercial search demand to qualified quotation requests.'],['E-commerce','Improve product discovery, campaign landing pages and purchase measurement.'],['Local services','Match Riyadh search intent with clear service scope and contact steps.']],
  cta:'Request a marketing review',more:'Explore marketing services',note:'We optimize for qualified enquiries, not vanity traffic.'
 },
 {paths:['ar/services.html'],lang:'ar',intent:'marketing-services',
  title:'خدمات تسويق إلكتروني في الرياض | SEO وإعلانات | Rassmiy',
  desc:'خدمات تسويق إلكتروني للشركات والمتاجر في الرياض: SEO، إدارة إعلانات جوجل وميتا والمحتوى وتحسين التحويل. اطلب نطاق عمل مناسبًا.',
  hero:'خدمات التسويق الإلكتروني تبدأ بهدفك: زيادة الطلبات، رفع مبيعات المتجر، تحسين ظهور Google، أو إصلاح قياس الحملات.',
  heading:'خدمات تسويق إلكتروني حسب هدف شركتك',
  rows:[['SEO وتحسين الظهور','تدقيق الفهرسة، تطوير الصفحات التجارية والمحتوى والربط الداخلي.'],['إدارة الإعلانات المدفوعة','هيكلة Google Ads وMeta، وتحسين صفحات الهبوط وتتبّع الاستفسارات.'],['نمو التجارة الإلكترونية','تحسين ظهور الفئات والمنتجات وتجربة الجوال ومراحل الشراء.'],['تحسين التحويل CRO','مراجعة رحلة الزائر والنماذج والأحداث وجودة الفرص.']],
  cta:'اطلب نطاق عمل مناسبًا',more:'تعرف على منهج وكالة التسويق',note:'تُحدد التسليمات والمسؤوليات ومؤشرات القياس قبل التنفيذ.'
 },
 {paths:['en/services.html'],lang:'en',intent:'marketing-services',
  title:'Digital Marketing Services Riyadh | SEO & Ads | Rassmiy',
  desc:'Digital marketing services in Riyadh: SEO, Google Ads, paid social, content and conversion optimization. Compare scope and request a review.',
  hero:'Choose digital marketing services around the real constraint: search visibility, customer acquisition costs, e-commerce conversion or tracking.',
  heading:'Marketing services by commercial objective',
  rows:[['SEO','Improve indexability, commercial content and internal links.'],['Paid media','Connect Google Ads and social campaigns to relevant landing pages.'],['E-commerce growth','Strengthen product discovery, mobile buying journeys and measurement.'],['Analytics and CRO','Test contact journeys, lead quality and conversion tracking.']],
  cta:'Request a scoped proposal',more:'Explore agency approach',note:'Agree on scope, delivery ownership and measurable outcomes first.'
 },
 {paths:['ar/pages/marketing-agency-riyadh/index.html'],lang:'ar',intent:'marketing-agency',
  title:'وكالة تسويق رقمي بالرياض | استراتيجية وتنفيذ | Rassmiy',
  desc:'وكالة تسويق رقمي بالرياض بنهج Full Stack Marketing: استراتيجية، SEO وإعلانات ومحتوى وقياس النتائج. ناقش هدف شركتك.',
  hero:'تبحث عن وكالة تسويق رقمي بالرياض؟ نربط التخطيط بالتنفيذ والقياس، مع توضيح نطاق الخدمات ومسؤولية كل مهمة.',
  heading:'ماذا تحصل عليه من نهج تسويق رقمي متكامل؟',
  rows:[['تشخيص أولًا','فهم الجمهور ومشكلة النمو قبل تحديد القنوات والميزانية.'],['تنفيذ متناسق','الربط بين البحث والإعلانات والمحتوى وصفحات الهبوط.'],['شفافية القياس','توضيح ملكية الحسابات والتقارير والاستفسارات المؤهلة.']],
  cta:'ناقش احتياج شركتك',more:'استعرض الخدمات',note:'العمل يقوده متخصص Full Stack Marketing، ويُوضح نطاق أي مساهمات إضافية.'
 },
 {paths:['en/pages/marketing-agency-riyadh/index.html'],lang:'en',intent:'marketing-agency',
  title:'Digital Marketing Agency Riyadh | Strategy & Delivery | Rassmiy',
  desc:'Integrated marketing agency approach in Riyadh: SEO, paid media, content, growth planning and conversion tracking. Discuss your goals.',
  hero:'Need an integrated digital marketing agency approach in Riyadh? Connect strategy, execution and measurement with clear responsibilities.',
  heading:'What does an integrated marketing approach deliver?',
  rows:[['Diagnosis first','Understand audience, demand and channel constraints.'],['Connected execution','Align SEO, campaigns, content and landing pages.'],['Measurable outcomes','Clarify account ownership and qualified enquiry tracking.']],
  cta:'Discuss your requirements',more:'Explore services',note:'A full-stack specialist leads the approach; any outside scope is disclosed.'
 },
 {paths:['ar/pages/b2b-lead-generation/index.html'],lang:'ar',intent:'b2b-leads',optional:true,
  title:'توليد العملاء المحتملين للشركات B2B في السعودية | Rassmiy',
  desc:'توليد العملاء المحتملين B2B في السعودية عبر SEO وصفحات الخدمات والإعلانات وطلبات عرض السعر وقياس الفرص المؤهلة.',
  hero:'زيادة طلبات الشركات لا تعني جمع نقرات واتساب؛ الهدف هو استفسارات مؤهلة يمكن متابعتها وتحويلها إلى فرص مبيعات.',
  heading:'من ظهور خدمات شركتك إلى فرصة B2B مؤهلة',
  rows:[['طلب تجاري واضح','ربط كلمات المشتريات بالخدمات واحتياجات صناع القرار.'],['نموذج عرض سعر ملائم','تسهيل إرسال المتطلبات بدل الإحالات غير الواضحة.'],['قياس جودة الفرص','فصل نقرات الأزرار عن الطلبات الفعلية والعملاء المؤهلين.']],
  cta:'اطلب مراجعة لجذب العملاء',more:'استعرض خدمات التسويق',note:'النقرة على زر التواصل ليست عميلًا مؤهلًا.'
 },
 {paths:['en/pages/b2b-lead-generation/index.html'],lang:'en',intent:'b2b-leads',optional:true,
  title:'B2B Lead Generation Saudi Arabia | Rassmiy Marketing',
  desc:'B2B lead generation in Saudi Arabia through SEO, landing pages, paid campaigns, quote requests and qualified opportunity measurement.',
  hero:'Build a qualified B2B enquiry pipeline rather than relying on traffic and messaging clicks alone.',
  heading:'Turn B2B search demand into qualified enquiries',
  rows:[['Buyer intent','Map procurement needs to relevant service pages.'],['Quote requests','Make the enquiry scope and next step clear.'],['Lead qualification','Distinguish CTA clicks, submitted forms and accepted opportunities.']],
  cta:'Request a B2B review',more:'Explore marketing services',note:'A button click is not a confirmed sale or qualified lead.'
 }
];
function urls(c){
 return {contact:'/'+c.lang+'/contact.html?service='+encodeURIComponent(c.intent),
         services:'/'+c.lang+'/services.html',
         secondary:c.intent==='marketing-services'?'/'+c.lang+'/pages/marketing-agency-riyadh/':'/'+c.lang+'/services.html'};
}
let touched=0,skipped=0;
for(const c of pages){
 for(const rel of c.paths){
  const file=path.join(root,rel);
  if(!fs.existsSync(file)){if(c.optional){skipped++;continue;}throw Error('Missing required page: '+rel);}
  let html=fs.readFileSync(file,'utf8');
  if(html.includes(marker))throw Error('Growth section already applied: '+rel);
  assert.match(html,/<main\b[^>]*>[\s\S]*?<\/main>/i,'Missing main: '+rel);
  assert.match(html,/<link\s+rel=["']canonical["']/i,'Missing canonical: '+rel);
  html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+e(c.title)+'</title>');
  const meta='<meta name="description" content="'+e(c.desc)+'">';
  if(/<meta\s+name=["']description["'][^>]*>/i.test(html))html=html.replace(/<meta\s+name=["']description["'][^>]*>/i,meta);
  else html=html.replace('</head>',meta+'</head>');
  const u=urls(c);
  const quick='<div class="growth89-intro"><p>'+e(c.hero)+'</p><div class="growth89-actions"><a class="growth89-primary" data-rassmiy-cta="'+e(c.intent)+'" data-rassmiy-placement="hero" href="'+u.contact+'">'+e(c.cta)+'</a><a class="growth89-secondary" href="'+u.secondary+'">'+e(c.more)+'</a></div></div>';
  const cards=c.rows.map(v=>'<li><strong>'+e(v[0])+'</strong><p>'+e(v[1])+'</p></li>').join('');
  const section=marker+'<section class="growth89-guide"><div class="container"><h2>'+e(c.heading)+'</h2><ul class="growth89-grid">'+cards+'</ul><p class="growth89-note">'+e(c.note)+'</p><div class="growth89-actions"><a class="growth89-primary" data-rassmiy-cta="'+e(c.intent)+'" data-rassmiy-placement="guide" href="'+u.contact+'">'+e(c.cta)+'</a><a class="growth89-secondary" href="/'+c.lang+'/portfolio.html">'+(c.lang==='ar'?'شاهد الأعمال':'View selected work')+'</a></div></div></section>';
  let inserted=false;
  html=html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i,(whole,open,middle,close)=>{
   if(!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(middle))throw Error('Missing H1 in main: '+rel);
   inserted=true;
   return open+middle.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/i,'$1'+quick)+section+close;
  });
  assert.ok(inserted,'Failed to modify main: '+rel);
  assert.equal((html.match(/<h1\b/gi)||[]).length,1,'Expected one H1: '+rel);
  assert.equal((html.match(/<meta\s+name=["']description["']/gi)||[]).length,1,'Expected one meta description: '+rel);
  html=html.replace('</body>','<script defer src="/assets/rassmiy-growth-events.js"></script></body>');
  fs.writeFileSync(file,html);
  touched++;
 }
}
const css=[
'/* GROWTH_89: accessible conversion components */',
'.growth89-intro{margin-block:1rem 1.5rem;max-width:75ch}',
'.growth89-intro p{line-height:1.8}',
'.growth89-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin:1rem 0}',
'.growth89-actions a{display:inline-flex;justify-content:center;align-items:center;min-height:46px;padding:.65rem 1.1rem;border-radius:.65rem;font-weight:700;text-decoration:none;line-height:1.5}',
'.growth89-primary{background:#a83e09;color:#fff!important;border:2px solid #a83e09}',
'.growth89-secondary{color:inherit;border:2px solid currentColor}',
'.growth89-guide{padding:clamp(1.5rem,4vw,3rem) 0;background:rgba(127,127,127,.06)}',
'.growth89-guide h2{line-height:1.4;max-width:35ch}',
'.growth89-grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:1rem}',
'.growth89-grid li{border:1px solid rgba(127,127,127,.32);border-radius:.9rem;padding:1rem;min-width:0}',
'.growth89-grid strong{display:block;font-size:1.05rem}',
'.growth89-grid p,.growth89-note{line-height:1.8;overflow-wrap:anywhere}',
'.growth89-actions a:focus-visible{outline:3px solid #197baf;outline-offset:3px}',
'@media(max-width:500px){.growth89-actions a{width:100%}}'
].join('\n');
fs.appendFileSync(path.join(root,'assets/styles.css'),'\n'+css+'\n');
const eventCode=[
'/* Track interest only: not a confirmed lead or purchase. */',
'document.addEventListener("click",function(ev){',
' const el=ev.target&&ev.target.closest?ev.target.closest("a[data-rassmiy-cta]"):null;',
' if(!el)return;',
' window.dataLayer=window.dataLayer||[];',
' window.dataLayer.push({event:"rassmiy_lead_intent_click",service_area:el.getAttribute("data-rassmiy-cta")||"",cta_placement:el.getAttribute("data-rassmiy-placement")||"",page_path:location.pathname});',
'});'
].join('\n');
fs.writeFileSync(path.join(root,'assets/rassmiy-growth-events.js'),eventCode);
console.log('GROWTH_89=PASS updated='+touched+' optionalSkipped='+skipped);

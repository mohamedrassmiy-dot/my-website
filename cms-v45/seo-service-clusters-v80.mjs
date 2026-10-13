import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2]||'release',base='https://rassmiy-marketing.netlify.app';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topics=[
  {
    "slug": "social-media-management-riyadh",
    "arTitle": "إدارة حسابات التواصل الاجتماعي في الرياض | Rassmiy Marketing",
    "enTitle": "Social Media Management Riyadh | Rassmiy Marketing",
    "arMeta": "إدارة حسابات التواصل الاجتماعي للشركات في الرياض: استراتيجية المحتوى، تنظيم النشر، تحليل الجمهور وقياس العملاء المحتملين.",
    "enMeta": "Social media management in Riyadh for businesses: social content strategy, platform planning and measurable enquiries.",
    "arH1": "إدارة حسابات التواصل الاجتماعي للشركات في الرياض",
    "enH1": "Social media management in Riyadh for businesses",
    "arBody": "<p>إدارة حسابات التواصل الاجتماعي للشركات لا تقتصر على تصميم المنشورات أو زيادة عدد المتابعين. يبدأ العمل بفهم طبيعة العملاء وسلوكهم والرسائل التي تساعدهم على تقييم الخدمة أو المنتج، ثم اختيار المنصات المناسبة وكتابة محتوى واضح يقود إلى موقع الشركة أو إلى طلب تواصل. Rassmiy Marketing تربط استراتيجية المحتوى بالأهداف التجارية وتقارير الأداء.</p><h2>ما الذي تشمله الخدمة؟</h2><ul><li>تدقيق الحسابات والهوية ووصف النشاط وروابط التواصل.</li><li>تحديد شرائح الجمهور ورسائل العلامة التجارية.</li><li>تقويم محتوى مناسب للمنصات المعتمدة.</li><li>صياغة منشورات تعليمية وتعريفية وتجارية.</li><li>تنسيق المحتوى مع حملات Meta وLinkedIn المدفوعة عند الحاجة.</li><li>قياس الزيارات والتفاعل والاستفسارات المؤهلة.</li></ul><h2>كيف نختار المنصات المناسبة؟</h2><p>قد يناسب LinkedIn الشركات التي تبيع للشركات B2B، بينما تحتاج العلامات الاستهلاكية إلى محتوى بصري يناسب جمهورها. يجب أن يعتمد الاختيار على الجمهور والموارد والهدف، وليس على عدد مستخدمي المنصة فقط.</p><h2>كيف نقيس النتائج؟</h2><p>نوازن بين الوصول والتفاعل وزيارات الصفحات والعملاء المحتملين، ونربط المنشورات والحملات بمسارات تحويل يمكن قياسها.</p>",
    "enBody": "<p>Social media management is more than publishing posts or growing follower counts. It should explain the offer, support buyers at each decision stage and guide interested people to relevant pages or enquiries. Rassmiy Marketing connects channel selection and editorial planning to measurable outcomes.</p><h2>What is included?</h2><ul><li>Audit existing profiles and conversion links.</li><li>Research audience segments and brand messaging.</li><li>Create an editorial calendar and platform-specific copy.</li><li>Coordinate organic social with paid Meta or LinkedIn campaigns when relevant.</li><li>Measure relevant sessions, engagement and qualified enquiries.</li></ul><h2>Which platforms matter?</h2><p>B2B firms often need expertise-led LinkedIn content, while consumer brands may need visual-first channels. Choose according to the actual audience and capacity.</p><h2>How is success measured?</h2><p>Reach and engagement are useful indicators but should not replace website traffic quality and commercial enquiry tracking.</p>"
  },
  {
    "slug": "google-ads-management-saudi",
    "arTitle": "إدارة حملات جوجل الإعلانية Google Ads في السعودية | Rassmiy",
    "enTitle": "Google Ads Management in Saudi Arabia | Rassmiy Marketing",
    "arMeta": "إدارة حملات Google Ads وإعلانات جوجل في السعودية: كلمات بنية شراء، تحسين الحملات، GTM وGA4، صفحات هبوط وتقارير العملاء المؤهلين.",
    "enMeta": "Google Ads management in Saudi Arabia: commercial-intent keywords, search campaigns, GA4 tracking, landing pages and qualified lead reporting.",
    "arH1": "إدارة حملات جوجل الإعلانية Google Ads في السعودية",
    "enH1": "Google Ads management for Saudi businesses",
    "arBody": "<p>تبدأ إدارة حملات جوجل الإعلانية من فهم ما يبيعه النشاط وطريقة اتخاذ العميل لقرار الشراء. ليست كل نقرة فرصة بيع؛ لذلك نحدد كلمات البحث ذات النية التجارية ونعمل على تقليل الزيارات غير المناسبة بالتقسيم والاستبعادات والرسائل وصفحات الهبوط المرتبطة بالعرض.</p><h2>خطوات إدارة إعلانات Google</h2><ul><li>مراجعة الحساب والحملات وإعدادات التحويل الحالية.</li><li>تقسيم كلمات البحث حسب الخدمة والموقع ونية التعاقد.</li><li>بناء مجموعات الإعلانات وصياغة رسائل مرتبطة بالطلب الفعلي.</li><li>تحسين صفحات الهبوط وتجربة الجوال ووضوح إجراءات التواصل.</li><li>ضبط تتبع GA4 وGoogle Tag Manager عند توفر الوصول.</li><li>تحليل Search Terms ومعدل التحويل وتكلفة العملاء المؤهلين.</li></ul><h2>ما المؤشرات الأكثر أهمية؟</h2><p>تختلف باختلاف هدف الحملة. في الخدمات تبرز تكلفة الاستفسار المؤهل وتكلفة الفرصة، وفي المتاجر تبرز قيمة الطلب ونسبة التحويل وROAS عند توفر بيانات دقيقة. لا نكتفي بعدد النقرات.</p><h2>هل إدارة الحملات تشمل ميزانية الإعلان؟</h2><p>يتم الفصل بين المبلغ الذي يُدفع للمنصة وبين تكلفة إدارة الحملات وأي تنفيذ إضافي لصفحات الهبوط أو التحليلات، وذلك في نطاق واضح قبل البدء.</p>",
    "enBody": "<p>Effective Google Ads management begins with the offer, the buyer and the commercial intent behind a search. More clicks are not necessarily more qualified enquiries. Rassmiy Marketing connects search themes, campaigns, landing pages and analytics with business objectives.</p><h2>Management workflow</h2><ul><li>Audit account configuration, search terms and conversion tracking.</li><li>Map high-intent queries to products and service pages.</li><li>Organize campaign groups, ad messages and exclusions.</li><li>Review landing page messaging, speed and mobile experience.</li><li>Configure GA4 and GTM measurement where access permits.</li><li>Monitor qualified leads, cost and relevant commercial outcomes.</li></ul><h2>Which KPIs matter?</h2><p>Lead quality and cost per qualified enquiry are more useful for many service businesses than clicks alone. E-commerce programs require reliable revenue and order value tracking.</p><h2>How are fees handled?</h2><p>Ad platform spend, management fees and additional site or tracking work should be separated in the engagement scope.</p>"
  },
  {
    "slug": "content-marketing-saudi",
    "arTitle": "التسويق بالمحتوى وكتابة محتوى SEO للشركات في السعودية | Rassmiy",
    "enTitle": "Content Marketing Services Saudi Arabia | Rassmiy Marketing",
    "arMeta": "التسويق بالمحتوى وكتابة صفحات الخدمات ومقالات SEO في السعودية: محتوى مبني على الجمهور ونية البحث والربط الداخلي والتحويل.",
    "enMeta": "Content marketing services for Saudi businesses: SEO service pages, buyer-focused articles, landing page copy and conversion-led content strategy.",
    "arH1": "خدمات التسويق بالمحتوى وكتابة المحتوى للشركات",
    "enH1": "Content marketing services for Saudi businesses",
    "arBody": "<p>لا تبدأ استراتيجية التسويق بالمحتوى بعدد مقالات شهري، بل بتحديد الأسئلة التي يسألها العملاء قبل التعاقد أو الشراء. المحتوى الجيد يعرّف بالخدمات بشكل دقيق، ويزيل اعتراضات العملاء ويقودهم إلى قرار مناسب، لذلك نربط المقالات بصفحات الخدمات والمنتجات والصفحات المقصودة.</p><h2>خدمات كتابة المحتوى</h2><ul><li>بحث الجمهور والمنافسين ونية البحث.</li><li>تخطيط صفحات خدمات تستهدف طلبات العملاء التجارية.</li><li>صياغة مقالات SEO وأدلة ومقارنات وأسئلة شائعة.</li><li>محتوى إعلاني وصفحات هبوط متوافق مع الرسائل المدفوعة.</li><li>محتوى LinkedIn والحسابات الاجتماعية حسب الجمهور.</li><li>تحديث المحتوى القديم وتحسين الروابط الداخلية وبنية الصفحات.</li></ul><h2>كيف يخدم المحتوى تحسين محركات البحث؟</h2><p>صفحات الخدمات تجيب عن نية التعاقد، بينما تعالج المقالات أسئلة التكلفة والمقارنة والاختيار. تنظيم المحتوى في مجموعات موضوعية يمنع تكرار الصفحات المتنافسة على نفس النية ويساعد الزائر ومحركات البحث في فهم الترابط.</p><h2>هل كثرة المقالات تعني نتائج أفضل؟</h2><p>لا. الأهم أن تكون الصفحات مفيدة ودقيقة وقابلة للتحديث، مع مؤشرات تقيس الوصول المناسب والاستفسارات بدل الاعتماد على عدد النصوص المنشورة.</p>",
    "enBody": "<p>Content marketing should start from real buyer questions rather than arbitrary publication targets. Useful content clarifies services, answers objections and guides visitors toward relevant actions, connecting informational articles to commercial service pages.</p><h2>Possible deliverables</h2><ul><li>Audience, competitor and search intent research.</li><li>Commercial service pages with clear conversion paths.</li><li>SEO articles covering buyer comparisons, pricing questions and decisions.</li><li>Advertising and landing page copy aligned to campaign offers.</li><li>Channel-specific social content for relevant audiences.</li><li>Content refreshes and internal linking plans.</li></ul><h2>How does content support SEO?</h2><p>Service pages address high-intent searches. Supporting content answers earlier questions and links users to the relevant service without repetitive keyword stuffing.</p><h2>How much content is enough?</h2><p>Quality, coverage, freshness and useful conversion outcomes matter more than publishing volume alone.</p>"
  },
  {
    "slug": "digital-marketing-strategy-saudi",
    "arTitle": "إعداد استراتيجية وخطة تسويق إلكتروني في السعودية | Rassmiy",
    "enTitle": "Digital Marketing Strategy Saudi Arabia | Rassmiy Marketing",
    "arMeta": "إعداد استراتيجية تسويق إلكتروني في السعودية للشركات: تحليل المنافسين والجمهور، خطة SEO والإعلانات والمحتوى، أولويات التنفيذ وKPIs.",
    "enMeta": "Digital marketing strategy for Saudi businesses: market and audience research, SEO and paid media planning, measurement and prioritized execution.",
    "arH1": "إعداد استراتيجية تسويق إلكتروني وخطة نمو للشركات",
    "enH1": "Digital marketing strategy and growth planning in Saudi Arabia",
    "arBody": "<p>إعداد خطة تسويق إلكتروني قوية يتطلب أكثر من توزيع ميزانية بين المنصات. تبدأ الاستراتيجية من فهم النشاط والجمهور ومنافسيه، ثم تحديد الرسائل والقنوات ومسارات التحويل التي تستحق الاستثمار. يركز منهج Full Stack Marketing على ربط قرارات البحث والإعلانات والمحتوى وتحسين الموقع بنتيجة تجارية واحدة.</p><h2>مكونات خطة التسويق</h2><ul><li>Business Brief عن النشاط والخدمات وأهداف النمو والموارد.</li><li>Market & Competitor Research عن المنافسين وحضورهم الرقمي.</li><li>تقسيم العملاء حسب المشاكل والسلوك ونية الشراء.</li><li>خريطة القنوات والصفحات: SEO والإعلانات والمحتوى والتجارة الإلكترونية.</li><li>تحديد أولويات التنفيذ حسب الأثر والتكلفة والجاهزية.</li><li>تحديد KPIs مثل الاستفسارات المؤهلة ومعدل التحويل وتكلفة الفرصة.</li></ul><h2>كيف نحدد الأولوية؟</h2><p>إذا كانت صفحة الخدمة لا تحوّل الزوار فقد يبدأ العمل من تحسين العرض وتجربة المستخدم. وإذا كان الموقع لا يغطي أسئلة العملاء فقد نبدأ بصفحات الخدمات. القرار يعتمد على التشخيص لا الوصفات الجاهزة.</p><h2>ما الذي تستلمه الشركة؟</h2><p>خارطة تنفيذ واضحة مقسمة إلى أولويات قصيرة ومتوسطة المدى، ومسؤوليات كل فريق، وافتراضات يمكن قياسها بدل وعود مضمونة بالترتيب أو الإيراد.</p>",
    "enBody": "<p>A marketing strategy is not just a channel budget split. It starts with the market, customers, competitors and commercial goals, then connects search, content, paid media and website conversion work to measurable outcomes.</p><h2>Strategy scope</h2><ul><li>Business brief covering goals, resources and offers.</li><li>Market and competitor assessment.</li><li>Buyer intent, segments and decision-stage questions.</li><li>SEO, paid media, content and conversion channel mapping.</li><li>Prioritization of implementation by impact and readiness.</li><li>Qualified lead, conversion rate and opportunity cost measurement.</li></ul><h2>What comes first?</h2><p>The highest-impact constraint might be an unclear landing page, poor indexation, weak service-page coverage or incomplete tracking. Diagnosis determines the order.</p><h2>Deliverable</h2><p>A practical roadmap with responsibilities, near-term tasks and measurable hypotheses rather than guaranteed rankings or revenue.</p>"
  }
];
for(const t of topics){
 for(const lang of ['ar','en']){
  const ar=lang==='ar';
  const folder=path.join(root,lang,'pages',t.slug);
  const target=path.join(folder,'index.html');
  const canonical=base+'/'+lang+'/pages/'+t.slug;
  let html=fs.readFileSync(path.join(root,lang,'pages','marketing-agency-riyadh','index.html'),'utf8');
  const title=ar?t.arTitle:t.enTitle,description=ar?t.arMeta:t.enMeta,h1=ar?t.arH1:t.enH1,body=ar?t.arBody:t.enBody;
  html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+esc(title)+'</title>');
  html=html.replace(/<meta name="description" content="[^"]*"[^>]*>/i,'<meta name="description" content="'+esc(description)+'">');
  html=html.replace(/<link rel="canonical" href="[^"]*"[^>]*>/i,'<link rel="canonical" href="'+canonical+'">');
  html=html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*"[^>]*>/g,'');
  html=html.replace('</head>','<link rel="alternate" hreflang="ar" href="'+base+'/ar/pages/'+t.slug+'"><link rel="alternate" hreflang="en" href="'+base+'/en/pages/'+t.slug+'"><link rel="alternate" hreflang="x-default" href="'+base+'/ar/pages/'+t.slug+'"></head>');
  html=html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i,'<main id="main-content"><section class="page-hero"><div class="container"><div class="kicker">'+(ar?'خدمات التسويق':'Marketing Services')+'</div><h1>'+esc(h1)+'</h1><p>'+esc(description)+'</p></div></section><section class="section"><div class="container"><article class="prose">'+body+'<h2>'+(ar?'كيف نبدأ؟':'How do we start?')+'</h2><p>'+(ar?'ابدأ بتحديد الخدمة المطلوبة وهدفها التجاري ومؤشرات القياس، ثم اطلب مراجعة توضح النطاق المناسب لمشروعك.':'Start with your commercial objective and a review of your current channels before deciding the right scope.')+'</p><p><a href="/'+lang+'/services.html">'+(ar?'استعرض خدمات التسويق':'Explore marketing services')+'</a> · <a href="/'+lang+'/contact.html">'+(ar?'اطلب مراجعة تسويقية':'Request a marketing review')+'</a></p></article></div></section></main>');
  fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(target,html);
 }
}
const marker='<!-- SEO_CLUSTER_V80 -->';
for(const lang of ['ar','en']){
 const service=path.join(root,lang,'services.html'),home=path.join(root,lang,'index.html');
 const heading=lang==='ar'?'حلول التسويق الإلكتروني حسب احتياج شركتك':'Marketing solutions by business need';
 const cards=topics.map(t=>'<article class="growth-card"><h3><a href="/'+lang+'/pages/'+t.slug+'">'+(lang==='ar'?t.arH1:t.enH1)+'</a></h3><p>'+(lang==='ar'?t.arMeta:t.enMeta)+'</p></article>').join('');
 let sh=fs.readFileSync(service,'utf8');
 if(!sh.includes(marker))fs.writeFileSync(service,(/<\/main>/i.test(sh)?sh.replace(/<\/main>/i,marker+'<section class="growth-section soft"><div class="container"><h2>'+heading+'</h2><div class="growth-grid">'+cards+'</div></div></section></main>'):sh.replace(/<footer\b/i,marker+'<section class="growth-section soft"><div class="container"><h2>'+heading+'</h2><div class="growth-grid">'+cards+'</div></div></section><footer')));
 let hh=fs.readFileSync(home,'utf8');
 if(!hh.includes(marker))fs.writeFileSync(home,(/<\/main>/i.test(hh)?hh.replace(/<\/main>/i,marker+'<section class="growth-section"><div class="container"><h2>'+heading+'</h2><div class="growth-cta">'+topics.map(t=>'<a class="btn outline" href="/'+lang+'/pages/'+t.slug+'">'+(lang==='ar'?t.arH1:t.enH1)+'</a>').join('')+'</div></div></section></main>'):hh.replace(/<footer\b/i,marker+'<section class="growth-section"><div class="container"><h2>'+heading+'</h2><div class="growth-cta">'+topics.map(t=>'<a class="btn outline" href="/'+lang+'/pages/'+t.slug+'">'+(lang==='ar'?t.arH1:t.enH1)+'</a>').join('')+'</div></div></section><footer')));
}
fs.writeFileSync(path.join(root,'seo-service-clusters-v80.json'),JSON.stringify({version:'8.0',pages:topics.map(t=>({slug:t.slug,arKeyword:t.arH1,enKeyword:t.enH1})),existingIntentPages:['SEO consultant','Digital marketing consultant','Lead generation','E-commerce growth','Performance marketing','Analytics'],futureResearch:['Local SEO','Email marketing','Landing pages','Marketing automation','E-commerce SEO','CRO','AI search visibility','Industry-specific marketing']},null,2));
console.log('SEO_SERVICE_CLUSTERS_V80=PASS');

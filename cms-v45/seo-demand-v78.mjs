import fs from 'node:fs';
import path from 'node:path';

const root=process.argv[2]||'release';
const BASE='https://rassmiy-marketing.netlify.app';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function read(file){return fs.readFileSync(file,'utf8')}
function write(file,s){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,s)}
function setTitleMeta(h,title,meta){
  h=h.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+esc(title)+'</title>');
  if(/<meta\s+name=["']description["']/i.test(h)) h=h.replace(/<meta\s+name=["']description["'][^>]*>/i,'<meta name="description" content="'+esc(meta)+'">');
  else h=h.replace(/<\/head>/i,'<meta name="description" content="'+esc(meta)+'"></head>');
  return h;
}
function replaceFirstH1(h,h1){
  return h.replace(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/i,'<h1>'+h1+'</h1>');
}
function beforeFooter(h,marker,html){
  if(h.includes(marker)) return h;
  return h.replace(/<footer\b/i,html+'<footer');
}
function addSchema(h,id,obj){
  if(h.includes(id)) return h;
  const json=JSON.stringify(obj).replaceAll('<','\\u003c');
  return h.replace(/<\/head>/i,'<script id="'+id+'" type="application/ld+json">'+json+'</script></head>');
}
function addFaq(h,lang,faqs){
  const ar=lang==='ar';
  const html='<section class="growth-section soft seo-faq-v78"><div class="container"><div class="growth-kicker">'+(ar?'أسئلة قبل التعاقد':'Questions before you hire')+'</div><h2>'+(ar?'أسئلة شائعة تساعدك على اتخاذ قرار أفضل':'FAQs to help you make a better decision')+'</h2><div class="growth-faq">'+faqs.map(([q,a])=>'<details><summary>'+q+'</summary><p>'+a+'</p></details>').join('')+'</div></div></section>';
  return beforeFooter(h,'seo-faq-v78',html);
}
function addBuyerBlock(h,lang){
  const ar=lang==='ar';
  const block='<!-- SEO_BUYER_BLOCK_V78 --><section class="growth-section seo-buyer-v78"><div class="container"><div class="growth-copy"><div class="growth-kicker">'+(ar?'ابدأ من النتيجة التجارية':'Start with the business outcome')+'</div><h2>'+(ar?'الهدف ليس Traffic أكثر؛ الهدف Leads أفضل وPipeline أوضح':'The goal is not more traffic; it is better leads and clearer pipeline')+'</h2><p>'+(ar?'يتم ربط نية البحث بالصفحة والرسالة والـCTA والقياس، بحيث نعرف أي زيارة يمكن أن تتحول إلى فرصة حقيقية وأي محتوى يجب أن يدعمها.':'Search intent, page message, CTA and measurement are connected so we can identify which visits can become real opportunities and which content should support them.')+'</p></div><div class="growth-grid"><article class="growth-card"><h3>'+(ar?'نية تجارية واضحة':'Commercial intent')+'</h3><p>'+(ar?'كل صفحة تستهدف سؤالًا أو احتياجًا واحدًا بدل محاولة ترتيب الصفحة الرئيسية لكل شيء.':'Each page targets one buyer need instead of forcing the homepage to rank for everything.')+'</p></article><article class="growth-card"><h3>'+(ar?'محتوى يدعم القرار':'Decision-support content')+'</h3><p>'+(ar?'مقالات التكلفة والمقارنة والاختيار تجيب عن الأسئلة التي تسبق التواصل مباشرة.':'Cost, comparison and selection content answers the questions buyers ask immediately before contacting a provider.')+'</p></article><article class="growth-card"><h3>'+(ar?'CTA قابل للقياس':'Measurable CTA')+'</h3><p>'+(ar?'كل Cluster يقود إلى مراجعة أو استشارة مرتبطة بالخدمة بدل نهاية محتوى بلا خطوة تالية.':'Every cluster leads to a relevant review or consultation instead of ending without a next step.')+'</p></article></div><div class="growth-cta"><a class="btn primary" href="/'+lang+'/contact.html">'+(ar?'اطلب مراجعة تسويقية →':'Request a marketing review →')+'</a><a class="btn outline" href="/'+lang+'/articles">'+(ar?'اقرأ الأدلة العملية':'Read practical guides')+'</a></div></div></section>';
  return beforeFooter(h,'SEO_BUYER_BLOCK_V78',block);
}

// Homepage: local commercial positioning without diluting Full Stack Marketing.
for(const [file,lang] of [[path.join(root,'index.html'),'ar'],[path.join(root,'ar','index.html'),'ar'],[path.join(root,'en','index.html'),'en']]){
  if(!fs.existsSync(file)) continue;
  let h=read(file),ar=lang==='ar';
  h=setTitleMeta(h,
    ar?'استشاري تسويق في الرياض | Full Stack Marketing':'Marketing Consultant Riyadh | Full Stack Marketing',
    ar?'استشاري تسويق في الرياض يربط SEO والإعلانات والمحتوى والتجارة الإلكترونية والتحليلات بالـLeads والإيراد. اطلب مراجعة تسويقية أولية.':'Marketing consultant in Riyadh connecting SEO, paid media, content, e-commerce and analytics to qualified leads and revenue. Request an initial marketing review.'
  );
  h=replaceFirstH1(h,ar?'استشاري تسويق في الرياض يربط التنفيذ بالـLeads والإيراد':'Marketing consultant in Riyadh connecting execution to leads and revenue');
  h=addBuyerBlock(h,lang);
  write(file,h);
}

// SEO consultant landing page — direct answer + local/commercial intent + conversion.
for(const lang of ['ar','en']){
  const ar=lang==='ar';
  const slug=ar?'استشاري-seo-الرياض':'seo-consultant-riyadh';
  const file=path.join(root,lang,'pages',slug,'index.html');
  if(!fs.existsSync(file)) continue;
  let h=read(file);
  h=setTitleMeta(h,
    ar?'استشاري SEO في الرياض | تدقيق واستراتيجية نمو عضوي':'SEO Consultant Riyadh | Audit & Organic Growth Strategy',
    ar?'استشاري SEO في الرياض للشركات التي تريد الظهور على كلمات ذات نية شراء وتحويل البحث إلى Leads. تدقيق تقني، محتوى، AEO/GEO وقياس واضح.':'SEO consultant in Riyadh helping businesses rank for commercial-intent searches and turn organic visibility into qualified leads through technical SEO, content, AEO/GEO and measurement.'
  );
  const answer=ar
   ? '<!-- SEO_DIRECT_ANSWER_V78 --><section class="growth-section soft"><div class="container"><div class="growth-kicker">الإجابة المختصرة</div><h2>ماذا يفعل استشاري SEO في الرياض؟</h2><p class="growth-copy">استشاري SEO الجيد لا يركز على عدد الكلمات فقط؛ يبدأ بتحديد الصفحات التي يمكن أن تجذب عميلًا محتملًا، يصلح مشاكل الفهرسة والزحف، يبني Content Clusters حول نية البحث، ثم يقيس الاستفسارات والـLeads الناتجة من Organic Search.</p><div class="growth-cta"><a class="btn primary" href="/ar/contact.html?service=seo-aeo">اطلب SEO Opportunity Review →</a></div></div></section>'
   : '<!-- SEO_DIRECT_ANSWER_V78 --><section class="growth-section soft"><div class="container"><div class="growth-kicker">Quick answer</div><h2>What does an SEO consultant in Riyadh actually do?</h2><p class="growth-copy">A useful SEO consultant does more than track keyword positions. The work starts by identifying pages that can attract buyers, fixing indexation and crawl issues, building content clusters around search intent, then measuring qualified enquiries generated by organic search.</p><div class="growth-cta"><a class="btn primary" href="/en/contact.html?service=seo-aeo">Request an SEO Opportunity Review →</a></div></div></section>';
  if(!h.includes('SEO_DIRECT_ANSWER_V78')) h=h.replace(/<section class="section"/i,answer+'<section class="section"');
  const faqs=ar?[
    ['هل يمكن ضمان المركز الأول في Google؟','لا. لا يوجد متخصص يستطيع ضمان المركز الأول بشكل مشروع. الهدف هو رفع احتمالية الوصول لمراكز متقدمة عبر تحسين تقني ومحتوى أقوى وإشارات ثقة وقياس مستمر.'],
    ['كم يحتاج SEO ليبدأ بإظهار أثر؟','يعتمد على حالة الموقع والمنافسة وسرعة التنفيذ. بعض الإصلاحات التقنية تظهر آثارها أسرع، بينما الكلمات التنافسية تحتاج عملًا تراكميًا ومحتوى وسلطة.'],
    ['هل أحتاج مقالات أم صفحات خدمات؟','الصفحات التجارية تلتقط نية الشراء، والمقالات تدعمها بأسئلة التكلفة والمقارنة والاختيار. الاثنان يعملان معًا داخل Cluster واحد.'],
    ['كيف أعرف أن SEO يجلب عملاء؟','يتم تتبع Organic Leads ومصدرها وصفحات الدخول والاستفسارات المؤهلة، وليس الاكتفاء بالزيارات أو ترتيب الكلمات.']
  ]:[
    ['Can anyone guarantee a #1 Google ranking?','No legitimate consultant can guarantee the #1 position. The goal is to increase the probability of top visibility through technical quality, stronger content, trust signals and continuous measurement.'],
    ['How long does SEO take to show impact?','It depends on the site, competition and execution speed. Technical fixes can show signals sooner, while competitive commercial queries require compounding content and authority.'],
    ['Do I need service pages or blog articles?','Commercial pages capture buying intent. Articles support them with cost, comparison and selection questions. Both should work as one topic cluster.'],
    ['How do I know SEO is producing customers?','Track organic enquiries, landing pages, qualified-lead rate and assisted conversions—not traffic and rankings alone.']
  ];
  h=addFaq(h,lang,faqs);
  h=addSchema(h,'faq-seo-v78',{'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
  write(file,h);
}

// Digital marketing consultant page preserves its search language while the brand remains Full Stack Marketing.
for(const lang of ['ar','en']){
  const ar=lang==='ar',slug=ar?'استشاري-تسويق-رقمي-الرياض':'digital-marketing-consultant-riyadh';
  const file=path.join(root,lang,'pages',slug,'index.html');
  if(!fs.existsSync(file)) continue;
  let h=read(file);
  h=setTitleMeta(h,
    ar?'استشاري تسويق رقمي في الرياض | خطة نمو قابلة للقياس':'Digital Marketing Consultant Riyadh | Measurable Growth',
    ar?'استشاري تسويق رقمي في الرياض يربط SEO والإعلانات والمحتوى والتحليلات في خطة 90 يومًا هدفها Leads وإيراد قابلان للقياس.':'Digital marketing consultant in Riyadh aligning SEO, paid media, content and analytics into a 90-day plan focused on measurable leads and revenue.'
  );
  h=replaceFirstH1(h,ar?'استشاري تسويق رقمي في الرياض بخطة Full Stack Marketing':'Digital marketing consultant in Riyadh with a full-stack growth approach');
  h=addBuyerBlock(h,lang);
  write(file,h);
}

// Bottom-of-funnel articles: cost, comparison and provider-selection intent.
const articles=[
 {
  enSlug:'seo-cost-saudi-arabia-2026',arSlug:'تكلفة-seo-في-السعودية-2026',
  enTitle:'SEO Cost in Saudi Arabia 2026: What Are You Really Paying For?',
  arTitle:'تكلفة SEO في السعودية 2026: ماذا تدفع مقابله فعلًا؟',
  enMeta:'Understand SEO cost in Saudi Arabia, what changes the scope, which deliverables matter and how to compare proposals without buying a cheap checklist.',
  arMeta:'دليل عملي لفهم تكلفة SEO في السعودية، ما الذي يغيّر نطاق العمل، وكيف تقارن العروض حسب الأثر والـDeliverables بدل السعر وحده.',
  enBody:`<p><strong>Quick answer:</strong> there is no official fixed price for SEO in Saudi Arabia. The real cost depends on technical condition, competition, number of commercial pages, Arabic/English scope, content requirements and the amount of implementation included.</p><h2>Why two SEO proposals can be very different</h2><p>One proposal may only include an audit and monthly recommendations. Another may include technical fixes, service-page rewrites, content production, internal linking, reporting and implementation support. Comparing the monthly number without comparing scope creates a false comparison.</p><h2>Separate audit, strategy and execution</h2><p>An SEO audit identifies problems. A strategy decides which opportunities matter. Execution changes the site. Before comparing price, ask which of these three layers are actually included.</p><h2>What usually increases the scope?</h2><ul><li>Large websites or e-commerce catalogs.</li><li>Arabic and English content.</li><li>Competitive commercial keywords.</li><li>Multiple cities or service lines.</li><li>Technical issues affecting crawl and indexation.</li><li>Content production and page implementation.</li></ul><h2>What should a serious proposal measure?</h2><p>Not only keyword positions. Ask how the provider will track organic enquiries, qualified leads, high-intent landing pages and assisted conversions.</p><h2>How to compare SEO proposals</h2><p>Compare the business problem, target pages, implementation ownership, reporting method and expected decision cadence. A cheaper proposal is not cheaper if your team must execute everything internally.</p><h2>What should you do before requesting a quote?</h2><p>Prepare your priority services, target market, current site, analytics access and the commercial actions you want visitors to take. This makes the scope—and therefore the price—more accurate.</p><p><a href="/en/pages/seo-consultant-riyadh">See the SEO consulting approach</a> or <a href="/en/contact.html?service=seo-aeo">request an SEO Opportunity Review</a>.</p>`,
  arBody:`<p><strong>الإجابة المختصرة:</strong> لا يوجد سعر رسمي ثابت لخدمات SEO في السعودية. التكلفة تتغير حسب الحالة التقنية للموقع، شدة المنافسة، عدد الصفحات التجارية، العمل بالعربي والإنجليزي، حجم المحتوى، وهل التنفيذ داخل الخدمة أم مجرد توصيات.</p><h2>لماذا يختلف عرضان SEO بشكل كبير؟</h2><p>قد يكون العرض الأول Audit وتقريرًا شهريًا فقط، بينما يتضمن الآخر إصلاحات تقنية وكتابة صفحات خدمات ومحتوى وروابط داخلية ومتابعة تنفيذ. مقارنة الرقم الشهري بدون مقارنة Scope تعطيك مقارنة مضللة.</p><h2>افصل بين Audit والاستراتيجية والتنفيذ</h2><p>الـAudit يحدد المشكلة، والاستراتيجية تحدد الأولوية، والتنفيذ يغير الموقع فعليًا. اسأل بوضوح: أي طبقة من الثلاثة موجودة في العرض؟</p><h2>ما الذي يرفع نطاق العمل؟</h2><ul><li>موقع كبير أو متجر بعدد منتجات وفئات مرتفع.</li><li>محتوى عربي وإنجليزي.</li><li>كلمات تجارية ذات منافسة قوية.</li><li>استهداف عدة مدن أو خدمات.</li><li>مشاكل Technical SEO تؤثر على الزحف والفهرسة.</li><li>إنتاج المحتوى والتنفيذ داخل الموقع.</li></ul><h2>ما الذي يجب قياسه؟</h2><p>لا تكتفِ بترتيب الكلمات. اسأل كيف سيتم تتبع Organic Leads والصفحات ذات النية الشرائية والاستفسارات المؤهلة والتحويلات المساعدة.</p><h2>كيف تقارن عروض SEO؟</h2><p>قارن المشكلة المستهدفة، الصفحات ذات الأولوية، مسؤولية التنفيذ، طريقة التقارير ودورية اتخاذ القرار. العرض الأرخص ليس أرخص إذا كان فريقك سيقوم بكل التنفيذ داخليًا.</p><h2>ماذا تجهز قبل طلب عرض سعر؟</h2><p>حدد الخدمات الأهم، السوق المستهدف، الموقع الحالي، بيانات Analytics، والإجراء التجاري الذي تريد من الزائر القيام به. كلما كان ذلك أوضح أصبح Scope والتسعير أدق.</p><p><a href="/ar/pages/استشاري-seo-الرياض">راجع منهجية استشارات SEO</a> أو <a href="/ar/contact.html?service=seo-aeo">اطلب SEO Opportunity Review</a>.</p>`
 },
 {
  enSlug:'seo-consultant-vs-agency-riyadh',arSlug:'مستشار-seo-ام-شركة-seo-الرياض',
  enTitle:'SEO Consultant vs SEO Agency in Riyadh: Which Is Better for Your Business?',
  arTitle:'مستشار SEO أم شركة SEO في الرياض؟ كيف تختار الأنسب؟',
  enMeta:'Compare an SEO consultant and SEO agency in Riyadh by scope, speed, ownership, communication and implementation before you hire.',
  arMeta:'مقارنة عملية بين مستشار SEO وشركة SEO في الرياض حسب نطاق العمل، سرعة القرار، التواصل، التنفيذ والتكلفة التنظيمية قبل التعاقد.',
  enBody:`<p>The right choice depends less on the label and more on the operating model your business needs.</p><h2>Choose a consultant when you need senior focus</h2><p>A consultant can be useful when the problem is strategy, prioritization, audits, cross-team coordination or direct access to the person making SEO decisions.</p><h2>Choose an agency when you need production capacity</h2><p>An agency can be the better fit when the scope requires a larger content team, development capacity, outreach or several specialists working in parallel.</p><h2>Ask who actually does the work</h2><p>Do not evaluate only the sales presentation. Ask who owns technical decisions, content briefs, reporting and implementation after the contract starts.</p><h2>Compare implementation ownership</h2><p>Some providers advise while your team executes. Others implement directly. This difference has a major effect on speed, internal workload and total cost.</p><h2>Use a 90-day decision framework</h2><p>Before signing a long engagement, define the first 90-day outcomes: technical blockers removed, priority pages improved, content cluster launched and lead measurement working.</p><p><a href="/en/pages/seo-consultant-riyadh">Review my SEO consulting model</a> or <a href="/en/contact.html?service=seo-aeo">request an initial review</a>.</p>`,
  arBody:`<p>الاختيار الصحيح لا يعتمد على الاسم «مستشار» أو «شركة» بقدر ما يعتمد على طريقة العمل التي يحتاجها نشاطك.</p><h2>اختر مستشار SEO عندما تحتاج تركيزًا مباشرًا</h2><p>المستشار مناسب عندما تكون المشكلة في الاستراتيجية أو ترتيب الأولويات أو الـAudit أو التنسيق مع فرق التسويق والتقنية، وتحتاج وصولًا مباشرًا للشخص الذي يتخذ القرار.</p><h2>اختر شركة SEO عندما تحتاج طاقة إنتاج أكبر</h2><p>الوكالة قد تكون أفضل عندما تحتاج فريق محتوى كبيرًا أو تطويرًا مستمرًا أو Outreach أو عدة تخصصات تعمل بالتوازي.</p><h2>اسأل من سينفذ فعليًا</h2><p>لا تقيّم العرض التجاري فقط. اسأل من يملك قرارات Technical SEO، ومن يكتب الـBriefs، ومن يراجع التنفيذ والتقارير بعد بدء العقد.</p><h2>قارن مسؤولية التنفيذ</h2><p>بعض الجهات تعطي توصيات ويقوم فريقك بالتنفيذ، وجهات أخرى تنفذ مباشرة. هذا الفرق يؤثر على السرعة وحجم العمل الداخلي والتكلفة الكلية.</p><h2>استخدم إطار 90 يومًا</h2><p>قبل التزام طويل، اتفق على نواتج أول 90 يومًا: إزالة العوائق التقنية، تحسين الصفحات التجارية، إطلاق Cluster محتوى، وتشغيل قياس الـLeads.</p><p><a href="/ar/pages/استشاري-seo-الرياض">راجع نموذج استشارات SEO</a> أو <a href="/ar/contact.html?service=seo-aeo">اطلب مراجعة أولية</a>.</p>`
 },
 {
  enSlug:'google-ads-management-cost-saudi-arabia-2026',arSlug:'تكلفة-ادارة-google-ads-السعودية-2026',
  enTitle:'Google Ads Management Cost in Saudi Arabia 2026: Budget vs Management Fee',
  arTitle:'تكلفة إدارة Google Ads في السعودية 2026: الميزانية أم رسوم الإدارة؟',
  enMeta:'Understand Google Ads management cost in Saudi Arabia and separate ad spend, management fees, tracking and landing-page work before comparing proposals.',
  arMeta:'افهم تكلفة إدارة Google Ads في السعودية وافصل بين ميزانية الإعلان ورسوم الإدارة وTracking وصفحات الهبوط قبل مقارنة العروض.',
  enBody:`<p><strong>Quick answer:</strong> Google Ads cost has two different parts: the media budget paid to Google and the fee for managing, measuring and improving the account. They should never be confused.</p><h2>1. Ad spend</h2><p>This is the amount available for auctions, clicks and conversions. Google lets advertisers control their budgets; the right level depends on search demand, competition and commercial value.</p><h2>2. Management fee</h2><p>This pays for account structure, keyword work, creative testing, optimization, reporting and decision-making. The fee depends on complexity, not only the amount spent.</p><h2>3. Tracking and measurement</h2><p>GA4, GTM, call/form tracking or e-commerce events may require separate setup. Without reliable conversion data, campaign optimization can move in the wrong direction.</p><h2>4. Landing-page work</h2><p>Paid search can capture intent, but the page still has to convert it. Message match, proof, mobile speed and form friction all affect acquisition cost.</p><h2>How should you compare proposals?</h2><p>Ask what is included, who owns tracking, how lead quality is reviewed, how often optimization happens and which business KPI controls budget decisions.</p><p><a href="/en/pages/performance-marketing-consultant-saudi-arabia">See the performance marketing approach</a> or <a href="/en/contact.html?service=paid-media">request a campaign audit</a>.</p>`,
  arBody:`<p><strong>الإجابة المختصرة:</strong> تكلفة Google Ads تتكون من جزأين مختلفين: ميزانية الإعلان التي تُدفع إلى Google، ورسوم إدارة وقياس وتحسين الحساب. الخلط بين الاثنين يجعل مقارنة العروض غير دقيقة.</p><h2>1. ميزانية الإعلان Ad Spend</h2><p>هي الميزانية المتاحة للمزادات والنقرات والتحويلات. مستوى الميزانية المناسب يعتمد على حجم البحث والمنافسة والقيمة التجارية للتحويل.</p><h2>2. رسوم الإدارة</h2><p>تغطي هيكلة الحساب، الكلمات، الاختبارات، التحسين، التقارير واتخاذ القرار. تعقيد الحساب أهم من مجرد رقم الإنفاق.</p><h2>3. Tracking والقياس</h2><p>إعداد GA4 وGTM وتتبع النماذج والمكالمات أو أحداث التجارة الإلكترونية قد يحتاج عملًا مستقلًا. بدون بيانات تحويل موثوقة قد تتجه الخوارزمية والميزانية في الاتجاه الخطأ.</p><h2>4. صفحة الهبوط</h2><p>Google Search يلتقط نية الشراء، لكن الصفحة يجب أن تحولها إلى Lead أو بيع. تطابق الرسالة والثقة وسرعة الجوال واحتكاك النموذج كلها تؤثر على تكلفة الاستحواذ.</p><h2>كيف تقارن العروض؟</h2><p>اسأل ما الذي يشمله العرض، من مسؤول عن Tracking، كيف تُراجع جودة الـLeads، كم مرة يتم التحسين، وأي KPI تجاري يتحكم في قرار الميزانية.</p><p><a href="/ar/pages/استشاري-performance-marketing-السعودية">راجع منهجية Performance Marketing</a> أو <a href="/ar/contact.html?service=paid-media">اطلب Audit للحملات</a>.</p>`
 }
];

function articleLayout(lang,a){
  const ar=lang==='ar',slug=ar?a.arSlug:a.enSlug,other=ar?a.enSlug:a.arSlug,title=ar?a.arTitle:a.enTitle,meta=ar?a.arMeta:a.enMeta,bodyText=ar?a.arBody:a.enBody;
  const canonical=BASE+'/'+lang+'/articles/'+encodeURIComponent(slug);
  const alt=BASE+'/'+(ar?'en':'ar')+'/articles/'+encodeURIComponent(other);
  const schema=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:title,description:meta,author:{'@type':'Person',name:'Mohamed Ali Rassmiy'},publisher:{'@type':'Organization',name:'Rassmiy Marketing'},mainEntityOfPage:canonical}).replaceAll('<','\\u003c');
  return '<!doctype html><html lang="'+lang+'" dir="'+(ar?'rtl':'ltr')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title+' | Rassmiy Marketing')+'</title><meta name="description" content="'+esc(meta)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="'+esc(canonical)+'"><link rel="alternate" hreflang="'+lang+'" href="'+esc(canonical)+'"><link rel="alternate" hreflang="'+(ar?'en':'ar')+'" href="'+esc(alt)+'"><link rel="alternate" hreflang="x-default" href="'+esc(ar?alt:canonical)+'"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(meta)+'"><meta property="og:type" content="article"><meta property="og:url" content="'+esc(canonical)+'"><link rel="stylesheet" href="/assets/styles.css"><script type="application/ld+json">'+schema+'</script></head><body><main id="main-content"><section class="page-hero"><div class="container"><div class="kicker">'+(ar?'قرار شراء':'Buyer Guide')+'</div><h1>'+title+'</h1><p>'+meta+'</p></div></section><section class="section"><div class="container"><article class="prose">'+bodyText+'</article><aside class="growth-card"><h2>'+(ar?'هل تريد قرارًا مبنيًا على موقعك وبياناتك؟':'Want a recommendation based on your own site and data?')+'</h2><p>'+(ar?'اطلب مراجعة أولية مرتبطة بهدفك التجاري بدل الاعتماد على متوسطات عامة.':'Request an initial review tied to your commercial goal instead of relying on generic averages.')+'</p><a class="btn primary" href="/'+lang+'/contact.html">'+(ar?'اطلب المراجعة →':'Request a review →')+'</a></aside></div></section></main><script defer src="/assets/site.js"></script></body></html>';
}
for(const a of articles){
  for(const lang of ['ar','en']){
    const slug=lang==='ar'?a.arSlug:a.enSlug;
    write(path.join(root,lang,'articles',slug,'index.html'),articleLayout(lang,a));
  }
}

// Add BOFU articles to article indexes without duplicating.
for(const lang of ['ar','en']){
  const file=path.join(root,lang,'articles','index.html'); if(!fs.existsSync(file))continue;
  let h=read(file),ar=lang==='ar';
  if(!h.includes('BOFU_ARTICLES_V78')){
    const cards='<!-- BOFU_ARTICLES_V78 -->'+articles.map(a=>{
      const slug=ar?a.arSlug:a.enSlug,title=ar?a.arTitle:a.enTitle,meta=ar?a.arMeta:a.enMeta;
      return '<article class="article-card"><div class="tag">'+(ar?'نية شراء':'Buyer Intent')+'</div><h2><a href="/'+lang+'/articles/'+encodeURIComponent(slug)+'">'+title+'</a></h2><p>'+meta+'</p><a class="link" href="/'+lang+'/articles/'+encodeURIComponent(slug)+'">'+(ar?'اقرأ الدليل →':'Read the guide →')+'</a></article>';
    }).join('');
    h=h.replace(/<div class="articles">/i,'<div class="articles">'+cards);
    write(file,h);
  }
}

// Cache bust public static assets so old mobile UI cannot survive a new publish.
for(const file of (function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)])})(root).filter(f=>f.endsWith('.html'))){
  let h=read(file);
  h=h.replace(/\/assets\/styles\.css(?:\?v=[^"' ]+)?/g,'/assets/styles.css?v=78');
  h=h.replace(/\/assets\/site\.js(?:\?v=[^"' ]+)?/g,'/assets/site.js?v=78');
  write(file,h);
}
const appFile=path.join(root,'netlify','functions','app.mjs');
let app=read(appFile);
app=app.replace(/\/assets\/styles\.css(?:\?v=[^"' ]+)?/g,'/assets/styles.css?v=78');
app=app.replace(/\/assets\/site\.js(?:\?v=[^"' ]+)?/g,'/assets/site.js?v=78');
write(appFile,app);

fs.writeFileSync(path.join(root,'seo-demand-v78.json'),JSON.stringify({
  version:'7.8',
  homepagePrimary:{ar:'استشاري تسويق في الرياض',en:'marketing consultant Riyadh'},
  seoLandingPrimary:{ar:'استشاري SEO في الرياض',en:'SEO consultant Riyadh'},
  bofuArticles:articles.map(x=>({ar:x.arSlug,en:x.enSlug})),
  cacheBust:'v=78'
},null,2));
console.log('SEO_DEMAND_V78=PASS');

import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2]||'release';
for(const lang of ['ar','en']){
 const ar=lang==='ar';
 const rows=ar?[
 ['تشخيص واستشارة','لديك فريق أو منفذ وتحتاج قرارًا واضحًا','مراجعة المعطيات، سجل المشكلات، وأولويات مع مسؤول ومؤشر لكل مهمة','وضوح القرار وقابلية تنفيذ الأولويات'],
 ['تنفيذ خدمة محددة','المشكلة واضحة في SEO أو الإعلانات أو المتجر','نطاق محدد بالصفحات أو الحملات، قائمة تنفيذ، وفحص قبل وبعد','مؤشر مرتبط بالخدمة: ظهور مؤهل، طلبات أو تحويل'],
 ['إدارة تسويق مستمرة','تحتاج ربط أكثر من قناة ومتابعة شهرية','خطة قنوات، جدول مهام، سجل اختبارات وتقرير قرارات','جودة الاستفسارات وتطور فرص البيع وتكلفة الاكتساب']
 ]:[
 ['Diagnosis and consulting','You have an execution team but need clear priorities','Evidence review, issue register and actions with owners and metrics','Decision clarity and executable priorities'],
 ['Focused service execution','A defined SEO, advertising or store problem','Page or campaign scope, implementation checklist and before/after validation','A service-specific outcome: relevant visibility, enquiries or conversion'],
 ['Ongoing marketing management','You need connected channels and monthly follow-through','Channel plan, task schedule, experiment log and decision report','Enquiry quality, sales opportunities and acquisition cost']];
 const heads=ar?['المسار','متى يناسبك؟','مخرجات تُحدد في العرض','ما الذي نراجعه؟']:['Engagement','When it fits','Deliverables defined in the proposal','Review focus'];
 const table=`<div class="scope-table" role="region" aria-label="${ar?'مقارنة مسارات خدمات التسويق':'Marketing engagement comparison'}" tabindex="0"><table><caption>${ar?'اختر نطاق العمل حسب احتياج المشروع':'Choose scope around your business need'}</caption><thead><tr>${heads.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr><th scope="row">${row[0]}</th>${row.slice(1).map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 const consult=ar?'استشاري-تسويق-رقمي-الرياض':'digital-marketing-consultant-riyadh';
 const segments=ar?[
 ['شركة تبيع لشركات B2B','اربط صفحة الحل بنوع المشتري والمنطقة ومتطلبات الطلب. تابع الاستفسار المؤهل ثم عرض السعر وفرصة البيع، مع مراعاة طول دورة التعاقد.','b2b-lead-generation','توليد عملاء للشركات'],
 ['متجر إلكتروني','ابدأ بالفئات والمنتجات والمخزون والتوصيل وصحة قياس الطلب. اربط الظهور في البحث والحملات بمعدل الشراء والهامش والمرتجعات.','ecommerce-marketing','تسويق المتاجر الإلكترونية'],
 ['نشاط يقدم خدمات في الرياض','وضّح نطاق الخدمة والمناطق التي تخدمها وطريقة الحجز أو طلب العرض. وجّه الزائر إلى الصفحة الأقرب لاحتياجه بدل إرسال جميع الحملات إلى الرئيسية.','seo-services','تحسين ظهور الخدمات في البحث']
 ]:[
 ['B2B business','Connect solution pages to buyer roles, served regions and order requirements. Follow qualified enquiry, quotation and opportunity stages while accounting for longer sales cycles.','b2b-lead-generation','B2B lead generation'],
 ['Online store','Start with categories, products, stock, delivery and purchase measurement. Connect search and campaigns with conversion, margins and returns.','ecommerce-marketing','E-commerce marketing'],
 ['Service business in Riyadh','Explain coverage, scope and the booking or quotation process. Send visitors to the relevant service page rather than using the homepage for every campaign.','seo-services','Search visibility for services']];
 const stages=ar?[
 ['الأسبوع الأول: فهم وقياس','تحديد العرض والجمهور، مراجعة الوصول للحسابات، وتسجيل خط الأساس والمشكلات. المخرج: قائمة أولويات معتمدة.'],
 ['الأسبوع الثاني: تجهيز','تحسين الصفحة أو القياس أو بنية الحملة وفق الأولوية. المخرج: أصل جاهز للفحص وقائمة قبول قبل الإطلاق.'],
 ['الأسبوع الثالث: اختبار','تنفيذ اختبار محدود بفرضية ومؤشر وميزانية متفق عليها إن كان مدفوعًا. المخرج: سجل تنفيذ وملاحظات الجودة.'],
 ['الأسبوع الرابع: مراجعة','مراجعة البيانات المتاحة مع جودة الاستفسارات وتحديد الاستمرار أو التعديل. المخرج: قرارات وخطة الفترة التالية.']
 ]:[
 ['Week one: understand and measure','Define the offer and audience, review account access, and record a baseline and issues. Output: agreed priorities.'],
 ['Week two: prepare','Improve the priority page, measurement or campaign structure. Output: a reviewable asset and a pre-launch acceptance checklist.'],
 ['Week three: test','Run a bounded test with a hypothesis, metric and agreed budget where paid. Output: execution log and quality observations.'],
 ['Week four: review','Review available evidence and enquiry quality to decide what to continue or change. Output: decisions and the next work plan.']];
 const block=`<section class="section" id="engagement-options"><div class="container"><article class="prose"><h2>${ar?'ما مسار التسويق المناسب لمشروعك؟':'Which marketing engagement fits your business?'}</h2>${table}<p>${ar?'هذه خيارات لتحديد النطاق وليست باقات بأسعار ثابتة. تُعتمد التسليمات والمدة والتكلفة بعد مراجعة المشروع.':'These are scope options, not fixed-price packages. Deliverables, timing and fees are agreed after reviewing the project.'}</p><p><a class="btn" href="/${lang}/contact.html">${ar?'اطلب نطاق عمل لمشروعك':'Request a scope for your project'}</a> <a href="/${lang}/pages/${consult}/">${ar?'ابدأ باستشارة تسويقية':'Start with marketing consulting'}</a></p><h2>${ar?'كيف تختلف الأولويات حسب نشاطك؟':'How do priorities change by business model?'}</h2><div class="growth-grid">${segments.map(([title,desc,slug,label])=>`<section class="growth-card"><h3>${title}</h3><p>${desc}</p><a href="/${lang}/pages/${slug}/">${label}</a></section>`).join('')}</div><h2>${ar?'نموذج بداية لمدة 30 يومًا':'An illustrative 30-day starting plan'}</h2><p>${ar?'هذا نموذج تنظيمي يُعدّل حسب النطاق والصلاحيات والموافقات، وليس تعهدًا بنتائج أو ترتيب خلال شهر.':'This planning example is adapted to scope, access and approvals. It is not a promise of rankings or business results within a month.'}</p><ol>${stages.map(([title,desc])=>`<li><h3>${title}</h3><p>${desc}</p></li>`).join('')}</ol><h2>${ar?'ماذا ترسل لطلب عرض مناسب؟':'What should you include in an enquiry?'}</h2><p>${ar?'رابط الموقع، وصف نشاطك، العميل المستهدف، مناطق الخدمة، المشكلة الأهم، والقنوات الحالية. اذكر هل تحتاج استشارة أم تنفيذًا والميزانية المتاحة إن رغبت. لا تحتاج مشاركة بيانات عملائك أو كلمات مرورك لبدء النقاش.':'Include your website, business description, target buyer, served regions, main challenge and current channels. State whether you need advice or execution and an indicative budget if you wish. Customer records and passwords are not needed for the initial discussion.'}</p><p><a class="btn" href="/${lang}/contact.html">${ar?'ناقش نطاق العمل':'Discuss the scope'}</a> · <a href="/${lang}/portfolio.html">${ar?'راجع الأعمال المنشورة':'Review published work'}</a></p></article></div></section>`;
 for(const rel of ['services.html','pages/marketing-agency-riyadh/index.html']){
  const p=path.join(root,lang,rel);let h=fs.readFileSync(p,'utf8');
  // Keep the existing narrative and make concrete engagement options reachable near the top.
  h=h.replace('</main>',block+'</main>');
  h=h.replace('</h1>',`</h1><p><a href="#engagement-options">${ar?'قارن مسارات الخدمة ومخرجاتها':'Compare engagement options and deliverables'}</a></p>`);
  h=h.replace('</head>','<style>.scope-table{overflow-x:auto;margin:1.5rem 0}.scope-table table{border-collapse:collapse;width:100%;min-width:640px}.scope-table caption{text-align:start;font-weight:700;padding:.7rem}.scope-table th,.scope-table td{border:1px solid #8886;padding:1rem;text-align:start;vertical-align:top}.scope-table th{font-weight:700}.scope-table:focus{outline:2px solid currentColor}#engagement-options{scroll-margin-top:6rem}</style></head>');
  fs.writeFileSync(p,h);
 }
 for(const slug of ['choose-marketing-company-saudi','marketing-services-budget-saudi']){
  const p=path.join(root,lang,'articles',slug,'index.html');let h=fs.readFileSync(p,'utf8'),i=0,items=[];
  h=h.replace(/<h2>([^<]+)<\/h2>/g,(_,title)=>{const id='guide-section-'+(++i);items.push(`<li><a href="#${id}">${title}</a></li>`);return `<h2 id="${id}" style="scroll-margin-top:6rem">${title}</h2>`;});
  h=h.replace('<article class="prose">',`<article class="prose"><nav aria-label="${ar?'محتويات الدليل':'Guide contents'}"><p><strong>${ar?'في هذا الدليل':'In this guide'}</strong></p><ol>${items.join('')}</ol></nav>`);
  fs.writeFileSync(p,h);
 }
}
console.log('COMPETITIVE_V84: engagement comparison, business-model guidance, illustrative roadmap, guide navigation');

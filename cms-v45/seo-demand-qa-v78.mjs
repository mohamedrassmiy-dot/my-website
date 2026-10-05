import fs from 'node:fs';import path from 'node:path';
const root=process.argv[2]||'release';
const must=(ok,label)=>{if(!ok)throw new Error('SEO DEMAND QA FAIL: '+label);console.log('SEO DEMAND QA PASS:',label)};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
must(read('index.html').includes('استشاري تسويق في الرياض'),'Arabic homepage targets marketing consultant Riyadh');
must(read('en/index.html').includes('Marketing Consultant Riyadh'),'English homepage targets marketing consultant Riyadh');
must(read('ar/pages/استشاري-seo-الرياض/index.html').includes('SEO Opportunity Review'),'Arabic SEO landing conversion CTA');
must(read('en/pages/seo-consultant-riyadh/index.html').includes('SEO Opportunity Review'),'English SEO landing conversion CTA');
must(read('ar/pages/استشاري-seo-الرياض/index.html').includes('FAQPage'),'Arabic SEO landing FAQ schema');
for(const p of [
 'ar/articles/تكلفة-seo-في-السعودية-2026/index.html',
 'en/articles/seo-cost-saudi-arabia-2026/index.html',
 'ar/articles/مستشار-seo-ام-شركة-seo-الرياض/index.html',
 'en/articles/seo-consultant-vs-agency-riyadh/index.html',
 'ar/articles/تكلفة-ادارة-google-ads-السعودية-2026/index.html',
 'en/articles/google-ads-management-cost-saudi-arabia-2026/index.html'
]) must(fs.existsSync(path.join(root,p)),p+' exists');
must(read('ar/articles/index.html').includes('BOFU_ARTICLES_V78'),'Arabic article index contains buyer-intent cluster');
must(read('en/articles/index.html').includes('BOFU_ARTICLES_V78'),'English article index contains buyer-intent cluster');
must(read('index.html').includes('/assets/styles.css?v=78')&&read('index.html').includes('/assets/site.js?v=78'),'cache-busted public assets');
const app=read('netlify/functions/app.mjs');
must(app.includes('/assets/styles.css?v=78')&&app.includes('/assets/site.js?v=78'),'cache-busted dynamic assets');
console.log('SEO_DEMAND_QA_V78=PASS');
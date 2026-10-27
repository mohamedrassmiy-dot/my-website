import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root='release',host='https://rassmiy-marketing.netlify.app';
const targets=[
'ar/services.html','en/services.html',
'ar/pages/marketing-agency-riyadh/index.html','en/pages/marketing-agency-riyadh/index.html',
'ar/pages/استشاري-تسويق-رقمي-الرياض/index.html','en/pages/digital-marketing-consultant-riyadh/index.html',
'ar/pages/seo-services/index.html','en/pages/seo-services/index.html'
];
const checked=[];
for(const rel of targets){
 const html=fs.readFileSync(path.join(root,rel),'utf8');
 assert.equal([...html.matchAll(/<!-- COMMERCIAL_INTENT_V88 -->/g)].length,1,rel+': content injected once');
 assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/gi)].length,1,rel+': one H1');
 assert.ok(!/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html),rel+': indexability');
 const canonical=[...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)];
 assert.equal(canonical.length,1,rel+': canonical count');
 const url=new URL(canonical[0][1]);
 assert.equal(url.origin,host,rel+': canonical host');
 assert.ok(html.includes('id="commercial-intent-v88"'),rel+': useful detail');
 assert.ok(html.includes('commercial-intro-v88'),rel+': direct first answer');
 assert.ok(html.includes('href="/'+rel.slice(0,2)+'/about.html"'),rel+': expertise');
 assert.ok(html.includes('href="/'+rel.slice(0,2)+'/portfolio.html"'),rel+': evidence');
 assert.ok(html.includes('href="/'+rel.slice(0,2)+'/contact.html"'),rel+': conversion');
 const jsons=[...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>{try{return JSON.parse(x[1]);}catch(e){throw Error(rel+': bad JSON-LD '+e.message);}});
 const services=jsons.filter(x=>x['@type']==='Service');
 const faq=jsons.filter(x=>x['@type']==='FAQPage');
 const breadcrumb=jsons.filter(x=>x['@type']==='BreadcrumbList');
 assert.equal(services.length,1,rel+': Service schema');
 assert.equal(faq.length,1,rel+': FAQ schema');
 assert.equal(breadcrumb.length,1,rel+': BreadcrumbList');
 assert.equal(faq[0].mainEntity.length,4,rel+': four relevant questions');
 for(const q of faq[0].mainEntity){
  assert.ok(html.includes(q.name),rel+': question visible');
  assert.ok(html.includes(q.acceptedAnswer.text.replaceAll('&','&amp;'))||html.includes(q.acceptedAnswer.text),rel+': answer visible');
 }
 const text=html.match(/<section class="section" id="commercial-intent-v88">([\s\S]*?)<\/section><\/main>/)?.[1]||'';
 assert.ok(text.length>1600,rel+': useful, detailed original content');
 checked.push({url:url.href,faqs:faq[0].mainEntity.length,blockChars:text.length});
}
console.log('COMMERCIAL_INTENT_V88_QA=PASS: '+checked.length+' pages, 32 visible answers, schema + CTA + evidence validated');
for(const p of checked)console.log('V88_QA_PAGE',JSON.stringify(p));

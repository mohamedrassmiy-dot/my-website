import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2]||'release';
const read=s=>fs.readFileSync(path.join(root,s),'utf8');
const assert=(condition,label)=>{if(!condition)throw Error('SEO BRAND V79 QA FAIL: '+label);console.log('SEO BRAND V79 QA PASS: '+label)};
for(const file of ['index.html','ar/index.html']){
 const page=read(file);
 assert(/<title>شركة تسويق في الرياض/.test(page),file+' commercial title');
 assert(/<h1>شركة تسويق في الرياض/.test(page),file+' company H1');
 assert(page.includes('/ar/pages/marketing-agency-riyadh'),file+' agency link');
 assert(page.includes('استشاري تسويق في الرياض'),file+' consultant intent retained');
}
const en=read('en/index.html');
assert(/<title>Marketing Company/.test(en),'English marketing company title');
assert(en.includes('Marketing Consultant Riyadh'),'existing SEO consultant positioning preserved');
for(const lang of ['ar','en']){
 const services=read(lang+'/services.html');
 const agency=read(lang+'/pages/marketing-agency-riyadh/index.html');
 assert(services.includes('<!-- BRAND_SEARCH_V79 -->'),lang+' services commercial copy');
 assert(agency.includes('<main id="main-content">'),lang+' agency page landmark');
 assert(agency.includes('name="robots" content="index,follow'),lang+' agency indexable');
 assert(agency.includes('rel="canonical" href="https://rassmiy-marketing.netlify.app/'+lang+'/pages/marketing-agency-riyadh"'),lang+' canonical');
 assert((agency.match(/<h1\b/g)||[]).length===1,lang+' one agency H1');
 assert(agency.includes('hreflang="ar"')&&agency.includes('hreflang="en"')&&agency.includes('hreflang="x-default"'),lang+' hreflang');
}
const app=read('netlify/functions/app.mjs');
assert(app.includes('/ar/pages/marketing-agency-riyadh')&&app.includes('/en/pages/marketing-agency-riyadh'),'new bilingual agency URLs submitted to dynamic sitemap');
for(const lang of ['ar','en']){
  const services=read(lang+'/services.html');
  assert(services.includes('<!-- SEO_CLUSTER_V80 -->'),lang+' service cluster navigation');
  for(const slug of ['social-media-management-riyadh','google-ads-management-saudi','content-marketing-saudi','digital-marketing-strategy-saudi']){
    const page=read(lang+'/pages/'+slug+'/index.html');
    assert(page.includes('<h1>')&&(page.match(/<h1\b/g)||[]).length===1,lang+' one H1 '+slug);
    assert(page.includes('rel="canonical" href="https://rassmiy-marketing.netlify.app/'+lang+'/pages/'+slug+'"'),lang+' canonical '+slug);
    assert(page.includes('name="robots" content="index,follow'),lang+' robots '+slug);
    assert(services.includes('/'+lang+'/pages/'+slug),lang+' internal link '+slug);
  }
}
console.log('SEO_BRAND_QA_V79_AND_V80=PASS');
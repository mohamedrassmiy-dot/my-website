import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2]||'release';
const assert=(yes,label)=>{if(!yes)throw Error('SEO TOPIC QA: '+label)};
const html=p=>fs.readFileSync(path.join(root,p),'utf8');
const topics=JSON.parse(fs.readFileSync(path.join(root,'seo-topics-v80.json'),'utf8'));
assert(topics.primaryServicePages.length>=10,'10+ clusters generated');
for(const lang of ['ar','en'])for(const slug of topics.primaryServicePages){
 const f=lang+'/pages/'+slug+'/index.html',h=html(f);
 assert((h.match(/<h1\b/g)||[]).length===1,f+' one H1');
 assert((h.match(/<link rel="canonical"/g)||[]).length===1,f+' one canonical');
 assert(/<meta name="robots" content="index,follow/.test(h),f+' indexable');
 assert(/<meta name="description" content="[^"]{50,}"/.test(h),f+' description');
 assert(h.includes('/'+lang+'/contact.html'),f+' CTA');
 assert(h.includes('application/ld+json'),f+' structured data');
 assert(h.includes('href="https://wa.me/966536741442"'),f+' WhatsApp');
 assert(h.includes('https://www.linkedin.com/company/rassmiy-marketing/'),f+' business social');
 assert(h.includes('/assets/site.js'),f+' main javascript');
}
for(const f of ['index.html','ar/index.html','en/index.html']){
 const h=html(f);assert(/شركة تسويق في الرياض|Marketing company in Riyadh/i.test(h),f+' commercial targeting');
}
for(const lang of ['ar','en']){
 assert(html(lang+'/services.html').includes('service-topics-v80'),lang+' commercial services navigation');
 assert(html(lang+'/pages/marketing-agency-riyadh/index.html').includes('marketing-agency-riyadh'),lang+' agency landing');
 assert(html(lang+'/articles/index.html').includes('article-topic-links-v80'),lang+' supporting articles linking');
}
console.log('SEO_TOPICS_QA_V80=PASS: '+topics.primaryServicePages.length*2+' service pages + bilingual hubs + agency pages');

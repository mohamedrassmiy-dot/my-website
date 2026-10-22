import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2]||'release';
const host='https://rassmiy-marketing.netlify.app';
const critical=[
'/ar/index.html',
'/ar/services.html',
'/ar/pages/marketing-agency-riyadh/index.html',
'/ar/pages/استشاري-تسويق-رقمي-الرياض/index.html',
'/ar/articles/choose-marketing-company-saudi/index.html',
'/ar/articles/marketing-services-budget-saudi/index.html',
'/en/services.html'
];
const toPublicPath=p=>p.endsWith('/index.html')?p.slice(0,-10):p;
let tested=0;
for(const route of critical){
 const file=path.join(root,route.slice(1));
 const html=fs.readFileSync(file,'utf8');
 const canonical=[...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)];
 assert.equal(canonical.length,1,'one canonical: '+route);
 const url=new URL(canonical[0][1]);
 assert.equal(url.origin,host,'canonical must use primary host: '+route);
 assert.equal(decodeURIComponent(url.pathname),toPublicPath(route),'self canonical: '+route);
 const robots=[...html.matchAll(/<meta\s+name="robots"\s+content="([^"]+)"/gi)];
 assert.ok(robots.every(x=>!/(?:noindex|none)/i.test(x[1])),'no noindex: '+route);
 assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/gi)].length,1,'one H1: '+route);
 assert.ok(/<meta\s+name="description"\s+content="[^"]{40,}"/i.test(html),'useful meta description: '+route);
 assert.ok(html.includes('<main'),'main content: '+route);
 tested++;
}
const app=fs.readFileSync(path.join(root,'netlify/functions/app.mjs'),'utf8');
for(const route of critical.filter(x=>x.includes('/pages/')||x.includes('/articles/'))){
 const url=host+toPublicPath(route);
 assert.ok(app.includes(url),'critical page missing from sitemap generator: '+route);
}
console.log('Indexability gate passed: '+tested+' critical commercial pages');

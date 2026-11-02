import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.argv[2]||'release';
const checks=[
 ['index.html','شركة تسويق في الرياض','marketing-company'],
 ['ar/index.html','شركة تسويق في الرياض','marketing-company'],
 ['en/index.html','Marketing Company Riyadh','marketing-company'],
 ['ar/services.html','خدمات تسويق إلكتروني في الرياض','marketing-services'],
 ['en/services.html','Digital Marketing Services Riyadh','marketing-services'],
 ['ar/pages/marketing-agency-riyadh/index.html','وكالة تسويق رقمي بالرياض','marketing-agency'],
 ['en/pages/marketing-agency-riyadh/index.html','Digital Marketing Agency Riyadh','marketing-agency']
];
let count=0;
for(const [rel,title,intent] of checks){
 const file=path.join(root,rel);
 const h=fs.readFileSync(file,'utf8');
 assert.ok(h.includes('<!-- GROWTH_89 -->'),'Growth content missing: '+rel);
 assert.ok(h.includes('<title>'+title),'Commercial title missing: '+rel);
 assert.ok(h.includes('data-rassmiy-cta="'+intent+'"'),'Lead CTA missing: '+rel);
 assert.ok(h.includes('/assets/rassmiy-growth-events.js'),'CTA telemetry missing: '+rel);
 assert.equal((h.match(/<h1\b/gi)||[]).length,1,'H1 count: '+rel);
 assert.equal((h.match(/<meta\s+name=["']description["']/gi)||[]).length,1,'Meta description count: '+rel);
 assert.equal((h.match(/<link\s+rel=["']canonical["']/gi)||[]).length,1,'Canonical count: '+rel);
 assert.doesNotMatch(h,/<meta[^>]+(?:noindex|nofollow)/i,'Unexpected noindex: '+rel);
 count++;
}
const event=fs.readFileSync(path.join(root,'assets/rassmiy-growth-events.js'),'utf8');
assert.ok(event.includes('rassmiy_lead_intent_click'));
assert.ok(!event.includes('generate_lead'),'Do not pretend CTA click is confirmed lead');
assert.match(fs.readFileSync(path.join(root,'assets/styles.css'),'utf8'),/growth89-actions/);
console.log('SEO_GROWTH_89_QA=PASS pages='+count);

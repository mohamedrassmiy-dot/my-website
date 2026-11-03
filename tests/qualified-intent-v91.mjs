import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=process.argv[2]||'release';
const focus=[
 'ar/pages/b2b-lead-generation/index.html',
 'en/pages/b2b-lead-generation/index.html',
 'en/pages/seo-consultant-riyadh/index.html',
 'ar/pages/seo-services/index.html'
];
for(const rel of focus){
 const html=fs.readFileSync(path.join(root,rel),'utf8');
 assert.ok(html.includes('<!-- QUALIFIED_INTENT_V91 -->'),'Missing buyer intent section: '+rel);
 assert.equal((html.match(/<h1\b/gi)||[]).length,1,'Single H1: '+rel);
 assert.equal((html.match(/<link\s+rel=["']canonical["']/gi)||[]).length,1,'Single canonical: '+rel);
 assert.ok(html.includes('/assets/qualified-intent-v91.js'),'Tracking script: '+rel);
}
for(const lang of ['ar','en']){
 const html=fs.readFileSync(path.join(root,lang,'contact.html'),'utf8');
 assert.ok(html.includes('action="/api/lead"'),'Existing lead API unchanged: '+lang);
 assert.ok(html.includes('role="alert"'),'Accessible validation message: '+lang);
 assert.ok(html.includes('type="tel"'),'Mobile telephone input: '+lang);
 assert.ok(html.includes('/assets/qualified-intent-v91.js'),'Attribution script: '+lang);
}
const js=fs.readFileSync(path.join(root,'assets/qualified-intent-v91.js'),'utf8');
assert.ok(js.includes("rassmiy_contact_method_click"),'Non-purchase contact-click event');
function run(search,pathname,withForm){
 const listeners={},events=[],hidden={value:''},alert={hidden:true,textContent:''};
 const email={value:'',addEventListener(){},setCustomValidity(){},focus(){}},phone={value:'',addEventListener(){},setCustomValidity(){},focus(){}};
 const form={querySelector:q=>q.includes('name="email"')?email:q.includes('name="phone"')?phone:q.includes('name="page_url"')?hidden:null,addEventListener:(key,cb)=>{listeners['form:'+key]=cb;}};
 const document={addEventListener:(key,cb)=>{listeners[key]=cb;},querySelector:()=>withForm?form:null,getElementById:()=>alert,documentElement:{lang:'ar'}};
 vm.runInNewContext(js,{window:{dataLayer:events},document,location:{pathname,search,origin:'https://rassmiy-marketing.netlify.app'},URL,URLSearchParams,Object});
 return {listeners,events,hidden,alert,email,phone};
}
let test=run('?from=%2Far%2Fservices.html','/ar/contact.html',true);
assert.ok(test.hidden.value.includes('from=%2Far%2Fservices.html'),'Source page preserved in lead record');
let prevented=false,stopped=false;
test.listeners['form:submit']({preventDefault(){prevented=true;},stopImmediatePropagation(){stopped=true;}});
assert.ok(prevented&&stopped&&!test.alert.hidden,'Missing reply method blocked before submission');
assert.ok(test.events.some(e=>e.event==='rassmiy_lead_validation_error'),'Reason event');
test.phone.value='055 123 4567';
prevented=false;stopped=false;
test.listeners['form:submit']({preventDefault(){prevented=true;},stopImmediatePropagation(){stopped=true;}});
assert.ok(!prevented&&!stopped,'Saudi-format phone permits submission');
test=run('?utm_source=google','/ar/services.html',false);
const anchor={value:'/ar/contact.html?service=marketing-services',getAttribute(){return this.value;},set href(v){this.value=v;},get href(){return this.value;}};
test.listeners.click({target:{closest(){return anchor;}}});
assert.ok(anchor.value.includes('from=%2Far%2Fservices.html'),'Preserve CTA origin');
assert.ok(anchor.value.includes('utm_source=google'),'Carry campaign attribution');
const wa={getAttribute(){return 'https://wa.me/966500000000';}};
test.listeners.click({target:{closest(){return wa;}}});
assert.ok(test.events.some(e=>e.event==='rassmiy_contact_method_click'&&e.contact_method==='whatsapp'),'WhatsApp intent counted separately');
assert.ok(!js.includes('generate_lead'),'No false lead from outbound click');
console.log('QUALIFIED_INTENT_V91_QA=PASS pages='+focus.length+' contacts=2 validation=PASS attribution=PASS');

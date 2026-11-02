import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root=process.argv[2]||'release';
for(const lang of ['ar','en']){
 const html=fs.readFileSync(path.join(root,lang,'contact.html'),'utf8');
 assert.ok(html.includes('data-rassmiy-lead-form="1"'),lang+' enhanced real lead form');
 assert.ok(html.includes('/assets/contact-funnel-v90.js'),lang+' prefill script');
 assert.ok(html.includes('id="rassmiy-service-choice"'),lang+' service context');
 assert.ok(html.includes('action="/api/lead"'),lang+' backend submission');
}
const script=fs.readFileSync(path.join(root,'assets/contact-funnel-v90.js'),'utf8');
assert.ok(!script.includes('gtag("event","generate_lead"'),'No unverified standalone analytics integration');
const cache=new Map();
const storage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v),removeItem:k=>cache.delete(k)};
function execute(search,lang='ar'){
 let submission=null;
 const inputs={source:{value:''},page_url:{value:''},message:{value:''}};
 const form={querySelector:q=>inputs[q.match(/name="([^"]+)"/)?.[1]]||null,addEventListener:(type,callback)=>{if(type==='submit')submission=callback;}};
 const banner={hidden:true,textContent:''};
 const events=[];
 const win={dataLayer:events};
 vm.runInNewContext(script,{
  document:{querySelector:q=>q==='form[data-rassmiy-lead-form="1"]'?form:null,getElementById:k=>k==='rassmiy-service-choice'?banner:null,documentElement:{lang}},
  location:{search,pathname:'/'+lang+'/contact.html'},
  window:win,sessionStorage:storage,URLSearchParams,Date,JSON,Object
 });
 return {submission,inputs,banner,events};
}
let run=execute('?service=marketing-services&utm_source=google&utm_campaign=seo');
assert.ok(run.banner.textContent.includes('خدمات التسويق الإلكتروني'),'Visible selected service');
assert.equal(run.inputs.source.value,'website:marketing-services');
assert.ok(run.inputs.message.value.includes('خدمات التسويق الإلكتروني'),'Message prefilled with service');
assert.ok(run.inputs.page_url.value.includes('utm_source=google'),'UTM attribution preserved');
assert.ok(run.submission,'submit listener installed');
run.submission();
assert.ok(run.events.some(x=>x.event==='rassmiy_lead_form_submit_attempt'),'Attempt event');
assert.ok(!run.events.some(x=>x.event==='generate_lead'),'No false confirmed lead before redirect');
run=execute('?sent=1');
assert.equal(run.events.filter(x=>x.event==='generate_lead').length,1,'One confirmed submission event after redirect');
run=execute('?sent=1');
assert.equal(run.events.filter(x=>x.event==='generate_lead').length,0,'No duplicate success on reload');
run=execute('?service=invalid-service','en');
assert.equal(run.banner.hidden,true,'Reject unknown service injection');
assert.equal(run.inputs.source.value,'','No invalid service attribution');
let count=0;
for(const lang of ['ar','en']){
 const dir=path.join(root,lang,'articles');
 if(!fs.existsSync(dir))continue;
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const f=ent.isDirectory()?path.join(dir,ent.name,'index.html'):path.join(dir,ent.name);
  if(fs.existsSync(f)&&fs.readFileSync(f,'utf8').includes('<!-- RELEVANT_SERVICE_LINKS_V90 -->'))count++;
 }
}
assert.ok(count>=2,'At least two real articles got commercial internal links');
console.log('CONTACT_FUNNEL_QA_V90=PASS confirmed_intent_and_conversion_states related_articles='+count);

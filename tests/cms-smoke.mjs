import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'rassmiy-qa-'));
const source=await fs.readFile('release/netlify/functions/app.mjs','utf8');
await fs.writeFile(path.join(tmp,'app.mjs'),source.replace("import { getStore, getDeployStore } from '@netlify/blobs';",`const stores=new Map();function getStore(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {get:async key=>structuredClone(data.get(key)??null),setJSON:async(key,value)=>data.set(key,structuredClone(value)),set:async(key,value)=>data.set(key,value),delete:async key=>data.delete(key)}} const getDeployStore=getStore;`));
const {default:handler}=await import(path.join(tmp,'app.mjs'));
let cookie='',checks=0;
function ok(value,message){assert.ok(value,message);checks++;}
async function request(url,fields,authenticated=true){const headers={};if(authenticated&&cookie)headers.cookie=cookie;let body;if(fields){body=new URLSearchParams(fields);headers['content-type']='application/x-www-form-urlencoded';}const res=await handler(new Request('https://example.test'+url,{method:fields?'POST':'GET',headers,body}));if(authenticated&&res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie').split(';')[0];return {res,text:await res.text()};}
function token(text){return text.match(/name="csrf" value="([^"]+)"/)?.[1];}
let r=await request('/api/health');ok(r.res.status===200&&JSON.parse(r.text).installed===false,'health on fresh store');
r=await request('/admin',null,false);ok([302,303].includes(r.res.status),'anonymous dashboard denied');
r=await request('/install');let csrf=token(r.text);ok(Boolean(csrf),'install csrf');
r=await request('/install',{csrf,name:'QA Administrator',email:'qa@example.test',password:'Local-QA-password-123',confirm_password:'Local-QA-password-123'});ok([302,303].includes(r.res.status),'install');
r=await request('/admin/login');csrf=token(r.text);
r=await request('/admin/login',{email:'qa@example.test',password:'Local-QA-password-123'});ok(r.res.status===419,'login rejects missing csrf');
r=await request('/admin/login',{csrf,email:'qa@example.test',password:'Local-QA-password-123'});ok([302,303].includes(r.res.status)&&r.res.headers.get('location')==='/admin','login');
for(const section of ['dashboard','pages','articles','media','leads','seo','redirects','robots','users','activity','settings','security']){r=await request('/admin?section='+section);ok(r.res.status===200&&!r.text.includes('<title>CMS Error'),'section '+section);ok(r.res.headers.get('x-robots-tag')==='noindex, nofollow','private SEO '+section);csrf=token(r.text)||csrf;}
r=await request('/admin/action',{action:'save_page'});ok(r.res.status===419,'mutations require csrf');
const page={csrf,action:'save_page',title_ar:'اختبار الصفحة',title_en:'Test Page',slug_ar:'test-ar',slug_en:'test-en',content_ar:'<p>محتوى تجريبي</p>',content_en:'<p>Test content</p>',status:'draft',robots_index:'1',robots_follow:'1'};
r=await request('/admin/action',page);ok(!r.res.headers.get('location').includes('error'),'draft save');
r=await request('/en/pages/test-en');ok(r.res.status===404,'draft private');
r=await request('/admin/action',{...page,id:'1',status:'published'});ok(!r.res.headers.get('location').includes('error'),'publish bilingual page');
for(const [lang,slug]of [['ar','test-ar'],['en','test-en']]){r=await request('/'+lang+'/pages/'+slug);ok(r.res.status===200,'published '+lang);ok(r.text.includes('hreflang="'+lang+'"'),'content hreflang '+lang);ok(r.text.includes('https://www.linkedin.com/company/rassmiy-marketing/'),'company contact '+lang);ok(r.text.includes('/assets/site.js'),'mobile script '+lang);}
r=await request('/admin/action',{...page,id:'1',status:'published',content_en:''});ok(r.res.headers.get('location').includes('error'),'incomplete bilingual publish rejected');
r=await request('/sitemap.xml');ok(r.text.includes('/en/pages/test-en')&&!r.text.includes('/admin'),'sitemap published pages only');
r=await request('/admin/action',{csrf,action:'content_status',type:'page',id:'1',status:'trash'});ok([302,303].includes(r.res.status),'trash page');
r=await request('/en/pages/test-en');ok(r.res.status===404,'trash private');
r=await request('/sitemap.xml');ok(!r.text.includes('/en/pages/test-en'),'trash removed sitemap');
r=await request('/admin/action',{...page,action:'save_article',slug_ar:'article-ar',slug_en:'article-en',status:'published'});ok(!r.res.headers.get('location').includes('error'),'article create');
for(const lang of ['ar','en']){r=await request('/'+lang+'/articles');ok(r.res.status===200&&r.text.includes('rel="canonical"'),'article index SEO '+lang);ok(r.text.includes('href="/'+(lang==='ar'?'en':'ar')+'/articles"'),'index language switch '+lang);ok(r.text.includes('/assets/site.js'),'article index mobile '+lang);r=await request('/'+lang+'/articles/article-'+lang);ok(r.res.status===200&&r.text.includes('action="/api/lead"'),'article lead form '+lang);}
r=await request('/api/lead',{name:''},false);ok(r.res.status===400,'empty lead rejected');
r=await request('/api/lead',{name:'=1+1',email:'qa@example.test',message:'Local test only',page_url:'/en/contact.html'},false);ok(r.res.headers.get('location')==='/en/contact.html?sent=1','lead language redirect');
r=await request('/admin/export/leads.csv');ok(r.res.status===200&&r.text.includes("'=1+1"),'CSV formula safe');ok(r.text.includes('\r\n'),'CSV line endings');
r=await request('/admin/action',{csrf,action:'save_redirect',from:'/old',to:'/en/contact.html',status:'301',enabled:'1'});ok([302,303].includes(r.res.status),'redirect creation');r=await request('/old');ok(r.res.status===301&&r.res.headers.get('location')==='/en/contact.html','redirect applied');
r=await request('/robots.txt');ok(r.text.includes('Sitemap: https://example.test/sitemap.xml'),'robots sitemap absolute');
r=await request('/ar/articles.html');ok(r.res.status===301&&r.res.headers.get('location')==='/ar/articles','legacy article index alias');
r=await request('/unknown');ok(r.res.status===404,'unknown route');
// Upload a tiny PNG into the isolated store, then retrieve it and reject an unsupported file.
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64');
for(const [mime,expectError] of [['image/png',false],['text/plain',true]]){const fd=new FormData();fd.set('csrf',csrf);fd.set('file',new File([png],'qa.png',{type:mime}));const res=await handler(new Request('https://example.test/admin/media/upload',{method:'POST',headers:{cookie},body:fd}));ok(res.headers.get('location').includes('error')===expectError,'media validation '+mime);}
r=await request('/admin?section=media');const mediaPath=r.text.match(/src="(\/media\/[^"]+)"/)?.[1];ok(Boolean(mediaPath),'uploaded media listed');r=await request(mediaPath);ok(r.res.status===200&&r.res.headers.get('content-type')==='image/png','media retrieval');
r=await request('/admin/action',{csrf,action:'add_user',name:'QA Sales',email:'sales@example.test',password:'Local-QA-password-456',role:'sales'});ok(!r.res.headers.get('location').includes('error'),'local sales role created');
const adminCookie=cookie;cookie='';r=await request('/admin/login');const salesCsrf=token(r.text);r=await request('/admin/login',{csrf:salesCsrf,email:'sales@example.test',password:'Local-QA-password-456'});ok(r.res.headers.get('location')==='/admin','local sales login');r=await request('/admin?section=leads');ok(r.res.status===200,'sales sees leads');const salesActionToken=token(r.text);r=await request('/admin/action',{...page,csrf:salesActionToken});ok(r.res.headers.get('location').includes('error'),'sales cannot edit pages');cookie=adminCookie;
await fs.rm(tmp,{recursive:true,force:true});
console.log(JSON.stringify({passed:checks,environment:'isolated in-memory store; no live accounts or leads changed'}));

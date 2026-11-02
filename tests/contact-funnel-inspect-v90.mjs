import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2]||'release';
const result={};
for(const lang of ['ar','en']){
 const file=path.join(root,lang,'contact.html');
 if(!fs.existsSync(file)){result[lang]={missing:true};continue;}
 const s=fs.readFileSync(file,'utf8');
 const fields=[...s.matchAll(/<(input|select|textarea|button)\b([^>]*)>/gi)].map(x=>({tag:x[1],name:x[2].match(/\bname=(["'])(.*?)\1/i)?.[2]||null,id:x[2].match(/\bid=(["'])(.*?)\1/i)?.[2]||null,type:x[2].match(/\btype=(["'])(.*?)\1/i)?.[2]||null,required:/\brequired\b/i.test(x[2])})).slice(0,40);
 const forms=[...s.matchAll(/<form\b([^>]*)>/gi)].map(x=>({id:x[1].match(/\bid=(["'])(.*?)\1/i)?.[2]||null,action:x[1].match(/\baction=(["'])(.*?)\1/i)?.[2]||null,method:x[1].match(/\bmethod=(["'])(.*?)\1/i)?.[2]||null}));
 const scripts=[...s.matchAll(/<script\b[^>]*src=(["'])(.*?)\1/gi)].map(x=>x[2]);
 result[lang]={size:s.length,forms,fields,scripts,ga4:/G-[A-Z0-9]{8,}/.test(s),gtm:/GTM-[A-Z0-9]{5,}/.test(s),analytics:/gtag\(|dataLayer/.test(s),queryPrefill:/URLSearchParams|searchParams|location.search/.test(s)};
}
console.log('CONTACT_FUNNEL_AUDIT_V90 '+JSON.stringify(result));
if(!result.ar?.forms?.length&&!result.en?.forms?.length)console.log('CONTACT_FORM_WARNING no HTML form found; verify alternative contact flow');

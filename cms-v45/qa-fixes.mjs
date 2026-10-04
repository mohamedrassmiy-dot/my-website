import fs from 'node:fs';
const root=process.argv[2];
const file=`${root}/netlify/functions/app.mjs`;
let s=fs.readFileSync(file,'utf8');
function replace(a,b){if(!s.includes(a))throw new Error('QA patch target missing: '+a.slice(0,70));s=s.replace(a,b);}
replace('${nav(lang)}<section class="page-hero">','${nav(lang,`/${ar?\'en\':\'ar\'}/articles`)}<section class="page-hero">');
replace('${cards}</div></div></section>${footer(lang,state)}</body></html>','${cards}</div></div></section>${footer(lang,state)}<script defer src="/assets/site.js"></script></body></html>');
replace('<link rel="stylesheet" href="/assets/styles.css">`;\n  return `<!doctype html><html lang="${lang}"', '<link rel="canonical" href="${attr(siteBase(req,state)+`/${lang}/articles`)}"><link rel="alternate" hreflang="ar" href="${attr(siteBase(req,state)+\'/ar/articles\')}"><link rel="alternate" hreflang="en" href="${attr(siteBase(req,state)+\'/en/articles\')}"><link rel="alternate" hreflang="x-default" href="${attr(siteBase(req,state)+\'/en/articles\')}"><meta name="robots" content="index,follow"><link rel="stylesheet" href="/assets/styles.css"><link rel="stylesheet" href="/assets/cms-public.css">`;\n  return `<!doctype html><html lang="${lang}"');
const socials='<div class="social-contact"><a href="https://wa.me/966536741442" target="_blank" rel="noopener noreferrer">${ar?\'واتساب\':\'WhatsApp\'}</a><a href="https://www.linkedin.com/in/mohamedrassmiy" target="_blank" rel="noopener noreferrer">${ar?\'حسابي على LinkedIn\':\'My LinkedIn\'}</a><a href="https://www.linkedin.com/company/rassmiy-marketing/" target="_blank" rel="noopener noreferrer">Rassmiy Marketing · LinkedIn</a></div>';
replace('<small>© 2026 Rassmiy Marketing</small>',socials+'<small>© 2026 Rassmiy Marketing</small>');
replace('</div></div></footer>`; }','</div></div></footer><a class="whatsapp-floating" href="https://wa.me/966536741442" target="_blank" rel="noopener noreferrer">${ar?\'واتساب\':\'WhatsApp\'}</a>`; }');
// Real BOM/newlines and formula-safe cells for spreadsheet exports.
replace("function csvCell(v=''){ return `\"${String(v??'').replaceAll('\"','\"\"')}\"`; }", "function csvCell(v=''){ let value=String(v??''); if(/^[\\s]*[=+@-]/.test(value)) value=\"'\"+value; return `\"${value.replaceAll('\"','\"\"')}\"`; }");
replace("  if(path==='/api/health')", "  if(/^\\/(ar|en)\\/articles\\.html$/.test(path)) return saveAnd(redirect(path.replace('.html',''),301));\n  if(path==='/api/health')");
fs.writeFileSync(file,s);
// Clean URLs must reach the CMS index, instead of shadowing it with the ZIP's sample listings.
for(const lang of ['ar','en'])fs.rmSync(`${root}/${lang}/articles.html`,{force:true});
let js=fs.readFileSync(`${root}/assets/site.js`,'utf8');
js+=`\n(()=>{if(new URLSearchParams(location.search).get('sent')!=='1')return;const form=document.querySelector('form[action="/api/lead"]');if(!form)return;const note=document.createElement('p');note.setAttribute('role','status');note.className='contact-success';note.textContent=document.documentElement.lang==='ar'?'تم إرسال طلبك بنجاح. شكرًا لتواصلك.':'Your request was sent successfully. Thank you for getting in touch.';form.prepend(note);})();\n`;
fs.writeFileSync(`${root}/assets/site.js`,js);
for(const lang of ['ar','en'])for(const name of ['login','dashboard']){
 const f=`${root}/${lang}/${name}.html`;let h=fs.readFileSync(f,'utf8');
 h=h.replace(/<meta\s+name=["']robots["'][^>]*>/gi,'');
 h=h.replace('</head>','<meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"></head>');
 fs.writeFileSync(f,h);
}

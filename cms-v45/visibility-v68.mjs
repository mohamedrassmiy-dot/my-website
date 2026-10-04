import fs from 'node:fs';
const root=process.argv[2]||'release',base='https://rassmiy-marketing.netlify.app';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${d}/${e.name}`):[`${d}/${e.name}`]);
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const entries=[];
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 let h=fs.readFileSync(file,'utf8');if(/name="robots"[^>]*noindex/i.test(h))continue;
 const canonical=h.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];if(!canonical)throw Error(`Missing canonical: ${file}`);
 const lang=h.match(/<html[^>]*lang="([^"]+)"/)?.[1];
 const alts=[...h.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(m=>({lang:m[1],href:m[2]}));
 if(!alts.some(a=>a.lang===lang))alts.push({lang,href:canonical});
 if(!alts.some(a=>a.lang==='x-default'))alts.push({lang:'x-default',href:(alts.find(a=>a.lang==='ar')||alts[0]).href});
 h=h.replace(/<link\s+rel="alternate"\s+hreflang="[^"]+"[^>]*>/g,'');
 h=h.replace('</head>',alts.map(a=>`<link rel="alternate" hreflang="${a.lang}" href="${esc(a.href)}">`).join('')+'</head>');
 const title=h.match(/<title>(.*?)<\/title>/s)?.[1]||'',description=h.match(/<meta name="description" content="([^"]*)"/)?.[1]||'';
 for(const [property,content] of [['og:title',title],['og:description',description],['og:image',base+'/assets/logo.jpg'],['og:type',canonical.includes('/articles/')?'article':'website']])if(!h.includes(`property="${property}"`))h=h.replace('</head>',`<meta property="${property}" content="${esc(content.replaceAll('&amp;','&'))}"></head>`);
 const schema={'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':base+'/#organization',name:'Rassmiy Marketing',url:base+'/',logo:base+'/assets/logo.jpg',sameAs:['https://www.linkedin.com/company/rassmiy-marketing/']},{'@type':'Person','@id':base+'/#person',name:'Mohamed Ali Rassmiy',sameAs:['https://www.linkedin.com/in/mohamedrassmiy'],worksFor:{'@id':base+'/#organization'}},{'@type':'WebPage','@id':canonical+'#webpage',url:canonical,name:title.replaceAll('&amp;','&'),description:description.replaceAll('&amp;','&'),inLanguage:lang,about:{'@id':base+'/#organization'}}]};
 h=h.replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head>`);
 if(!h.includes('<main'))h=h.replace('</header>','</header><main id="main-content">').replace(/<footer\b/,'</main><footer');else h=h.replace(/<main(?![^>]*\bid=)/,'<main id="main-content"');
 h=h.replace(/<body([^>]*)>/,`<body$1><a class="skip-link" href="#main-content">${lang==='ar'?'انتقل إلى المحتوى':'Skip to content'}</a>`);
 fs.writeFileSync(file,h);entries.push({loc:canonical,alts});
}
const appFile=`${root}/netlify/functions/app.mjs`;let app=fs.readFileSync(appFile,'utf8');
const anchor='const xmlEscape=v=>';if(!app.includes(anchor))throw Error('Sitemap anchor missing');
// Static pages remain discoverable without creating or overwriting CMS records.
app=app.replace(anchor,`for(const entry of ${JSON.stringify(entries)})add(entry.loc,'','0.7','monthly',entry.alts); ${anchor}`);
// Specific bot groups do not inherit the wildcard rules: repeat private exclusions.
app=app.replace("body=body.replace(/^Sitemap:","body=body.replace(/(User-agent:[^\\n]+\\nAllow: \\/\\n)/gi,'$1Disallow: /admin\\nDisallow: /install\\nDisallow: /api/\\nDisallow: /cache-flush.html\\nDisallow: /responsive-preview.html\\n'); body=body.replace(/^Sitemap:");
fs.writeFileSync(appFile,app);
fs.appendFileSync(`${root}/assets/styles.css`,String.raw`
/* Accessible controls, readable metrics and safe small-screen wrapping. */
.skip-link{position:fixed;inset-block-start:8px;inset-inline-start:16px;z-index:1000;padding:12px 18px;background:#fff;color:#082b55;transform:translateY(-180%);border:2px solid #082b55;border-radius:8px}.skip-link:focus{transform:none}
:focus-visible{outline:3px solid #087baa;outline-offset:4px}.hero :focus-visible,.dark :focus-visible{outline-color:#fff}
.btn.primary{background:#b74308;color:#fff}.btn.primary:hover{background:#973806}.metric strong{font-size:clamp(18px,2.3vw,28px);overflow-wrap:anywhere}.metric,.hero-grid>*,.section-head>*{min-width:0}
.prose{max-width:76ch;margin-inline:auto;overflow-wrap:anywhere}.prose p{line-height:1.85}.prose a{text-decoration:underline;text-underline-offset:3px}.prose img{height:auto}
.social-contact{display:flex;gap:12px 24px;flex-wrap:wrap;padding-block:24px}.social-contact a{display:inline-flex;align-items:center;min-height:44px;text-decoration:underline;text-underline-offset:4px}
@media(max-width:768px){.section-head{align-items:start;flex-wrap:wrap}.analytics-card{transform:none}.hero h1{font-size:clamp(32px,8vw,48px)}.stats{gap:8px}.stat{padding-inline:10px}.whatsapp-floating{max-width:calc(100vw - 32px)}input,select,textarea{font-size:16px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}}
`);
console.log('Visibility v68: enhanced',entries.length,'public documents');

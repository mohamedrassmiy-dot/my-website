import fs from 'node:fs';
const root=process.argv[2]||'release',file=root+'/netlify/functions/app.mjs';
let source=fs.readFileSync(file,'utf8');
const re=/function siteBase\(req,state\)\s*\{[^}]+\}/;
if(!re.test(source))throw Error('siteBase function not found: stopping canonical patch');
const replacement="function siteBase(req,state) { const reqUrl=new URL(req.url); const origin=reqUrl.origin, host=reqUrl.hostname.toLowerCase(); if(host==='rassmiy-marketing.netlify.app'||host.endsWith('--rassmiy-marketing.netlify.app')) return 'https://rassmiy-marketing.netlify.app'; let configured=String(state.settings.site_url||'').trim().replace(/\\/$/,''); if(/^http:\\/\\/[^/]+\\.netlify\\.app$/i.test(configured)) configured=configured.replace(/^http:/i,'https:'); return configured||origin; }";
source=source.replace(re,()=>replacement);
fs.writeFileSync(file,source);
console.log('SEO_CANONICAL_V81=PASS');

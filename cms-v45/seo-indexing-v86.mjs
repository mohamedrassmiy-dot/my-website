import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.argv[2]||'release';
const base='https://rassmiy-marketing.netlify.app';
const topPages=['about','services','portfolio','contact','article-seo'];
const aliases=new Map();
for(const lang of ['ar','en'])for(const p of topPages){
 const file=path.join(root,lang,p+'.html');
 if(fs.existsSync(file))aliases.set('/'+lang+'/'+p,'/'+lang+'/'+p+'.html');
}
aliases.set('/ar/','/');
aliases.set('/ar/index.html','/');
aliases.set('/index.html','/');
aliases.set('/en/index.html','/en/');
aliases.set('/en/index','/en/');

const rewrite=value=>{
 if(!value.startsWith('/')&&!value.startsWith(base+'/'))return value;
 if(value.startsWith('//'))return value;
 let url;
 try{url=new URL(value,base)}catch{return value}
 if(url.origin!==base)return value;
 const target=aliases.get(decodeURIComponent(url.pathname));
 if(!target)return value;
 url.pathname=target;
 return value.startsWith('/')?url.pathname+url.search+url.hash:url.href;
};
function walk(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>
 e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
let modified=0,urlsChanged=0;
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 let html=fs.readFileSync(file,'utf8'),before=html;
 // Only rewrite public canonical/link references. No admin/API paths are changed.
 html=html.replace(/\b(href|content)=("([^"]*)"|'([^']*)')/g,(whole,attr,quoted,double,single)=>{
  const val=double??single;
  const next=rewrite(val);
  if(next!==val){urlsChanged++;return attr+'='+quoted[0]+next+quoted[0];}
  return whole;
 });
 // JSON-LD and inline hreflang data for the English homepage must agree with the visible URL.
 html=html.replaceAll(base+'/en/index.html',base+'/en/');
 if(html!==before){fs.writeFileSync(file,html);modified++;}
}
const appPath=path.join(root,'netlify/functions/app.mjs');
let app=fs.readFileSync(appPath,'utf8');
const from=base+'/en/index.html',to=base+'/en/';
assert.ok(app.includes(from),'Expected sitemap URL for English homepage was not found');
app=app.replaceAll(from,to);
// Normalize every sitemap entry (including CMS-injected entries) before the XML
// renderer, and deduplicate entries whose canonical destination is the same.
const originalAdd="const add=(loc,lastmod='',priority='0.7',changefreq='monthly',alts=[])=>items.push({loc:normalizeStaticUrlV82(loc),lastmod,priority,changefreq,alts:alts.map(a=>({...a,href:normalizeStaticUrlV82(a.href)}))});";
assert.ok(app.includes(originalAdd),'Expected sitemap add() source missing: stop instead of risking output');
const fixedAdd=String.raw`const add=(loc,lastmod='',priority='0.7',changefreq='monthly',alts=[])=>{
 const normalized=canonicalSitemapUrlV87(normalizeStaticUrlV82(loc));
 const cleanedAlts=alts.map(a=>({...a,href:canonicalSitemapUrlV87(normalizeStaticUrlV82(a.href))}));
 const existing=items.find(x=>x.loc===normalized);
 if(existing){if(cleanedAlts.length>(existing.alts||[]).length)existing.alts=cleanedAlts;return;}
 items.push({loc:normalized,lastmod,priority,changefreq,alts:cleanedAlts});
};`;
app=app.replace(originalAdd,fixedAdd);
app+=String.raw`
function canonicalSitemapUrlV87(value){
 try{
  const url=new URL(value);
  if(url.origin!=='https://rassmiy-marketing.netlify.app')return value;
  if(url.pathname==='/en/index.html')url.pathname='/en/';
  if(url.pathname==='/ar/index.html'||url.pathname==='/ar/'||url.pathname==='/index.html')url.pathname='/';
  return url.href;
 }catch{return value;}
}
`;
fs.writeFileSync(appPath,app);

function canonical(file){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const matches=[...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)];
 assert.equal(matches.length,1,file+': exactly one canonical');
 return matches[0][1];
}
assert.equal(canonical('index.html'),base+'/');
assert.equal(canonical('ar/index.html'),base+'/');
assert.equal(canonical('en/index.html'),base+'/en/');
for(const lang of ['ar','en'])for(const page of topPages){
 const file=path.join(root,lang,page+'.html');
 if(fs.existsSync(file))assert.equal(canonical(lang+'/'+page+'.html'),base+'/'+lang+'/'+page+'.html');
}
console.log('SEO_INDEXING_V86=PASS: aliases='+aliases.size+', htmlFilesUpdated='+modified+', urlAttributesRewritten='+urlsChanged);

// Public, read-only smoke audit to make GSC exclusions actionable.
// Run in GitHub Actions (network access); never submits URLs or edits GSC.
const origin='https://rassmiy-marketing.netlify.app';
async function get(path) {
  try {
    const res=await fetch(new URL(path,origin),{redirect:'follow',signal:AbortSignal.timeout(16000),headers:{'user-agent':'RassmiySiteIndexabilityQA/1.0'}});
    return {status:res.status,url:res.url,headers:res.headers,body:await res.text()};
  }catch(e){return {status:0,url:String(path),error:String(e.message||e),body:'',headers:new Headers()};}
}
function canon(html){
  return [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)]
    .map(m=>m[0].match(/\bhref=["']([^"']+)["']/i)?.[1]).filter(Boolean);
}
function normalized(url){try{let u=new URL(url,origin);let p=decodeURIComponent(u.pathname).replace(/\/+$/,'')||'/';return u.origin+p;}catch{return url;}}
const [robots,sitemap]=await Promise.all([get('/robots.txt'),get('/sitemap.xml')]);
console.log('ROBOTS_HTTP',robots.status,'ROBOTS_TEXT_START',robots.body.slice(0,2200));
console.log('SITEMAP_HTTP',sitemap.status,'CONTENT_TYPE',sitemap.headers.get('content-type'));
const locs=[...sitemap.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m=>m[1].replaceAll('&amp;','&'));
const counts=new Map();for(const u of locs)counts.set(normalized(u),(counts.get(normalized(u))||0)+1);
const duplicate=[...counts].filter(x=>x[1]>1);
console.log('SITEMAP_URL_COUNTS',JSON.stringify({total:locs.length,unique:counts.size,duplicates:duplicate.slice(0,35)}));
// Google lists duplicate but canonicalized aliases separately until it recrawls them.
const htmlTargets=locs.filter(u=>new URL(u).pathname.match(/^\/(?:ar|en)\/[^/]+\.html$/));
console.log('SITEMAP_TOP_LEVEL_HTML',JSON.stringify(htmlTargets));
const aliases=await Promise.all(htmlTargets.map(async target=>{
  const alias=new URL(target).pathname.slice(0,-5);
  const r=await get(alias);
  return {alias,status:r.status,final:r.url,canonical:canon(r.body)[0]||'',sameHtml:r.status===200&&normalized(canon(r.body)[0]||r.url)===normalized(target)};
}));
for(const item of aliases)console.log('HTML_ALIAS',JSON.stringify(item));
const specials=['/','/index.html','/ar/','/ar/index.html','/en/','/en/index.html','/en/index','/ar/services','/ar/services.html','/en/about','/en/about.html'];
for(const path of specials){
 try{
   const res=await fetch(new URL(path,origin),{redirect:'manual',signal:AbortSignal.timeout(10000)});
   console.log('RAW_ROUTE',JSON.stringify({path,status:res.status,location:res.headers.get('location'),contentType:res.headers.get('content-type')}));
 }catch(e){console.log('RAW_ROUTE',JSON.stringify({path,error:String(e.message||e)}));}
}
const targets=[
'/','/ar/','/ar/services','/ar/services.html','/ar/pages/marketing-agency-riyadh/',
'/ar/pages/استشاري-تسويق-رقمي-الرياض/','/ar/pages/google-ads-management-saudi/',
'/ar/pages/content-marketing-saudi/','/ar/pages/social-media-management-riyadh/',
'/en/portfolio','/en/contact','/en/pages/seo-consultant-riyadh/',
'/en/articles/ecommerce-growth-strategy-saudi-arabia/',
'/en/articles/seo-checklist-saudi-business/',
'/en/articles/seo-vs-google-ads-saudi-arabia/'
];
const results=await Promise.all(targets.map(async path=>{
 const res=await get(path);const c=canon(res.body);
 const metaRobots=res.body.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i)?.[0]||'';
 return {path,status:res.status,finalUrl:res.url,canonical:c,
  selfCanonical:c.length===1&&normalized(c[0])===normalized(res.url),
  inSitemap:counts.has(normalized(res.url)),xRobotsTag:res.headers.get('x-robots-tag'),
  robotsNoindex:/noindex/i.test(metaRobots),h1Count:[...res.body.matchAll(/<h1\b/gi)].length,
  htmlLength:res.body.length,error:res.error||null};
}));
for(const item of results)console.log('AUDIT_URL',JSON.stringify(item));
const problems=results.filter(x=>x.status!==200||x.canonical.length!==1||x.robotsNoindex||x.xRobotsTag?.includes('noindex'));
console.log('AUDIT_SUMMARY',JSON.stringify({urls:results.length,hardProblems:problems.length,sitemapTotal:locs.length,sitemapUnique:counts.size,duplicateCanonicalLocations:duplicate.length}));
if(robots.status!==200||sitemap.status!==200||locs.length===0)process.exitCode=1;

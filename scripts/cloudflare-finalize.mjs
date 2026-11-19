import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const origin = 'https://gladio-egypt.vercel.app';

const manifest = JSON.parse(await fs.readFile(path.join(dist,'mirror-manifest.json'),'utf8'));
const searchIndex = JSON.parse(await fs.readFile(path.join(dist,'search-index.json'),'utf8'));

if(manifest.canonical !== origin) throw new Error('Wrong canonical source');
if(manifest.canonicalIndexableUrls < 190 || manifest.canonicalIndexableUrls > 340) throw new Error('Unexpected canonical URL count');
if(searchIndex.length !== manifest.canonicalIndexableUrls + 2) throw new Error('Index entries must include exactly two localized search routes');
if(!searchIndex.some(item=>item.path==='/ar/') || !searchIndex.some(item=>item.path==='/en/'))throw new Error('Localized homepages missing');
const seen = new Set();
for(const entry of searchIndex){
 if(seen.has(entry.path)) throw new Error('Duplicate archive route '+entry.path);
 seen.add(entry.path);
 if(!/^\/(ar|en)\//.test(entry.path) || !entry.path.endsWith('/')) throw new Error('Unexpected route '+entry.path);
 const html = await fs.readFile(path.join(dist, entry.path.replace(/^\/+/g,''), 'index.html'),'utf8');
 if(!/<meta\b(?=[^>]*name=["']robots["'])[^>]*noindex/i.test(html)) throw new Error('Mirror page lacks noindex '+entry.path);
 const canonical = html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)["']/i)?.[1];
 if(!canonical?.startsWith(origin+'/')) throw new Error('Canonical not on Vercel '+entry.path);
}
await fs.writeFile(path.join(dist,'_headers'), [
 '/*',
 '  X-Robots-Tag: noindex, follow',
 '  X-Content-Type-Options: nosniff',
 '  Referrer-Policy: strict-origin-when-cross-origin',
 '',
].join('\n'));
await fs.writeFile(path.join(dist,'_redirects'), [
 '/ /ar/ 302',
 '/admin https://gladio-egypt.vercel.app/admin/ 302',
 '/admin/* https://gladio-egypt.vercel.app/admin/:splat 302',
 '',
].join('\n'));
await fs.writeFile(path.join(dist,'_routes.json'),JSON.stringify({
 version:1,
 include:['/api/*','/healthz'],
 exclude:[]
},null,2));
await fs.writeFile(path.join(dist,'404.html'),[
 '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">',
 '<meta name="viewport" content="width=device-width,initial-scale=1">',
 '<meta name="robots" content="noindex,nofollow">',
 '<title>الملف غير متاح | غلاديو مصر</title>',
 '<link rel="canonical" href="https://gladio-egypt.vercel.app/ar/">',
 '<style>body{font-family:Tahoma,Arial,sans-serif;background:#08141d;color:#f1eee4;min-height:90vh;display:grid;place-content:center;text-align:center;padding:24px}a{color:#dfb59c}</style>',
 '</head><body><main><h1>الملف غير متاح</h1><p>هذا الرابط ليس ضمن الملفات المنشورة.</p>',
 '<p><a href="/ar/">العودة إلى الرئيسية</a> · <a href="/ar/archive/">تصفح الأرشيف</a></p></main></body></html>'
].join(''));
const qa={service:'cloudflare-pages-public-mirror',canonical:origin,publicPages:searchIndex.length,indexableOnCanonicalOnly:true,noindexMirror:true,backend:'Cloudflare Pages Functions: read-only search and health',admin:'https://gladio-egypt.vercel.app/admin/'};
await fs.writeFile(path.join(dist,'cloudflare-mirror-status.json'),JSON.stringify(qa,null,2));
console.log('GLADIO_CLOUDFLARE_PAGES_BUILD_QA_PASS '+JSON.stringify(qa));

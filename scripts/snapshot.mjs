import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://gladio-egypt.vercel.app';
const DIST = path.resolve('dist');
const CONCURRENCY = 8;
const INDEXABLE_MINIMUM = 190;
const INDEXABLE_MAXIMUM = 340;

async function fetchChecked(address, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(address, {
        headers: {
          accept: 'text/html,application/xml,text/css,application/javascript,*/*',
          'user-agent': 'GladioEgyptRenderMirror/1.0 (+https://gladio-egypt.vercel.app/)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = Buffer.from(await response.arrayBuffer());
      if (!data.length || data.length > 8000000) throw new Error('Unexpected asset size');
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 600));
      }
    }
  }
  throw new Error('Fetch failed for ' + address + ': ' + lastError.message);
}

async function writeSafe(relativePath, bytes) {
  const destination = path.resolve(DIST, relativePath.replace(/^\/+/, ''));
  if (!destination.startsWith(DIST + path.sep)) {
    throw new Error('Unsafe path: ' + relativePath);
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, bytes);
}

async function runInParallel(items, fn) {
  let position = 0;
  const workers = Array.from(
    { length: Math.min(CONCURRENCY, items.length) },
    async () => {
      while (position < items.length) {
        const current = position++;
        await fn(items[current]);
      }
    },
  );
  await Promise.all(workers);
}

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });
const sitemap = (await fetchChecked(ORIGIN + '/sitemap.xml')).toString('utf8');
const indexedUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (
  indexedUrls.length < INDEXABLE_MINIMUM ||
  indexedUrls.length > INDEXABLE_MAXIMUM ||
  new Set(indexedUrls).size !== indexedUrls.length
) {
  throw new Error('Invalid canonical sitemap URL count: ' + indexedUrls.length);
}
const routes = new Set(indexedUrls.map((url) => {
  const parsed = new URL(url);
  if (parsed.origin !== ORIGIN || !/^\/(?:ar|en)\//.test(parsed.pathname)) {
    throw new Error('Non-canonical URL: ' + url);
  }
  return parsed.pathname;
}));
routes.add('/ar/search/');
routes.add('/en/search/');
if (!routes.has('/ar/') || !routes.has('/en/')) {
  throw new Error('Language homepage missing from sitemap');
}

const assets = new Set([
  '/assets/gladio-editorial.css',
  '/assets/gladio-editorial.js',
  '/assets/intelligence-ui.css',
  '/assets/intelligence-ui.js',
  '/research-site.css',
  '/research-site.js',
  '/favicon.svg',
]);
const records = [];
await runInParallel([...routes], async (route) => {
  if (!route.endsWith('/')) throw new Error('Expected trailing slash: ' + route);
  const original = (await fetchChecked(ORIGIN + route)).toString('utf8');
  if (!original.includes('</html>') || !original.includes('</head>')) {
    throw new Error('Truncated HTML at ' + route);
  }
  const canonical = ORIGIN + route;
  if (!indexedUrls.includes(canonical) && !route.endsWith('/search/')) {
    throw new Error('Non-canonical route in snapshot: ' + route);
  }
  if (!original.includes('rel="canonical"')) {
    throw new Error('Missing canonical element: ' + route);
  }
  let html = original.replace(
    /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i,
    '<meta name="robots" content="noindex,follow">',
  );
  if (!html.includes('content="noindex,follow"')) {
    html = html.replace('</head>', '<meta name="robots" content="noindex,follow"></head>');
  }
  html = html.replace(/<head>/i, '<head><base href="/">');
  if (!html.includes('content="noindex,follow"')) throw new Error('Mirror indexing guard missing');

  for (const match of html.matchAll(/(?:href|src)=["'](\/[^"']+\.(?:css|js|json|svg|webmanifest|woff2?|png|jpg|jpeg|webp|gif|ico))(?:\?[^"']*)?["']/gi)) {
    const asset = match[1];
    if (!asset.startsWith('/admin/') && !asset.startsWith('/api/')) assets.add(asset);
  }
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || 'غلاديو مصر';
  const description = /<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']+)/i.exec(html)?.[1] || '';
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] || '';
  const body = main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  records.push({
    path: route,
    lang: route.startsWith('/en/') ? 'en' : 'ar',
    title: title.replace(/<[^>]+>/g, '').trim().slice(0, 210),
    description: description.trim().slice(0, 360),
    excerpt: body.slice(0, 760),
  });
  await writeSafe(route + 'index.html', Buffer.from(html));
});


const adminFiles = ['/admin/','/admin/app.js','/admin/google-verification-check.js','/admin/seo-helper.js'];
await runInParallel(adminFiles, async (route) => {
  let source = (await fetchChecked(ORIGIN + route)).toString('utf8');
  if (route === '/admin/') {
    if (!source.includes('id="loginForm"') || !source.includes('</html>')) throw new Error('Admin UI incomplete');
    source = source.replace('المحتوى التاريخي الثابت محفوظ في Vercel.', 'المحتوى التاريخي الثابت متاح في Render بعد كل عملية بناء.');
    source = source.replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>');
    const backupPanel = '<section id="backupPanel"><h2>نسخ احتياطي ونقل المحتوى</h2><p>يمكن تصدير مواد الإدارة وإعداداتها أو استيراد ملف JSON من لوحة Vercel بعد تسجيل الدخول.</p><p><a href="/api/admin/export" download="gladio-render-backup.json">تنزيل نسخة JSON من Render</a></p><input type="file" id="importCmsJson" accept=".json,application/json"><button type="button" id="importCmsNow">استيراد مواد JSON</button></section>';
    source = source.replace('</main>', backupPanel + '</main>');
    await writeSafe('/admin/index.html', Buffer.from(source));
    return;
  }
  if (route === '/admin/app.js') {
    if (!source.includes('/api/admin/login') || !source.includes('/api/admin/item')) throw new Error('Admin app incomplete');
    source = source.replace('إعدادات Vercel', 'إعدادات Render');
    source = source.replace('begin()})();', String.raw`const imp=document.getElementById('importCmsNow');if(imp)imp.addEventListener('click',async()=>{try{const f=document.getElementById('importCmsJson').files?.[0];if(!f)throw Error('اختر ملف JSON أولًا');const body=JSON.parse(await f.text());const result=await req('/api/admin/import','POST',body);message('تم استيراد '+result.imported+' مادة، وتخطي '+result.skipped+' مادة');await sync()}catch(e){message(e.message)}});begin()})();`);
    await writeSafe(route, Buffer.from(source));
    return;
  }
  await writeSafe(route, Buffer.from(source));
});

const assetFailures = [];
await runInParallel([...assets], async (asset) => {
  try {
    const bytes = await fetchChecked(ORIGIN + asset);
    await writeSafe(asset, bytes);
  } catch (error) {
    assetFailures.push({ asset, reason: error.message });
  }
});
const critical = new Set([
  '/assets/gladio-editorial.css',
  '/assets/gladio-editorial.js',
  '/assets/intelligence-ui.css',
  '/assets/intelligence-ui.js',
  '/research-site.css',
  '/research-site.js',
]);
const missingCritical = assetFailures.filter((item) => critical.has(item.asset));
if (missingCritical.length) {
  throw new Error('Critical public assets missing: ' + JSON.stringify(missingCritical));
}
records.sort((a, b) => a.path.localeCompare(b.path));
await writeSafe('/search-index.json', JSON.stringify(records));
await writeSafe('/robots.txt', [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin/',
  'Disallow: /api/',
  'Sitemap: ' + ORIGIN + '/sitemap.xml',
  '',
].join('\n'));
await writeSafe('/mirror-manifest.json', JSON.stringify({
  canonical: ORIGIN,
  publicPages: records.length,
  canonicalIndexableUrls: indexedUrls.length,
  assets: assets.size - assetFailures.length,
  sourceDeployedAt: new Date().toISOString(),
  failedOptionalAssets: assetFailures,
  admin: 'redirects to the canonical Vercel service',
  contentWrites: 'disabled on Render mirror',
}, null, 2));
console.log('GLADIO_RENDER_SNAPSHOT_READY ' + JSON.stringify({
  publicPages: records.length,
  canonicalIndexableUrls: indexedUrls.length,
  assets: assets.size - assetFailures.length,
  missingOptionalAssets: assetFailures.length,
}));

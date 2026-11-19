const PRIMARY = 'https://gladio-egypt.vercel.app';
const NO_INDEX = 'noindex, follow';
const JSON_HEADERS = {
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff'
};
function clean(value) {
  return String(value ?? '').normalize('NFKC').replace(/[\u064b-\u065f]/g, '').toLowerCase().trim();
}
function json(data, status = 200, headers = JSON_HEADERS) {
  return Response.json(data, { status, headers });
}
async function getPublicAsset(request, env, filename) {
  const url = new URL(filename, request.url);
  const result = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
  if (!result.ok) throw new Error('Missing required public snapshot asset ' + filename);
  return result.json();
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return Response.redirect(PRIMARY + pathname.replace(/^\/admin$/, '/admin/') + url.search, 302);
    }
    if (pathname === '/' || pathname === '/index.html') {
      return Response.redirect(new URL('/ar/', url.origin), 302);
    }
    if (pathname.startsWith('/api/') || pathname === '/healthz') {
      if (request.method !== 'GET') {
        return json({ error: 'Only read-only GET endpoints are available on this mirror' }, 405);
      }
      try {
        if (pathname === '/api/health' || pathname === '/api/mirror-status' || pathname === '/healthz') {
          const status = await getPublicAsset(request, env, '/mirror-manifest.json');
          return json({
            status: 'ok',
            service: 'gladio-egypt-cloudflare-worker-mirror',
            canonical: PRIMARY,
            publicPages: status.publicPages,
            sourcePages: status.canonicalIndexableUrls,
            admin: PRIMARY + '/admin/',
            snapshot: 'Build-time public snapshot; not real-time replication'
          });
        }
        if (pathname === '/api/search' || pathname === '/api/entries') {
          const docs = await getPublicAsset(request, env, '/search-index.json');
          if (!Array.isArray(docs)) throw new Error('Malformed public index');
          const query = clean(url.searchParams.get('q')).slice(0, 140);
          const lang = url.searchParams.get('lang');
          const limit = Math.max(1, Math.min(50, Number.parseInt(url.searchParams.get('limit') || '20', 10) || 20));
          const found = docs.filter(item => {
            if (['ar','en'].includes(lang) && item.lang !== lang) return false;
            return !query || clean([item.title, item.description, item.excerpt].join(' ')).includes(query);
          });
          return json({
            query, total: found.length, canonical: PRIMARY,
            results: found.slice(0, limit).map(({path,title,description,lang}) => ({path,title,description,lang}))
          }, 200, {...JSON_HEADERS,'cache-control':'public, max-age=60'});
        }
        return json({error:'Unknown API path'},404);
      } catch (error) {
        console.error('Gladio mirror API error:', error instanceof Error ? error.message : 'Unknown');
        return json({error:'Public snapshot is unavailable'},503);
      }
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({error:'Method not allowed'},405);
    }
    // Serve local static HTML, styles, scripts, and public archive. Never proxy secrets.
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('x-robots-tag', NO_INDEX);
    headers.set('x-content-type-options','nosniff');
    headers.set('referrer-policy','strict-origin-when-cross-origin');
    headers.delete('set-cookie');
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};

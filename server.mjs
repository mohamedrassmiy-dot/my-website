import { handleCms } from './cms.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
const PRIMARY = 'https://gladio-egypt.vercel.app';
const PORT = Number(process.env.PORT || 10000);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};
const entries = JSON.parse(await fs.readFile(path.join(DIST, 'search-index.json'), 'utf8'));
const status = JSON.parse(await fs.readFile(path.join(DIST, 'mirror-manifest.json'), 'utf8'));
function sendJson(res, code, object) {
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex',
    'x-content-type-options': 'nosniff',
  });
  res.end(JSON.stringify(object));
}
function normalize(text) {
  return String(text || '').normalize('NFKC').replace(/[\u064b-\u065f]/g, '').toLowerCase().trim();
}
function handleSearch(searchParams, res) {
  const query = normalize(searchParams.get('q')).slice(0, 140);
  const lang = searchParams.get('lang');
  const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 20));
  const matches = entries.filter((entry) => {
    if (lang && ['ar', 'en'].includes(lang) && entry.lang !== lang) return false;
    if (!query) return true;
    return normalize(entry.title + ' ' + entry.description + ' ' + entry.excerpt).includes(query);
  });
  sendJson(res, 200, {
    query,
    total: matches.length,
    results: matches.slice(0, limit).map(({ path: route, title, description, lang: language }) => ({
      path: route, title, description, lang: language,
    })),
  });
}
const server = http.createServer(async (req, res) => {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  let url;
  try { url = new URL(req.url || '/', 'https://gladio-mirror.local'); } catch {
    return sendJson(res, 400, { error: 'Invalid URL' });
  }
  if (await handleCms(req, res, url)) return;
  if (url.pathname === '/healthz' || url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', service: 'gladio-render-mirror', publicPages: entries.length });
  }
  if (url.pathname === '/api/search' && req.method === 'GET') {
    return handleSearch(url.searchParams, res);
  }
  if (url.pathname === '/api/entries' && req.method === 'GET') {
    return handleSearch(url.searchParams, res);
  }
  if (url.pathname === '/api/mirror-status' && req.method === 'GET') {
    return sendJson(res, 200, status);
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(302, { location: '/ar/', 'x-robots-tag': 'noindex' });
    return res.end();
  }
  if (url.pathname === '/admin') {
    res.writeHead(308, {location:'/admin/', 'x-robots-tag':'noindex,nofollow'});
    return res.end();
  }
  if (url.pathname.startsWith('/api/')) {
    return sendJson(res, 404, {error:'Unknown API route'});
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch {
    return sendJson(res, 400, { error: 'Invalid path' });
  }
  if (pathname.includes('\0') || pathname.includes('\\') || pathname.includes('..')) {
    return sendJson(res, 400, { error: 'Invalid path' });
  }
  if (!pathname.endsWith('/') && !path.extname(pathname)) {
    res.writeHead(308, { location: pathname + '/' + url.search });
    return res.end();
  }
  const relative = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
  const file = path.resolve(DIST, relative.replace(/^\/+/, ''));
  if (!file.startsWith(DIST + path.sep)) {
    return sendJson(res, 403, { error: 'Forbidden' });
  }
  try {
    const bytes = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': ext === '.html' ? 'public, max-age=120' : 'public, max-age=3600',
      'x-robots-tag': ext === '.html' ? 'noindex,follow' : 'noindex',
      'content-length': bytes.length,
    });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return sendJson(res, 404, { error: 'Page not found', canonical: PRIMARY + pathname });
    }
    console.error('Static file failure:', error.message);
    return sendJson(res, 500, { error: 'Unexpected file error' });
  }
});
server.listen(PORT, '0.0.0.0', () => {
  console.log('Gladio Egypt Render mirror ready on port ' + PORT + '; static pages ' + entries.length);
});

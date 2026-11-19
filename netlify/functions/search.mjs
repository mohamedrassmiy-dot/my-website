import records from './generated-search.mjs';

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u064b-\u065f]/g, '')
    .toLowerCase()
    .trim();
}
function respond(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'cache-control': 'public, max-age=60',
      'x-robots-tag': 'noindex, nofollow',
      'x-content-type-options': 'nosniff',
    },
  });
}
export default async function handler(request) {
  if (request.method !== 'GET') {
    return respond({ error: 'Method not allowed' }, 405);
  }
  const url = new URL(request.url);
  const q = normalize(url.searchParams.get('q')).slice(0, 140);
  const lang = url.searchParams.get('lang');
  const langFilter = ['ar', 'en'].includes(lang) ? lang : null;
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20));
  const matched = records.filter(record => {
    if (langFilter && record.lang !== langFilter) return false;
    if (!q) return true;
    return normalize([record.title, record.description, record.excerpt].join(' ')).includes(q);
  });
  return respond({
    query: q,
    total: matched.length,
    results: matched.slice(0, limit).map(({ path, title, description, lang }) => ({
      path, title, description, lang,
    })),
    canonical: 'https://gladio-egypt.vercel.app',
  });
}
export const config = { path: ['/api/search', '/api/entries'] };

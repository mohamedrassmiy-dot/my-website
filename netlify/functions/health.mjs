import manifest from './generated-manifest.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  return Response.json(
    {
      status: 'ok',
      service: 'gladio-netlify-public-mirror',
      canonical: manifest.canonical,
      publicPages: manifest.publicPages,
      admin: 'https://gladio-egypt.vercel.app/admin/',
      dataSource: 'public site snapshot at build time',
    },
    { headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' } },
  );
}
export const config = { path: ['/api/health', '/api/mirror-status', '/healthz'] };

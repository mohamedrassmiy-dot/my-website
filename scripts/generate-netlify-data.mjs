import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const publishedDir = path.join(root, 'dist');
const functionsDir = path.join(root, 'netlify', 'functions');

const rawEntries = JSON.parse(await fs.readFile(path.join(publishedDir, 'search-index.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(publishedDir, 'mirror-manifest.json'), 'utf8'));
if (!Array.isArray(rawEntries) || rawEntries.length < 200 || rawEntries.length > 350) {
  throw new Error('Invalid search index size: ' + rawEntries?.length);
}
if (!manifest.canonical?.startsWith('https://gladio-egypt.vercel.app')) {
  throw new Error('Unexpected canonical source');
}
if (!rawEntries.some(entry => entry.path === '/ar/') || !rawEntries.some(entry => entry.path === '/en/')) {
  throw new Error('Missing locale homepages');
}
for (const entry of rawEntries) {
  if (!entry.path?.startsWith('/ar/') && !entry.path?.startsWith('/en/')) {
    throw new Error('Unexpected index entry path: ' + entry.path);
  }
}
await fs.mkdir(functionsDir, { recursive: true });
await fs.writeFile(
  path.join(functionsDir, 'generated-search.mjs'),
  'export default ' + JSON.stringify(rawEntries) + ';\n',
);
await fs.writeFile(
  path.join(functionsDir, 'generated-manifest.mjs'),
  'export default ' + JSON.stringify(manifest) + ';\n',
);
const stats = {
  pages: rawEntries.length,
  source: 'https://gladio-egypt.vercel.app',
  independentlyHostedPublicSnapshot: true,
  backend: 'Netlify serverless read-only search + status',
  admin: 'Vercel canonical administration only',
};
await fs.writeFile(path.join(publishedDir, 'netlify-mirror-health.json'), JSON.stringify(stats, null, 2));
console.log('GLADIO_NETLIFY_API_DATA_READY ' + JSON.stringify(stats));

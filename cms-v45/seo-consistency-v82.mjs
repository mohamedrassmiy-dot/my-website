import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || 'release';
const origin = 'https://rassmiy-marketing.netlify.app';
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) files.push(file);
  }
}
walk(root);
// Netlify serves directory index pages at trailing-slash URLs. Keep CMS-only
// routes unchanged: they need not follow the static directory convention.
const directories = files.map(file => '/' + path.relative(root, file).split(path.sep).join('/'))
  .filter(file => file.endsWith('/index.html') && /^\/(ar|en)\/(pages|articles)\//.test(file))
  .map(file => file.slice(0, -'/index.html'.length));
const directorySet = new Set(directories);
function normalize(value) {
  if (!value.startsWith('/') && !value.startsWith(origin + '/')) return value;
  if (value.startsWith('//')) return value;
  const u = new URL(value, origin);
  let decoded;
  try { decoded = decodeURIComponent(u.pathname).replace(/\/+$/, ''); } catch { return value; }
  if (!directorySet.has(decoded)) return value;
  u.pathname = u.pathname.replace(/\/+$/, '') + '/';
  return value.startsWith('/') ? u.pathname + u.search + u.hash : u.href;
}
let changes = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/\b(href|content)="([^"]*)"/g, (match, attr, value) => {
    const next = normalize(value);
    if (next !== value) changes++;
    return `${attr}="${next}"`;
  });
  fs.writeFileSync(file, after);
}
const runtime = path.join(root, 'netlify/functions/app.mjs');
let source = fs.readFileSync(runtime, 'utf8');
const add = 'const add=(loc,lastmod=\'\',priority=\'0.7\',changefreq=\'monthly\',alts=[])=>items.push({loc,lastmod,priority,changefreq,alts});';
if (!source.includes(add)) throw Error('Sitemap insertion point changed');
source = source.replace(add, `const add=(loc,lastmod='',priority='0.7',changefreq='monthly',alts=[])=>items.push({loc:normalizeStaticUrlV82(loc),lastmod,priority,changefreq,alts:alts.map(a=>({...a,href:normalizeStaticUrlV82(a.href)}))});`);
const alternate = 'const alternate=x.alts.map(a=>';
if (!source.includes(alternate)) throw Error('Sitemap alternate insertion point changed');
source = source.replace(alternate, "const alternate=x.alts.filter(a=>a.lang!=='x-default').map(a=>");
source = source.replace("const xd=x.alts.find(a=>a.href===`${base}/`)", "const xd=x.alts.find(a=>a.lang==='x-default')||x.alts.find(a=>a.href===`${base}/`)");
source += `\n// Static URLs shared by sitemap and rendered HTML (build-generated).\nconst STATIC_DIRECTORIES_V82=new Set(${JSON.stringify(directories)});\nfunction normalizeStaticUrlV82(value){try{const u=new URL(value);const p=decodeURIComponent(u.pathname).replace(/\\/+$/,'');if(STATIC_DIRECTORIES_V82.has(p))u.pathname=u.pathname.replace(/\\/+$/,'')+'/';return u.href;}catch{return value;}}\n`;
fs.writeFileSync(runtime, source);
console.log(`SEO_CONSISTENCY_V82: ${directories.length} static routes; ${changes} URL references normalized`);

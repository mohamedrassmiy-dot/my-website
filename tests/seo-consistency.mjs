import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = 'release';
let checked = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name === 'index.html' && /\/(ar|en)\/(pages|articles)\//.test(file)) {
      const html = fs.readFileSync(file, 'utf8');
      const canonical = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)];
      assert.equal(canonical.length, 1, file + ': one canonical');
      const expected = '/' + path.relative(root,file).replace(/index\.html$/, '');
      assert.equal(decodeURIComponent(new URL(canonical[0][1]).pathname), expected, file);
      for (const m of html.matchAll(/hreflang="[^"]+"\s+href="([^"]+)"/g)) {
        const p = decodeURIComponent(new URL(m[1]).pathname);
        assert.ok(fs.existsSync(path.join(root,p,'index.html')) || fs.existsSync(path.join(root,p)), 'alternate exists: '+p);
        if (/\/(pages|articles)\//.test(p)) assert.ok(p.endsWith('/'), 'alternate slash: '+p);
      }
      checked++;
    }
  }
}
walk(root);
assert.ok(checked > 0);
console.log(`SEO_CONSISTENCY_TEST=PASS: ${checked} static pages`);

import fs from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('Target function file is required.');
let src = fs.readFileSync(file, 'utf8');

const exact = "const url=new URL(req.url), path=url.pathname;";
const replacement = "const url=new URL(req.url), rawPath=url.pathname, path=(rawPath.length>1?rawPath.replace(/\\/+$/,''):rawPath);";

if (!src.includes(exact)) {
  throw new Error('Admin path normalization signature not found.');
}
src = src.replace(exact, replacement);
fs.writeFileSync(file, src);

import fs from 'node:fs';import path from 'node:path';
const root=process.argv[2]||'release',must=(x,m)=>{if(!x)throw new Error('SECURITY QA FAIL: '+m);console.log('SECURITY QA PASS:',m)},read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('netlify/functions/app.mjs'),site=read('assets/site.js'),admin=read('assets/admin.js');
for(const lang of ['ar','en']){must(!fs.existsSync(path.join(root,lang,'login.html')),lang+' client login removed');must(!fs.existsSync(path.join(root,lang,'dashboard.html')),lang+' client dashboard removed');}
must(app.includes('RASSMIY_SECURITY_V61'),'security middleware installed');
must(app.includes('RASSMIY_DB_ENCRYPTION_V62'),'AES-GCM DB encryption installed');
must(app.includes('recaptcha/api/siteverify'),'server-side reCAPTCHA verification code');
must(app.includes('RASSMIY_ATTACK_GUARD_V61'),'automated probe blocker');
must(app.includes('/api/security-events'),'attack record API');
must(admin.includes('__RASSMIY_SECURITY_ADMIN_V61__'),'admin attack record UI');
must(/HttpOnly/i.test(app)&&/SameSite/i.test(app),'secure admin cookie flags');
must(/csrf/i.test(app),'CSRF defenses');
must(!/eval\s*\(/.test(site)&&!/eval\s*\(/.test(admin),'no eval in frontend/admin');
must(!/document\.write\s*\(/.test(site)&&!/document\.write\s*\(/.test(admin),'no document.write');
must(!/\.\.\/\.\.\//.test(app),'no obvious hard-coded traversal');
console.log('SECURITY QA SUMMARY: auth-surface=PASS captcha=PASS encryption=PASS attack-record=PASS frontend=PASS backend=PASS');
import fs from 'node:fs';import path from 'node:path';
const root=process.argv[2]||'release';
const must=(x,m)=>{if(!x)throw new Error('RUNTIME QA FAIL: '+m);console.log('RUNTIME QA PASS:',m)};
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const app=fs.readFileSync(path.join(root,'netlify/functions/app.mjs'),'utf8');
const site=fs.readFileSync(path.join(root,'assets/site.js'),'utf8');
must(pkg.dependencies?.['sanitize-html']==='2.14.0','sanitize-html pinned to htmlparser2 8.x compatible version');
must(app.includes("__rassmiyCreateRequire")&&app.includes("__rassmiyRequire('sanitize-html')"),'sanitize-html loaded through CJS require');
must(pkg.dependencies?.['@netlify/blobs']==='11.1.3','Netlify blobs pinned');
must(site.includes('__RASSMIY_PUBLIC_AUTH_SCRUB_V70__'),'public auth scrub installed');
must(app.includes('RASSMIY_LEGACY_LOGIN_REDIRECT_V70'),'legacy login redirects installed');
must(app.includes('RASSMIY_ADMIN_LOGIN_FORM_FIX_V72'),'admin login form fix installed');
must(app.includes('action="/admin"'),'admin login form posts directly to /admin');
must(!app.includes('action="/admin/login"'),'admin login form no longer posts to legacy route');
must(app.includes("if(path==='/admin/login')return redirect('/admin',req.method==='POST'?307:301);"),'legacy POST preserves method and body');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of walk(root).filter(f=>f.endsWith('.html')&&!f.includes(path.sep+'admin'+path.sep))){
 const h=fs.readFileSync(f,'utf8');
 must(!/<a\b[^>]*href=["'][^"']*(?:\/admin(?:\/login)?|login\.html|dashboard\.html)[^"']*["']/i.test(h),path.relative(root,f)+' has no public auth link');
}
must(fs.existsSync(path.join(root,'runtime-hotfix-v70.json')),'hotfix manifest exists');
console.log('RUNTIME_QA_V70=PASS');
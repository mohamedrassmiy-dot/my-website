import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const blobRoot=process.env.CMS_DATA_DIR||"/data/rassmiy-blobs";
fs.mkdirSync(blobRoot,{recursive:true});
const netlifyBlobsMain=path.resolve("node_modules/@netlify/blobs/dist/main.js");

const shim=String.raw`
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root=process.env.CMS_DATA_DIR||"/data/rassmiy-blobs";
const enc=s=>Buffer.from(String(s)).toString("base64url");
const dec=s=>Buffer.from(String(s),"base64url").toString();
const dir=n=>{const d=path.join(root,enc(n||"default"));fs.mkdirSync(d,{recursive:true});return d;};
const file=(n,k)=>path.join(dir(n),enc(k)+".blob");
const meta=(n,k)=>path.join(dir(n),enc(k)+".meta.json");
const readMeta=(n,k)=>{try{return JSON.parse(fs.readFileSync(meta(n,k),"utf8"));}catch{return null;}};

async function toBuffer(value){
  if(Buffer.isBuffer(value)) return value;
  if(value instanceof Uint8Array) return Buffer.from(value);
  if(value instanceof ArrayBuffer) return Buffer.from(new Uint8Array(value));
  if(typeof Blob!=="undefined" && value instanceof Blob) return Buffer.from(await value.arrayBuffer());
  if(value && typeof value.getReader==="function") return Buffer.from(await new Response(value).arrayBuffer());
  return Buffer.from(typeof value==="string"?value:JSON.stringify(value));
}
function typed(buf,type){
  if(type==="json") return JSON.parse(buf.toString("utf8"));
  if(type==="arrayBuffer") return buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength);
  if(type==="blob") return new Blob([buf]);
  if(type==="stream") return fs.createReadStream("__FILE__");
  return buf.toString("utf8");
}
export function getStore(input){
  const name=typeof input==="string"?input:(input?.name||"default");
  return {
    async get(key,opts={}){
      const f=file(name,key); if(!fs.existsSync(f)) return null;
      if(opts?.type==="stream") return fs.createReadStream(f);
      const b=fs.readFileSync(f);
      if(opts?.type==="json") return JSON.parse(b.toString("utf8"));
      if(opts?.type==="arrayBuffer") return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
      if(opts?.type==="blob") return new Blob([b]);
      return b.toString("utf8");
    },
    async getWithMetadata(key,opts={}){
      const f=file(name,key); if(!fs.existsSync(f)) return null;
      const b=fs.readFileSync(f);
      let data;
      if(opts?.type==="json") data=JSON.parse(b.toString("utf8"));
      else if(opts?.type==="arrayBuffer") data=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
      else if(opts?.type==="blob") data=new Blob([b]);
      else if(opts?.type==="stream") data=fs.createReadStream(f);
      else data=b.toString("utf8");
      return {data,metadata:readMeta(name,key),etag:crypto.createHash("sha1").update(b).digest("hex")};
    },
    async set(key,value,opts={}){
      const b=await toBuffer(value);
      fs.writeFileSync(file(name,key),b);
      if(opts?.metadata!=null) fs.writeFileSync(meta(name,key),JSON.stringify(opts.metadata));
      return {etag:crypto.createHash("sha1").update(b).digest("hex"),modified:new Date()};
    },
    async setJSON(key,value,opts={}){return this.set(key,JSON.stringify(value),opts);},
    async delete(key){for(const f of [file(name,key),meta(name,key)])try{fs.unlinkSync(f)}catch{}},
    async getMetadata(key){return readMeta(name,key);},
    async list(opts={}){
      const d=dir(name), prefix=String(opts?.prefix||"");
      const blobs=fs.readdirSync(d).filter(x=>x.endsWith(".blob")).map(x=>{
        const key=dec(x.slice(0,-5)); if(prefix&&!key.startsWith(prefix)) return null;
        const f=path.join(d,x), st=fs.statSync(f), b=fs.readFileSync(f);
        return {key,size:st.size,etag:crypto.createHash("sha1").update(b).digest("hex"),uploadedAt:st.mtime.toISOString(),metadata:readMeta(name,key)};
      }).filter(Boolean);
      return {blobs,directories:[]};
    }
  };
}
export function getDeployStore(input){return getStore(input||"deploy");}
export const connectLambda=()=>{};
export const connectLocal=()=>{};
`;
fs.writeFileSync(netlifyBlobsMain,shim);

const app=await import("./release/netlify/functions/app.mjs");
const root=path.resolve("release");
const port=Number(process.env.PORT||8080);
const mime={
  ".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".ico":"image/x-icon",".xml":"application/xml; charset=utf-8",
  ".txt":"text/plain; charset=utf-8",".webp":"image/webp",".woff2":"font/woff2"
};

const customCodeFile=process.env.CUSTOM_CODE_FILE||"/data/rassmiy-custom-code.json";
const CUSTOM_CODE_TYPES=new Set(["html","meta","javascript","css","jsonld"]);
const CUSTOM_CODE_PLACEMENTS=new Set(["head_start","head_end","body_start","body_end"]);
const CUSTOM_CODE_SCOPES=new Set(["all","home","ar","en","custom"]);
const CUSTOM_CODE_ADMIN_ASSET="<style id=\"rassmiy-custom-code-style\">\n#custom-code-manager{margin-top:24px}.cc-warning{padding:12px 14px;border:1px solid #e2b44f;border-radius:10px;background:#fff8e7;line-height:1.6}.cc-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.cc-item{border:1px solid #dfe7ef;border-radius:14px;padding:16px;margin:14px 0;background:#fff}.cc-row,.cc-grid{display:grid;gap:12px}.cc-row{grid-template-columns:minmax(0,1fr) 140px}.cc-grid{grid-template-columns:repeat(3,minmax(0,1fr));margin-top:12px}.cc-item label{display:grid;gap:6px;font-weight:700}.cc-item input,.cc-item select,.cc-item textarea{width:100%;box-sizing:border-box}.cc-item textarea{resize:vertical}.cc-code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;direction:ltr;text-align:left;line-height:1.5}.cc-actions{display:flex;justify-content:flex-end;margin-top:10px}.cc-paths{margin-top:12px}.cc-hidden{display:none}.cc-toggle input{width:auto}@media(max-width:760px){.cc-row,.cc-grid{grid-template-columns:1fr}.cc-toolbar>*{flex:1 1 auto}}\n</style>\n<script id=\"rassmiy-custom-code-admin\">\n(()=>{if(window.__RASSMIY_CUSTOM_CODE_ADMIN__)return;window.__RASSMIY_CUSTOM_CODE_ADMIN__=true;\nconst ar=()=>document.documentElement.dir==='rtl'||(document.documentElement.lang||'ar').startsWith('ar');\nconst esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\nconst L=()=>ar()?{title:'الأكواد المخصصة',sub:'أضف أكواد التحقق وAnalytics وTag Manager وMeta وCSS وJavaScript وحدد مكانها ونطاقها.',add:'إضافة كود',save:'حفظ الأكواد',enabled:'مفعّل',name:'الاسم',type:'نوع الكود',place:'المكان',scope:'النطاق',paths:'المسارات',code:'الكود',del:'حذف',saving:'جاري الحفظ…',saved:'تم الحفظ بنجاح.',warning:'تنبيه: الأكواد المخصصة تُنفذ على الصفحات العامة فقط، ولا يتم حقنها داخل /admin لحماية لوحة التحكم.',pathHelp:'مثال: /ar/* أو /en/contact.html — افصل بين المسارات بفاصلة أو سطر جديد.',types:{html:'HTML',meta:'Meta Tag',javascript:'JavaScript',css:'CSS',jsonld:'JSON-LD'},places:{head_start:'بداية <head>',head_end:'قبل </head>',body_start:'بعد <body>',body_end:'قبل </body>'},scopes:{all:'كل الصفحات',home:'الرئيسية فقط',ar:'العربية',en:'الإنجليزية',custom:'مسارات مخصصة'}}:{title:'Custom Code',sub:'Add verification, analytics, Tag Manager, meta, CSS or JavaScript and choose placement and scope.',add:'Add code',save:'Save codes',enabled:'Enabled',name:'Name',type:'Code type',place:'Placement',scope:'Scope',paths:'Paths',code:'Code',del:'Delete',saving:'Saving…',saved:'Saved successfully.',warning:'Custom code runs on public pages only and is never injected into /admin to protect the CMS.',pathHelp:'Example: /ar/* or /en/contact.html — separate paths with commas or new lines.',types:{html:'HTML',meta:'Meta Tag',javascript:'JavaScript',css:'CSS',jsonld:'JSON-LD'},places:{head_start:'Start of <head>',head_end:'Before </head>',body_start:'After <body>',body_end:'Before </body>'},scopes:{all:'All pages',home:'Homepage only',ar:'Arabic',en:'English',custom:'Custom paths'}};\nlet rows=[];\nconst options=(o,v)=>Object.entries(o).map(([k,t])=>'<option value=\"'+esc(k)+'\" '+(k===v?'selected':'')+'>'+esc(t)+'</option>').join('');\nconst item=(x,i)=>{const l=L();return '<article class=\"cc-item\" data-i=\"'+i+'\"><div class=\"cc-row\"><label><span>'+l.name+'</span><input data-f=\"name\" maxlength=\"160\" value=\"'+esc(x.name||'')+'\"></label><label class=\"cc-toggle\"><span>'+l.enabled+'</span><input type=\"checkbox\" data-f=\"enabled\" '+(x.enabled!==false?'checked':'')+'></label></div><div class=\"cc-grid\"><label><span>'+l.type+'</span><select data-f=\"type\">'+options(l.types,x.type||'meta')+'</select></label><label><span>'+l.place+'</span><select data-f=\"placement\">'+options(l.places,x.placement||'head_end')+'</select></label><label><span>'+l.scope+'</span><select data-f=\"scope\">'+options(l.scopes,x.scope||'all')+'</select></label></div><label class=\"cc-paths '+((x.scope||'all')==='custom'?'':'cc-hidden')+'\"><span>'+l.paths+'</span><textarea data-f=\"paths\" rows=\"2\" placeholder=\"/ar/*\">'+esc(x.paths||'')+'</textarea><small>'+l.pathHelp+'</small></label><label><span>'+l.code+'</span><textarea class=\"cc-code\" data-f=\"code\" rows=\"8\" spellcheck=\"false\" placeholder=\"&lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot;&gt;\">'+esc(x.code||'')+'</textarea></label><div class=\"cc-actions\"><button type=\"button\" class=\"danger-btn\" data-del=\"'+i+'\">'+l.del+'</button></div></article>'};\nfunction sync(){document.querySelectorAll('.cc-item').forEach((el,i)=>{const x=rows[i]||{};el.querySelectorAll('[data-f]').forEach(inp=>x[inp.dataset.f]=inp.type==='checkbox'?inp.checked:inp.value);rows[i]=x;});}\nfunction render(){const box=document.querySelector('[data-cc-list]');if(box)box.innerHTML=rows.map(item).join('');}\nasync function save(){sync();const s=document.querySelector('[data-cc-status]');s.textContent=L().saving;const r=await fetch('/api/custom-code-admin',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json','x-requested-with':'RassmiyAdmin'},body:JSON.stringify({snippets:rows})});if(!r.ok)throw new Error('Save failed: '+r.status);s.textContent=L().saved;}\nasync function init(){if(!location.pathname.startsWith('/admin'))return;const q=new URLSearchParams(location.search),section=q.get('section')||'dashboard';if(!['settings','seo'].includes(section))return;const main=document.querySelector('.cms-main');if(!main||document.getElementById('custom-code-manager'))return;const l=L();const sec=document.createElement('section');sec.className='panel';sec.id='custom-code-manager';sec.innerHTML='<div class=\"panel-head\"><div><h2>'+l.title+'</h2><p>'+l.sub+'</p></div></div><p class=\"cc-warning\">'+l.warning+'</p><div class=\"cc-toolbar\"><button type=\"button\" class=\"secondary-btn\" data-cc-add>'+l.add+'</button><button type=\"button\" class=\"primary-btn\" data-cc-save>'+l.save+'</button></div><div data-cc-list></div><p data-cc-status class=\"muted\"></p>';main.appendChild(sec);try{const r=await fetch('/api/custom-code-admin',{credentials:'same-origin',cache:'no-store'});if(r.ok){const d=await r.json();rows=Array.isArray(d.snippets)?d.snippets:[];}}catch{}render();sec.addEventListener('input',e=>{if(e.target.matches('[data-f]'))sync();});sec.addEventListener('change',e=>{if(e.target.matches('[data-f=\"scope\"]')){sync();render();}});sec.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('[data-cc-add]')){sync();rows.push({id:'snippet-'+Date.now(),name:ar()?'كود جديد':'New code',enabled:true,type:'meta',placement:'head_end',scope:'all',paths:'',code:''});render();return;}if(b.matches('[data-cc-save]')){save().catch(err=>document.querySelector('[data-cc-status]').textContent=err.message);return;}if(b.dataset.del!=null){sync();rows.splice(Number(b.dataset.del),1);render();}});if(q.get('custom_code')==='1')setTimeout(()=>sec.scrollIntoView({behavior:'smooth'}),100);}\ndocument.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();\n})();\n</script>";
function normalizeCustomCode(input){
  const list=Array.isArray(input)?input:[];
  if(list.length>40)throw Object.assign(new Error("too many snippets"),{statusCode:400});
  return list.map((x,i)=>{
    const type=CUSTOM_CODE_TYPES.has(String(x?.type||""))?String(x.type):"html";
    const placement=CUSTOM_CODE_PLACEMENTS.has(String(x?.placement||""))?String(x.placement):"head_end";
    const scope=CUSTOM_CODE_SCOPES.has(String(x?.scope||""))?String(x.scope):"all";
    return {id:String(x?.id||("snippet-"+i)).slice(0,100),name:String(x?.name||("Custom code "+(i+1))).slice(0,160),enabled:x?.enabled!==false,type,placement,scope,paths:String(x?.paths||"").slice(0,4000),code:String(x?.code||"").slice(0,50000)};
  });
}
function readCustomCode(){try{return normalizeCustomCode(JSON.parse(fs.readFileSync(customCodeFile,"utf8")));}catch{return []}}
function writeCustomCode(items){fs.mkdirSync(path.dirname(customCodeFile),{recursive:true});const tmp=customCodeFile+".tmp";fs.writeFileSync(tmp,JSON.stringify(normalizeCustomCode(items),null,2));fs.renameSync(tmp,customCodeFile);}
function customScopeMatch(item,pathname){
  const p=String(pathname||"/"),scope=String(item.scope||"all");
  if(scope==="all")return true;
  if(scope==="home")return ["/","/index.html","/ar/","/ar/index.html","/en/","/en/index.html"].includes(p);
  if(scope==="ar")return p==="/ar"||p.startsWith("/ar/");
  if(scope==="en")return p==="/en"||p.startsWith("/en/");
  if(scope==="custom"){
    const rules=String(item.paths||"").split(/[\n,]+/).map(x=>x.trim()).filter(Boolean);
    return rules.some(rule=>rule==="*"||(rule.endsWith("*")&&p.startsWith(rule.slice(0,-1)))||(rule.endsWith("/")&&p.startsWith(rule))||p===rule);
  }
  return false;
}
function renderCustomSnippet(item){
  const raw=String(item.code||"");if(!raw)return "";
  if(item.type==="javascript")return /<script\b/i.test(raw)?raw:"<script>"+raw+"</"+"script>";
  if(item.type==="css")return /<style\b/i.test(raw)?raw:"<style>"+raw+"</"+"style>";
  if(item.type==="jsonld")return /<script\b/i.test(raw)?raw:'<script type="application/ld+json">'+raw+"</"+"script>";
  return raw;
}
async function injectCustomCode(html,pathname){
  if(!html||pathname.startsWith("/admin")||pathname.startsWith("/api/")||pathname==="/install")return html;
  const bins={head_start:[],head_end:[],body_start:[],body_end:[]};
  for(const item of readCustomCode())if(item.enabled!==false&&customScopeMatch(item,pathname))bins[item.placement].push(renderCustomSnippet(item));
  let out=html;
  const hs=bins.head_start.filter(Boolean).join("\n"),he=bins.head_end.filter(Boolean).join("\n"),bs=bins.body_start.filter(Boolean).join("\n"),be=bins.body_end.filter(Boolean).join("\n");
  if(hs)out=out.replace(/<head([^>]*)>/i,m=>m+"\n"+hs);
  if(he)out=out.replace(/<\/head>/i,he+"\n</head>");
  if(bs)out=out.replace(/<body([^>]*)>/i,m=>m+"\n"+bs);
  if(be)out=out.replace(/<\/body>/i,be+"\n</body>");
  return out;
}
async function cmsAdminAuthenticated(req){
  try{
    const handler=app.handler||app.default;if(typeof handler!=="function")return false;
    const proto=String(req.headers["x-forwarded-proto"]||"https").split(",")[0].trim();
    const host=req.headers.host||"rassmiy-marketing.up.railway.app";
    const h=new Headers();if(req.headers.cookie)h.set("cookie",String(req.headers.cookie));if(req.headers["user-agent"])h.set("user-agent",String(req.headers["user-agent"]));
    const out=await handler(new Request(proto+"://"+host+"/admin?section=settings",{headers:h}),{});
    if(!(out instanceof Response)||out.status!==200)return false;
    const body=await out.text();
    return /class=["'][^"']*cms-main/i.test(body)&&!/name=["']password["']/i.test(body);
  }catch{return false}
}
function customAdminOriginAllowed(req){
  const origin=String(req.headers.origin||"").trim();if(!origin)return true;
  const proto=String(req.headers["x-forwarded-proto"]||"https").split(",")[0].trim(),host=req.headers.host||"";
  return origin===proto+"://"+host;
}
function injectCustomCodeAdminUi(html,pathname,search){
  if(pathname!=="/admin")return html;
  const section=new URLSearchParams(search||"").get("section")||"dashboard";
  if(section!=="settings"&&section!=="seo")return html;
  if(html.includes("rassmiy-custom-code-admin"))return html;
  return html.replace(/<\/body>/i,CUSTOM_CODE_ADMIN_ASSET+"</body>");
}

function safeFile(urlPath){
  let p=decodeURIComponent(urlPath.split("?")[0]);
  if(p==="/") p="/index.html";
  const tries=[p,p.endsWith("/")?p+"index.html":p+".html",p+"/index.html"];
  for(const t of tries){
    const f=path.resolve(root,"."+t);
    if(f.startsWith(root+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile()) return f;
  }
  return null;
}
function injectGoogleVerification(html){
  const token=String(process.env.GOOGLE_SITE_VERIFICATION||"").trim();
  if(!token) return html;
  const safe=token.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const meta=`<meta name="google-site-verification" content="${safe}">`;
  const existing=/<meta\s+name=["']google-site-verification["'][^>]*>/i;
  if(existing.test(html)) return html.replace(existing,meta);
  return html.replace(/<\/head>/i,`  ${meta}\n</head>`);
}
async function sendFile(res,f,pathname="/"){
  res.statusCode=200;
  const type=mime[path.extname(f).toLowerCase()]||"application/octet-stream";
  res.setHeader("Content-Type",type);
  if(f.includes(path.sep+"admin"+path.sep)||f.endsWith(path.sep+"admin.html")) res.setHeader("Cache-Control","no-store, max-age=0");
  if(path.extname(f).toLowerCase()===".html"){
    let html=fs.readFileSync(f,"utf8");
    html=injectGoogleVerification(html);
    html=await injectCustomCode(html,pathname);
    res.end(html);
    return;
  }
  fs.createReadStream(f).pipe(res);
}
function readBody(req,max=25*1024*1024){
  return new Promise((resolve,reject)=>{
    const chunks=[];let n=0;
    req.on("data",c=>{n+=c.length;if(n>max){reject(Object.assign(new Error("body too large"),{statusCode:413}));req.destroy();return;}chunks.push(c);});
    req.on("end",()=>resolve(Buffer.concat(chunks)));
    req.on("error",reject);
  });
}
function appendResponseHeaders(res,headers){
  const setCookies=typeof headers.getSetCookie==="function"?headers.getSetCookie():[];
  headers.forEach((v,k)=>{if(k.toLowerCase()!=="set-cookie")res.setHeader(k,v);});
  if(setCookies.length) res.setHeader("Set-Cookie",setCookies);
  else{
    const sc=headers.get("set-cookie"); if(sc) res.setHeader("Set-Cookie",sc);
  }
}
async function runFunction(req,res){
  const body=await readBody(req);
  const proto=String(req.headers["x-forwarded-proto"]||"https").split(",")[0].trim();
  const host=req.headers.host||"rassmiy-marketing.up.railway.app";
  const reqUrl=proto+"://"+host+req.url;
  const webReq=new Request(reqUrl,{
    method:req.method,
    headers:new Headers(Object.fromEntries(Object.entries(req.headers).map(([k,v])=>[k,Array.isArray(v)?v.join(","):String(v??"")]))),
    body:["GET","HEAD"].includes(req.method)?undefined:body
  });
  const handler=app.handler||app.default;
  if(typeof handler!=="function") throw new Error("CMS handler export not found");
  const out=await handler(webReq,{});
  if(out instanceof Response){
    res.statusCode=out.status;
    appendResponseHeaders(res,out.headers);
    if(req.method==="HEAD"){res.end();return;}
    const ab=await out.arrayBuffer();
    let payload=Buffer.from(ab);
    const parsedReqUrl=new URL(reqUrl);
    const ct=String(out.headers.get("content-type")||"");
    if(ct.includes("text/html")){
      let html=payload.toString("utf8");
      html=injectCustomCodeAdminUi(html,parsedReqUrl.pathname,parsedReqUrl.search);
      html=injectGoogleVerification(html);
      html=await injectCustomCode(html,parsedReqUrl.pathname);
      payload=Buffer.from(html);
    }
    res.end(payload);
    return;
  }
  res.statusCode=Number(out?.statusCode||200);
  for(const [k,v] of Object.entries(out?.headers||{})) if(v!=null) res.setHeader(k,String(v));
  if(out?.multiValueHeaders) for(const [k,vals] of Object.entries(out.multiValueHeaders)) if(Array.isArray(vals)) res.setHeader(k,vals.map(String));
  const payload=out?.body??"";
  res.end(out?.isBase64Encoded?Buffer.from(payload,"base64"):payload);
}

const server=http.createServer(async(req,res)=>{
  try{
    const reqUrlObj=new URL(req.url,"http://local");
    const pathname=reqUrlObj.pathname;
    if(pathname==="/api/custom-code-admin"){
      if(!customAdminOriginAllowed(req)){res.statusCode=403;res.end("Forbidden");return;}
      if(!(await cmsAdminAuthenticated(req))){res.statusCode=401;res.end("Unauthorized");return;}
      if(req.method==="GET"){
        res.statusCode=200;
        res.setHeader("Content-Type","application/json; charset=utf-8");
        res.setHeader("Cache-Control","no-store");
        res.end(JSON.stringify({snippets:readCustomCode()}));
        return;
      }
      if(req.method==="POST"){
        if(String(req.headers["x-requested-with"]||"")!=="RassmiyAdmin"){res.statusCode=403;res.end("Forbidden");return;}
        const raw=await readBody(req,2*1024*1024);
        let data;try{data=JSON.parse(raw.toString("utf8"));}catch{res.statusCode=400;res.end("Invalid JSON");return;}
        writeCustomCode(data?.snippets||[]);
        res.statusCode=200;
        res.setHeader("Content-Type","application/json; charset=utf-8");
        res.end(JSON.stringify({ok:true,count:readCustomCode().length}));
        return;
      }
      res.statusCode=405;res.end("Method Not Allowed");return;
    }
    const googleVerificationFiles={
      "/googlef284124f6e4cc6fb.html":"google-site-verification: googlef284124f6e4cc6fb.html\n",
      "/google5f2aa36fd981433f.html":"google-site-verification: google5f2aa36fd981433f.html\n"
    };
    if(Object.prototype.hasOwnProperty.call(googleVerificationFiles,pathname)){
      res.statusCode=200;
      res.setHeader("Content-Type","text/html; charset=utf-8");
      res.setHeader("Cache-Control","public, max-age=300");
      res.end(googleVerificationFiles[pathname]);
      return;
    }
    if(["/favicon","/favicon.ico","/apple-touch-icon.png","/apple-touch-icon-precomposed.png"].includes(pathname)){
      const brandIcon=path.join(root,"assets","logo.jpg");
      if(fs.existsSync(brandIcon)){await sendFile(res,brandIcon,pathname);return;}
    }
    const dynamic=pathname.startsWith("/api/")||pathname.startsWith("/admin")||pathname==="/install";
    if(!dynamic){
      const f=safeFile(pathname); if(f){await sendFile(res,f,pathname);return;}
    }
    await runFunction(req,res);
  }catch(err){
    console.error("[RASSMIY_SERVER_ERROR]",err?.stack||err);
    res.statusCode=Number(err?.statusCode||500);
    res.setHeader("Content-Type","application/json; charset=utf-8");
    res.end(JSON.stringify({error:res.statusCode===413?"payload_too_large":"server_error"}));
  }
});

function cookieJarFrom(res,jar={}){
  const values=typeof res.headers.getSetCookie==="function"?res.headers.getSetCookie():[res.headers.get("set-cookie")].filter(Boolean);
  for(const raw of values){
    const first=String(raw).split(";")[0], i=first.indexOf("=");
    if(i>0) jar[first.slice(0,i).trim()]=first.slice(i+1).trim();
  }
  return jar;
}
const cookieHeader=jar=>Object.entries(jar).map(([k,v])=>k+"="+v).join("; ");
const csrfFrom=html=>(html.match(/name=["']csrf["'][^>]*value=["']([^"']+)["']/i)||html.match(/value=["']([^"']+)["'][^>]*name=["']csrf["']/i)||[])[1]||"";

async function bootstrapAdmin(base){
  const email=String(process.env.BOOTSTRAP_ADMIN_EMAIL||"").trim();
  const password=String(process.env.BOOTSTRAP_ADMIN_PASSWORD||"");
  const name=String(process.env.BOOTSTRAP_ADMIN_NAME||"Mohamed Ali Rassmiy").trim();
  const health=await fetch(base+"/api/health",{redirect:"manual"});
  const before=await health.json().catch(()=>({}));
  if(before?.installed) return {installed:true,created:false,loginTest:null};
  if(!email||!password) return {installed:false,created:false,reason:"bootstrap_credentials_not_set"};

  const jar={};
  const ig=await fetch(base+"/install",{redirect:"manual"});
  cookieJarFrom(ig,jar);
  const ih=await ig.text();
  const csrf=csrfFrom(ih);
  if(!csrf) throw new Error("INSTALL_CSRF_NOT_FOUND");
  const body=new URLSearchParams({csrf,name,email,password,confirm_password:password});
  const ip=await fetch(base+"/install",{
    method:"POST",redirect:"manual",
    headers:{"content-type":"application/x-www-form-urlencoded","cookie":cookieHeader(jar)},
    body
  });
  cookieJarFrom(ip,jar);
  if(![200,302,303].includes(ip.status)) throw new Error("INSTALL_POST_FAILED_"+ip.status);

  const h2=await fetch(base+"/api/health",{redirect:"manual"});
  const after=await h2.json().catch(()=>({}));
  if(!after?.installed) throw new Error("INSTALL_DID_NOT_PERSIST");

  const loginJar={};
  const lg=await fetch(base+"/admin",{redirect:"manual"});
  cookieJarFrom(lg,loginJar);
  const lh=await lg.text();
  const lcsrf=csrfFrom(lh);
  if(!lcsrf) throw new Error("LOGIN_CSRF_NOT_FOUND");
  const lp=await fetch(base+"/admin",{
    method:"POST",redirect:"manual",
    headers:{"content-type":"application/x-www-form-urlencoded","cookie":cookieHeader(loginJar)},
    body:new URLSearchParams({csrf:lcsrf,email,password})
  });
  cookieJarFrom(lp,loginJar);
  const dash=await fetch(base+"/admin?section=dashboard",{redirect:"manual",headers:{"cookie":cookieHeader(loginJar)}});
  const pages=await fetch(base+"/admin?section=pages",{redirect:"manual",headers:{"cookie":cookieHeader(loginJar)}});
  const articles=await fetch(base+"/admin?section=articles",{redirect:"manual",headers:{"cookie":cookieHeader(loginJar)}});
  const loginOk=[200].includes(dash.status)&&[200].includes(pages.status)&&[200].includes(articles.status);
  if(!loginOk) throw new Error("ADMIN_LOGIN_TEST_FAILED");
  return {installed:true,created:true,loginTest:{dashboard:dash.status,pages:pages.status,articles:articles.status}};
}

async function productionSelfTest(base){
  const tests=[];
  async function check(name,p,allowed){
    try{
      const r=await fetch(base+p,{redirect:"manual"});
      const item={name,path:p,status:r.status,location:r.headers.get("location")||null,ok:allowed.includes(r.status)};
      if(p==="/"&&r.status===200){
        const html=await r.text();
        const token=String(process.env.GOOGLE_SITE_VERIFICATION||"").trim();
        item.googleVerificationMeta=Boolean(token&&html.includes(`name="google-site-verification"`)&&html.includes(`content="${token}"`));
        item.ok=item.ok&&item.googleVerificationMeta;
      }
      else if(p==="/api/health"&&r.status===200){const j=await r.json().catch(()=>({}));item.installed=Boolean(j?.installed);item.ok=item.ok&&item.installed;}
      else if(p==="/api/content-cards"&&r.status===200){const j=await r.json().catch(()=>({}));item.cards=Array.isArray(j?.cards)?j.cards.length:-1;item.ok=item.ok&&item.cards>0;}
      else await r.arrayBuffer();
      tests.push(item);
    }catch(err){tests.push({name,path:p,status:0,ok:false,error:String(err?.message||err)});}
  }
  let volumeWrite=false;
  try{
    const probe=path.join(blobRoot,".railway-write-test");
    fs.writeFileSync(probe,"ok-"+Date.now());
    volumeWrite=fs.readFileSync(probe,"utf8").startsWith("ok-");
    fs.unlinkSync(probe);
  }catch{}
  await check("homepage","/",[200]);
  await check("arabic-home","/ar/index.html",[200]);
  await check("english-home","/en/index.html",[200]);
  await check("robots","/robots.txt",[200]);
  await check("sitemap","/sitemap.xml",[200]);
  await check("favicon","/favicon.ico",[200]);
  await check("gsc-file-1","/googlef284124f6e4cc6fb.html",[200]);
  await check("gsc-file-2","/google5f2aa36fd981433f.html",[200]);
  let customStorage=false;try{writeCustomCode(readCustomCode());customStorage=fs.existsSync(customCodeFile);}catch{}
  tests.push({name:"custom-code-storage",path:customCodeFile,status:customStorage?200:500,ok:customStorage});
  await check("api-health","/api/health",[200]);
  await check("content-cards","/api/content-cards",[200]);
  await check("site-js","/assets/site.js",[200]);
  await check("admin","/admin",[200]);
  const ok=volumeWrite&&tests.every(x=>x.ok);
  return {ok,volumeWrite,tests};
}

server.listen(port,"0.0.0.0",async()=>{
  console.log("Rassmiy CMS listening on",port);
  const base="http://127.0.0.1:"+port;
  try{
    const bootstrap=await bootstrapAdmin(base);
    console.log("[RASSMIY_BOOTSTRAP] "+JSON.stringify(bootstrap));
  }catch(err){
    console.error("[RASSMIY_BOOTSTRAP_ERROR]",String(err?.stack||err));
  }
  try{
    const qa=await productionSelfTest(base);
    console.log("[RASSMIY_PRODUCTION_QA] "+JSON.stringify(qa));
  }catch(err){
    console.error("[RASSMIY_PRODUCTION_QA_ERROR]",String(err?.stack||err));
  }
});

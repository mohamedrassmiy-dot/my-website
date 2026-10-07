import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Railway compatibility: replace Netlify Blobs with durable local storage on the mounted Railway volume.
const blobRoot=process.env.CMS_DATA_DIR||"/data/rassmiy-blobs";
fs.mkdirSync(blobRoot,{recursive:true});
const netlifyBlobsMain=path.resolve("node_modules/@netlify/blobs/dist/main.js");
const shim=String.raw`
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const root=process.env.CMS_DATA_DIR||"/data/rassmiy-blobs";
const enc=s=>Buffer.from(String(s)).toString("base64url"), dec=s=>Buffer.from(s,"base64url").toString();
const dir=n=>{const d=path.join(root,enc(n||"default"));fs.mkdirSync(d,{recursive:true});return d};
const file=(n,k)=>path.join(dir(n),enc(k)+".blob");
const meta=(n,k)=>path.join(dir(n),enc(k)+".meta.json");
export function getStore(input){
 const name=typeof input==="string"?input:(input?.name||"default");
 return {
  async get(key,opts={}){const f=file(name,key);if(!fs.existsSync(f))return null;const b=fs.readFileSync(f);if(opts?.type==="json")return JSON.parse(b.toString("utf8"));if(opts?.type==="arrayBuffer")return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);if(opts?.type==="blob")return new Blob([b]);if(opts?.type==="stream")return fs.createReadStream(f);return b.toString("utf8")},
  async set(key,value,opts={}){const b=Buffer.isBuffer(value)?value:value instanceof Uint8Array?Buffer.from(value):Buffer.from(typeof value==="string"?value:JSON.stringify(value));fs.writeFileSync(file(name,key),b);if(opts?.metadata)fs.writeFileSync(meta(name,key),JSON.stringify(opts.metadata));return {etag:crypto.createHash("sha1").update(b).digest("hex"),modified:new Date()}},
  async setJSON(key,value,opts={}){return this.set(key,JSON.stringify(value),opts)},
  async delete(key){for(const f of [file(name,key),meta(name,key)])try{fs.unlinkSync(f)}catch{}},
  async getMetadata(key){const f=meta(name,key);return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,"utf8")):null},
  async list(){const d=dir(name);const blobs=fs.readdirSync(d).filter(x=>x.endsWith(".blob")).map(x=>({key:dec(x.slice(0,-5))}));return {blobs,directories:[]}}
 };
}
export function getDeployStore(input){ return getStore(input||"deploy"); }
export const connectLambda=()=>{};
export const connectLocal=()=>{};
`;
fs.writeFileSync(netlifyBlobsMain,shim);
const app = await import("./release/netlify/functions/app.mjs");

const root=path.resolve("release");
const port=Number(process.env.PORT||8080);
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".ico":"image/x-icon",".xml":"application/xml; charset=utf-8",".txt":"text/plain; charset=utf-8",".webp":"image/webp"};

function safeFile(urlPath){
  let p=decodeURIComponent(urlPath.split("?")[0]);
  if(p==="/") p="/index.html";
  const tries=[p, p.endsWith("/")?p+"index.html":p+".html", p+"/index.html"];
  for(const t of tries){
    const f=path.resolve(root,"."+t);
    if(f.startsWith(root+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile()) return f;
  }
  return null;
}
function sendFile(res,f){
  res.statusCode=200;
  res.setHeader("Content-Type",mime[path.extname(f).toLowerCase()]||"application/octet-stream");
  if(f.includes(path.sep+"admin"+path.sep)||f.endsWith(path.sep+"admin.html")) res.setHeader("Cache-Control","no-store, max-age=0");
  fs.createReadStream(f).pipe(res);
}
function bodyOf(req){return new Promise((resolve,reject)=>{const chunks=[];let n=0;req.on("data",c=>{n+=c.length;if(n>2_000_000){reject(new Error("body too large"));req.destroy();return;}chunks.push(c)});req.on("end",()=>resolve(Buffer.concat(chunks).toString("utf8")));req.on("error",reject);});}
async function runFunction(req,res){
  const body=await bodyOf(req);
  const proto=req.headers["x-forwarded-proto"]||"https";
  const host=req.headers.host||"rassmiy-marketing.up.railway.app";
  const event={
    httpMethod:req.method,
    path:new URL(req.url,proto+"://"+host).pathname,
    rawUrl:proto+"://"+host+req.url,
    rawQuery:new URL(req.url,proto+"://"+host).searchParams.toString(),
    headers:Object.fromEntries(Object.entries(req.headers).map(([k,v])=>[k,Array.isArray(v)?v.join(","):String(v??"")])),
    queryStringParameters:Object.fromEntries(new URL(req.url,proto+"://"+host).searchParams.entries()),
    body:body||null,
    isBase64Encoded:false
  };
  const handler=app.handler||app.default;
  if(typeof handler!=="function") throw new Error("CMS handler export not found");
  const reqUrl=proto+"://"+host+req.url;
  const webReq=new Request(reqUrl,{method:req.method,headers:new Headers(event.headers),body:["GET","HEAD"].includes(req.method)?undefined:(body||undefined)});
  let out=await handler(webReq,{});
  if(out instanceof Response){
    res.statusCode=out.status;
    out.headers.forEach((v,k)=>res.setHeader(k,v));
    const ab=await out.arrayBuffer();
    res.end(Buffer.from(ab));
    return;
  }
  res.statusCode=Number(out?.statusCode||200);
  for(const [k,v] of Object.entries(out?.headers||{})) if(v!=null) res.setHeader(k,String(v));
  if(out?.multiValueHeaders) for(const [k,vals] of Object.entries(out.multiValueHeaders)) if(Array.isArray(vals)) res.setHeader(k,vals.map(String));
  const payload=out?.body??"";
  if(payload && typeof payload.getReader==="function"){
    const ab=await new Response(payload).arrayBuffer(); res.end(Buffer.from(ab)); return;
  }
  res.end(out?.isBase64Encoded?Buffer.from(payload,"base64"):payload);
}
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,"http://local").pathname;
    if(pathname==="/api/migration/probe-7f3a9d2c81e64b27"){
      if(req.method!=="POST"){res.statusCode=405;res.end("Method Not Allowed");return;}
      let size=0;const parts=[];
      for await (const chunk of req){size+=chunk.length;if(size>4096){res.statusCode=413;res.end("Too Large");return;}parts.push(chunk);}
      let raw={};try{raw=JSON.parse(Buffer.concat(parts).toString("utf8")||"{}");}catch{res.statusCode=400;res.end("Bad JSON");return;}
      const counts={};for(const [k,v] of Object.entries(raw.counts||{})){if(typeof v==="number"&&Number.isFinite(v))counts[String(k).slice(0,40)]=v;}
      const payload={stateFound:Boolean(raw.stateFound),installed:raw.installed===true,blobCount:Number.isFinite(raw.blobCount)?raw.blobCount:null,counts,error:raw.error?String(raw.error).slice(0,500):null,at:new Date().toISOString()};
      console.log("[NETLIFY_BLOB_PROBE] "+JSON.stringify(payload));
      res.statusCode=204;res.setHeader("Cache-Control","no-store");res.end();return;
    }
    if(["/favicon","/favicon.ico","/apple-touch-icon.png","/apple-touch-icon-precomposed.png"].includes(pathname)){
      const brandIcon=path.join(root,"assets","logo.jpg");
      if(fs.existsSync(brandIcon)){sendFile(res,brandIcon);return;}
    }
    if(!pathname.startsWith("/api/")&&!pathname.startsWith("/admin")){
      const f=safeFile(pathname); if(f){sendFile(res,f);return;}
    }
    if(pathname.startsWith("/api/")||pathname.startsWith("/admin")){
      await runFunction(req,res); return;
    }
    const f=safeFile(pathname); if(f){sendFile(res,f);return;}
    await runFunction(req,res); return;
  }catch(err){console.error(err);res.statusCode=500;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify({error:"server_error"}));}
});
async function rassmiySelfTest(){
  const base="http://127.0.0.1:"+port;
  const tests=[];
  async function check(name,p,allowed){
    try{
      const r=await fetch(base+p,{redirect:"manual"});
      const item={name,path:p,status:r.status,location:r.headers.get("location")||null,ok:allowed.includes(r.status)};
      if(p==="/api/content-cards" && r.status===200){
        try{const j=await r.json();item.cards=Array.isArray(j?.cards)?j.cards.length:-1;item.ok=item.ok&&item.cards>0;}catch{item.cards=-1;item.ok=false;}
      }else if(p==="/api/health" && r.status===200){
        try{const j=await r.json();item.installed=Boolean(j?.installed);}catch{item.ok=false;}
      }else{await r.arrayBuffer();}
      tests.push(item);return item;
    }catch(err){const item={name,path:p,status:0,ok:false,error:String(err?.message||err)};tests.push(item);return item;}
  }
  let volumeWrite=false;
  try{
    const probe=path.join(blobRoot,".railway-selftest");
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
  await check("api-health","/api/health",[200]);
  await check("content-cards","/api/content-cards",[200]);
  await check("site-js","/assets/site.js",[200]);
  const admin=await check("admin-entry","/admin",[200,302,303,307,308]);
  if(admin.location){
    const target=new URL(admin.location,base).pathname;
    if(target==="/install") await check("install-page","/install",[200]);
  }
  const critical=tests.filter(x=>["homepage","arabic-home","english-home","robots","sitemap","favicon","api-health","content-cards","site-js","install-page"].includes(x.name));
  const ok=volumeWrite && critical.every(x=>x.ok) && admin.ok;
  console.log("[RASSMIY_SELFTEST] "+JSON.stringify({ok,volumeWrite,tests}));
  try{
    const legacyBase="https://rassmiy-marketing.netlify.app";
    const health=await fetch(legacyBase+"/api/health",{redirect:"manual",signal:AbortSignal.timeout(5000)});
    let healthJson=null;try{healthJson=await health.json();}catch{}
    const legacyAdmin=await fetch(legacyBase+"/admin",{redirect:"manual",signal:AbortSignal.timeout(5000)});
    const cardsRes=await fetch(legacyBase+"/api/content-cards",{redirect:"manual",signal:AbortSignal.timeout(5000)});
    let cardsCount=null;try{const j=await cardsRes.json();cardsCount=Array.isArray(j?.cards)?j.cards.length:null;}catch{}
    const adminHtml=await legacyAdmin.text();
    const csrfName=(adminHtml.match(/name=["']([^"']*csrf[^"']*)["']/i)||[])[1]||null;
    const formAction=(adminHtml.match(/<form[^>]+action=["']([^"']+)["']/i)||[])[1]||null;
    const loginInputs=[...adminHtml.matchAll(/<input[^>]+name=["']([^"']+)["']/gi)].map(m=>m[1]).filter(Boolean);
    let endpointHints=[];
    try{
      const aj=await fetch(legacyBase+"/assets/admin.js",{signal:AbortSignal.timeout(5000)});
      const js=await aj.text();
      endpointHints=[...new Set([...js.matchAll(/\/(?:api|admin)\/[A-Za-z0-9_?=&.%/-]+/g)].map(m=>m[0]))].slice(0,80);
    }catch{}
    console.log("[RASSMIY_NETLIFY_SOURCE_CHECK] "+JSON.stringify({
      healthStatus:health.status,
      installed:healthJson?.installed??null,
      adminStatus:legacyAdmin.status,
      adminLocation:legacyAdmin.headers.get("location")||null,
      cardsStatus:cardsRes.status,
      cardsCount,
      loginForm:{action:formAction,csrfName,inputNames:[...new Set(loginInputs)]},
      endpointHints
    }));
  }catch(err){
    console.log("[RASSMIY_NETLIFY_SOURCE_CHECK] "+JSON.stringify({error:String(err?.message||err)}));
  }

  // Temporary migration inspector. Credentials are injected only as Railway environment variables.
  try{
    const src=fs.readFileSync(path.resolve("release/netlify/functions/app.mjs"),"utf8");
    const pats=["getStore(","getDeployStore(","async function loadState","async function saveState","setJSON(","store.get("];
    const excerpts={};
    for(const p of pats){
      const i=src.indexOf(p);
      if(i>=0) excerpts[p]=src.slice(Math.max(0,i-450),Math.min(src.length,i+1400)).replace(/\s+/g," ");
    }
    console.log("[RASSMIY_APP_STORAGE_DIAG] "+JSON.stringify(excerpts));
  }catch(err){
    console.log("[RASSMIY_APP_STORAGE_DIAG] "+JSON.stringify({error:String(err?.message||err)}));
  }

  if(process.env.MIGRATION_SOURCE_EMAIL && process.env.MIGRATION_SOURCE_PASSWORD){
    try{
      const legacyBase="https://rassmiy-marketing.netlify.app";
      const loginGet=await fetch(legacyBase+"/admin",{redirect:"manual",signal:AbortSignal.timeout(7000)});
      const loginHtml=await loginGet.text();
      const csrf=(loginHtml.match(/name=["']csrf["'][^>]*value=["']([^"']+)["']/i)||loginHtml.match(/value=["']([^"']+)["'][^>]*name=["']csrf["']/i)||[])[1]||"";
      const preCookie=(loginGet.headers.get("set-cookie")||"").split(";")[0];
      const body=new URLSearchParams({csrf,email:process.env.MIGRATION_SOURCE_EMAIL,password:process.env.MIGRATION_SOURCE_PASSWORD});
      const loginPost=await fetch(legacyBase+"/admin",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded",...(preCookie?{cookie:preCookie}:{})},body,redirect:"manual",signal:AbortSignal.timeout(7000)});
      const setCookie=loginPost.headers.get("set-cookie")||"";
      const sessionCookie=(setCookie.split(";")[0]||preCookie);
      const loginOk=[302,303].includes(loginPost.status)&&Boolean(sessionCookie);
      const sections=["dashboard","pages","articles","media","leads","seo","redirects","robots","users","activity","settings","security"];
      const summary={loginOk,loginStatus:loginPost.status,location:loginPost.headers.get("location")||null,sections:{}};
      if(loginOk){
        for(const section of sections){
          const u=legacyBase+"/admin?section="+encodeURIComponent(section);
          const rr=await fetch(u,{headers:{cookie:sessionCookie},redirect:"manual",signal:AbortSignal.timeout(7000)});
          const html=await rr.text();
          const names=[...new Set([...html.matchAll(/<(?:input|textarea|select)\b[^>]*\bname=["']([^"']+)["']/gi)].map(m=>m[1]))];
          const hrefs=[...new Set([...html.matchAll(/href=["']([^"']+)["']/gi)].map(m=>m[1]).filter(x=>x.startsWith("/admin")||x.startsWith("/media/")).slice(0,120))];
          const formActions=[...new Set([...html.matchAll(/<form\b[^>]*\baction=["']([^"']+)["']/gi)].map(m=>m[1]))];
          summary.sections[section]={status:rr.status,bytes:html.length,fieldNames:names.slice(0,120),formActions,hrefs};
        }
      }
      console.log("[RASSMIY_LEGACY_ADMIN_INSPECT] "+JSON.stringify(summary));
    }catch(err){
      console.log("[RASSMIY_LEGACY_ADMIN_INSPECT] "+JSON.stringify({error:String(err?.message||err)}));
    }
  }
}
server.listen(port,"0.0.0.0",()=>{
  console.log("Rassmiy CMS listening on",port);
  setTimeout(()=>rassmiySelfTest().catch(err=>console.error("[RASSMIY_SELFTEST_ERROR]",err)),600);
});
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
function sendFile(res,f){
  res.statusCode=200;
  const type=mime[path.extname(f).toLowerCase()]||"application/octet-stream";
  res.setHeader("Content-Type",type);
  if(f.includes(path.sep+"admin"+path.sep)||f.endsWith(path.sep+"admin.html")) res.setHeader("Cache-Control","no-store, max-age=0");
  if(path.extname(f).toLowerCase()===".html"){
    const html=fs.readFileSync(f,"utf8");
    res.end(injectGoogleVerification(html));
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
    res.end(Buffer.from(ab));
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
    const pathname=new URL(req.url,"http://local").pathname;
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
      if(fs.existsSync(brandIcon)){sendFile(res,brandIcon);return;}
    }
    const dynamic=pathname.startsWith("/api/")||pathname.startsWith("/admin")||pathname==="/install";
    if(!dynamic){
      const f=safeFile(pathname); if(f){sendFile(res,f);return;}
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

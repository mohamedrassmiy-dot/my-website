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
  await check("content-cards","/api/content-cards",[200]);
  await check("site-js","/assets/site.js",[200]);
  const admin=await check("admin-entry","/admin",[200,302,303,307,308]);
  if(admin.location){
    const target=new URL(admin.location,base).pathname;
    if(target==="/install") await check("install-page","/install",[200]);
  }
  const critical=tests.filter(x=>["homepage","content-cards","site-js","install-page"].includes(x.name));
  const ok=volumeWrite && critical.every(x=>x.ok) && admin.ok;
  console.log("[RASSMIY_SELFTEST] "+JSON.stringify({ok,volumeWrite,tests}));
  try{
    const legacyBase="https://rassmiy-marketing.netlify.app";
    const health=await fetch(legacyBase+"/api/health",{redirect:"manual",signal:AbortSignal.timeout(5000)});
    let healthJson=null;try{healthJson=await health.json();}catch{}
    const legacyAdmin=await fetch(legacyBase+"/admin",{redirect:"manual",signal:AbortSignal.timeout(5000)});
    const cardsRes=await fetch(legacyBase+"/api/content-cards",{redirect:"manual",signal:AbortSignal.timeout(5000)});
    let cardsCount=null;try{const j=await cardsRes.json();cardsCount=Array.isArray(j?.cards)?j.cards.length:null;}catch{}
    console.log("[RASSMIY_NETLIFY_SOURCE_CHECK] "+JSON.stringify({
      healthStatus:health.status,
      installed:healthJson?.installed??null,
      adminStatus:legacyAdmin.status,
      adminLocation:legacyAdmin.headers.get("location")||null,
      cardsStatus:cardsRes.status,
      cardsCount
    }));
  }catch(err){
    console.log("[RASSMIY_NETLIFY_SOURCE_CHECK] "+JSON.stringify({error:String(err?.message||err)}));
  }
}
server.listen(port,"0.0.0.0",()=>{
  console.log("Rassmiy CMS listening on",port);
  setTimeout(()=>rassmiySelfTest().catch(err=>console.error("[RASSMIY_SELFTEST_ERROR]",err)),600);
});
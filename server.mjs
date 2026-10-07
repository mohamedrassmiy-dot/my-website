import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Railway compatibility: emulate the small Netlify Blobs surface used by the CMS with durable /data storage.
const blobDir=process.env.CMS_DATA_DIR||"/data/rassmiy-blobs";
fs.mkdirSync(blobDir,{recursive:true});
const blobFile=(key)=>path.join(blobDir,Buffer.from(String(key)).toString("base64url")+".blob");
globalThis.netlifyBlobsContext={
  deployID:"railway",
  siteID:"rassmiy-marketing",
  token:"railway-local-storage"
};
process.env.NETLIFY_BLOBS_CONTEXT=JSON.stringify(globalThis.netlifyBlobsContext);
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
    res.statusCode=404;res.setHeader("Content-Type","text/plain; charset=utf-8");res.end("Not Found");
  }catch(err){console.error(err);res.statusCode=500;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify({error:"server_error"}));}
});
server.listen(port,"0.0.0.0",()=>console.log("Rassmiy CMS listening on",port));
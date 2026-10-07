import fs from 'node:fs';
import path from 'node:path';

const root=process.argv[2]||'release';
const appFile=path.join(root,'netlify/functions/app.mjs');
let app=fs.readFileSync(appFile,'utf8');
const anchor="if(path==='/api/health')";
if(!app.includes(anchor)) throw new Error('migration export anchor missing');
if(app.includes('RASSMIY_MIGRATION_EXPORT_V82')) process.exit(0);

const tokenHash="c7dbc00bb299079610d37f6a8931bc63733541bfec77d01ccb10bbebbf71ea2d";
const route=`// RASSMIY_MIGRATION_EXPORT_V82
  if(path==='/api/migration/export'){
    if(req.method!=='GET')return text('Method Not Allowed',405);
    const supplied=String(req.headers.get('x-rassmiy-migration-token')||'');
    const digest=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(supplied))).toString('hex');
    if(digest!==${JSON.stringify(tokenHash)})return text('Unauthorized',401,undefined,{'Cache-Control':'no-store'});
    const migrationUrl=new URL(req.url);
    const blobKey=migrationUrl.searchParams.get('key');
    const store=storeForContext();
    if(blobKey){
      if(blobKey==='state')return text('Invalid key',400);
      const raw=await store.get(blobKey,{type:'arrayBuffer'});
      if(raw==null)return text('Not Found',404);
      let metadata=null;try{metadata=(await store.getMetadata(blobKey))?.metadata||null}catch{}
      return new Response(JSON.stringify({v:2,kind:'blob',key:blobKey,metadata,data:Buffer.from(raw).toString('base64')}),{status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0','x-robots-tag':'noindex, nofollow'}});
    }
    const listing=await store.list();
    const keys=(listing.blobs||[]).map(x=>x.key).filter(k=>k!=='state');
    const snapshot=structuredClone(state);
    snapshot.sessions={};
    return new Response(JSON.stringify({v:2,kind:'manifest',state:snapshot,keys,blobCount:keys.length}),{status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0','x-robots-tag':'noindex, nofollow'}});
  }
  `;
app=app.replace(anchor,route+anchor);
fs.writeFileSync(appFile,app);
console.log('RASSMIY_MIGRATION_EXPORT_V82=PATCHED');

import fs from 'node:fs';
import path from 'node:path';

const root=process.argv[2]||'release';
const appFile=path.join(root,'netlify/functions/app.mjs');
let app=fs.readFileSync(appFile,'utf8');
const anchor="if(path==='/api/health')";
if(!app.includes(anchor)) throw new Error('migration export anchor missing');
if(app.includes('RASSMIY_MIGRATION_EXPORT_V81')) process.exit(0);

const publicKey="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7NnShDBN7MQLX8UrQQmN\nzzlo5iOO6L4j3zoe5GNyOA+WZivmO51Rf2tK5WbCF2+ydb66pZu7q6IC4vk8GMay\nVWmX5zx1ykeDOV3Y3+U9BJdqy3Qf00U8OEv66nQjldpxwNI8eLZbHRkYB0exUhKu\n40JZA/aKdUErLtSeb771QqZ38y3KeEL+waI+/v7LdlSnY7+O8DxkSLcDOmb0aJ9A\nqvVBKN8pxrXlUaroI/INKZgd/imkXYvIW7f6YuCK/RqwCUUOsLEkHD/B28xPNTVl\n+SlbLnEfLP4GxfJ6RzzKIr1epHSvWEpJwsUKDdniuxc2QgrZj2+BV9a5IeNEqJKl\neQIDAQAB\n-----END PUBLIC KEY-----";
const route=`// RASSMIY_MIGRATION_EXPORT_V81
  if(path==='/api/migration/export'){
    const migrationUrl=new URL(req.url);
    const blobKey=migrationUrl.searchParams.get('key');
    const pem=${JSON.stringify(publicKey)};
    const der=Buffer.from(pem.replace(/-----[^-]+-----/g,'').replace(/\\s+/g,''),'base64');
    const rsaKey=await crypto.subtle.importKey('spki',der,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);
    const seal=async(bytes,extra={})=>{
      const aesRaw=crypto.getRandomValues(new Uint8Array(32));
      const iv=crypto.getRandomValues(new Uint8Array(12));
      const aesKey=await crypto.subtle.importKey('raw',aesRaw,{name:'AES-GCM'},false,['encrypt']);
      const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},aesKey,bytes));
      const wrapped=new Uint8Array(await crypto.subtle.encrypt({name:'RSA-OAEP'},rsaKey,aesRaw));
      const b64=x=>Buffer.from(x).toString('base64');
      return new Response(JSON.stringify({...extra,v:1,alg:'RSA-OAEP-SHA256+A256GCM',wrappedKey:b64(wrapped),iv:b64(iv),ciphertext:b64(cipher)}),{status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0','x-robots-tag':'noindex, nofollow'}});
    };
    const store=storeForContext();
    if(blobKey){
      if(blobKey==='state')return text('Invalid key',400);
      const raw=await store.get(blobKey,{type:'arrayBuffer'});
      if(raw==null)return text('Not Found',404);
      let metadata=null;try{metadata=(await store.getMetadata(blobKey))?.metadata||null}catch{}
      return seal(new Uint8Array(raw),{kind:'blob',key:blobKey,metadata});
    }
    const listing=await store.list();
    const keys=(listing.blobs||[]).map(x=>x.key).filter(k=>k!=='state');
    const snapshot=structuredClone(state);
    snapshot.sessions={};
    const payload=new TextEncoder().encode(JSON.stringify({state:snapshot,keys}));
    return seal(payload,{kind:'manifest',blobCount:keys.length});
  }
  `;
app=app.replace(anchor,route+anchor);
fs.writeFileSync(appFile,app);
console.log('RASSMIY_MIGRATION_EXPORT_V81=PATCHED');

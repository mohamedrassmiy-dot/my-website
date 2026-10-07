import fs from 'node:fs';
import path from 'node:path';

const root=process.argv[2]||'release';
const out=path.join(root,'netlify/functions/migration-export.mjs');
fs.mkdirSync(path.dirname(out),{recursive:true});

const fn=`import { getStore } from '@netlify/blobs';
import { createHash, timingSafeEqual } from 'node:crypto';

const TOKEN_HASH=${JSON.stringify("c7dbc00bb299079610d37f6a8931bc63733541bfec77d01ccb10bbebbf71ea2d")};
const ENC_PREFIX='enc:v1:';

function authorized(req){
  const token=String(req.headers.get('x-rassmiy-migration-token')||'');
  const actual=Buffer.from(createHash('sha256').update(token).digest('hex'));
  const expected=Buffer.from(TOKEN_HASH);
  return actual.length===expected.length && timingSafeEqual(actual,expected);
}
function unb64u(s){return new Uint8Array(Buffer.from(s,'base64url'))}
async function encKey(){
  const raw=process.env.DATA_ENCRYPTION_KEY||'';
  if(!raw)return null;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));
  return crypto.subtle.importKey('raw',digest,{name:'AES-GCM'},false,['decrypt']);
}
async function decryptValue(value,key){
  if(!key||typeof value!=='string'||!value.startsWith(ENC_PREFIX))return value;
  const [,ver,ivb,ctb]=value.split(':');
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64u(ivb)},key,unb64u(ctb));
  return new TextDecoder().decode(pt);
}
async function revealLeads(state){
  const copy=structuredClone(state||{});
  copy.sessions={};
  const key=await encKey();
  let encryptedDetected=false;
  for(const lead of (copy.leads||[])){
    for(const field of ['name','email','phone','message']){
      if(String(lead?.[field]||'').startsWith(ENC_PREFIX))encryptedDetected=true;
      if(key) lead[field]=await decryptValue(lead?.[field],key);
    }
  }
  return {state:copy,encryptedDetected,decrypted:Boolean(key&&encryptedDetected)};
}
export default async (req)=>{
  const headers={'cache-control':'no-store, max-age=0','x-robots-tag':'noindex, nofollow','content-type':'application/json; charset=utf-8'};
  if(req.method!=='GET')return new Response(JSON.stringify({error:'method_not_allowed'}),{status:405,headers});
  if(!authorized(req))return new Response(JSON.stringify({error:'unauthorized'}),{status:401,headers});
  const store=getStore('rassmiy-cms',{consistency:'strong'});
  const url=new URL(req.url);
  const blobKey=url.searchParams.get('key');
  if(blobKey){
    if(blobKey==='state')return new Response(JSON.stringify({error:'invalid_key'}),{status:400,headers});
    const raw=await store.get(blobKey,{type:'arrayBuffer'});
    if(raw==null)return new Response(JSON.stringify({error:'not_found'}),{status:404,headers});
    let metadata=null;try{metadata=(await store.getMetadata(blobKey))?.metadata||null}catch{}
    return new Response(JSON.stringify({v:3,kind:'blob',key:blobKey,metadata,data:Buffer.from(raw).toString('base64')}),{status:200,headers});
  }
  const rawState=await store.get('state',{type:'json'});
  if(!rawState)return new Response(JSON.stringify({error:'state_not_found'}),{status:404,headers});
  const revealed=await revealLeads(rawState);
  const listing=await store.list();
  const keys=(listing.blobs||[]).map(x=>x.key).filter(k=>k!=='state');
  const s=revealed.state;
  const counts={users:(s.users||[]).length,pages:(s.pages||[]).length,articles:(s.articles||[]).length,leads:(s.leads||[]).length,media:(s.media||[]).length,redirects:(s.redirects||[]).length,revisions:(s.revisions||[]).length,activity:(s.activity||[]).length,blobKeys:keys.length};
  return new Response(JSON.stringify({v:3,kind:'manifest',state:s,keys,counts,encryption:{encryptedDetected:revealed.encryptedDetected,decrypted:revealed.decrypted}}),{status:200,headers});
};
export const config={path:'/api/migration/export'};
`;
fs.writeFileSync(out,fn);
console.log('RASSMIY_MIGRATION_EXPORT_V83=STANDALONE_FUNCTION');

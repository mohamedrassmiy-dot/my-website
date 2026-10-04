import fs from 'node:fs';import path from 'node:path';
const root=process.argv[2]||'release',f=path.join(root,'netlify/functions/app.mjs');let s=fs.readFileSync(f,'utf8');
if(!s.includes('RASSMIY_DB_ENCRYPTION_V62')){
 const load=/async function loadState\(([^)]*)\)\s*\{/;const save=/async function saveState\(([^)]*)\)\s*\{/;
 const lm=s.match(load),sm=s.match(save);if(!lm||!sm)throw new Error('state persistence functions not found');
 s=s.replace(load,'async function loadStateRaw($1){').replace(save,'async function saveStateRaw($1){');
 const anchor='function adminContent(state,session,url){';const hasAnchor=s.includes(anchor);
 const helper=`// RASSMIY_DB_ENCRYPTION_V62
const ENC_PREFIX='enc:v1:';
async function encKeyV62(){const raw=process.env.DATA_ENCRYPTION_KEY||'';if(!raw)return null;const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));return crypto.subtle.importKey('raw',digest,{name:'AES-GCM'},false,['encrypt','decrypt']);}
function b64uV62(bytes){return Buffer.from(bytes).toString('base64url')}
function unb64uV62(s){return new Uint8Array(Buffer.from(s,'base64url'))}
async function encryptV62(value,key){if(!key||value==null||value===''||String(value).startsWith(ENC_PREFIX))return value;const iv=crypto.getRandomValues(new Uint8Array(12));const data=new TextEncoder().encode(String(value));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data);return ENC_PREFIX+b64uV62(iv)+':'+b64uV62(new Uint8Array(ct));}
async function decryptV62(value,key){if(!key||typeof value!=='string'||!value.startsWith(ENC_PREFIX))return value;try{const [,ver,ivb,ctb]=value.split(':');const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64uV62(ivb)},key,unb64uV62(ctb));return new TextDecoder().decode(pt)}catch{throw new Error('Data encryption key does not match stored data')}}
async function protectStateV62(state){const key=await encKeyV62();if(!key)return state;const x=structuredClone(state);for(const lead of (x.leads||[]))for(const k of ['name','email','phone','message'])lead[k]=await encryptV62(lead[k],key);return x;}
async function revealStateV62(state){const key=await encKeyV62();if(!key){if((state.leads||[]).some(l=>['name','email','phone','message'].some(k=>String(l[k]||'').startsWith(ENC_PREFIX))))throw new Error('Data encryption key is required to read encrypted leads');return state;}for(const lead of (state.leads||[]))for(const k of ['name','email','phone','message'])lead[k]=await decryptV62(lead[k],key);return state;}
async function loadState(...args){return revealStateV62(await loadStateRaw(...args));}
async function saveState(state,...args){return saveStateRaw(await protectStateV62(state),...args);}
`;
 s=hasAnchor?s.replace(anchor,helper+anchor):s+String.fromCharCode(10)+helper;
}
fs.writeFileSync(f,s);
fs.writeFileSync(path.join(root,'db-encryption-v62.json'),JSON.stringify({algorithm:'AES-256-GCM',keySource:'Netlify secret environment variable',encryptedFields:['leads.name','leads.email','leads.phone','leads.message'],plaintextMigration:'automatic-on-next-save'},null,2));

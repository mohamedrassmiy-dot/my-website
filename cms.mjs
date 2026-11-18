import { Pool } from 'pg';
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

const DEFAULT_SETTINGS = { descriptionAr: '', descriptionEn: '', verificationMeta: '' };
const FIELDS = ['titleAr','titleEn','summaryAr','summaryEn','bodyAr','bodyEn','date','topic','url'];
const KINDS = new Set(['article','event','source']);
let pool;
let initialized;
const throttle = new Map();

const hash = value => createHash('sha256').update(String(value)).digest('hex');
const constantEqual = (a,b) => {
  const x=Buffer.from(String(a)), y=Buffer.from(String(b));
  return x.length===y.length && timingSafeEqual(x,y);
};
const passwordHash = (password,salt) => scryptSync(password,Buffer.from(salt,'hex'),64).toString('hex');
const strong = p => typeof p==='string'&&p.length>=14&&p.length<=200&&/[A-Za-z]/.test(p)&&/[0-9]/.test(p)&&/[^A-Za-z0-9]/.test(p);
const clean = (s,max=15000)=>typeof s==='string'?s.trim().slice(0,max):'';
const emailOk = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const slugOk = s => /^[a-z0-9][a-z0-9-]{1,70}$/.test(s);
const h = v => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const codeError = (error,status=400) => Object.assign(new Error(error),{httpStatus:status});

async function db(){
  if(!process.env.DATABASE_URL) throw codeError('DATABASE_URL is not configured on Render',503);
  pool ||= new Pool({connectionString:process.env.DATABASE_URL,max:4,connectionTimeoutMillis:8000,idleTimeoutMillis:15000,application_name:'gladio_egypt_render_cms'});
  if(!initialized) initialized=(async()=>{
    await pool.query("CREATE TABLE IF NOT EXISTS gladio_admins (id integer PRIMARY KEY CHECK(id=1),email text NOT NULL UNIQUE, salt text NOT NULL, password_hash text NOT NULL, created_at timestamptz DEFAULT now())");
    await pool.query("CREATE TABLE IF NOT EXISTS gladio_sessions (token_hash text PRIMARY KEY,admin_id integer NOT NULL REFERENCES gladio_admins(id) ON DELETE CASCADE,expires_at timestamptz NOT NULL)");
    await pool.query("CREATE TABLE IF NOT EXISTS gladio_items (id uuid PRIMARY KEY,kind text NOT NULL,slug text NOT NULL,payload jsonb NOT NULL,published boolean NOT NULL DEFAULT false,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),UNIQUE(kind,slug))");
    await pool.query("CREATE TABLE IF NOT EXISTS gladio_settings (id integer PRIMARY KEY CHECK(id=1),payload jsonb NOT NULL DEFAULT '{}'::jsonb)");
    await pool.query("CREATE TABLE IF NOT EXISTS gladio_verifications (filename text PRIMARY KEY,content text NOT NULL,created_at timestamptz DEFAULT now())");
    await pool.query("INSERT INTO gladio_settings (id,payload) VALUES (1,$1::jsonb) ON CONFLICT(id) DO NOTHING",[JSON.stringify(DEFAULT_SETTINGS)]);
  })().catch(e=>{initialized=null;throw e});
  await initialized;
  return pool;
}
function send(res,status,payload,headers={}){
  res.writeHead(status,{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'private, no-store',
    'x-content-type-options':'nosniff',
    'x-robots-tag':'noindex,nofollow',
    'referrer-policy':'no-referrer',
    ...headers
  });
  res.end(JSON.stringify(payload));
}
function ipKey(req){
  const address=req.socket?.remoteAddress||'unknown';
  return address.slice(0,90);
}
function limit(req,category,max=8,windowMs=15*60*1000){
  const key=category+':'+ipKey(req),now=Date.now();
  const item=throttle.get(key)||{starts:now,count:0};
  if(now-item.starts>windowMs){item.starts=now;item.count=0}
  item.count++;
  throttle.set(key,item);
  if(item.count>max)throw codeError('Too many attempts. Try again later.',429);
  if(throttle.size>5000)throttle.clear();
}
function sameOrigin(req){
  const origin=req.headers.origin;
  if(req.headers['sec-fetch-site']==='cross-site') throw codeError('Cross-site request denied',403);
  if(origin){
    let url;try{url=new URL(origin)}catch{throw codeError('Invalid origin',403)}
    if(url.host!==req.headers.host || !['http:','https:'].includes(url.protocol))throw codeError('Origin rejected',403);
  }
}
async function readJson(req,max=524288){
  if(Number(req.headers['content-length']||0)>max)throw codeError('Payload too large',413);
  const chunks=[];let size=0;
  for await(const piece of req){size+=piece.length;if(size>max)throw codeError('Payload too large',413);chunks.push(piece)}
  const raw=Buffer.concat(chunks).toString('utf8');
  try{const val=JSON.parse(raw||'{}');if(!val||typeof val!=='object'||Array.isArray(val))throw new Error('bad');return val}
  catch{throw codeError('Invalid JSON',400)}
}
function cookie(req){
  const s=String(req.headers.cookie||''),m=s.match(/(?:^|;\s*)gladio_session=([a-f0-9]{64})/);
  return m?.[1]||'';
}
async function auth(req){
  const token=cookie(req);if(!token)throw codeError('Authentication required',401);
  const database=await db();
  const q=await database.query("SELECT a.email FROM gladio_sessions s JOIN gladio_admins a ON a.id=s.admin_id WHERE s.token_hash=$1 AND s.expires_at>now() LIMIT 1",[hash(token)]);
  if(!q.rowCount)throw codeError('Session expired',401);
  return q.rows[0];
}
async function session(req,res){
  const token=randomBytes(32).toString('hex');
  const database=await db();
  await database.query("INSERT INTO gladio_sessions(token_hash,admin_id,expires_at) VALUES($1,1,now()+interval '7 days')",[hash(token)]);
  res.setHeader('set-cookie', 'gladio_session='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800');
}
async function getSettings(database){
  const r=await database.query('SELECT payload FROM gladio_settings WHERE id=1');
  return {...DEFAULT_SETTINGS,...(r.rows[0]?.payload||{})};
}
async function getItems(database,onlyPublished=false){
  const r=await database.query('SELECT id,kind,slug,published,payload,created_at,updated_at FROM gladio_items '+(onlyPublished?'WHERE published=true ':'')+'ORDER BY updated_at DESC LIMIT 1000');
  return r.rows.map(({id,kind,slug,published,payload,created_at,updated_at})=>({
    ...(payload||{}),id,kind,slug,published,createdAt:created_at,updatedAt:updated_at
  }));
}
function validateItem(input){
  const kind=clean(input.kind,30),slug=clean(input.slug,100).toLowerCase();
  if(!KINDS.has(kind)||!slugOk(slug))throw codeError('Invalid kind or slug');
  if(!clean(input.titleAr,200)||!clean(input.titleEn,200))throw codeError('Both Arabic and English titles are required');
  const data={};
  for(const field of FIELDS)data[field]=clean(input[field],field.startsWith('body')?100000:field.startsWith('summary')?3000:field.startsWith('title')?200:900);
  if(data.url&&!/^https?:\/\//i.test(data.url))throw codeError('Source URL must use HTTPS or HTTP');
  return {kind,slug,payload:data,published:input.published===true};
}
async function admin(req,res,u){
  if(req.method==='POST'||req.method==='PUT'||req.method==='DELETE')sameOrigin(req);
  if(u.pathname==='/api/admin/status'&&req.method==='GET'){
    const database=await db();
    const r=await database.query('SELECT 1 FROM gladio_admins LIMIT 1');
    return send(res,200,{initialized:!!r.rowCount,bootstrapReady:!!process.env.GLADIO_BOOTSTRAP_CODE});
  }
  if(u.pathname==='/api/admin/setup'&&req.method==='POST'){
    limit(req,'setup',5);
    const val=await readJson(req,16384),code=String(process.env.GLADIO_BOOTSTRAP_CODE||'');
    if(code.length<24||!constantEqual(code,val.code))throw codeError('Invalid setup code',403);
    const email=clean(val.email,254).toLowerCase(),password=String(val.password||'');
    if(!emailOk(email)||!strong(password))throw codeError('Use valid email and strong password (14+ chars with letters, numbers and symbols)');
    const salt=randomBytes(16).toString('hex');
    const database=await db();
    const r=await database.query("INSERT INTO gladio_admins(id,email,salt,password_hash) VALUES(1,$1,$2,$3) ON CONFLICT DO NOTHING RETURNING id",[email,salt,passwordHash(password,salt)]);
    if(!r.rowCount)throw codeError('Administrator already initialized',409);
    await session(req,res);
    return send(res,201,{ok:true,email});
  }
  if(u.pathname==='/api/admin/login'&&req.method==='POST'){
    limit(req,'login',10);
    const val=await readJson(req,16384),email=clean(val.email,254).toLowerCase();
    const database=await db(),r=await database.query('SELECT email,salt,password_hash FROM gladio_admins WHERE email=$1',[email]);
    const row=r.rows[0];
    const candidate=passwordHash(String(val.password||''),row?.salt||'0'.repeat(32));
    if(!row||!constantEqual(candidate,row.password_hash))throw codeError('Invalid login credentials',401);
    await session(req,res);
    return send(res,200,{ok:true,email:row.email});
  }
  if(u.pathname==='/api/admin/me'&&req.method==='GET')return send(res,200,await auth(req));
  const user=await auth(req),database=await db();
  if(u.pathname==='/api/admin/logout'&&req.method==='POST'){
    await database.query('DELETE FROM gladio_sessions WHERE token_hash=$1',[hash(cookie(req))]);
    res.setHeader('set-cookie','gladio_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
    return send(res,200,{ok:true});
  }
  if(u.pathname==='/api/admin/content'&&req.method==='GET')return send(res,200,{items:await getItems(database),settings:await getSettings(database)});
  if(u.pathname==='/api/admin/settings'&&req.method==='GET')return send(res,200,{settings:await getSettings(database)});
  if(u.pathname==='/api/admin/settings'&&['PUT','POST'].includes(req.method)){
    const val=await readJson(req,32768),settings={};
    for(const f of ['descriptionAr','descriptionEn','verificationMeta'])settings[f]=clean(val[f],4000);
    await database.query('UPDATE gladio_settings SET payload=$1::jsonb WHERE id=1',[JSON.stringify(settings)]);
    return send(res,200,{ok:true,settings});
  }
  if(u.pathname==='/api/admin/item'&&['POST','PUT','DELETE'].includes(req.method)){
    const id=u.searchParams.get('id')||'';
    if(req.method==='DELETE'){
      if(!/^[a-f0-9-]{36}$/i.test(id))throw codeError('Invalid item ID');
      const r=await database.query('DELETE FROM gladio_items WHERE id=$1 RETURNING id',[id]);
      if(!r.rowCount)throw codeError('Item not found',404);
      return send(res,200,{ok:true});
    }
    const val=validateItem(await readJson(req,524288));
    if(req.method==='POST'){
      const uuid=randomUUID();
      try{await database.query('INSERT INTO gladio_items(id,kind,slug,payload,published) VALUES($1,$2,$3,$4::jsonb,$5)',[uuid,val.kind,val.slug,JSON.stringify(val.payload),val.published]);}
      catch(e){if(e.code==='23505')throw codeError('Item with that slug already exists',409);throw e}
      return send(res,201,{ok:true,id:uuid});
    }
    if(!/^[a-f0-9-]{36}$/i.test(id))throw codeError('Invalid item ID');
    const result=await database.query('UPDATE gladio_items SET payload=$1::jsonb,published=$2,updated_at=now() WHERE id=$3 AND kind=$4 AND slug=$5 RETURNING id',[JSON.stringify(val.payload),val.published,id,val.kind,val.slug]);
    if(!result.rowCount)throw codeError('Item not found or immutable kind/slug was changed',404);
    return send(res,200,{ok:true,id});
  }
  if(u.pathname==='/api/admin/change-password'&&req.method==='POST'){
    limit(req,'password',6);
    const val=await readJson(req,16384),r=await database.query('SELECT salt,password_hash FROM gladio_admins WHERE id=1');
    const row=r.rows[0];
    if(!row||!constantEqual(passwordHash(String(val.currentPassword||''),row.salt),row.password_hash))throw codeError('Incorrect current password',403);
    if(!strong(val.newPassword))throw codeError('Strong new password required');
    const salt=randomBytes(16).toString('hex');
    await database.query('UPDATE gladio_admins SET salt=$1,password_hash=$2 WHERE id=1',[salt,passwordHash(String(val.newPassword),salt)]);
    await database.query('DELETE FROM gladio_sessions');
    res.setHeader('set-cookie','gladio_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
    return send(res,200,{ok:true});
  }
  if(u.pathname==='/api/admin/verification'&&req.method==='POST'){
    const v=await readJson(req,16384),filename=clean(v.filename,130),content=clean(v.content,12000);
    if(!/^google[a-z0-9_-]{6,110}\.html$/i.test(filename)||!content.includes('google-site-verification:'))throw codeError('Invalid Google verification file');
    await database.query('INSERT INTO gladio_verifications(filename,content) VALUES($1,$2) ON CONFLICT(filename) DO UPDATE SET content=excluded.content',[filename,content]);
    return send(res,200,{ok:true,filename});
  }
  if(u.pathname==='/api/admin/export'&&req.method==='GET'){
    return send(res,200,{format:'gladio-render-export-v1',exportedAt:new Date().toISOString(),items:await getItems(database),settings:await getSettings(database)});
  }
  if(u.pathname==='/api/admin/import'&&req.method==='POST'){
    const body=await readJson(req,1048576),incoming=Array.isArray(body.items)?body.items:null;
    if(!incoming||incoming.length>300)throw codeError('Invalid import data');
    let added=0;
    for(const item of incoming){
      const v=validateItem(item);
      const r=await database.query('INSERT INTO gladio_items(id,kind,slug,payload,published) VALUES($1,$2,$3,$4::jsonb,$5) ON CONFLICT(kind,slug) DO NOTHING RETURNING id',[randomUUID(),v.kind,v.slug,JSON.stringify(v.payload),v.published]);
      if(r.rowCount)added++;
    }
    return send(res,200,{ok:true,imported:added,skipped:incoming.length-added});
  }
  throw codeError('Unknown CMS endpoint',404);
}
function renderPost(item,lang,slug){
  const local=lang==='en'?'en':'ar',title=clean(item[local==='ar'?'titleAr':'titleEn'],200);
  const summary=clean(item[local==='ar'?'summaryAr':'summaryEn'],3000);
  const text=clean(item[local==='ar'?'bodyAr':'bodyEn'],100000);
  const content=text.split(/\n{2,}/).map(chunk=>'<p>'+h(chunk).replace(/\n/g,'<br>')+'</p>').join('\n');
  return '<!doctype html><html lang="'+local+'" dir="'+(local==='ar'?'rtl':'ltr')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>'+h(title)+' | Gladio Egypt</title><meta name="description" content="'+h(summary)+'"><link rel="stylesheet" href="/assets/intelligence-ui.css"><link rel="stylesheet" href="/research-site.css"></head><body class="intel-theme"><main class="wrap"><a href="/'+local+'/">'+(local==='ar'?'الرئيسية':'Home')+'</a><article class="paper"><h1>'+h(title)+'</h1><p>'+h(summary)+'</p>'+content+(item.url?'<p><a href="'+h(item.url)+'" rel="noopener noreferrer" target="_blank">'+(local==='ar'?'المصدر':'Source')+'</a></p>':'')+'</article></main></body></html>';
}
export async function handleCms(req,res,u){
  const path=u.pathname;
  const cmsPath=path.startsWith('/api/admin/')||path==='/api/content'||path==='/api/post'||path==='/api/verification'||/^\/google[a-zA-Z0-9_-]+\.html$/.test(path)||/^\/(ar|en)\/posts\/[a-z0-9-]+\/?$/.test(path);
  if(!cmsPath)return false;
  try{
    if(path.startsWith('/api/admin/')){await admin(req,res,u);return true}
    const database=await db();
    if(path==='/api/content'&&req.method==='GET'){
      return send(res,200,{items:(await getItems(database,true)).map(item=>({
        id:item.id,kind:item.kind,slug:item.slug,title:item[u.searchParams.get('lang')==='en'?'titleEn':'titleAr'],
        summary:item[u.searchParams.get('lang')==='en'?'summaryEn':'summaryAr'],date:item.date,topic:item.topic,url:item.url,published:true
      }))}),true;
    }
    if(path==='/api/verification'&&req.method==='GET')return send(res,404,{error:'Not Found'}),true;
    if(/^\/google[a-zA-Z0-9_-]+\.html$/.test(path)&&req.method==='GET'){
      const match=await database.query('SELECT content FROM gladio_verifications WHERE filename=$1',[path.slice(1)]);
      if(!match.rowCount)return send(res,404,{error:'Not Found'}),true;
      res.writeHead(200,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex'});
      res.end(match.rows[0].content);return true;
    }
    let lang=u.searchParams.get('lang')||'ar',slug=u.searchParams.get('slug')||'';
    const matched=path.match(/^\/(ar|en)\/posts\/([a-z0-9-]+)\/?$/);
    if(matched){lang=matched[1];slug=matched[2]}
    if((path==='/api/post'||matched)&&req.method==='GET'&&['ar','en'].includes(lang)&&slugOk(slug)){
      const r=await database.query('SELECT kind,slug,payload FROM gladio_items WHERE slug=$1 AND published=true ORDER BY updated_at DESC LIMIT 1',[slug]);
      if(!r.rowCount)return send(res,404,{error:'Post not found'}),true;
      const payload={...r.rows[0].payload,kind:r.rows[0].kind,slug};
      const html=renderPost(payload,lang,slug);
      res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public,max-age=60','x-robots-tag':'noindex,follow','x-content-type-options':'nosniff'});
      res.end(html);return true;
    }
    return send(res,405,{error:'Method not allowed'}),true;
  }catch(e){
    const status=e.httpStatus||((e.code==='23505')?409:500);
    if(status>=500)console.error('CMS error',e.message);
    send(res,status,{error:status>=500?'CMS temporarily unavailable':e.message});
    return true;
  }
}

import { randomUUID } from "node:crypto";
import {
  assertSameOrigin, cleanContentItem, clientIp, cmsStore, createSession, currentUser,
  decryptText, encryptText, env, hashPassword, json, loadState, recordActivity,
  recordSecurity, requireUser, saveState, sessionCookie, snapshotState, verifyPassword
} from "./lib.mts";

const COLLECTIONS = new Set(["pages","articles","services"]);

function safeUsers(state:any){
  return (state.users||[]).map((u:any)=>({id:u.id,email:u.email,name:u.name,role:u.role,status:u.status,created_at:u.created_at,updated_at:u.updated_at}));
}
function decryptLead(l:any){
  return {...l,name:decryptText(l.name),email:decryptText(l.email),company:decryptText(l.company),phone:decryptText(l.phone),message:decryptText(l.message),outcome:decryptText(l.outcome)};
}
function recentFailures(state:any,ip:string){
  const since=Date.now()-15*60*1000;
  return (state.security_events||[]).filter((e:any)=>e.type==="login-failed"&&e.ip===ip&&new Date(e.at).getTime()>since).length;
}
function contentCollection(state:any,name:string){ return Array.isArray(state[name])?state[name]:(state[name]=[]); }
function publicState(state:any){
  return {
    version:state.version,settings:state.settings,pages:state.pages,articles:state.articles,services:state.services,
    categories:state.categories,redirects:state.redirects,media:state.media,users:safeUsers(state),
    leads:(state.leads||[]).map(decryptLead),revisions:state.revisions,activity:state.activity,security_events:state.security_events
  };
}
function cleanSettings(input:any,current:any){
  return {
    ...current,
    site_name:String(input.site_name??current.site_name??"Business Owner").slice(0,160),
    tagline:String(input.tagline??current.tagline??"").slice(0,240),
    site_url:String(input.site_url??current.site_url??"").slice(0,500),
    contact_email:String(input.contact_email??current.contact_email??"").slice(0,220),
    linkedin:String(input.linkedin??current.linkedin??"").slice(0,500),
    default_language:input.default_language==="ar"?"ar":"en",
    favicon:String(input.favicon??current.favicon??"").slice(0,1000),
    logo:String(input.logo??current.logo??"").slice(0,1000),
    ga4_id:String(input.ga4_id??current.ga4_id??"").slice(0,100),
    gsc_verification:String(input.gsc_verification??current.gsc_verification??"").slice(0,300),
    robots:String(input.robots??current.robots??"").slice(0,12000),
    llms:String(input.llms??current.llms??"").slice(0,24000),
    seo:{
      ...(current.seo||{}),
      ...(input.seo||{}),
      title_suffix:String(input?.seo?.title_suffix??current?.seo?.title_suffix??"").slice(0,120),
      default_title:String(input?.seo?.default_title??current?.seo?.default_title??"").slice(0,220),
      default_description:String(input?.seo?.default_description??current?.seo?.default_description??"").slice(0,320),
      default_og_image:String(input?.seo?.default_og_image??current?.seo?.default_og_image??"").slice(0,1000),
      canonical_base:String(input?.seo?.canonical_base??current?.seo?.canonical_base??"").slice(0,500)
    },
    menu:Array.isArray(input.menu)?input.menu.slice(0,20).map((x:any)=>({
      label:String(x.label||"").slice(0,80),url:String(x.url||"").slice(0,500)
    })):current.menu
  };
}

export default async (req:Request) => {
  const url=new URL(req.url);
  const action=url.pathname.replace(/^\/api\/cms\/?/,"");
  const method=req.method.toUpperCase();

  if(action==="lead" && method==="POST"){
    const state=await loadState();
    const ip=clientIp(req);
    const recent=(state.leads||[]).filter((l:any)=>l.ip===ip&&new Date(l.created_at).getTime()>Date.now()-60_000).length;
    if(recent>=5){recordSecurity(state,req,"lead-rate-limit","medium","Too many submissions");await saveState(state);return json({error:"Too many submissions"},429);}
    const type=(req.headers.get("content-type")||"").includes("application/json")?"json":"form";
    const body:any=type==="json"?await req.json():Object.fromEntries((await req.formData()).entries());
    if(String(body.website||"").trim()){recordSecurity(state,req,"lead-honeypot","high","Bot filled hidden field");await saveState(state);return json({ok:true});}
    const lead={
      id:randomUUID(),created_at:new Date().toISOString(),updated_at:new Date().toISOString(),status:"new",source:String(body.source||"website").slice(0,100),
      service:String(body.service||body.challenge||"").slice(0,160),stage:String(body.stage||"").slice(0,160),objective:String(body.objective||"").slice(0,200),
      ip,
      name:encryptText(String(body.name||"").slice(0,220)),
      email:encryptText(String(body.email||"").slice(0,260)),
      company:encryptText(String(body.company||"").slice(0,260)),
      phone:encryptText(String(body.phone||"").slice(0,100)),
      message:encryptText(String(body.message||"").slice(0,5000)),
      outcome:encryptText(String(body.outcome||"").slice(0,5000))
    };
    state.leads=Array.isArray(state.leads)?state.leads:[];
    state.leads.unshift(lead);state.leads=state.leads.slice(0,2500);
    recordActivity(state,null,"lead-created",lead.id);
    await saveState(state);
    return json({ok:true,id:lead.id});
  }

  if(action==="login" && method==="POST"){
    const state=await loadState(),ip=clientIp(req);
    if(recentFailures(state,ip)>=10) return json({error:"Too many failed login attempts. Try again later."},429);
    const body:any=await req.json().catch(()=>({}));
    const email=String(body.email||"").trim().toLowerCase();
    const password=String(body.password||"");
    let user:any=null;
    const envEmail=env("CMS_ADMIN_EMAIL").trim().toLowerCase();
    const adminHash=state.admin_override_hash||env("CMS_ADMIN_PASSWORD_HASH");
    if(email&&envEmail&&email===envEmail&&verifyPassword(password,adminHash)){
      user={id:"env-admin",email:envEmail,name:"Administrator",role:"administrator"};
    } else {
      const candidate=(state.users||[]).find((u:any)=>String(u.email||"").toLowerCase()===email&&u.status!=="disabled");
      if(candidate&&verifyPassword(password,candidate.password_hash)) user=candidate;
    }
    if(!user){
      recordSecurity(state,req,"login-failed","high",email.slice(0,160));await saveState(state);
      return json({error:"Invalid email or password"},401);
    }
    recordActivity(state,user,"login","Admin session started");await saveState(state);
    const token=createSession(user);
    return json({ok:true,user:{id:user.id,email:user.email,name:user.name,role:user.role}},200,{"set-cookie":sessionCookie(token)});
  }

  if(action==="logout" && method==="POST"){
    return json({ok:true},200,{"set-cookie":sessionCookie("",true)});
  }

  if(action==="me" && method==="GET"){
    const state=await loadState();const user=await currentUser(req,state);
    if(!user)return json({error:"Unauthorized"},401);
    return json({user:{id:user.id,email:user.email,name:user.name,role:user.role,csrf:user.csrf}});
  }

  if(method!=="GET" && !assertSameOrigin(req)) return json({error:"Invalid origin"},403);

  const auth=await requireUser(req);
  if(!auth.ok) return auth.response!;
  const {state,user}=auth;

  if(action==="state" && method==="GET") return json(publicState(state));

  if(action==="content" && method==="POST"){
    const body:any=await req.json();
    const collection=String(body.collection||"");
    if(!COLLECTIONS.has(collection)) return json({error:"Invalid collection"},400);
    const items=contentCollection(state,collection);
    const type=collection==="articles"?"article":collection==="services"?"service":"page";
    const cleaned=cleanContentItem(body.item||{},type);
    const duplicate=items.find((x:any)=>x.slug===cleaned.slug&&x.id!==cleaned.id&&x.status!=="trash");
    if(duplicate)return json({error:"Slug already exists"},409);
    const idx=items.findIndex((x:any)=>x.id===cleaned.id);
    await snapshotState(state,`before-${collection}-save`,user);
    if(idx>=0){
      state.revisions=Array.isArray(state.revisions)?state.revisions:[];
      state.revisions.unshift({id:randomUUID(),created_at:new Date().toISOString(),collection,item_id:items[idx].id,snapshot:items[idx],actor:user.email});
      state.revisions=state.revisions.slice(0,400);
      items[idx]={...items[idx],...cleaned};
      recordActivity(state,user,"content-updated",`${collection}:${cleaned.slug}`);
    }else{
      items.unshift(cleaned);recordActivity(state,user,"content-created",`${collection}:${cleaned.slug}`);
    }
    await saveState(state);return json({ok:true,item:cleaned});
  }

  if(action==="content" && method==="DELETE"){
    const collection=String(url.searchParams.get("collection")||"");
    const id=String(url.searchParams.get("id")||"");
    const purge=url.searchParams.get("purge")==="1";
    if(!COLLECTIONS.has(collection)||!id)return json({error:"Invalid request"},400);
    const items=contentCollection(state,collection);const idx=items.findIndex((x:any)=>x.id===id);
    if(idx<0)return json({error:"Not found"},404);
    await snapshotState(state,`before-${collection}-delete`,user);
    if(purge){items.splice(idx,1);recordActivity(state,user,"content-purged",`${collection}:${id}`);}
    else{items[idx].status="trash";items[idx].updated_at=new Date().toISOString();recordActivity(state,user,"content-trashed",`${collection}:${id}`);}
    await saveState(state);return json({ok:true});
  }

  if(action==="revision-restore" && method==="POST"){
    const body:any=await req.json();const rev=(state.revisions||[]).find((r:any)=>r.id===body.id);
    if(!rev||!COLLECTIONS.has(rev.collection))return json({error:"Revision not found"},404);
    await snapshotState(state,"before-revision-restore",user);
    const items=contentCollection(state,rev.collection),idx=items.findIndex((x:any)=>x.id===rev.item_id);
    if(idx>=0)items[idx]={...rev.snapshot,updated_at:new Date().toISOString()};else items.unshift({...rev.snapshot,updated_at:new Date().toISOString()});
    recordActivity(state,user,"revision-restored",rev.id);await saveState(state);return json({ok:true});
  }

  if(action==="settings" && method==="POST"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const body:any=await req.json();await snapshotState(state,"before-settings-save",user);
    state.settings=cleanSettings(body,state.settings||{});
    recordActivity(state,user,"settings-updated","Global SEO/site settings");await saveState(state);return json({ok:true,settings:state.settings});
  }

  if(action==="redirects" && method==="POST"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const body:any=await req.json();
    state.redirects=Array.isArray(body.redirects)?body.redirects.slice(0,500).map((r:any)=>({
      from:String(r.from||"").slice(0,500),to:String(r.to||"").slice(0,500),status:[301,302].includes(Number(r.status))?Number(r.status):301
    })).filter((r:any)=>r.from&&r.to):[];
    recordActivity(state,user,"redirects-updated",String(state.redirects.length));await saveState(state);return json({ok:true,redirects:state.redirects});
  }

  if(action==="category" && method==="POST"){
    const body:any=await req.json();
    state.categories=Array.isArray(state.categories)?state.categories:[];
    const id=String(body.id||`cat-${randomUUID()}`),name=String(body.name||"").trim().slice(0,120);
    const slug=String(body.slug||name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,120);
    const idx=state.categories.findIndex((x:any)=>x.id===id);
    const item={id,name,slug};if(idx>=0)state.categories[idx]=item;else state.categories.push(item);
    recordActivity(state,user,"category-saved",slug);await saveState(state);return json({ok:true,item});
  }

  if(action==="category" && method==="DELETE"){
    const id=String(url.searchParams.get("id")||"");state.categories=(state.categories||[]).filter((x:any)=>x.id!==id);
    recordActivity(state,user,"category-deleted",id);await saveState(state);return json({ok:true});
  }

  if(action==="lead-status" && method==="POST"){
    const body:any=await req.json();const lead=(state.leads||[]).find((l:any)=>l.id===body.id);
    if(!lead)return json({error:"Lead not found"},404);
    lead.status=["new","contacted","qualified","proposal","won","lost","spam"].includes(body.status)?body.status:"new";
    lead.updated_at=new Date().toISOString();recordActivity(state,user,"lead-status",`${lead.id}:${lead.status}`);await saveState(state);
    return json({ok:true});
  }

  if(action==="media" && method==="POST"){
    const form=await req.formData();const file=form.get("file");
    if(!(file instanceof File))return json({error:"File required"},400);
    if(file.size>5*1024*1024)return json({error:"Max file size is 5 MB"},413);
    if(!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.type))return json({error:"Unsupported file type"},415);
    const id=randomUUID(),ext=(file.name.split(".").pop()||"bin").replace(/[^a-z0-9]/gi,"").slice(0,8);
    const key=`media/${id}.${ext}`;await cmsStore().set(key,await file.arrayBuffer());
    const item={id,key,name:file.name,mime:file.type,size:file.size,alt:String(form.get("alt")||"").slice(0,300),url:`/cms-media/${id}.${ext}`,created_at:new Date().toISOString()};
    state.media=Array.isArray(state.media)?state.media:[];state.media.unshift(item);
    recordActivity(state,user,"media-uploaded",file.name);await saveState(state);return json({ok:true,item});
  }

  if(action==="media" && method==="DELETE"){
    const id=String(url.searchParams.get("id")||"");const item=(state.media||[]).find((m:any)=>m.id===id);
    if(!item)return json({error:"Media not found"},404);
    await cmsStore().delete(item.key);state.media=state.media.filter((m:any)=>m.id!==id);
    recordActivity(state,user,"media-deleted",item.name);await saveState(state);return json({ok:true});
  }

  if(action==="users" && method==="POST"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const body:any=await req.json(),email=String(body.email||"").trim().toLowerCase(),password=String(body.password||"");
    if(!email.includes("@")||password.length<12)return json({error:"Valid email and password of at least 12 characters required"},400);
    state.users=Array.isArray(state.users)?state.users:[];
    const existing=state.users.find((u:any)=>u.id===body.id||u.email===email);
    const item={
      id:existing?.id||randomUUID(),email,name:String(body.name||email).slice(0,160),
      role:body.role==="administrator"?"administrator":"editor",status:body.status==="disabled"?"disabled":"active",
      password_hash:password?hashPassword(password):(existing?.password_hash||""),created_at:existing?.created_at||new Date().toISOString(),updated_at:new Date().toISOString()
    };
    const idx=state.users.findIndex((u:any)=>u.id===item.id);if(idx>=0)state.users[idx]=item;else state.users.push(item);
    recordActivity(state,user,"user-saved",email);await saveState(state);return json({ok:true,user:{...item,password_hash:undefined}});
  }

  if(action==="users" && method==="DELETE"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const id=String(url.searchParams.get("id")||"");state.users=(state.users||[]).filter((u:any)=>u.id!==id);
    recordActivity(state,user,"user-deleted",id);await saveState(state);return json({ok:true});
  }

  if(action==="change-password" && method==="POST"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const body:any=await req.json(),password=String(body.password||"");
    if(password.length<14)return json({error:"Password must be at least 14 characters"},400);
    state.admin_override_hash=hashPassword(password);recordActivity(state,user,"admin-password-changed","Primary admin password changed");await saveState(state);
    return json({ok:true});
  }

  if(action==="backup" && method==="GET"){
    const payload=JSON.stringify({exported_at:new Date().toISOString(),state},null,2);
    return new Response(payload,{status:200,headers:{"content-type":"application/json","content-disposition":`attachment; filename="business-owner-cms-backup-${new Date().toISOString().slice(0,10)}.json"`,"cache-control":"no-store"}});
  }

  if(action==="restore" && method==="POST"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const body:any=await req.json();if(!body?.state?.settings||!Array.isArray(body?.state?.articles))return json({error:"Invalid backup"},400);
    await snapshotState(state,"before-manual-restore",user);
    const restored=body.state;recordActivity(restored,user,"backup-restored","Manual backup restore");await saveState(restored);return json({ok:true});
  }

  if(action==="backups" && method==="GET"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const listing=await cmsStore().list({prefix:"backup/"});return json({backups:listing.blobs.map((b:any)=>({key:b.key,etag:b.etag})).reverse()});
  }

  if(action==="backup-restore" && method==="POST"){
    if(user.role!=="administrator")return json({error:"Administrator only"},403);
    const body:any=await req.json();const snap=await cmsStore().get(String(body.key||""),{type:"json"});
    if(!snap?.state)return json({error:"Backup not found"},404);
    await snapshotState(state,"before-auto-backup-restore",user);recordActivity(snap.state,user,"backup-restored",String(body.key));await saveState(snap.state);return json({ok:true});
  }

  return json({error:"Not found"},404);
};

export const config={path:"/api/cms/*"};

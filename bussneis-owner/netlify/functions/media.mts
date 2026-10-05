import { cmsStore, loadState } from "./lib.mts";

export default async (req:Request) => {
  if(req.method!=="GET") return new Response("Method not allowed",{status:405});
  const url=new URL(req.url);
  const requested=url.pathname.replace(/^\/cms-media\//,"");
  if(!requested) return new Response("Not found",{status:404});
  const state=await loadState();
  const item=(state.media||[]).find((m:any)=>String(m.url||"").endsWith("/"+requested));
  if(!item) return new Response("Not found",{status:404});
  const data=await cmsStore().get(item.key,{type:"arrayBuffer"});
  if(!data) return new Response("Not found",{status:404});
  return new Response(data,{status:200,headers:{
    "content-type":item.mime||"application/octet-stream",
    "cache-control":"public, max-age=86400, stale-while-revalidate=604800",
    "x-content-type-options":"nosniff"
  }});
};

export const config={path:"/cms-media/*"};

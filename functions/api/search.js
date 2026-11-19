const CANONICAL='https://gladio-egypt.vercel.app';
function normalize(value){
 return String(value ?? '').normalize('NFKC')
  .replace(/[\u064b-\u065f]/g,'').toLowerCase().trim();
}
const corslessHeaders={
 'cache-control':'public, max-age=60',
 'x-robots-tag':'noindex,nofollow',
 'x-content-type-options':'nosniff',
};
export async function onRequest({ request, env }){
 if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405,headers:corslessHeaders});
 try{
  const url=new URL(request.url);
  const query=normalize(url.searchParams.get('q')).slice(0,140);
  const lang=url.searchParams.get('lang');
  const limit=Math.max(1,Math.min(50,parseInt(url.searchParams.get('limit')||'20',10)||20));
  const indexURL=new URL('/search-index.json',url.origin);
  const response=await env.ASSETS.fetch(new Request(indexURL));
  if(!response.ok)throw new Error('Search index unavailable');
  const records=await response.json();
  if(!Array.isArray(records))throw new Error('Invalid search index');
  const matches=records.filter(item=>{
   if(['ar','en'].includes(lang) && item.lang!==lang)return false;
   return !query || normalize([item.title,item.description,item.excerpt].join(' ')).includes(query);
  });
  return Response.json({
   query,total:matches.length,
   results:matches.slice(0,limit).map(({path,title,description,lang})=>({path,title,description,lang})),
   canonical:CANONICAL
  },{headers:corslessHeaders});
 }catch(error){
  console.error('Cloudflare read-only search:',error.message);
  return Response.json({error:'Search temporarily unavailable'},{status:503,headers:{...corslessHeaders,'cache-control':'no-store'}});
 }
}

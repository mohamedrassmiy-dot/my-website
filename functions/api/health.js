export async function onRequest({request,env}){
 if(request.method!=='GET'){
  return Response.json({error:'Method not allowed'},{status:405,headers:{'x-robots-tag':'noindex,nofollow'}});
 }
 try{
  const u=new URL('/mirror-manifest.json',request.url);
  const response=await env.ASSETS.fetch(new Request(u));
  if(!response.ok)throw new Error('Mirror manifest not available');
  const status=await response.json();
  return Response.json({
   status:'ok',
   service:'gladio-egypt-cloudflare-mirror',
   publicPages:status.publicPages,
   canonical:status.canonical,
   admin:'https://gladio-egypt.vercel.app/admin/',
   snapshot:'at build time'
  },{headers:{'cache-control':'no-store','x-robots-tag':'noindex,nofollow','x-content-type-options':'nosniff'}});
 }catch(error){
  console.error('Cloudflare mirror health:',error.message);
  return Response.json({status:'unavailable'},{status:503,headers:{'cache-control':'no-store','x-robots-tag':'noindex,nofollow'}});
 }
}

import { getStore } from '@netlify/blobs';

const endpoint='https://rassmiy-marketing.up.railway.app/api/migration/probe-7f3a9d2c81e64b27';
const result={stateFound:false,installed:false,blobCount:null,counts:{},error:null};
try{
  const store=getStore('rassmiy-cms',{consistency:'strong'});
  const state=await store.get('state',{type:'json'});
  result.stateFound=Boolean(state);
  result.installed=Boolean(Array.isArray(state?.users)&&state.users.length>0);
  if(state){
    for(const k of ['users','pages','articles','leads','media','redirects','revisions','activity']){
      result.counts[k]=Array.isArray(state[k])?state[k].length:0;
    }
  }
  const listing=await store.list();
  result.blobCount=Array.isArray(listing?.blobs)?listing.blobs.length:0;
}catch(err){
  result.error=String(err?.message||err).slice(0,500);
}
try{
  await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(result),signal:AbortSignal.timeout(8000)});
}catch(err){
  console.error('RASSMIY_BUILD_BLOB_PROBE_POST_FAILED',String(err?.message||err));
}
console.log('RASSMIY_BUILD_BLOB_PROBE',JSON.stringify(result));

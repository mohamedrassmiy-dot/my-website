import fs from 'node:fs';
const root=process.argv[2]||'release';
function positioning(text){return text.replaceAll('FULL-STACK DIGITAL MARKETING','FULL STACK MARKETING').replaceAll('خبير تسويق رقمي متكامل','خبير التسويق المتكامل · Full Stack Marketing').replaceAll('Digital Marketing','Full Stack Marketing').replaceAll('digital marketing','full stack marketing').replaceAll('التسويق الرقمي','التسويق المتكامل').replaceAll('تسويق رقمي','تسويق متكامل');}
const pages=['index','about','services','portfolio','contact'];
for(const lang of ['ar','en'])for(const page of [...pages,...(lang==='ar'?['root']:[])]){const file=page==='root'?`${root}/index.html`:`${root}/${lang}/${page}.html`;let h=positioning(fs.readFileSync(file,'utf8'));
 if(page==='index'||page==='root'){
  const title=lang==='ar'?'Full Stack Marketing | محمد علي رسمي':'Full Stack Marketing | Mohamed Ali Rassmiy';
  const description=lang==='ar'?'محمد علي رسمي — تسويق متكامل يربط الاستراتيجية والمحتوى وSEO والإعلانات والتجارة الإلكترونية والفعاليات والتحليلات بأهداف الأعمال.':'Mohamed Ali Rassmiy — Full Stack Marketing connecting strategy, content, SEO, paid media, e-commerce, events and analytics to business goals.';
  h=h.replace(/<title>[\s\S]*?<\/title>/,`<title>${title}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${description}">`);
 }
 fs.writeFileSync(file,h);
}

// Commercial SEO landing pages intentionally preserve their exact search-language keywords.
const appFile=`${root}/netlify/functions/app.mjs`;let app=fs.readFileSync(appFile,'utf8');
app=app.replace("Rassmiy Marketing — Digital Marketing, SEO, Paid Media, E-Commerce and Content.","Rassmiy Marketing — Full Stack Marketing: Strategy, SEO, Paid Media, E-Commerce, Content, Events and Analytics.");
fs.writeFileSync(appFile,app);
console.log('Full Stack Marketing positioning: core bilingual pages updated');

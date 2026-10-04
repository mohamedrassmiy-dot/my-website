import fs from 'node:fs';
import path from 'node:path';

const root=process.argv[2]||'release';
const services=[
  ['seo-aeo','SEO & AEO','SEO و AEO'],
  ['paid-media','Paid Advertising','الإعلانات المدفوعة'],
  ['social-media','Social Media','إدارة السوشيال ميديا'],
  ['ecommerce-growth','E-Commerce Growth','نمو التجارة الإلكترونية'],
  ['content-copywriting','Content & Copywriting','المحتوى وكتابة الإعلانات'],
  ['events-activation','Events & Brand Activation','الفعاليات وتنشيط العلامة'],
  ['analytics-reporting','Analytics & Reporting','التحليلات والتقارير']
];
const cases=[
  ['ecommerce-store','E-Commerce Store','متجر إلكتروني'],
  ['organic-seo-growth','Organic SEO Growth','SEO للنمو العضوي'],
  ['paid-media-case','Paid Media','Paid Media'],
  ['brand-launch-event','Brand Launch Event','Brand Launch Event']
];
const read=f=>fs.readFileSync(f,'utf8');
const write=(f,s)=>fs.writeFileSync(f,s);

for(const lang of ['ar','en']){
  const ar=lang==='ar';
  const dir=path.join(root,lang);
  if(!fs.existsSync(dir))continue;

  const home=path.join(dir,'index.html');
  if(fs.existsSync(home)){
    let h=read(home);
    let i=0;
    h=h.replace(/<article class="service-card">([\s\S]*?)<a class="link" href="services\.html">([\s\S]*?)<\/a>([\s\S]*?)<\/article>/g,(m,before,label,after)=>{
      const svc=services[i++];
      if(!svc)return m;
      return '<article class="service-card" data-card-link="/'+lang+'/services.html#'+svc[0]+'">'+before+'<a class="link" href="/'+lang+'/services.html#'+svc[0]+'">'+label+'</a>'+after+'</article>';
    });
    write(home,h);
  }

  const sf=path.join(dir,'services.html');
  if(fs.existsSync(sf)){
    let h=read(sf);
    let i=0;
    h=h.replace(/<article class="service-card">([\s\S]*?)<a class="link" href="services\.html">([\s\S]*?)<\/a>([\s\S]*?)<\/article>/g,(m,before,label,after)=>{
      const svc=services[i++];
      if(!svc)return m;
      const text=ar?'اطلب هذه الخدمة →':'Discuss this service →';
      const href='/'+lang+'/contact.html?service='+encodeURIComponent(svc[0]);
      return '<article id="'+svc[0]+'" class="service-card" data-card-link="'+href+'">'+before+'<a class="link" href="'+href+'">'+text+'</a>'+after+'</article>';
    });
    write(sf,h);
  }

  const pf=path.join(dir,'portfolio.html');
  if(fs.existsSync(pf)){
    let h=read(pf);
    let i=0;
    h=h.replace(/<article class="case-card">([\s\S]*?)<\/article>/g,(m,inside)=>{
      const c=cases[i++];
      if(!c)return m;
      const href='/'+lang+'/contact.html?project='+encodeURIComponent(c[0]);
      const label=ar?'ناقش مشروعًا مشابهًا →':'Discuss a similar project →';
      return '<article class="case-card" data-card-link="'+href+'">'+inside+'<a class="case-link" href="'+href+'">'+label+'</a></article>';
    });
    write(pf,h);
  }

  const cf=path.join(dir,'contact.html');
  if(fs.existsSync(cf)){
    let h=read(cf);
    const contactHtml=ar
      ? '<p><a href="mailto:mohamed.rassmiy@gmail.com">mohamed.rassmiy@gmail.com</a><br>Riyadh, Saudi Arabia<br><a href="https://www.linkedin.com/in/mohamedrassmiy" target="_blank" rel="noopener noreferrer">LinkedIn الشخصي</a><br><a href="https://www.linkedin.com/company/rassmiy-marketing/" target="_blank" rel="noopener noreferrer">Rassmiy Marketing على LinkedIn</a><br><a href="https://wa.me/966536741442" target="_blank" rel="noopener noreferrer">WhatsApp: +966 53 674 1442</a></p>'
      : '<p><a href="mailto:mohamed.rassmiy@gmail.com">mohamed.rassmiy@gmail.com</a><br>Riyadh, Saudi Arabia<br><a href="https://www.linkedin.com/in/mohamedrassmiy" target="_blank" rel="noopener noreferrer">Personal LinkedIn</a><br><a href="https://www.linkedin.com/company/rassmiy-marketing/" target="_blank" rel="noopener noreferrer">Rassmiy Marketing on LinkedIn</a><br><a href="https://wa.me/966536741442" target="_blank" rel="noopener noreferrer">WhatsApp: +966 53 674 1442</a></p>';
    h=h.replace(/<div class="prose"><h2>(.*?)<\/h2><p>[\s\S]*?<\/p><\/div>/,(_m,title)=>'<div class="prose"><h2>'+title+'</h2>'+contactHtml+'</div>');
    write(cf,h);
  }
}

const siteJs=path.join(root,'assets','site.js');
let js=read(siteJs);
const behavior=String.raw`
;(()=>{
  if(window.__RASSMIY_CLICKS_V53__)return;window.__RASSMIY_CLICKS_V53__=true;
  const qs=s=>document.querySelector(s);
  const qsa=s=>[...document.querySelectorAll(s)];
  const ar=(document.documentElement.lang||'ar').startsWith('ar');

  qsa('.service-card,.case-card,[data-card-link]').forEach(card=>{
    if(!card.getAttribute('data-card-link')){
      const fallback=card.querySelector('a.link,a.case-link,a[href^="https://wa.me/"],a[href]');
      if(fallback?.href)card.setAttribute('data-card-link',fallback.href);
    }
    const href=card.getAttribute('data-card-link'); if(!href)return;
    card.classList.add('is-clickable-card'); card.tabIndex=0; card.setAttribute('role','link');
    const go=()=>{if(/^https?:\/\//i.test(href))window.location.assign(href);else location.href=href};
    card.addEventListener('click',e=>{if(e.target.closest('a,button,input,textarea,select,label'))return;go()});
    card.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('a,button,input,textarea,select,label')){e.preventDefault();go()}});
  });

  const params=new URLSearchParams(location.search);
  const service=params.get('service'), project=params.get('project');
  if((service||project)&&location.pathname.endsWith('/contact.html')){
    const map={
      'seo-aeo':ar?'أرغب في خدمة SEO و AEO':'I am interested in SEO & AEO',
      'paid-media':ar?'أرغب في خدمة الإعلانات المدفوعة':'I am interested in Paid Advertising',
      'social-media':ar?'أرغب في خدمة إدارة السوشيال ميديا':'I am interested in Social Media',
      'ecommerce-growth':ar?'أرغب في خدمة نمو التجارة الإلكترونية':'I am interested in E-Commerce Growth',
      'content-copywriting':ar?'أرغب في خدمة المحتوى وكتابة الإعلانات':'I am interested in Content & Copywriting',
      'events-activation':ar?'أرغب في خدمة الفعاليات وتنشيط العلامة':'I am interested in Events & Brand Activation',
      'analytics-reporting':ar?'أرغب في خدمة التحليلات والتقارير':'I am interested in Analytics & Reporting',
      'ecommerce-store':ar?'أرغب في مناقشة مشروع متجر إلكتروني مشابه':'I want to discuss a similar e-commerce project',
      'organic-seo-growth':ar?'أرغب في مناقشة مشروع نمو SEO مشابه':'I want to discuss a similar organic SEO project',
      'paid-media-case':ar?'أرغب في مناقشة مشروع Paid Media مشابه':'I want to discuss a similar paid media project',
      'brand-launch-event':ar?'أرغب في مناقشة فعالية إطلاق علامة مشابهة':'I want to discuss a similar brand launch event'
    };
    const msg=map[service||project];
    const ta=qs('form[action="/api/lead"] textarea[name="message"]');
    if(ta&&msg&&!ta.value)ta.value=msg;
  }

  if(params.get('sent')==='1'&&location.pathname.endsWith('/contact.html')){
    const form=qs('form[action="/api/lead"]');
    if(form&&!qs('.lead-success')){
      const ok=document.createElement('div');ok.className='lead-success';ok.setAttribute('role','status');
      ok.textContent=ar?'تم إرسال طلبك بنجاح. سأتواصل معك في أقرب وقت.':'Your request was sent successfully. I will get back to you shortly.';
      form.before(ok);
    }
  }

  qsa('a[href]').forEach(a=>{
    const href=a.getAttribute('href')||'';
    if(href==='services.html'&&location.pathname.endsWith('/services.html')){
      a.href=location.pathname+'#services';
    }
  });
})();
`;
if(!js.includes('__RASSMIY_CLICKS_V53__'))js+='\n'+behavior+'\n';
write(siteJs,js);

const cssFile=path.join(root,'assets','styles.css');
let css=read(cssFile);
const extra=String.raw`
/* Rassmiy click/interaction fixes v5.4 */
.is-clickable-card{cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}
.is-clickable-card:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(7,43,83,.12)}
.is-clickable-card:focus-visible{outline:3px solid #ff7a19;outline-offset:3px}
.case-link{display:inline-flex;margin:0 20px 20px;color:#0b5e92;font-weight:800;text-decoration:none}
.lead-success{margin:0 0 16px;padding:13px 15px;border-radius:12px;background:#e9f8ef;border:1px solid #b9e6c8;color:#146b35;font-weight:800}
.prose a{color:#0b5e92;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}
@media(max-width:620px){.case-link{margin:0 16px 16px}.is-clickable-card{touch-action:manipulation}}
`;
if(!css.includes('Rassmiy click/interaction fixes v5.4'))css+='\n'+extra+'\n';
write(cssFile,css);

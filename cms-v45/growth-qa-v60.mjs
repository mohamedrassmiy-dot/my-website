import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2]||'release';
const must=(ok,label)=>{if(!ok)throw new Error('Growth QA FAIL: '+label);console.log('Growth QA PASS:',label)};
const app=fs.readFileSync(path.join(root,'netlify/functions/app.mjs'),'utf8');
const admin=fs.readFileSync(path.join(root,'assets/admin.js'),'utf8');
const site=fs.readFileSync(path.join(root,'assets/site.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/styles.css'),'utf8');
must(app.includes("path==='/api/content-cards'"),'public cards API route');
must(app.includes("action==='save_cards'"),'authenticated cards save action');
must(!app.includes('RASSMIY_SEED_MIGRATION_V60'),'legacy auto-seed migration removed');
must(app.includes('const RASSMIY_DEFAULT_CARDS_V60='),'default card constants injected');
must(app.includes('function rassmiyCards(state)'),'card state resolver injected');
must(admin.includes('__RASSMIY_CARD_MANAGER_V60__'),'card manager UI');
must(site.includes('__RASSMIY_CARDS_V60__'),'frontend card hydration');
must(css.includes('Rassmiy growth system v6.0'),'growth styles');
for(const f of ['index.html','ar/index.html','en/index.html','ar/about.html','en/about.html','ar/services.html','en/services.html','ar/portfolio.html','en/portfolio.html','ar/contact.html','en/contact.html'])must(fs.existsSync(path.join(root,f)),f+' exists');
must(fs.readFileSync(path.join(root,'ar/index.html'),'utf8').includes('GROWTH_HOME_AR_V60'),'Arabic home growth content');
must(fs.readFileSync(path.join(root,'en/index.html'),'utf8').includes('GROWTH_HOME_EN_V60'),'English home growth content');
for(const p of [
 ['en/pages/seo-consultant-riyadh/index.html','SEO landing page'],
 ['en/pages/digital-marketing-consultant-riyadh/index.html','digital marketing landing page'],
 ['en/pages/ecommerce-growth-saudi-arabia/index.html','ecommerce landing page'],
 ['en/articles/digital-marketing-strategy-saudi-arabia-2026/index.html','strategy article'],
 ['en/articles/seo-vs-google-ads-saudi-arabia/index.html','SEO vs Ads article'],
 ['en/articles/choose-seo-consultant-riyadh/index.html','SEO consultant article'],
 ['en/articles/aeo-geo-ai-search-saudi-arabia/index.html','AEO GEO article'],
 ['en/articles/ecommerce-growth-strategy-saudi-arabia/index.html','ecommerce article'],
 ['en/articles/b2b-lead-generation-saudi-arabia/index.html','B2B lead article'],
 ['en/articles/index.html','article index']
]) must(fs.existsSync(path.join(root,p[0])),p[1]);
const meta=JSON.parse(fs.readFileSync(path.join(root,'growth-v60.json'),'utf8'));
must(meta.cards.length>=13,'editable card seeds');
must(meta.pages.length===3,'lead landing page definitions');
must(meta.articles.length===6,'SEO article definitions');
const urls=JSON.parse(fs.readFileSync(path.join(root,'growth-urls-v61.json'),'utf8'));
must(urls.length===20,'growth URL inventory');
must(fs.existsSync(path.join(root,'sitemap-growth.xml')),'sitemap-growth.xml exists');
console.log('GROWTH_QA_V61=PASS');

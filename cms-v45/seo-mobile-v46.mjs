import fs from 'node:fs';
const file=process.argv[2];
if(!file) throw new Error('Target backend file is required');
let s=fs.readFileSync(file,'utf8');
const must=(a,b,label)=>{if(!s.includes(a)) throw new Error('v4.6 SEO patch failed: '+label); s=s.replace(a,b);};

must("  robots_txt: 'User-agent: *\\nAllow: /\\nDisallow: /admin/\\n\\nSitemap: /sitemap.xml\\n'\n", `  robots_txt: \`# Rassmiy Marketing — Search + AI crawler policy
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /install
Disallow: /api/

# OpenAI / ChatGPT
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /

# Google / Gemini
User-agent: Googlebot
Allow: /
User-agent: Google-Extended
Allow: /

# Microsoft / Copilot
User-agent: Bingbot
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /

# Anthropic / Claude
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Claude-SearchBot
Allow: /

# Apple / Common Crawl / Meta / Amazon
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: meta-externalagent
Allow: /
User-agent: FacebookBot
Allow: /
User-agent: Amazonbot
Allow: /

Sitemap: /sitemap.xml
\`\n`, 'professional robots default');

must("  state.settings = { ...DEFAULT_SETTINGS, ...(state.settings || {}) };\n", "  state.settings = { ...DEFAULT_SETTINGS, ...(state.settings || {}) };\n  const legacyRobots = 'User-agent: *\\nAllow: /\\nDisallow: /admin/\\n\\nSitemap: /sitemap.xml\\n';\n  if (!String(state.settings.robots_txt||'').trim() || String(state.settings.robots_txt||'').trim()===legacyRobots.trim()) { state.settings.robots_txt=DEFAULT_SETTINGS.robots_txt; dirty=true; }\n", 'robots migration');

must("function siteBase(req,state) { const configured=String(state.settings.site_url||'').replace(/\\/$/,''); return configured || new URL(req.url).origin; }", "function siteBase(req,state) { const origin=new URL(req.url).origin; let base=String(state.settings.site_url||'').trim().replace(/\\/$/,'')||origin; if(/^http:\\/\\/[^/]+\\.netlify\\.app$/i.test(base)) base=base.replace(/^http:/i,'https:'); return base; }", 'https canonical base');

must(`  const alts=['ar','en'].filter(l=>hasTranslation(row,l)).map(l=>\`<link rel="alternate" hreflang="\${l}" href="\${attr(base+\`/\${l}/\${type==='article'?'articles':'pages'}/\${encodeURIComponent(localizedValue(row,'slug',l))}\`)}">\`).join('');
  return \`<meta name="description" content="\${attr(meta)}"><meta name="keywords" content="\${attr([r.focus_keyword,r.secondary_keywords].filter(Boolean).join(', '))}"><meta name="robots" content="\${row.robots_index?'index':'noindex'},\${row.robots_follow?'follow':'nofollow'}"><link rel="canonical" href="\${attr(canonical)}">\${alts}\${googleVerify?\`<meta name="google-site-verification" content="\${attr(googleVerify)}">\`:''}<meta property="og:title" content="\${attr(ogTitle)}"><meta property="og:description" content="\${attr(ogDesc)}">\${ogImage?\`<meta property="og:image" content="\${attr(ogImage)}">\`:''}<meta property="og:url" content="\${attr(canonical)}"><meta property="og:type" content="\${type==='article'?'article':'website'}">\${schema?\`<script type="application/ld+json">\${schema}</script>\`:''}\${globalSchema?\`<script type="application/ld+json">\${globalSchema}</script>\`:''}\${state.settings.global_head_code||''}\`;
`, `  const alternates=['ar','en'].filter(l=>hasTranslation(row,l)).map(l=>({lang:l,url:base+\`/\${l}/\${type==='article'?'articles':'pages'}/\${encodeURIComponent(localizedValue(row,'slug',l))}\`}));
  const alts=alternates.map(x=>\`<link rel="alternate" hreflang="\${x.lang}" href="\${attr(x.url)}">\`).join('');
  const xDefault=alternates.find(x=>x.lang==='en')||alternates[0];
  const robots=\`\${row.robots_index?'index':'noindex'},\${row.robots_follow?'follow':'nofollow'},max-image-preview:large,max-snippet:-1,max-video-preview:-1\`;
  return \`<meta name="description" content="\${attr(meta)}"><meta name="keywords" content="\${attr([r.focus_keyword,r.secondary_keywords].filter(Boolean).join(', '))}"><meta name="robots" content="\${robots}"><meta name="googlebot" content="\${robots}"><link rel="canonical" href="\${attr(canonical)}">\${alts}\${xDefault?\`<link rel="alternate" hreflang="x-default" href="\${attr(xDefault.url)}">\`:''}\${googleVerify?\`<meta name="google-site-verification" content="\${attr(googleVerify)}">\`:''}<meta property="og:title" content="\${attr(ogTitle)}"><meta property="og:description" content="\${attr(ogDesc)}">\${ogImage?\`<meta property="og:image" content="\${attr(ogImage)}">\`:''}<meta property="og:url" content="\${attr(canonical)}"><meta property="og:type" content="\${type==='article'?'article':'website'}">\${schema?\`<script type="application/ld+json">\${schema}</script>\`:''}\${globalSchema?\`<script type="application/ld+json">\${globalSchema}</script>\`:''}\${state.settings.global_head_code||''}\`;
`, 'dynamic hreflang and robots');

must(`  return \`<header class="topbar"><div class="container nav"><a class="brand" href="/\${lang}/index.html"><img src="/assets/logo.jpg" alt="Rassmiy Marketing"><span class="brand-copy"><b>RASSMIY</b><span>MARKETING</span></span></a><nav class="menu"><a href="/\${lang}/index.html">\${ar?'الرئيسية':'Home'}</a><a href="/\${lang}/about.html">\${ar?'من أنا':'About'}</a><a href="/\${lang}/services.html">\${ar?'الخدمات':'Services'}</a><a href="/\${lang}/portfolio.html">\${ar?'الأعمال':'Portfolio'}</a><a href="/\${lang}/articles">\${ar?'المقالات':'Articles'}</a><a href="/\${lang}/contact.html">\${ar?'تواصل':'Contact'}</a></nav><div class="nav-actions"><a class="lang" href="\${attr(altHref||\`/\${ar?'en':'ar'}/index.html\`)}">\${ar?'EN':'AR'}</a><a class="btn outline" href="/admin/login">\${ar?'دخول الإدارة':'Admin'}</a><a class="btn primary" href="/\${lang}/contact.html">\${ar?'طلب استشارة →':'Book a consultation →'}</a></div></div></header>\`;
`, `  return \`<header class="topbar"><div class="container nav"><a class="brand" href="/\${lang}/index.html"><img src="/assets/logo.jpg" alt="Rassmiy Marketing"><span class="brand-copy"><b>RASSMIY</b><span>MARKETING</span></span></a><nav class="menu"><a href="/\${lang}/index.html">\${ar?'الرئيسية':'Home'}</a><a href="/\${lang}/about.html">\${ar?'من أنا':'About'}</a><a href="/\${lang}/services.html">\${ar?'الخدمات':'Services'}</a><a href="/\${lang}/portfolio.html">\${ar?'الأعمال':'Portfolio'}</a><a href="/\${lang}/articles">\${ar?'المقالات':'Articles'}</a><a href="/\${lang}/contact.html">\${ar?'X�واصل':'Contact'}</a></nav><div class="nav-actions"><a class="lang" href="\${attr(altHref||\`/\${ar?'en':'ar'}/index.html\`)}">\${ar?'EN':'AR'}</a><a class="btn outline desktop-action" href="/admin/login">\${ar?'دخول الإدارة':'Admin'}</a><a class="btn primary desktop-action" href="/\${lang}/contact.html">\${ar?'طلب استشارة →':'Book a consultation →'}</a><button class="mobile-toggle" type="button" aria-label="\${ar?'فتح القائمة':'Open menu'}" aria-expanded="false" data-public-menu-toggle>☰</button></div><div class="mobile-nav-panel" data-public-menu><nav><a href="/\${lang}/index.html">\${ar?'الرئيسية':'Home'}</a><a href="/\${lang}/about.html">\${ar?'من أنا':'About'}</a><a href="/\${lang}/services.html">\${ar?'الخدمات':'Services'}</a><a href="/\${lang}/portfolio.html">\${ar?'الأعمال':'Portfolio'}</a><a href="/\${lang}/articles">\${ar?'المقالات':'Articles'}</a><a href="/\${lang}/contact.html">\${ar?'X�واصل':'Contact'}</a></nav><div class="mobile-nav-actions"><a class="btn outline" href="/admin/login">\${ar?'X�خول الإدارة':'Admin'}</a><a class="btn primary" href="/\${lang}/contact.html">\${ar?'طلب استشارة →':'Book a consultation →'}</a></div></div></div></header>\`;
`, 'dynamic burger nav');

must(`  const head=\`<meta name="description" content="\${attr(ar?'X�قالات علمية في التطويق الرقمي, SEO، التجارة الإلكترونية والإعلانات.':'Practical articles about digital marketing, SEO, e-commerce and paid media.')}\"><link rel="stylesheet" href="/assets/styles.css">\`;
  return \`<!doctype html><html lang="\${lang}" dir="\${ar?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>\${ar?'المقالات | Rassmiy Marketing':'Articles | Rassmiy Marketing'}</title><link rel="icon" href="/favicon">\${head}</head><body>\${nav(lang)}<section class="page-hero"><div class="container"><div class="kicker">\${ar?'X�لمقالات':'Articles'}</div><h1>\${ar?'مقالات عملية في التسويق والنمو':'Practical marketing & growth articles'}</h1><p>\${ar?'SEO وAEO وGEO، التجارة الإلكترونية، الإعلانات، المحتوى والتحليلات.':'SEO, AEO, GEO, e-commerce, paid media, content and analytics.'}</p></div></section><section class="section soft"><div class="container"><div class="articles">\${cards}</div></div></section>\${footer(lang,state)}</body></html>\`;
`, `  const base=siteBase(req,state), canonical=\`\${base}/\${lang}/articles\`;
  const head=\`<meta name="description" content="\${attr(ar?'مقالات عملية في التسويق الرقمي، SEO، التجارة الإلكترونية والإعلانات.':'Practical articles about digital marketing, SEO, e-commerce and paid media.')}\"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><link rel="canonical" href="\${attr(canonical)}"><link rel="alternate" hreflang="ar" href="\${attr(base+'/ar/articles')}"><link rel="alternate" hreflang="en" href="\${attr(base+'/en/articles')}"><link rel="alternate" hreflang="x-default" href="\${attr(base+'/en/articles')}"><link rel="stylesheet" href="/assets/styles.css">\`;
  return \`<!doctype html><html lang="\${lang}" dir="\${ar?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>\${ar?'المقالات | Rassmiy Marketing':'Articles | Rassmiy Marketing'}</title><link rel="icon" href="/favicon">\${head}</head><body>\${nav(lang)}<section class="page-hero"><div class="container"><div class="kicker">\${ar?'المقالات':'Articles'}</div><h1>\${ar?'مقالات عملية في التسويق والنمو':'Practical marketing & growth articles'}</h1><p>\${ar?'SEO وAEO وGEO، التجارة الإلكترونية، الإعلانات، المحتوى والتحليلات.':'SEO, AEO, GEO, e-commerce, paid media, content and analytics.'}</p></div></section><section class="section soft"><div class="container"><div class="articles">\${cards}</div></div></section>\${footer(lang,state)}<script defer src="/assets/site.js"></script></body></html>\`;
`, 'article index SEO');

must(`\${cta}\${leadForm}\${footer(lang,state)}</body></html>\`;`, `\${cta}\${leadForm}\${footer(lang,state)}<script defer src="/assets/site.js"></script></body></html>\`;`, 'dynamic site js');

must(`  if(path==='/robots.txt'){ let body=state.settings.robots_txt||DEFAULT_SETTINGS.robots_txt; body=body.replace(/^Sitemap:.*$/gmi,\`Sitemap: \${siteBase(req,state)}/sitemap.xml\`); return saveAnd(text(body)); }
  if(path==='/sitemap.xml'){ const base=siteBase(req,state),urls=[]; for(const lang of ['ar','en']){for(const p of ['index.html','about.html','services.html','portfolio.html','contact.html'])urls.push(\`\${base}/\${lang}/\${p}\`);urls.push(\`\${base}/\${lang}/articles\`);} for(const r of state.pages.filter(x=>x.status==='published'&&x.robots_index!==false))for(const lang of ['ar','en'])if(hasTranslation(r,lang))urls.push(\`\${base}/\${lang}/pages/\${encodeURIComponent(localizedValue(r,'slug',lang))}\`); const now=nowIso(); for(const r of state.articles.filter(x=>((x.status==='published'&&(!x.published_at||x.published_at<=now))||(x.status==='scheduled'&&x.published_at&&x.published_at<=now))&&x.robots_index!==false))for(const lang of ['ar','en'])if(hasTranslation(r,lang))urls.push(\`\${base}/\${lang}/articles/\${encodeURIComponent(localizedValue(r,'slug',lang))}\`); const xml=\`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n\${[...new Set(urls)].map(u=>\`<url><loc>\${esc(u)}</loc></url>\`).join('\\n')}\\n</urlset>\`; return saveAnd(text(xml,200,'application/xml; charset=utf-8')); }
`, `  if(path==='/robots.txt'){ let body=state.settings.robots_txt||DEFAULT_SETTINGS.robots_txt; const legacy='User-agent: *\\nAllow: /\\nDisallow: /admin/\\n\\nSitemap: /sitemap.xml\\n'; if(body.trim()===legacy.trim()) body=DEFAULT_SETTINGS.robots_txt; body=body.replace(/^Sitemap:.*$/gmi,\`Sitemap: \${siteBase(req,state)}/sitemap.xml\`); if(!/^Sitemap:/mi.test(body)) body+=\`\\nSitemap: \${siteBase(req,state)}/sitemap.xml\\n\`; return saveAnd(text(body,200,'text/plain; charset=utf-8',{'Cache-Control':'public, max-age=300'})); }
  if(path==='/sitemap.xml'){ const base=siteBase(req,state),items=[]; const add=(loc,lastmod='',priority='0.7',changefreq='monthly',alts=[])=>items.push({loc,lastmod,priority,changefreq,alts}); const staticPages=['index.html','about.html','services.html','portfolio.html','contact.html']; for(const p of staticPages){ const alts=['ar','en'].map(lang=>({lang,href:\`\${base}/\${lang}/\${p}\`})); for(const x of alts)add(x.href,'','0.8',p==='index.html'?'weekly':'monthly',alts); } const articleIndexAlts=['ar','en'].map(lang=>({lang,href:\`\${base}/\${lang}/articles\`})); for(const x of articleIndexAlts)add(x.href,'','0.8','weekly',articleIndexAlts); for(const r of state.pages.filter(x=>x.status==='published'&&x.robots_index!==false)){ const alts=['ar','en'].filter(lang=>hasTranslation(r,lang)).map(lang=>({lang,href:\`\${base}/\${lang}/pages/\${encodeURIComponent(localizedValue(r,'slug',lang))}\`})); for(const x of alts)add(x.href,r.updated_at||r.created_at||'','0.8','monthly',alts); } const now=nowIso(); for(const r of state.articles.filter(x=>((x.status==='published'&&(!x.published_at||x.published_at<=now))||(x.status==='scheduled'&&x.published_at&&x.published_at<=now))&&x.robots_index!==false)){ const alts=['ar','en'].filter(lang=>hasTranslation(r,lang)).map(lang=>({lang,href:\`\${base}/\${lang}/articles/\${encodeURIComponent(localizedValue(r,'slug',lang))}\`})); for(const x of alts)add(x.href,r.updated_at||r.published_at||r.created_at||'','0.9','weekly',alts); } const xmlEscape=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;'); const rows=items.filter((x,i,a)=>a.findIndex(y=>y.loc===x.loc)===i).map(x=>{ const alternate=x.alts.map(a=>\`<xhtml:link rel="alternate" hreflang="\${a.lang}" href="\${xmlEscape(a.href)}"/>\`).join(''); const xd=x.alts.find(a=>a.lang==='en')||x.alts[0]; return \`<url><loc>\${xmlEscape(x.loc)}</loc>\${x.lastmod?\`<lastmod>\${xmlEscape(String(x.lastmod).slice(0,10))}</lastmod>\`:''}<changefreq>\${x.changefreq}</changefreq><priority>\${x.priority}</priority>\${alternate}\${xd?\`<xhtml:link rel="alternate" hreflang="x-default" href="\${xmlEscape(xd.href)}"/>\`:''}</url>\`; }).join('\\n'); const xml=\`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\\n\${rows}\\n</urlset>\`; return saveAnd(text(xml,200,'application/xml; charset=utf-8',{'Cache-Control':'public, max-age=300'})); }
`, 'robots and sitemap');

fs.writeFileSync(file,s);

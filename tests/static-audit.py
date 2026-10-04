from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import json
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.tags=[]
    def handle_starttag(self, tag, attrs): self.tags.append((tag,dict(attrs)))
root=Path('release'); checks=0
for file in root.rglob('*.html'):
    p=Page();p.feed(file.read_text()); private=any(t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for t,a in p.tags)
    for name in ['viewport','robots']:
        assert sum(t=='meta' and a.get('name')==name for t,a in p.tags)==1,(file,name)
        checks+=1
    if not private:
        for name in ['description']:
            assert any(t=='meta' and a.get('name')==name and a.get('content') for t,a in p.tags),(file,name)
            checks+=1
        assert sum(t=='h1' for t,a in p.tags)==1,(file,'h1');checks+=1
        assert sum(t=='a' and a.get('class')=='whatsapp-floating' for t,a in p.tags)==1,(file,'whatsapp');checks+=1
        assert any(t=='a' and a.get('href')=='https://www.linkedin.com/company/rassmiy-marketing/' for t,a in p.tags),(file,'company');checks+=1
    for tag,a in p.tags:
        value=a.get('src') or a.get('href','');u=urlparse(value)
        if u.scheme or u.netloc or not u.path:continue
        target=root/u.path.lstrip('/') if u.path.startswith('/') else file.parent/u.path
        dynamic=any(u.path.startswith(v) for v in ['/admin','/install','/api','/favicon','/ar/articles','/en/articles','/ar/pages','/en/pages'])
        assert target.exists() or dynamic,(file,value);checks+=1
        if tag=='img': assert 'alt' in a,(file,'alt');checks+=1
for lang in ['ar','en']:
    home=(root/lang/'index.html').read_text()
    assert '+215%' not in home and '+340%' not in home,(lang,'unverified metrics');checks+=1
    assert home.count('/articles/')>=6,(lang,'real article destinations');checks+=1
    text=(root/lang/'portfolio.html').read_text()
    assert text.count('class="work-card"')==6;checks+=1
    assert 'href="/'+('en' if lang=='ar' else 'ar')+'/portfolio.html"' in text;checks+=1
print(json.dumps({'passed':checks,'html_pages':len(list(root.rglob('*.html'))),'scope':'metadata, assets, internal links, bilingual portfolio, contact links'}))

"""Crawl site routes and assets; optionally test published URLs and external links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, urljoin
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from concurrent.futures import ThreadPoolExecutor
import argparse, json, re, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='https://dultenrichard.github.io'
class Page(HTMLParser):
 def __init__(self): super().__init__(); self.refs=[]; self.ids=set(); self.redirect=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'): self.ids.add(a['id'])
  for key in ('href','src','poster'):
   if a.get(key): self.refs.append(a[key])
  if a.get('srcset'):
   self.refs.extend(x.strip().split()[0] for x in a['srcset'].split(','))
  if tag=='meta' and a.get('http-equiv','').lower()=='refresh':
   m=re.search(r'url=(.*)',a.get('content',''),re.I)
   if m: self.redirect=m.group(1).strip();self.refs.append(self.redirect)
  if tag=='meta' and a.get('property') in ('og:url','og:image'): self.refs.append(a.get('content',''))
def route(p): return '/'+p.relative_to(ROOT).as_posix().removesuffix('index.html')
def target(source,value):
 u=urlsplit(value)
 if u.scheme in ('mailto','tel','data'):return None
 if u.netloc and u.netloc!='dultenrichard.github.io':return None
 path=unquote(u.path)
 p=(ROOT/path.lstrip('/')) if path.startswith('/') else (source.parent/path if path else source)
 p=p.resolve()
 if p.is_dir() or path.endswith('/'):p=p/'index.html'
 return p,unquote(u.fragment)
def status(url):
 try:
  with urlopen(Request(url,headers={'User-Agent':'DultenSiteLinkCheck/1.0'}),timeout=15) as r:return {'url':url,'status':r.status,'final_url':r.url}
 except HTTPError as e:return {'url':url,'status':e.code,'verification':'unverified' if e.code in (401,403,429,999) else 'failed'}
 except Exception as e:return {'url':url,'status':None,'verification':'unverified','reason':str(e)}
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--external',action='store_true');ap.add_argument('--published');ap.add_argument('--report',default='link-report.json');args=ap.parse_args()
 pages={};errors=[];external=set();count=0;assets=0
 for p in ROOT.rglob('*.html'):
  if any(x in p.parts for x in ('.git','dist','node_modules')):continue
  parser=Page();parser.feed(p.read_text());pages[p.resolve()]=parser
 for p,parser in pages.items():
  for value in parser.refs:
   result=target(p,value)
   if result is None:
    if value.startswith(('http://','https://')):external.add(value)
    continue
   count+=1;t,fragment=result
   if not t.is_relative_to(ROOT) or not t.is_file():errors.append(f'{route(p)} -> {value}: missing target');continue
   if fragment and t in pages and fragment not in pages[t].ids:errors.append(f'{route(p)} -> {value}: missing fragment')
   if t.suffix!='.html':assets+=1
  if parser.redirect:
   seen={p};t=target(p,parser.redirect)
   while t and t[0] in pages and pages[t[0]].redirect:
    if t[0] in seen:errors.append(f'{route(p)}: redirect loop');break
    seen.add(t[0]);t=target(t[0],pages[t[0]].redirect)
 # JSON-backed gallery assets and fragments are part of the site contract.
 for record in json.loads((ROOT/'data/awards.json').read_text()):
  for key in ('image','document'):
   if record.get(key):
    t=target(ROOT/'awards/index.html',record[key])
    if t and not t[0].is_file():errors.append(f'awards.json: missing {record[key]}')
  t=target(ROOT/'awards/index.html',record.get('story','#'+record['id']))
  if t and (t[0] not in pages or t[1] not in pages[t[0]].ids):errors.append(f"awards.json: missing award anchor {record['id']}")
 for css in ROOT.glob('*.css'):
  for v in re.findall(r'url\([\"\']?([^\)\"\']+)',css.read_text()):
   t=target(css,v)
   if t and not t[0].is_file():errors.append(f'{css.name}: missing {v}')
 xml=ET.parse(ROOT/'sitemap.xml');sitemap=[x.text for x in xml.getroot().iter() if x.tag.endswith('loc')]
 for u in sitemap:
  t=target(ROOT/'index.html',u)
  if t and not t[0].is_file():errors.append('sitemap: missing '+u)
 robots=(ROOT/'robots.txt').read_text()
 if ORIGIN+'/sitemap.xml' not in robots:errors.append('robots: missing canonical sitemap')
 urls=sorted(external) if args.external else []
 with ThreadPoolExecutor(max_workers=8) as pool:ext=list(pool.map(status,urls))
 published=[]
 if args.published:
  paths=sorted(set(route(p) for p in pages)|{'/robots.txt','/sitemap.xml','/styles.css','/editorial.css','/site.js','/dulten-fromentin-profile.webp','/dulten-richard-monogram.png'})
  with ThreadPoolExecutor(max_workers=8) as pool:published=list(pool.map(status,[urljoin(args.published,x) for x in paths]))
 report={'html_pages':len(pages),'internal_references_tested':count,'asset_references':assets,'external_unique_links':len(external),'internal_errors':errors,'external_results':ext,'published_results':published}
 Path(args.report).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ('external_results','published_results')},indent=2))
 if errors or any(x.get('status')!=200 for x in published):raise SystemExit(1)
if __name__=='__main__':main()

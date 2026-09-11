"""Verify a built Hugo site without third-party packages or network requests."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
import json
import tomllib
import re
import sys
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
output = root / (sys.argv[1] if len(sys.argv) > 1 else 'build-check')
errors = []
site_config = tomllib.loads((root / 'hugo.toml').read_text(encoding='utf-8-sig'))
site_base = site_config['baseURL'].rstrip('/') + '/'
site_host = urlsplit(site_base).netloc

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.refs = []
        self.images = []
        self.h1 = 0
        self.canonicals = []
        self.script_id = None
        self.index = ''
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            if attrs['id'] in self.ids:
                errors.append(f'Duplicate id {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonicals.append(attrs.get('href', ''))
        for key in ('href', 'src', 'action', 'content'):
            value = attrs.get(key, '')
            if value.startswith(('http://', 'https://')) and urlsplit(value).hostname in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
                errors.append(f'Localhost reference in production {tag}: {value}')
        if tag == 'a' and 'href' in attrs: self.refs.append(attrs['href'])
        if tag in ('link', 'script'):
            value = attrs.get('href') or attrs.get('src')
            if value: self.refs.append(value)
        if tag == 'img':
            self.images.append(attrs)
            self.refs.append(attrs.get('src', ''))
        if tag == 'script': self.script_id = attrs.get('id')
    def handle_endtag(self, tag):
        if tag == 'script': self.script_id = None
    def handle_data(self, text):
        if self.script_id == 'search-index': self.index += text

if not output.is_dir():
    sys.exit(f'Build first: hugo --minify --destination {output.name}')
try:
    production_index = json.loads((output / 'index.json').read_text(encoding='utf-8'))
    production_urls = {entry['url'] for entry in production_index}
    if len(production_urls) != len(production_index): errors.append('Duplicate production article URLs')
except (ValueError, KeyError, OSError) as exc:
    sys.exit(f'Cannot read production index: {exc}')
pages = {}
for path in output.rglob('*.html'):
    page = Page()
    page.feed(path.read_text(encoding='utf-8'))
    pages[path.resolve()] = page
    if len(page.canonicals) != 1 or not page.canonicals[0].startswith(site_base): errors.append(f'{path.relative_to(output)}: canonical URL does not use {site_base}')
    if page.h1 != 1: errors.append(f'{path.relative_to(output)}: expected one h1, found {page.h1}')
    for image in page.images:
        if 'alt' not in image: errors.append(f'{path.name}: image lacks alt attribute')
        if not image.get('width') or not image.get('height'): errors.append(f'{path.relative_to(output)}: image lacks intrinsic dimensions: {image.get("src")}')
    if page.index:
        try:
            index = json.loads(page.index)
            if any('/test/' in entry['url'] for entry in index): errors.append('Draft leaked into search')
            if {entry['url'] for entry in index} != production_urls: errors.append(f'{path.relative_to(output)}: search entries differ from production index')
        except (ValueError, KeyError) as exc: errors.append(f'Invalid search index: {exc}')

checked = set()
for path, page in pages.items():
    relative = path.relative_to(output.resolve()).as_posix()
    base = site_base + (relative[:-10] if relative.endswith('index.html') else relative)
    for ref in page.refs:
        resolved = urlsplit(urljoin(base, ref))
        if resolved.hostname in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
            errors.append(f'{relative}: localhost URL in production: {ref}')
        if resolved.scheme not in ('http', 'https') or resolved.netloc != site_host: continue
        target = (output / unquote(resolved.path).lstrip('/')).resolve()
        if target.is_dir(): target = target / 'index.html'
        if not target.exists(): errors.append(f'{relative}: missing local target {ref}'); continue
        checked.add(resolved.path)
        if resolved.fragment and target.suffix == '.html':
            other = pages.get(target.resolve())
            if other and unquote(resolved.fragment) not in other.ids:
                errors.append(f'{relative}: missing anchor {ref}')

for css in output.rglob('*.css'):
    for asset in re.findall(r'url\([\'\"]?([^\)\'\"]+)', css.read_text(encoding='utf-8')):
        if asset.startswith('/') and not (output / asset.lstrip('/')).is_file(): errors.append(f'CSS asset missing: {asset}')
for slug in ('xpdf', 'the-fuzzing-notebook', 'vprintf'):
    if not (output / 'post' / slug / 'index.html').exists(): errors.append(f'Missing original article {slug}')
if (output / 'post/test/index.html').exists(): errors.append('Draft page leaked into production')
items = []
try:
    feed = ET.parse(output / 'index.xml')
    items = feed.findall('./channel/item')
    expected_feed = sorted(production_index, key=lambda entry: entry['date'], reverse=True)[:30]
    if {urlsplit(item.findtext('link', '')).path for item in items} != {entry['url'] for entry in expected_feed}:
        errors.append('RSS does not match the newest 30 published articles')
    ET.parse(output / 'sitemap.xml')
except (ET.ParseError, OSError) as exc: errors.append(f'Invalid feed/sitemap: {exc}')

design = (root / 'DESIGN.md').read_text(encoding='utf-8')
css = (root / 'themes/after-hours/assets/css/main.css').read_text(encoding='utf-8')
token_map = {'background':'bg', 'surface':'surface','raised':'raised','text':'text','muted':'muted','faint':'faint','border':'border','primary':'primary','mint':'mint','blue':'blue','peach':'rust'}
for name, variable in token_map.items():
    value = re.search(rf'^  {name}: [\'\"](#[0-9a-f]+)', design, re.M).group(1)
    actual = re.search(rf'--color-{variable}:(#[0-9a-f]+)', css).group(1)
    if actual != value: errors.append(f'Token drift: {name}: {value} vs {actual}')
report = {'htmlPages':len(pages),'localTargets':len(checked),'rssArticles':len(items),'tokenMappings':len(token_map),'errors':sorted(set(errors))}
(root / 'docs/build-verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
sys.exit(bool(errors))

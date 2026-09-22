"""Check that HTML's local static assets exist; no external network requests."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Assets(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.source = source
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        value = attrs.get('src') if tag in {'script', 'img', 'source'} else None
        if tag == 'link' and attrs.get('rel') in {'stylesheet', 'icon', 'manifest', 'modulepreload'}:
            value = attrs.get('href')
        if not value:
            return
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path:
            return
        path = unquote(url.path)
        target = (ROOT / path.lstrip('/') if path.startswith('/') else self.source.parent / path).resolve()
        if not target.is_relative_to(ROOT) or not target.is_file():
            self.errors.append(f'{self.source.relative_to(ROOT)}: missing local asset {value}')


def main():
    errors = []
    pages = sorted(ROOT.rglob('*.html'))
    for page in pages:
        parser = Assets(page)
        parser.feed(page.read_text(encoding='utf-8'))
        errors.extend(parser.errors)
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Checked local static asset references in {len(pages)} HTML pages.')


if __name__ == '__main__':
    main()

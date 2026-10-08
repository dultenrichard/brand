from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "index.html",
    "experience/index.html",
    "skills/index.html",
    "awards/index.html",
    "sources/index.html",
    "contact/index.html",
    "privacy/index.html",
    "robots.txt",
    "sitemap.xml",
    ".gitignore",
    "styles.css",
    "site.js",
    "dulten-richard-monogram.png",
    "dulten-fromentin-profile.webp",
]

class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs):
        values = dict(attrs)
        for key in ("href", "src"):
            value = values.get(key)
            if value:
                self.refs.append((key, value))

def local_target(page: Path, value: str) -> Path | None:
    if value.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        return None
    parts = urlsplit(value)
    if parts.scheme or parts.netloc:
        return None
    raw_path = parts.path
    if not raw_path:
        return None
    if raw_path.startswith("/"):
        candidate = (ROOT / raw_path.removeprefix("/")).resolve()
    elif raw_path == "/":
        candidate = ROOT.resolve()
    else:
        candidate = (page.parent / raw_path).resolve()
    if raw_path.endswith("/") or candidate.is_dir():
        return candidate / "index.html"
    return candidate

def main() -> None:
    errors: list[str] = []

    for relative in REQUIRED:
        if not (ROOT / relative).exists():
            errors.append(f"Missing required file: {relative}")

    for path in ROOT.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        if any(marker in text for marker in ("<<<<<<<", "=======", ">>>>>>>")):
            errors.append(f"Merge-conflict marker found in {path.name}")
        if "</html>" not in text.lower():
            errors.append(f"Missing </html> in {path.name}")
        if "<title>" not in text.lower():
            errors.append(f"Missing <title> in {path.name}")
        if "dultenrichard.github.iohttps://" in text or "raw.githack.com/dultenrichardhttps://" in text:
            errors.append(f"Malformed URL in {path.relative_to(ROOT)}")
        if "/brand/" in text:
            errors.append(f"Unmigrated project-root URL in {path.relative_to(ROOT)}")
        legacy_redirect = "data-legacy-redirect" in text
        if not legacy_redirect and path.name != "404.html":
            if 'name="description"' not in text:
                errors.append(f"Missing meta description in {path.relative_to(ROOT)}")
            if 'rel="canonical"' not in text:
                errors.append(f"Missing canonical URL in {path.relative_to(ROOT)}")
            if "/privacy/" not in text:
                errors.append(f"Missing privacy link in {path.relative_to(ROOT)}")
        if "cloud.umami.is/script.js" in text:
            errors.append(f"Direct analytics loader found in {path.relative_to(ROOT)}; analytics must respect privacy controls in site.js")

        parser = LinkParser()
        parser.feed(text)
        for attr, value in parser.refs:
            target = local_target(path, value)
            if target is None:
                continue
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                errors.append(f"{path.name}: {attr} escapes repository: {value}")
                continue
            if not target.exists():
                errors.append(f"{path.name}: broken local {attr}: {value}")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    if 'dulten-richard-monogram.png" rel="icon"' not in index:
        errors.append("Production favicon is no longer the DR monogram.")

    if errors:
        print("Website validation failed:")
        for error in errors:
            print(f" - {error}")
        raise SystemExit(1)

    print("Website validation passed.")

if __name__ == "__main__":
    main()

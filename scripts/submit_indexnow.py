"""Notify IndexNow only after an approved public Pages deployment succeeds."""
from pathlib import Path
from urllib.request import urlopen, Request
from xml.etree import ElementTree
import json

ROOT = Path(__file__).resolve().parents[1]
HOST = "dultenrichard.github.io"
BASE = "https://" + HOST + "/"
KEY = "c8197b3d20805844987f1b06cde33623"


def main():
    key_file = ROOT / (KEY + ".txt")
    if key_file.read_text(encoding="utf-8").strip() != KEY:
        raise ValueError("IndexNow ownership key file mismatch")

    with urlopen(BASE + KEY + ".txt", timeout=20) as live:
        if live.read(512).decode("utf-8").strip() != KEY:
            raise RuntimeError("Published Pages host has not deployed the ownership key")

    sitemap = ElementTree.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [n.text for n in sitemap.findall(".//s:url/s:loc", ns) if n.text]
    if not urls or any(not u.startswith(BASE) for u in urls):
        raise ValueError("Sitemap contains missing or off-host URLs")

    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": BASE + KEY + ".txt",
        "urlList": urls,
    }
    req = Request(
        "https://api.indexnow.org/indexnow",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    with urlopen(req, timeout=30) as reply:
        print(f"IndexNow response {reply.status}; submitted {len(urls)} canonical URLs")


if __name__ == "__main__":
    main()

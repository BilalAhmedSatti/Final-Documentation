# -*- coding: utf-8 -*-
"""Print EMI pack home (index.html) to PDF with the same destinations as the HTML."""
from __future__ import annotations

import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
PRINT_HTML = ROOT / "index-print.html"
PDF = ROOT / "index.pdf"

PRINT_CSS = """
  @page { size: A4; margin: 12mm 11mm 14mm; }
  a[href] { color: #1e4e8c !important; text-decoration: underline; }
  .btn { text-decoration: none !important; }
  .role, .group a { text-decoration: none !important; }
  @media print {
    header.site {
      background: #0f2744 !important;
      color: #fff !important;
      padding: 22px 0 28px !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    header.site .lede, .notice { color: #d7e4f4 !important; }
    .btn, .stats { display: revert !important; }
    .stats { display: grid !important; }
    .cta { display: flex !important; }
    .btn-primary { background: #fff !important; color: #0f2744 !important; }
    .btn-ghost { color: #fff !important; border-color: rgba(255,255,255,0.4) !important; }
    .card, .stat, .role, .group { box-shadow: none; }
    a[href]::after { content: none !important; }
  }
"""


def chrome_path() -> str:
    candidates = [
        Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
        Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    ]
    for path in candidates:
        if path.exists():
            return str(path)
    raise SystemExit("Chrome or Edge not found for PDF print")


def resolve_href(href: str) -> str:
    href = href.strip()
    if not href or href.startswith(("#", "mailto:", "javascript:", "data:")):
        return href
    parsed = urlparse(href)
    if parsed.scheme in {"http", "https", "file"}:
        return href
    path_part, _, fragment = href.partition("#")
    target = (ROOT / path_part).resolve()
    uri = target.as_uri()
    if fragment:
        uri = f"{uri}#{fragment}"
    return uri


class LinkRewriter(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.parts: list[str] = []
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        rewritten: list[tuple[str, str | None]] = []
        for name, value in attrs:
            if name.lower() == "href" and value:
                resolved = resolve_href(value)
                self.hrefs.append(resolved)
                rewritten.append((name, resolved))
            else:
                rewritten.append((name, value))
        self.parts.append(self._start(tag, rewritten, False))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        rewritten: list[tuple[str, str | None]] = []
        for name, value in attrs:
            if name.lower() == "href" and value:
                resolved = resolve_href(value)
                self.hrefs.append(resolved)
                rewritten.append((name, resolved))
            else:
                rewritten.append((name, value))
        self.parts.append(self._start(tag, rewritten, True))

    def handle_endtag(self, tag: str) -> None:
        self.parts.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.parts.append(data)

    def handle_entityref(self, name: str) -> None:
        self.parts.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.parts.append(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        self.parts.append(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self.parts.append(f"<!{decl}>")

    @staticmethod
    def _start(tag: str, attrs: list[tuple[str, str | None]], self_close: bool) -> str:
        bits = [f"<{tag}"]
        for name, value in attrs:
            if value is None:
                bits.append(f" {name}")
            else:
                bits.append(f' {name}="{value}"')
        bits.append(" />" if self_close else ">")
        return "".join(bits)


def build_print_html() -> list[str]:
    source = SOURCE.read_text(encoding="utf-8")
    source = source.replace(
        "    .btn, .stats { display: none; }\n",
        "    .btn, .stats { display: revert; }\n",
    )
    source = source.replace("</style>", PRINT_CSS + "\n</style>", 1)
    parser = LinkRewriter()
    parser.feed(source)
    parser.close()
    PRINT_HTML.write_text("".join(parser.parts), encoding="utf-8")
    print(f"Wrote {PRINT_HTML} ({len(parser.hrefs)} links)")
    return parser.hrefs


def print_pdf() -> None:
    browser = chrome_path()
    html_uri = PRINT_HTML.resolve().as_uri()
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-pdf-header-footer",
        "--allow-file-access-from-files",
        f"--print-to-pdf={PDF}",
        html_uri,
    ]
    print("Printing:", " ".join(cmd))
    subprocess.run(cmd, check=True)
    if not PDF.exists() or PDF.stat().st_size < 5_000:
        raise SystemExit(f"PDF was not created or is too small: {PDF}")
    print(f"Wrote {PDF} ({PDF.stat().st_size:,} bytes)")


def uris_in_pdf(pdf: Path) -> list[str]:
    data = pdf.read_bytes()
    found = re.findall(rb"/URI\s*\((?:\\[\\()]|[^\\)])*\)|/URI\s*<([^>]+)>", data)
    # Also plain /URI (http...)
    text_uris = re.findall(rb"/URI\s*\((.*?)\)", data)
    decoded: list[str] = []
    for raw in text_uris:
        value = raw.decode("latin-1", errors="replace")
        value = value.replace("\\(", "(").replace("\\)", ")").replace("\\\\", "\\")
        decoded.append(value)
    for hex_uri in found:
        if hex_uri:
            try:
                decoded.append(bytes.fromhex(hex_uri.decode("ascii")).decode("utf-8"))
            except ValueError:
                pass
    # unique preserve order
    seen: set[str] = set()
    out: list[str] = []
    for item in decoded:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def main() -> None:
    hrefs = build_print_html()
    print_pdf()
    pdf_uris = uris_in_pdf(PDF)
    expected = [h for h in hrefs if h.startswith(("http://", "https://", "file://"))]
    missing = [h for h in expected if h not in pdf_uris]
    print(f"PDF link annotations: {len(pdf_uris)}")
    for uri in pdf_uris:
        print(" ", uri)
    if missing:
        print("Missing from PDF (Chrome may still resolve some):")
        for uri in missing:
            print(" ", uri)


if __name__ == "__main__":
    main()

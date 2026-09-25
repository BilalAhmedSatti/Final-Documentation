# -*- coding: utf-8 -*-
"""Render EMI markdown files as browser-preview HTML (Cursor-like reading view)."""
from __future__ import annotations

import os
import re
from pathlib import Path

import markdown

EMI = Path(__file__).resolve().parents[1]

DOCS = [
    EMI / "README.md",
    EMI / "00-executive-summary.md",
    EMI / "01-regulatory-landscape-and-emis.md",
    EMI / "02-sbp-emi-kyc-cdd-framework.md",
    EMI / "03-shared-ekyc-and-emi.md",
    EMI / "04-emi-benchmarks.md",
    EMI / "05-recommended-emi-kyc-process.md",
    EMI / "05a-emi-user-journey.md",
    EMI / "05b-emi-user-journeys-catalog.md",
    EMI / "06-architecture-and-services.md",
    EMI / "07-database-and-erd.md",
    EMI / "08-state-machine.md",
    EMI / "09-api-specification.md",
    EMI / "10-aml-risk-edd-ops.md",
    EMI / "11-security-fraud-audit.md",
    EMI / "12-sbp-compliance-mapping.md",
    EMI / "13-implementation-gaps-references.md",
    EMI / "14-srs.md",
    EMI / "15-use-cases.md",
    EMI / "appendices" / "A-regulatory-requirement-catalog.md",
    EMI / "appendices" / "B-comparative-emi-matrix.md",
]

MD = markdown.Markdown(
    extensions=["tables", "fenced_code", "sane_lists", "toc", "smarty"],
    extension_configs={"toc": {"permalink": False}},
)
MERMAID = re.compile(r"```mermaid\s*\n(.*?)```", re.S)
MD_HREF = re.compile(r'href="([^"]+?)\.md(#[^"]*)?"')


def rewrite_md_links(html: str) -> str:
    def sub(match: re.Match[str]) -> str:
        path, frag = match.group(1), match.group(2) or ""
        if path.startswith(("http://", "https://", "mailto:")):
            return match.group(0)
        return f'href="{path}.html{frag}"'

    return MD_HREF.sub(sub, html)


def strip_md_link_labels(html: str) -> str:
    return re.sub(r"(<a href=\"[^\"]+\.html(?:#[^\"]*)?\">)([^<]+)\.md(</a>)", r"\1\2\3", html)


def html_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def to_html(md_text: str) -> tuple[str, bool]:
    blocks: list[str] = []

    def keep(match: re.Match[str]) -> str:
        blocks.append(match.group(1).strip())
        return f"\n\n<!--MERMAID:{len(blocks) - 1}-->\n\n"

    prepared = MERMAID.sub(keep, md_text)
    MD.reset()
    body = MD.convert(prepared)
    for i, src in enumerate(blocks):
        rendered = f'<pre class="mermaid">{html_escape(src)}</pre>'
        body = body.replace(f"<p><!--MERMAID:{i}--></p>", rendered)
        body = body.replace(f"<!--MERMAID:{i}-->", rendered)
    return strip_md_link_labels(rewrite_md_links(body)), bool(blocks)


def rel(from_file: Path, to_file: Path) -> str:
    return Path(os.path.relpath(to_file, from_file.parent)).as_posix()


def page(src: Path, body: str, needs_mermaid: bool, index: int) -> str:
    title = src.stem.replace("-", " ")
    heading = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
    if heading:
        title = re.sub(r"<[^>]+>", "", heading.group(1))
    prev_html = next_html = ""
    if index > 0:
        prev = DOCS[index - 1]
        prev_html = f'<a href="{rel(src, prev.with_suffix(".html"))}">← {html_escape(prev.stem)}</a>'
    if index < len(DOCS) - 1:
        nxt = DOCS[index + 1]
        next_html = f'<a href="{rel(src, nxt.with_suffix(".html"))}">{html_escape(nxt.stem)} →</a>'
    mermaid_js = ""
    if needs_mermaid:
        mermaid_js = """
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>mermaid.initialize({ startOnLoad: true, theme: "neutral", darkMode: false, flowchart: { useMaxWidth: true }, er: { useMaxWidth: false } });</script>
"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html_escape(title)}</title>
<link rel="stylesheet" href="{rel(src, EMI / "assets" / "doc.css")}">
</head>
<body>
<nav class="top">
  <div class="top-inner">
    <a href="{rel(src, EMI / "index.html")}">EMI pack home</a>
    <span class="meta"><a href="{rel(src, EMI / "05c-emi-interactive-journeys.html")}">Journeys</a> · <a href="{src.name}">Source .md</a></span>
  </div>
</nav>
<article class="page markdown-body">
{body}
</article>
<div class="pager">{prev_html}<span></span>{next_html}</div>
<footer class="note">Rendered preview of {html_escape(src.name)}. Markdown remains the source of truth. Not legal advice.</footer>
{mermaid_js}
</body>
</html>
"""


def main() -> None:
    for i, src in enumerate(DOCS):
        body, mermaid = to_html(src.read_text(encoding="utf-8"))
        out = src.with_suffix(".html")
        out.write_text(page(src, body, mermaid, i), encoding="utf-8")
        print(f"Wrote {out.relative_to(EMI)}")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Build a print HTML of all KYC customer journeys, then print it to PDF."""
from __future__ import annotations

import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "05c-kyc-interactive-journeys.html"
PRINT_HTML = ROOT / "05c-kyc-journeys-print.html"
PDF = ROOT / "05c-kyc-customer-journeys.pdf"

FAMILY_NAMES = {
    "A": "Onboarding",
    "B": "Identity exceptions",
    "C": "ID and residency",
    "D": "Risk and decision",
    "E": "Lifecycle",
    "F": "Phase 2 summary",
}
KIND_COLORS = {
    "action": "#1e4e8c",
    "decision": "#8a5a00",
    "success": "#0f6b45",
    "fail": "#b42318",
    "wait": "#5b4aa8",
}
KIND_LABELS = {
    "action": "Action",
    "decision": "Decision",
    "success": "Success",
    "fail": "Fail / stop",
    "wait": "Wait",
}


def load_data() -> list[dict]:
    text = SOURCE.read_text(encoding="utf-8")
    match = re.search(r"const DATA=(\[.*?\]);\s*\n\s*const familyNames", text, re.S)
    if not match:
        raise SystemExit("Could not find DATA in 05c-kyc-interactive-journeys.html")
    return json.loads(match.group(1))


def esc(value: object) -> str:
    return html.escape(str(value or ""), quote=True)


def md_html(value: object) -> str:
    text = esc(value)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


def wrap(text: str, width: int = 26, max_lines: int = 2) -> list[str]:
    words = str(text or "").split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = (current + " " + word).strip()
        if len(trial) <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    if not lines:
        return [""]
    if len(lines) > max_lines:
        last = lines[max_lines - 1]
        if len(last) > width - 1:
            last = last[: width - 1]
        lines = lines[: max_lines - 1] + [last.rstrip(".,;:") + "…"]
    return lines


def layout(journey: dict) -> tuple[dict, int, int, int, int]:
    width, height, x_gap, y_gap, pad = 168, 44, 22, 16, 10
    indeg = {n["id"]: 0 for n in journey["nodes"]}
    for edge in journey["edges"]:
        if edge["to"] in indeg:
            indeg[edge["to"]] += 1
    levels: dict[str, int] = {}
    queue = [n["id"] for n in journey["nodes"] if indeg[n["id"]] == 0]
    for node_id in queue:
        levels[node_id] = 0
    guard = 0
    while queue and guard < 2000:
        guard += 1
        current = queue.pop(0)
        level = levels.get(current, 0)
        for edge in journey["edges"]:
            if edge["from"] != current:
                continue
            nxt = edge["to"]
            # First visit only — ignore back-edges so lockout/retry loops
            # cannot stretch the diagram across hundreds of pages.
            if nxt not in levels:
                levels[nxt] = level + 1
                queue.append(nxt)
    for i, node in enumerate(journey["nodes"]):
        if node["id"] not in levels:
            walk_i = journey["walk"].index(node["id"]) if node["id"] in journey["walk"] else i
            levels[node["id"]] = walk_i
    cols: dict[int, list[dict]] = {}
    for node in journey["nodes"]:
        cols.setdefault(levels[node["id"]], []).append(node)
    max_cols = max(len(row) for row in cols.values())
    pos: dict[str, dict[str, float]] = {}
    for col, row in cols.items():
        row_width = len(row) * width + (len(row) - 1) * x_gap
        full = max_cols * width + (max_cols - 1) * x_gap
        offset = max(0, (full - row_width) / 2)
        for i, node in enumerate(row):
            pos[node["id"]] = {
                "x": pad + offset + i * (width + x_gap),
                "y": pad + col * (height + y_gap),
            }
    max_x = max(p["x"] for p in pos.values()) + width + pad
    max_y = max(p["y"] for p in pos.values()) + height + pad
    return pos, width, height, int(max_x), int(max_y)


def svg_for(journey: dict) -> str:
    pos, w, h, max_x, max_y = layout(journey)
    walk_set = set(journey["walk"])
    width_mm = max_x * 25.4 / 96
    height_mm = max_y * 25.4 / 96
    if height_mm > 168:
        scale = 168 / height_mm
        width_mm *= scale
        height_mm = 168
    if width_mm > 186:
        scale = 186 / width_mm
        height_mm *= scale
        width_mm = 186
    marker = f"arr-{journey['id'].lower().replace('-', '')}"
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {max_x} {max_y}" '
        f'width="{width_mm:.1f}mm" height="{height_mm:.1f}mm" '
        f'preserveAspectRatio="xMidYMin meet" role="img" aria-label="{esc(journey["id"])} workflow">'
        f'<defs><marker id="{marker}" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">'
        '<path d="M0,0 L8,4 L0,8 z" fill="#8b9bb0"/></marker></defs>'
    ]
    for edge in journey["edges"]:
        a, b = pos.get(edge["from"]), pos.get(edge["to"])
        if not a or not b:
            continue
        x1, y1 = a["x"] + w / 2, a["y"] + h
        x2, y2 = b["x"] + w / 2, b["y"]
        cy = (y1 + y2) / 2
        parts.append(
            f'<path d="M{x1},{y1} C{x1},{cy} {x2},{cy} {x2},{y2}" '
            f'fill="none" stroke="#8b9bb0" stroke-width="1.4" marker-end="url(#{marker})"/>'
        )
        if edge.get("label"):
            mx, my = (x1 + x2) / 2, cy - 6
            parts.append(
                f'<text x="{mx}" y="{my}" text-anchor="middle" font-size="10" '
                f'fill="#5c6b80" font-family="Segoe UI, system-ui, sans-serif">{esc(edge["label"])}</text>'
            )
    for node in journey["nodes"]:
        p = pos[node["id"]]
        color = KIND_COLORS.get(node["kind"], "#1e4e8c")
        title_lines = wrap(node["label"], 26, 2)
        kind = KIND_LABELS.get(node["kind"], node["kind"])
        if node["id"] in walk_set:
            kind += " · main"
        text_y = 17 if len(title_lines) == 1 else 14
        title_svg = "".join(
            f'<text x="12" y="{text_y + i * 12}" font-size="11" font-weight="650" fill="#1a2332" '
            f'font-family="Segoe UI, system-ui, sans-serif">{esc(line)}</text>'
            for i, line in enumerate(title_lines)
        )
        kind_y = text_y + len(title_lines) * 12 + 2
        parts.append(
            f'<g transform="translate({p["x"]},{p["y"]})">'
            f'<rect x="0" y="0" width="{w}" height="{h}" rx="6" fill="#fff" stroke="#c3ccd8"/>'
            f'<rect x="0" y="0" width="4" height="{h}" rx="2" fill="{color}"/>'
            f"{title_svg}"
            f'<text x="12" y="{kind_y}" font-size="8" fill="#5c6b80" '
            f'font-family="Segoe UI, system-ui, sans-serif">{esc(kind.upper())}</text>'
            "</g>"
        )
    parts.append("</svg>")
    return "".join(parts)


def node_order(journey: dict) -> list[dict]:
    by_id = {n["id"]: n for n in journey["nodes"]}
    ordered: list[dict] = []
    seen: set[str] = set()
    for node_id in journey["walk"]:
        if node_id in by_id:
            ordered.append(by_id[node_id])
            seen.add(node_id)
    for node in journey["nodes"]:
        if node["id"] not in seen:
            ordered.append(node)
    return ordered


def next_labels(journey: dict, node_id: str) -> str:
    by_id = {n["id"]: n for n in journey["nodes"]}
    bits = []
    for edge in journey["edges"]:
        if edge["from"] != node_id:
            continue
        dest = by_id.get(edge["to"], {}).get("label", edge["to"])
        label = edge.get("label") or ""
        bits.append(f"{label} → {dest}" if label else dest)
    return "<br>".join(esc(b) for b in bits) if bits else "End of this branch"


def journey_html(journey: dict) -> str:
    family = FAMILY_NAMES.get(journey["family"], journey["family"])
    related = journey.get("related") or []
    related_html = ""
    if related:
        related_html = (
            '<div class="related"><b>Related</b> '
            + " · ".join(f'<a href="#{rid}">{esc(rid)}</a>' for rid in related)
            + "</div>"
        )
    rows = []
    walk_set = set(journey["walk"])
    for i, node in enumerate(node_order(journey), 1):
        path = "Main" if node["id"] in walk_set else "Branch"
        rows.append(
            "<tr>"
            f"<td>{i}</td>"
            f"<td><span class='dot {esc(node['kind'])}'></span>{md_html(node['label'])}"
            f"<div class='sub'>{esc(path)} · {esc(KIND_LABELS.get(node['kind'], node['kind']))}</div></td>"
            f"<td>{esc(node.get('state', ''))}</td>"
            f"<td>{md_html(node.get('customer', ''))}</td>"
            f"<td>{md_html(node.get('system', ''))}</td>"
            f"<td>{next_labels(journey, node['id'])}</td>"
            "</tr>"
        )
    return f"""
<article class="journey" id="{esc(journey['id'])}">
  <header>
    <p class="kicker">{esc(journey['id'])} · Family {esc(journey['family'])} {esc(family)}</p>
    <h2>{esc(journey['title'])}</h2>
    <p class="persona">{md_html(journey.get('persona', ''))} · {esc(journey.get('classTag', ''))}</p>
    <p class="why">{md_html(journey.get('why', ''))}</p>
    <div class="facts">
      <div><b>Trigger</b><span>{md_html(journey.get('trigger', ''))}</span></div>
      <div><b>Success</b><span>{md_html(journey.get('success', ''))}</span></div>
      <div><b>Alternate</b><span>{md_html(journey.get('alternate', ''))}</span></div>
    </div>
    {related_html}
  </header>
  <h3>Workflow</h3>
  <div class="flow">{svg_for(journey)}</div>
  <h3>Steps</h3>
  <table>
    <thead>
      <tr><th>#</th><th>Step</th><th>State</th><th>Customer sees / does</th><th>System does</th><th>Next</th></tr>
    </thead>
    <tbody>
      {''.join(rows)}
    </tbody>
  </table>
</article>
"""


def toc_html(data: list[dict]) -> str:
    blocks = []
    current = None
    items = []
    for j in data:
        if j["family"] != current:
            if items:
                blocks.append("<ul>" + "".join(items) + "</ul>")
                items = []
            current = j["family"]
            blocks.append(
                f"<h3>Family {esc(current)} — {esc(FAMILY_NAMES.get(current, ''))}</h3>"
            )
        items.append(
            f'<li><a href="#{esc(j["id"])}"><span>{esc(j["id"])}</span> {esc(j["title"])}</a>'
            f'<em>{esc(j.get("persona", ""))}</em></li>'
        )
    if items:
        blocks.append("<ul>" + "".join(items) + "</ul>")
    return "".join(blocks)


def build_html(data: list[dict]) -> str:
    journeys = "".join(journey_html(j) for j in data)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>KYC customer journeys — 38 workflows</title>
<style>
  :root {{
    --ink: #1a2332;
    --muted: #5c6b80;
    --line: #d8dee8;
    --accent: #1e4e8c;
    --bg: #f4f6f8;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    color: var(--ink);
    font: 11pt/1.45 "Segoe UI", system-ui, sans-serif;
  }}
  @page {{
    size: A4;
    margin: 14mm 12mm 16mm;
  }}
  .cover, .toc {{ page-break-after: always; }}
  .journey {{ page-break-before: always; }}
  .journey:first-of-type {{ page-break-before: auto; }}
  .cover {{
    min-height: 240mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 18mm 8mm 10mm;
  }}
  .cover h1 {{
    font-size: 32pt;
    letter-spacing: -0.03em;
    margin: 12px 0 8px;
    line-height: 1.15;
  }}
  .eyebrow {{
    color: var(--accent);
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 10pt;
  }}
  .lede {{ color: var(--muted); max-width: 140mm; }}
  .stats {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 22px 0;
  }}
  .stat {{
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 12px 14px;
    background: var(--bg);
  }}
  .stat b {{ display: block; font-size: 18pt; color: var(--accent); }}
  .stat span {{ color: var(--muted); font-size: 9pt; }}
  .legend {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 18px;
    font-size: 10pt;
    color: var(--muted);
  }}
  .legend i {{
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 2px;
    margin-right: 6px;
    vertical-align: middle;
  }}
  .toc {{ padding: 4mm 2mm; }}
  .toc h2 {{ margin: 0 0 8px; font-size: 18pt; }}
  .toc h3 {{
    margin: 14px 0 6px;
    font-size: 11pt;
    color: var(--accent);
    border-bottom: 1px solid var(--line);
    padding-bottom: 4px;
  }}
  .toc ul {{ list-style: none; margin: 0; padding: 0; }}
  .toc li {{
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
    border-bottom: 1px dotted #e6ebf2;
    font-size: 10pt;
  }}
  .toc a {{ color: var(--ink); text-decoration: none; }}
  .toc a span {{ font-weight: 650; color: var(--accent); margin-right: 8px; }}
  .toc em {{ color: var(--muted); font-style: normal; font-size: 9pt; }}
  .journey {{ padding: 0 1mm 8mm; }}
  .kicker {{
    margin: 0;
    color: var(--accent);
    font-weight: 650;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 9pt;
  }}
  .journey h2 {{ margin: 4px 0 2px; font-size: 18pt; letter-spacing: -0.02em; }}
  .persona, .why {{ margin: 4px 0; color: var(--muted); }}
  .why {{
    background: #e8f0fa;
    color: var(--ink);
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 10pt;
  }}
  .facts {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin: 8px 0;
  }}
  .facts div {{
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 6px 8px;
    background: var(--bg);
  }}
  .facts b {{
    display: block;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin-bottom: 4px;
  }}
  .facts span {{ font-size: 9.5pt; }}
  .related {{ font-size: 9.5pt; margin: 6px 0 10px; }}
  .related a {{ color: var(--accent); text-decoration: none; font-weight: 650; }}
  h3 {{
    margin: 12px 0 8px;
    font-size: 11pt;
    color: var(--accent);
  }}
  .flow {{
    overflow: hidden;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 6px 8px;
    text-align: center;
  }}
  .flow svg {{
    display: inline-block;
    max-width: 186mm;
    height: auto;
  }}
  tr {{ break-inside: avoid; page-break-inside: avoid; }}
  table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin-top: 4px;
  }}
  th, td {{
    border: 1px solid var(--line);
    padding: 6px 7px;
    vertical-align: top;
    text-align: left;
  }}
  th {{
    background: #e8f0fa;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--muted);
  }}
  td:nth-child(1) {{ width: 6mm; color: var(--muted); }}
  td:nth-child(2) {{ width: 32mm; }}
  td:nth-child(3) {{ width: 28mm; }}
  .sub {{ color: var(--muted); font-size: 7.5pt; margin-top: 2px; }}
  .dot {{
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 2px;
    margin-right: 6px;
    vertical-align: middle;
  }}
  .dot.action {{ background: #1e4e8c; }}
  .dot.decision {{ background: #8a5a00; }}
  .dot.success {{ background: #0f6b45; }}
  .dot.fail {{ background: #b42318; }}
  .dot.wait {{ background: #5b4aa8; }}
  .foot {{
    margin-top: 18px;
    font-size: 8.5pt;
    color: var(--muted);
  }}
</style>
</head>
<body>
<section class="cover">
  <div>
    <p class="eyebrow">Pakistan Conventional Digital Retail Bank</p>
    <h1>KYC customer journeys</h1>
    <p class="lede">All 38 customer-facing workflows from the KYC/CDD documentation pack. Each journey includes the flowchart, trigger / success / alternate, and every step with what the customer sees and what the system does.</p>
    <div class="stats">
      <div class="stat"><b>38</b><span>Customer journeys UJ-01 to UJ-38</span></div>
      <div class="stat"><b>6</b><span>Families: onboarding, identity, ID types, risk, lifecycle, Phase 2</span></div>
      <div class="stat"><b>Sep 2026</b><span>Research pack — not legal advice</span></div>
    </div>
    <div class="legend">
      <div><i style="background:#1e4e8c"></i>Action</div>
      <div><i style="background:#8a5a00"></i>Decision</div>
      <div><i style="background:#0f6b45"></i>Success</div>
      <div><i style="background:#b42318"></i>Fail / stop</div>
      <div><i style="background:#5b4aa8"></i>Wait</div>
      <div>Actors: customer on app/web only</div>
    </div>
  </div>
  <p class="foot">Source: 05b catalog and 05c interactive explorer. Tracking ID is shown in-app at Step 0; SMS only after OTP success. Confirm interpretations with Compliance and Legal before go-live. Fictional personas — no real PII.</p>
</section>
<section class="toc">
  <h2>Contents</h2>
  <p class="lede">Click a journey ID in a PDF viewer that supports internal links. Interactive version: 05c-kyc-interactive-journeys.html.</p>
  {toc_html(data)}
</section>
{journeys}
</body>
</html>
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


def print_pdf() -> None:
    browser = chrome_path()
    html_uri = PRINT_HTML.resolve().as_uri()
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF}",
        html_uri,
    ]
    print("Printing:", " ".join(cmd))
    subprocess.run(cmd, check=True)
    if not PDF.exists() or PDF.stat().st_size < 10_000:
        raise SystemExit(f"PDF was not created or is too small: {PDF}")
    print(f"Wrote {PDF} ({PDF.stat().st_size:,} bytes)")


def main() -> None:
    data = load_data()
    if len(data) != 38:
        print(f"Warning: expected 38 journeys, found {len(data)}", file=sys.stderr)
    PRINT_HTML.write_text(build_html(data), encoding="utf-8")
    print(f"Wrote {PRINT_HTML}")
    print_pdf()


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Build EMI interactive HTML from the digital-bank explorer shell + EMI DATA."""
from __future__ import annotations

import json
from pathlib import Path

EMI = Path(__file__).resolve().parents[1]
ROOT = EMI.parent
SHELL = ROOT / "05c-kyc-interactive-journeys.html"
DATA_JSON = Path(__file__).with_name("emi-journeys-data.json")
OUT = EMI / "05c-emi-interactive-journeys.html"

FAMILY_JS = """const familyNames = {
  A: "Core wallet",
  B: "Identity exceptions",
  C: "AML and tracking",
  D: "Lifecycle"
};
const FILTERS = [
  ["ALL", "All"],
  ["A", "A Core"],
  ["B", "B Identity"],
  ["C", "C AML"],
  ["D", "D Lifecycle"]
];"""

EXTRA_CSS = """
  .eyebrow {
    margin: 0 0 4px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 650;
    color: var(--accent);
  }
  .pack-links {
    margin: 8px 0 0;
    font-size: 12px;
  }
  .pack-links a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 650;
  }
  .pack-links a:hover { text-decoration: underline; }
"""

BRAND_OLD = """    <div class="brand">
      <h1>EMI wallet journeys</h1>
      <p>20 customer-facing paths for the EMI pack. Click a journey, then a step.</p>
    </div>"""

BRAND_NEW = """    <div class="brand">
      <p class="eyebrow">Pakistan EMI · Sep 2026</p>
      <h1>Wallet KYC journeys</h1>
      <p>20 customer-facing paths. Click a journey, then a step. Not legal advice.</p>
      <p class="pack-links"><a href="index.html">Pack home</a> · <a href="05c-emi-customer-journeys.pdf">PDF</a> · <a href="05b-emi-user-journeys-catalog.html">Catalog</a></p>
    </div>"""


def main() -> None:
    data = json.loads(DATA_JSON.read_text(encoding="utf-8"))
    if len(data) != 20:
        raise SystemExit(f"Expected 20 journeys, found {len(data)}")
    shell = SHELL.read_text(encoding="utf-8")
    shell = shell.replace("<title>KYC customer journeys</title>", "<title>EMI wallet KYC journeys</title>")
    shell = shell.replace(
        "<h1>KYC customer journeys</h1>\n      <p>38 customer-facing paths for the Conventional DRB pack. Click a journey, then a step.</p>",
        "<h1>EMI wallet journeys</h1>\n      <p>20 customer-facing paths for the EMI pack. Click a journey, then a step.</p>",
    )
    shell = shell.replace("flex: 0 0 48px;", "flex: 0 0 62px;")
    shell = shell.replace("Source: 05b catalog", "Source: EMI 05b catalog")
    if "</style>" not in shell:
        raise SystemExit("Could not inject explorer CSS")
    shell = shell.replace("</style>", EXTRA_CSS + "</style>", 1)
    if BRAND_OLD not in shell:
        raise SystemExit("Could not replace explorer brand block")
    shell = shell.replace(BRAND_OLD, BRAND_NEW, 1)
    ids = [j["id"] for j in data]
    if ids != [f"UJ-E{i:02d}" for i in range(1, 21)]:
        raise SystemExit(f"Unexpected journey IDs: {ids}")
    for j in data:
        node_ids = {n["id"] for n in j["nodes"]}
        missing = [w for w in j["walk"] if w not in node_ids]
        if missing:
            raise SystemExit(f"{j['id']} walk ids not in nodes: {missing}")
        for e in j["edges"]:
            if e["from"] not in node_ids or e["to"] not in node_ids:
                raise SystemExit(f"{j['id']} edge {e} points at missing node")

    data_js = "const DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    start = shell.find("const DATA=")
    end = shell.find("let family =")
    if start < 0 or end < 0:
        raise SystemExit("Could not find DATA / let family in explorer shell")
    shell = shell[:start] + data_js + ";\n\n" + FAMILY_JS + "\n\n" + shell[end:]
    shell = shell.replace('let current = "UJ-01";', 'let current = "UJ-E01";')
    # First-visit layout only so retry loops cannot stretch the diagram.
    old_layout = """    j.edges.filter((e) => e.from === a).forEach((e) => {
      if (levels[e.to] == null || levels[e.to] < lv + 1) levels[e.to] = lv + 1;
      if (!q.includes(e.to)) q.push(e.to);
    });"""
    new_layout = """    j.edges.filter((e) => e.from === a).forEach((e) => {
      if (levels[e.to] == null) {
        levels[e.to] = lv + 1;
        if (!q.includes(e.to)) q.push(e.to);
      }
    });"""
    if old_layout not in shell:
        raise SystemExit("Could not patch layout() cycle handling")
    shell = shell.replace(old_layout, new_layout, 1)
    OUT.write_text(shell, encoding="utf-8")
    print(f"Wrote {OUT} ({len(data)} journeys)")


if __name__ == "__main__":
    main()

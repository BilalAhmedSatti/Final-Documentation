const fs = require("fs");
const path = "e:/MYDBDoc/js/emi-enrich.js";
let s = fs.readFileSync(path, "utf8");

const extraStart = s.indexOf("  /* ── Extra EMI journeys");
const applyStart = s.indexOf("  function applyFlow");
if (extraStart < 0 || applyStart < 0) {
  console.error("markers not found", extraStart, applyStart);
  process.exit(1);
}

const before = s.slice(0, extraStart);
let after = s.slice(applyStart);

// Remove EXTRA append + nav + old overview text
after = after.replace(
  /  for \(const j of D\.journeys\) applyFlow\(j, FLOWS\[j\.id\]\);\n\n  \/\* Append EMI extras[\s\S]*$/m,
  `  for (const j of D.journeys) applyFlow(j, FLOWS[j.id]);

  // Drop any leftover E* pages from a previous load pattern
  D.journeys = D.journeys.filter((j) => !/^E\\d+/.test(j.id));
  D.nav = D.nav.filter((g) => g.id !== "emi-extras");
  for (const k of Object.keys(W)) {
    if (/^E\\d+/.test(k)) delete W[k];
  }

  if (W.overview) {
    W.overview.plain =
      "One wallet product. Nineteen named journeys (J1–J19). Every customer starts on the same hallway: open app → tracking ID on screen → prove phone → accept terms → identity + photo → safety checks → prove who they are → wait 2 hours → wallet number. Side paths (wrong OTP, refuse terms, one early credit, salary/remittance exceptions, business wallets later) are steps inside those journeys — not separate products.";
    W.overview.steps = [
      { label: "Open + tracking ID", note: "Case file starts", kind: "start" },
      { label: "Prove phone", note: "OTP — wrong code stays stuck", kind: "process" },
      { label: "Accept terms", note: "Must tick required boxes", kind: "process" },
      { label: "Identity + photo", note: "CNIC + live face", kind: "process" },
      { label: "Safety checks", note: "One wallet · sanctions · risk", kind: "decision" },
      { label: "Prove identity", note: "Fingerprint or Verisys", kind: "process" },
      { label: "Wait 2 hours", note: "Then wallet number", kind: "end" },
    ];
    W.overview.forks = [
      { if: "Wrong OTP", then: "Stay on phone step (part of J1) — never skip ahead" },
      { if: "Refuses required terms", then: "Cannot open — can save draft (J7) or stop (J8)" },
      { if: "Already has this EMI wallet", then: "J12 — log in to the existing one" },
      { if: "Sanctions hit", then: "J5 — hard stop" },
      { if: "Fingerprint works", then: "J1 — highest limits" },
      { if: "Fingerprint not possible", then: "J2 — lower limits until upgrade (J13)" },
      { if: "NADRA / lists down", then: "J11 — wait and retry, never fake success" },
    ];
  }
})();
`
);

s = before + after;
fs.writeFileSync(path, s);
console.log("removed EXTRA block, new length", s.length);

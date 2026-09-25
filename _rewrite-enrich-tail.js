const fs = require("fs");
const path = "e:/MYDBDoc/js/emi-enrich.js";
let s = fs.readFileSync(path, "utf8");

const apply = s.indexOf("  function applyFlow");
if (apply < 0) {
  console.error("applyFlow not found");
  process.exit(1);
}

const head = s.slice(0, apply);

const tail = `  function applyFlow(j, f) {
    if (!f) return;
    if (f.plain) j.plain = f.plain;
    if (f.analogy) j.analogy = f.analogy;
    if (f.flow) j.flow = f.flow;
    if (f.flowStages) j.flowStages = f.flowStages;
    if (f.remember) j.remember = f.remember;
    const uniqPush = (arr, extras) => {
      if (!extras?.length) return arr || [];
      const out = (arr || []).slice();
      for (const x of extras) if (!out.includes(x)) out.push(x);
      return out;
    };
    j.customerSteps = uniqPush(j.customerSteps, f.extraCustomer);
    j.opsControls = uniqPush(j.opsControls, f.extraOps);
    j.systemInvariants = uniqPush(j.systemInvariants, f.extraSystem);

    if (f.wf && W[j.id]) {
      const w = W[j.id];
      Object.assign(w, {
        label: f.wf.label || w.label,
        plain: f.plain || w.plain,
        when: f.wf.when || w.when,
        outcome: f.wf.outcome || w.outcome,
        tip: f.wf.tip || w.tip,
        steps: f.wf.steps || w.steps,
        forks: f.wf.forks || w.forks,
        walkthrough: f.wf.walkthrough || w.walkthrough,
      });
    }
  }

  for (const j of D.journeys) applyFlow(j, FLOWS[j.id]);

  // Keep only J1–J19. Extra detail is folded into those journeys.
  D.journeys = D.journeys.filter((j) => /^J\\d+$/.test(j.id));
  D.nav = D.nav.filter((g) => g.id !== "emi-extras");
  for (const k of Object.keys(W)) {
    if (/^E\\d+$/.test(k)) delete W[k];
  }

  if (W.overview) {
    W.overview.plain =
      "One wallet product. Nineteen named journeys (J1–J19). Every new customer walks the same hallway first. Side cases (wrong OTP, refuse terms, rare early credit, salary/remittance rules, business wallets later) are steps inside those journeys — not separate menu items.";
    W.overview.steps = [
      { label: "Open + tracking ID", note: "Case file starts", kind: "start" },
      { label: "Prove phone", note: "Wrong OTP stays here", kind: "process" },
      { label: "Accept terms", note: "Required boxes", kind: "process" },
      { label: "Identity + photo", note: "CNIC + live face", kind: "process" },
      { label: "Safety checks", note: "One wallet · lists · risk", kind: "decision" },
      { label: "Prove identity", note: "Fingerprint or Verisys", kind: "process" },
      { label: "Wait 2 hours", note: "Then wallet number", kind: "end" },
    ];
    W.overview.forks = [
      { if: "Wrong OTP", then: "Stay on phone step (inside J1)" },
      { if: "Refuses required terms", then: "Cannot open — draft J7 or stop J8" },
      { if: "Already has wallet", then: "J12 — log in" },
      { if: "Sanctions hit", then: "J5 — hard stop" },
      { if: "Fingerprint works", then: "J1" },
      { if: "Fingerprint not possible", then: "J2 then maybe J13" },
      { if: "Systems down", then: "J11 — wait, never fake success" },
    ];
  }
})();
`;

fs.writeFileSync(path, head + tail);
console.log("tail rewritten");

// Now fix E-refs inside FLOWS
s = fs.readFileSync(path, "utf8");
const swaps = [
  [
    '"Wrong OTP must not advance CONTACT_VERIFIED (see E06).",',
    '"Wrong OTP must not move the customer forward — they stay on the phone step.",',
  ],
  [
    '{ if: "Wrong OTP / lockout", then: "Stay INITIATED → E06" },\n          { if: "Mandatory consent declined", then: "Cannot issue → E18 (draft ≤ 30d)" },',
    '{ if: "Wrong OTP / lockout", then: "Stay on phone step — do not skip ahead" },\n          { if: "Refuses required terms", then: "Cannot open — save draft (J7) or stop (J8)" },',
  ],
  ['label: "J1 · Clean biometric (EMI+map spine)",', 'label: "J1 · Clean biometric",'],
  ['{ to: "E04", label: "One-credit flag path → E04" },', '{ to: "J8", label: "Early credit never verified → close + report (J8)" },'],
  [
    '"Prefer not enabling unverified_one_credit; if Legal enables it, hard timeout + STR on fail (E04).",',
    '"Best default: do not allow money in before KYC finishes. If Legal turns that on, unfinished KYC must close the wallet and file a report.",',
  ],
  [
    'forks: [{ if: "One-credit product flag ON", then: "See E04 — close+STR if never verified" }],',
    'forks: [{ if: "One early credit allowed before KYC", then: "If KYC never finishes → close wallet and report (J8)" }],',
  ],
  [
    "Also covers consent refusal outcomes and TAT breach notices (EMI UJ-E09 / UJ-E18).\",",
    'Also covers: customer refused required terms, or we missed the reply deadline.",',
  ],
  ['label: "J8 · Decline notice (EMI UJ-E09/E18)",', 'label: "J8 · Decline notice",'],
  [
    '{ if: "Mandatory consent only", then: "E18 — may save draft, not final decline yet" },',
    '{ if: "Only refused required terms so far", then: "May still save draft (J7) — not always a final decline" },',
  ],
  [
    '"KYC does not end at issuance: continuous screening, TMS, mule/structuring detection. Remittance and salary load exclusions (EMI UJ-E15/E16) — if SBP granted — change load math only, never turn off AML/TMS. See E15/E16.",',
    '"After the wallet is live, watching never stops. Sometimes salary or home remittance may not count toward the monthly load cap — only if the regulator allowed it — but fraud checks still run. Business wallets are a later phase.",',
  ],
  [
    '{ to: "E15", label: "Inward remittance exclusion → E15" },\n            { to: "E16", label: "Salary exclusion → E16" },',
    '{ to: "J13", label: "Needs stronger verify → J13" },',
  ],
  [
    '{ if: "SBP exclusion credits", then: "E15/E16 — still TMS" },',
    '{ if: "Salary or remittance special load rule", then: "May skip load math if allowed — fraud checks still on" },',
  ],
  ['{ to: "E15", label: "Later remittance exclusion → E15" },', '{ to: "J10", label: "Ongoing monitoring → J10" },'],
];

for (const [a, b] of swaps) {
  if (!s.includes(a)) console.warn("MISS:", JSON.stringify(a).slice(0, 90));
  else {
    s = s.split(a).join(b);
    console.log("ok");
  }
}

// Add folded stages into J3 and J10 if missing
if (!s.includes("Early credit before KYC finishes")) {
  const needle = `          branches: [
            { to: "J1", label: "Complete BV → J1 activate" },
            { to: "J2", label: "Complete Verisys pack → J2" },
            { to: "J8", label: "Early credit never verified → close + report (J8)" },
            { to: "J8", label: "Never completes → J8" },
          ],
        },
      ],
      remember: [`;
  const repl = `          branches: [
            { to: "J1", label: "Complete BV → J1 activate" },
            { to: "J2", label: "Complete Verisys pack → J2" },
            { to: "J8", label: "Never completes → J8" },
          ],
        },
        {
          stage: "3",
          title: "Early credit before KYC finishes (rare — usually OFF)",
          steps: [
            { label: "Product may allow ONE credit", note: "Before ID is finished", kind: "decision" },
            { label: "Customer finishes KYC in time", note: "Continue normal path", kind: "end" },
            { label: "KYC never finished", note: "Close wallet + file report", kind: "danger" },
          ],
          branches: [{ to: "J8", label: "Closed with clear reason → J8" }],
        },
      ],
      remember: [`;
  if (s.includes(needle)) {
    s = s.replace(needle, repl);
    console.log("added J3 early-credit stage");
  } else console.warn("J3 needle miss");
}

if (!s.includes("Salary or home remittance")) {
  const needle = `            { to: "J17", label: "Refresh due → J17" },
            { to: "J5", label: "True match later → J5" },
          ],
        },
      ],
      wf: {
        label: "J10 · Continuous monitoring",`;
  const repl = `            { to: "J17", label: "Refresh due → J17" },
            { to: "J5", label: "True match later → J5" },
          ],
        },
        {
          stage: "2",
          title: "Salary or home remittance (special load rules)",
          steps: [
            { label: "Already fingerprint-verified", note: "Not the low-limit path", kind: "start" },
            { label: "Regulator allowed special rule?", note: "If no → counts to monthly load", kind: "decision" },
            { label: "Salary or remittance credit", note: "Employer / approved path checked", kind: "process" },
            { label: "Credit posts", note: "Fraud checks still run", kind: "end" },
          ],
        },
        {
          stage: "3",
          title: "Business / merchant wallets (later phase)",
          steps: [
            { label: "Not these personal journeys", note: "Company docs + owners", kind: "process" },
            { label: "Longer review", note: "About 5 working days", kind: "pending" },
            { label: "One wallet per business", note: "With this EMI", kind: "end" },
          ],
        },
      ],
      wf: {
        label: "J10 · Continuous monitoring",`;
  if (s.includes(needle)) {
    s = s.replace(needle, repl);
    console.log("added J10 stages");
  } else console.warn("J10 needle miss");
}

// Soften J3 plain if still jargon-heavy
s = s.replace(
  /J3: \{\r?\n      plain:\r?\n        "Instrument may be opened[\s\S]*?STR\.",/,
  `J3: {
      plain:
        "Sometimes a file is opened but the customer still cannot spend until stronger checks finish. That is not the same as a normal low-limit wallet (J2). Rare option: allow one credit before KYC finishes — usually keep this OFF. If it is ON and KYC never finishes, close the wallet and file a report.",`
);

fs.writeFileSync(path, s);
const left = [...s.matchAll(/\bE0[46]\b|\bE1[5-8]\b|emi-extras|EXTRA\b/g)].map((m) => m[0]);
console.log("leftover:", left.length ? left : "none");
require("child_process").execSync("node --check " + path, { stdio: "inherit" });

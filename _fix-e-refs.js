const fs = require("fs");
const path = "e:/MYDBDoc/js/emi-enrich.js";
let s = fs.readFileSync(path, "utf8");

const swaps = [
  [
    '"Wrong OTP must not advance CONTACT_VERIFIED (see E06).",',
    '"Wrong OTP must not move the customer forward — they stay on the phone step.",',
  ],
  [
    '{ if: "Wrong OTP / lockout", then: "Stay INITIATED → E06" },\n          { if: "Mandatory consent declined", then: "Cannot issue → E18 (draft ≤ 30d)" },',
    '{ if: "Wrong OTP / lockout", then: "Stay on phone step — do not skip ahead" },\n          { if: "Refuses required terms", then: "Cannot open — save draft (J7) or stop (J8)" },',
  ],
  [
    'label: "J1 · Clean biometric (EMI+map spine)",',
    'label: "J1 · Clean biometric",',
  ],
  [
    '{ to: "E04", label: "One-credit flag path → E04" },',
    '{ to: "J8", label: "Early credit never verified → close + report (J8)" },',
  ],
  [
    '"Prefer not enabling unverified_one_credit; if Legal enables it, hard timeout + STR on fail (E04).",',
    '"Best default: do not allow money in before KYC finishes. If Legal turns that on, unfinished KYC must close the wallet and file a report.",',
  ],
  [
    'forks: [{ if: "One-credit product flag ON", then: "See E04 — close+STR if never verified" }],',
    'forks: [{ if: "One early credit allowed before KYC", then: "If KYC never finishes → close wallet and report (same stop as J8)" }],',
  ],
  [
    'Also covers consent refusal outcomes and TAT breach notices (EMI UJ-E09 / UJ-E18).",',
    'Also covers: customer refused required terms, or we missed the reply deadline.",',
  ],
  [
    'label: "J8 · Decline notice (EMI UJ-E09/E18)",',
    'label: "J8 · Decline notice",',
  ],
  [
    '{ if: "Mandatory consent only", then: "E18 — may save draft, not final decline yet" },',
    '{ if: "Only refused required terms so far", then: "May still save draft (J7) — not always a final decline" },',
  ],
  [
    '"KYC does not end at issuance: continuous screening, TMS, mule/structuring detection. Remittance and salary load exclusions (EMI UJ-E15/E16) — if SBP granted — change load math only, never turn off AML/TMS. See E15/E16.",',
    '"After the wallet is live, watching never stops (lists, odd cash patterns). Sometimes salary or home remittance may not count toward the monthly load cap — only if the regulator allowed it — but fraud checks still run. Business/merchant wallets are a later phase, not these personal journeys.",',
  ],
  [
    '{ to: "E15", label: "Inward remittance exclusion → E15" },\n            { to: "E16", label: "Salary exclusion → E16" },',
    '{ to: "J13", label: "Needs stronger verify / higher band → J13" },',
  ],
  [
    '{ if: "SBP exclusion credits", then: "E15/E16 — still TMS" },',
    '{ if: "Salary or remittance special load rule", then: "May skip load math if regulator allowed — fraud checks still on" },',
  ],
  [
    '{ to: "E15", label: "Later remittance exclusion → E15" },',
    '{ to: "J10", label: "After upgrade — ongoing monitoring (J10)" },',
  ],
];

for (const [a, b] of swaps) {
  if (!s.includes(a)) {
    console.warn("MISS:", a.slice(0, 80));
  } else {
    s = s.split(a).join(b);
    console.log("ok:", a.slice(0, 50));
  }
}

// Enrich J3 with a plain-English "early credit" stage if not present
if (!s.includes("Early credit before KYC finishes")) {
  s = s.replace(
    `branches: [
            { to: "J1", label: "Complete BV → J1 activate" },
            { to: "J2", label: "Complete Verisys pack → J2" },
            { to: "J8", label: "Early credit never verified → close + report (J8)" },
            { to: "J8", label: "Never completes → J8" },
          ],
        },
      ],
      remember: [
        "Debit-blocked ≠ spendable Verisys 50k wallet.",
        "Best default: do not allow money in before KYC finishes. If Legal turns that on, unfinished KYC must close the wallet and file a report.",
      ],`,
    `branches: [
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
      remember: [
        "Opened-but-blocked is not the same as a normal low-limit wallet (J2).",
        "Best default: do not allow money in before KYC finishes. If Legal turns that on, unfinished KYC must close the wallet and file a report.",
      ],`
  );
}

// Enrich J10 with salary/remittance stage
if (!s.includes("Salary or home remittance")) {
  s = s.replace(
    `branches: [
            { to: "J13", label: "Needs stronger verify / higher band → J13" },
            { to: "J17", label: "Refresh due → J17" },
            { to: "J5", label: "True match later → J5" },
          ],
        },
      ],
      wf: {
        label: "J10 · Continuous monitoring",`,
    `branches: [
            { to: "J13", label: "Needs stronger verify / higher band → J13" },
            { to: "J17", label: "Refresh due → J17" },
            { to: "J5", label: "True match later → J5" },
          ],
        },
        {
          stage: "2",
          title: "Salary or home remittance (special load rules)",
          steps: [
            { label: "Wallet already fingerprint-verified", note: "Not the low-limit path", kind: "start" },
            { label: "Regulator allowed exclusion?", note: "If no → counts to monthly load", kind: "decision" },
            { label: "Salary: employer checked", note: "Or remittance via approved path", kind: "process" },
            { label: "Credit posts", note: "Fraud checks still run", kind: "end" },
          ],
        },
        {
          stage: "3",
          title: "Business / merchant wallets (later phase)",
          steps: [
            { label: "Not these personal journeys", note: "Company docs + owners", kind: "process" },
            { label: "Longer review time", note: "About 5 working days", kind: "pending" },
            { label: "One wallet per business", note: "With this EMI", kind: "end" },
          ],
        },
      ],
      wf: {
        label: "J10 · Continuous monitoring",`
  );
}

// Soften J3 plain
s = s.replace(
  /J3: \{\n      plain:\n        "[^"]+",/,
  `J3: {
      plain:
        "Sometimes a file is opened but the customer still cannot spend until stronger checks finish. That is not the same as a normal low-limit wallet (J2). Rare option: allow one credit before KYC finishes — usually keep this OFF. If it is ON and KYC never finishes, close the wallet and file a report.",`
);

// Fix leftover overview if old text still there
s = s.replace(
  /EMI recommended hallway:[\s\S]*?E04\/E06\/E15–E18\."/,
  'One wallet product. Nineteen journeys (J1–J19). Side cases (wrong OTP, refuse terms, early credit, salary/remittance rules, business wallets later) live inside those journeys — not as separate codes."'
);
s = s.replace(
  '{ if: "OTP fails", then: "E06 — never skip CONTACT_VERIFIED" },',
  '{ if: "OTP fails", then: "Stay on phone step (inside J1) — never skip ahead" },'
);

fs.writeFileSync(path, s);

// Verify no E-codes left as journey links
const left = [...s.matchAll(/\bE0[46]\b|\bE1[5-8]\b/g)].map((m) => m[0] + " @" + m.index);
console.log("remaining E refs:", left.length ? left : "none");
require("child_process").execSync("node --check " + path, { stdio: "inherit" });

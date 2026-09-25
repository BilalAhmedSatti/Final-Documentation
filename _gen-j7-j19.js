/**
 * Upgrade beginner overlays + interactive workflows for J7–J19 from the live map.
 */
const fs = require("fs");
const MAP = JSON.parse(fs.readFileSync("e:/MYDBDoc/js/_map-journeys.json", "utf8"));

function stagesFor(id, s) {
  const enter = { label: "Enters here", note: (s.from || "").slice(0, 42), kind: "start" };
  const commonEnd = [
    { label: "Outcome", note: (s.outcome || "").slice(0, 40), kind: "end" },
  ];
  const templates = {
    J7: [
      {
        stage: "1",
        title: "Pause mid-application (map: any point after APPLICATION_STARTED)",
        steps: [
          { label: "APPLICATION_STARTED", note: "Tracking ID exists", kind: "db" },
          { label: "Customer pauses", note: "Leaves the app", kind: "start" },
          { label: "Server keeps state", note: "Not phone gallery", kind: "db" },
        ],
      },
      {
        stage: "2",
        title: "Resume within 30 days",
        steps: [
          { label: "Return ≤ 30 days", note: "2FA again", kind: "process" },
          { label: "Re-check safety", note: "Device · lists · freshness", kind: "process" },
          { label: "Continue spine", note: "Same tracking ID", kind: "end" },
        ],
        branches: [
          { to: "J9", label: "Device unbound → treat as J9" },
          { to: "J8", label: "After 30 days → new application" },
        ],
      },
    ],
    J8: [
      {
        stage: "1",
        title: "Terminal negative from any journey",
        steps: [
          enter,
          { label: "Internal reason code", note: "Compliance catalogue", kind: "db" },
          { label: "Customer notice EN/UR", note: "Specific · no tip-off", kind: "process" },
          { label: "DECLINED", note: "Tracking ID still works", kind: "danger" },
        ],
        branches: [
          { to: "J5", label: "From J5 true match" },
          { to: "J6", label: "From J6 EDD fail" },
          { to: "J4", label: "From J4 incomplete" },
        ],
      },
    ],
    J9: [
      {
        stage: "1",
        title: "After wallet exists — new unbound device",
        steps: [
          { label: "WALLET_ACTIVE", note: "Existing customer", kind: "start" },
          { label: "New device login", note: "Not yet trusted", kind: "decision" },
          { label: "NADRA BV", note: "In-app biometric", kind: "process" },
          { label: "Notify old channels", note: "SMS + email", kind: "process" },
          { label: "Cool 2 hours", note: "BPRD 04", kind: "pending" },
          { label: "Device trusted", note: "Manage devices", kind: "end" },
        ],
        branches: [
          { to: "J14", label: "Contact/password change is J14" },
          { to: "J10", label: "Fraud pattern → J10" },
        ],
      },
    ],
    J10: [
      {
        stage: "1",
        title: "After issuance — list update / TMS / periodic",
        steps: [
          { label: "WALLET_ACTIVE", note: "Or DEBIT_BLOCKED", kind: "start" },
          { label: "Trigger", note: "List · TMS · payment", kind: "process" },
          { label: "MONITORING_HOLD", note: "Fail closed", kind: "pending" },
          { label: "Investigate", note: "No tip-off", kind: "process" },
          { label: "CLEAR or STR", note: "Resume · or exit", kind: "end" },
        ],
        branches: [
          { to: "J16", label: "Confirmed TFS/exit → J16" },
          { to: "J8", label: "Exit path may use J8 wording" },
          { to: "J17", label: "Not the same as CDD refresh (J17)" },
        ],
      },
    ],
    J11: [
      {
        stage: "1",
        title: "Any provider call fails closed",
        steps: [
          { label: "Call provider", note: "NADRA · lists · OTP", kind: "start" },
          { label: "Timeout / stub", note: "Never auto-APPROVED", kind: "danger" },
          { label: "PENDING / UNAVAILABLE", note: "Queue retry", kind: "pending" },
          { label: "Resume or J8", note: "If TAT expires", kind: "end" },
        ],
        branches: [
          { to: "J7", label: "Retry via resume (J7)" },
          { to: "J8", label: "Cannot complete CDD → J8" },
          { to: "J5", label: "Hit ≠ timeout (J5)" },
        ],
      },
    ],
    J12: [
      {
        stage: "1",
        title: "Spine uniqueness gate",
        steps: [
          { label: "CNIC known", note: "Spine step 7", kind: "start" },
          { label: "Already active?", note: "EMI 12.VII", kind: "decision" },
          { label: "Authenticated?", note: "Session present?", kind: "decision" },
          { label: "Path · Existing", note: "Login / J9", kind: "end" },
          { label: "Path · Generic", note: "No enumeration", kind: "end" },
        ],
        branches: [
          { to: "J9", label: "Lost access → J9 recovery" },
          { to: "J16", label: "CNIC free only after J16 policy" },
          { to: "J15", label: "Minor ≠ second guardian wallet" },
        ],
      },
    ],
    J13: [
      {
        stage: "1",
        title: "After wallet exists — higher band request",
        steps: [
          { label: "WALLET_ACTIVE", note: "Lower band today", kind: "start" },
          { label: "Upgrade request", note: "Or later BV", kind: "process" },
          { label: "Re-verify ID", note: "BV / Annexure-J", kind: "process" },
          { label: "Re-screen + CRP", note: "Moment 2", kind: "decision" },
          { label: "Cool 2 hours", note: "Old band meantime", kind: "pending" },
          { label: "LIMITS_UPDATED", note: "Or stay / J8", kind: "end" },
        ],
        branches: [
          { to: "J6", label: "CRP high on upgrade → J6" },
          { to: "J11", label: "Provider down → J11" },
          { to: "J8", label: "Upgrade CDD fails → J8" },
          { to: "J19", label: "Till BV may open J13 case" },
        ],
      },
    ],
    J14: [
      {
        stage: "1",
        title: "After wallet exists — mobile / email / password",
        steps: [
          { label: "Registered device", note: "Required start", kind: "start" },
          { label: "NADRA BV", note: "Or listed alternate", kind: "process" },
          { label: "OTP / pairing", note: "New mobile", kind: "process" },
          { label: "Notify old channels", note: "SMS + email", kind: "process" },
          { label: "Cool 2 hours", note: "Old value still live", kind: "pending" },
          { label: "CREDENTIAL_UPDATED", note: "Change live", kind: "end" },
        ],
        branches: [
          { to: "J9", label: "New phone is J9 (may fire together)" },
          { to: "J10", label: "Fraud pattern → J10" },
          { to: "J11", label: "BV timeout → J11" },
        ],
      },
    ],
    J15: [
      {
        stage: "1",
        title: "Inside guardian’s already-verified app",
        steps: [
          { label: "Guardian WALLET_ACTIVE", note: "Authenticated app", kind: "start" },
          { label: "Child ID + link", note: "B-Form / juvenile", kind: "process" },
          { label: "Screen both", note: "Hit either → J5", kind: "decision" },
          { label: "Band choice", note: "50k or BV 400k", kind: "process" },
          { label: "Undertaking", note: "Liability signed", kind: "db" },
          { label: "MINOR_LINKED", note: "Cool-off then live", kind: "end" },
        ],
        branches: [
          { to: "J5", label: "Hit on either → J5" },
          { to: "J8", label: "CDD fails → J8" },
          { to: "J1", label: "Do not reuse adult J1 for child" },
        ],
      },
    ],
    J16: [
      {
        stage: "1",
        title: "Close / redeem / release CNIC",
        steps: [
          { label: "Close request", note: "Or unverified / TFS", kind: "start" },
          { label: "Redeem path", note: "Cash BV · or IBFT 2FA", kind: "decision" },
          { label: "Pay at par", note: "No redemption fee", kind: "db" },
          { label: "WALLET_CLOSED", note: "10-yr retain", kind: "end" },
        ],
        branches: [
          { to: "J12", label: "Uniqueness / re-open policy" },
          { to: "J19", label: "Not the same as live cash (J19)" },
          { to: "J10", label: "TFS exit from monitoring" },
        ],
      },
    ],
    J17: [
      {
        stage: "1",
        title: "Periodic CDD / expired CNIC refresh",
        steps: [
          { label: "Refresh due", note: "Expiry · change · review", kind: "start" },
          { label: "Notify customer", note: "In-app + SMS", kind: "process" },
          { label: "Upload renewed ID", note: "Live capture", kind: "process" },
          { label: "Re-screen", note: "Moment 3", kind: "decision" },
          { label: "CDD_CURRENT", note: "Or OVERDUE restrict", kind: "end" },
        ],
        branches: [
          { to: "J10", label: "New hit → J10" },
          { to: "J13", label: "Also a band change → J13" },
          { to: "J6", label: "CRP becomes high → J6" },
          { to: "J11", label: "NADRA down → J11" },
        ],
      },
    ],
    J18: [
      {
        stage: "1",
        title: "National-data capture when ID ≠ resident CNIC",
        steps: [
          { label: "Select ID class", note: "NICOP/POC/ARC/POR", kind: "start" },
          { label: "Extra residency fields", note: "Table-A tax etc.", kind: "process" },
          { label: "BV or Verisys?", note: "NRP abroad exception", kind: "decision" },
          { label: "Same spine gates", note: "Screen · risk · activate", kind: "process" },
          { label: "Wallet / J8", note: "Or passport → J4", kind: "end" },
        ],
        branches: [
          { to: "J2", label: "NRP/POC abroad Verisys → J2" },
          { to: "J4", label: "Passport-only → J4 F2F" },
          { to: "J12", label: "NICOP vs CNIC uniqueness open" },
        ],
      },
    ],
    J19: [
      {
        stage: "1",
        title: "Live wallet cash-in / cash-out (not closure)",
        steps: [
          { label: "WALLET_ACTIVE", note: "At channel", kind: "start" },
          { label: "Cash-in", note: "Till BV required", kind: "process" },
          { label: "ATM cash-out", note: "2FA required", kind: "process" },
          { label: "CASH_PENDING", note: "Await proof", kind: "pending" },
          { label: "CASH_POSTED", note: "At par", kind: "end" },
        ],
        branches: [
          { to: "J13", label: "Verisys + till BV → also J13 upgrade" },
          { to: "J10", label: "TMS / mule → J10" },
          { to: "J11", label: "BVS timeout → J11" },
          { to: "J16", label: "Closure redeem is J16" },
        ],
      },
    ],
  };
  return templates[id] || [
    {
      stage: "1",
      title: s.title,
      steps: [enter, ...commonEnd],
    },
  ];
}

function flowFor(id, s) {
  const stages = stagesFor(id, s);
  const flat = [];
  for (const st of stages) {
    for (const step of st.steps || []) flat.push(step);
  }
  return flat.slice(0, 8);
}

const beginner = {};
const workflows = {};
for (const [key, s] of Object.entries(MAP)) {
  const id = s.num; // J7 etc
  if (["J1", "J2", "J3", "J4", "J5", "J6"].includes(id)) continue;

  beginner[id] = {
    plain: `${s.outcome} ${s.summary}`.slice(0, 420),
    analogy: `Map short: ${s.short}. Enters at: ${s.from}`,
    flow: flowFor(id, s),
    flowStages: stagesFor(id, s),
    remember: [
      `Map: ${s.num} · ${s.short}.`,
      `Enters at: ${s.from}`,
      s.open ? `Open question: ${s.open}` : "Keep tracking ID and written reasons.",
      `Actors: ${s.actors}`,
    ].filter(Boolean),
  };

  workflows[id] = {
    id,
    label: `${id} · ${s.short}`,
    plain: beginner[id].plain,
    when: s.from,
    outcome: s.outcome,
    tip: s.open || s.regs,
    related: id,
    steps: flowFor(id, s),
    forks: (beginner[id].flowStages[0].branches || []).map((b) => ({
      if: b.label.split("→")[0].trim(),
      then: b.label,
    })),
    walkthrough: [
      { n: "1", title: "Enters at", text: s.from },
      { n: "2", title: "Customer", text: (s.customer || []).slice(0, 2).join(" ") },
      { n: "3", title: "Operations", text: (s.ops || []).slice(0, 2).join(" ") },
      { n: "4", title: "System", text: (s.system || []).slice(0, 2).join(" ") },
    ],
  };
}

fs.writeFileSync(
  "e:/MYDBDoc/js/_generated-j7-j19.json",
  JSON.stringify({ beginner, workflows }, null, 2)
);
console.log("generated", Object.keys(beginner).join(","));

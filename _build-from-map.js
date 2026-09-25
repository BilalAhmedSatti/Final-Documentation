const fs = require("fs");
const MAP = JSON.parse(fs.readFileSync("e:/MYDBDoc/js/_map-journeys.json", "utf8"));

const header = `/**
 * Synced from https://kyc-journey-map.vercel.app/assets/data.js
 * Fills every journey with full Customer / Operations / System detail from the live map.
 */
(function () {
  const D = window.KYC_DATA;
  if (!D?.journeys) return;

  const MAP = `;

const footer = `;

  const NAV_SHORT = {
    J1: "Clean biometric",
    J2: "Listed reason, then Verisys",
    J3: "Opened, cannot spend",
    J4: "Video KYC / partner / decline",
    J5: "Hard stop · no wallet",
    J6: "Extra evidence + approval",
    J7: "Same tracking ID",
    J8: "Tracking ID still works",
    J9: "BV · notify · cooling-off",
    J10: "KYC does not end at issuance",
    J11: "Never auto-approve",
    J12: "One wallet per EMI",
    J13: "Verisys → BV → enhanced",
    J14: "BV · notify · cooling-off",
    J15: "Opened inside guardian’s app",
    J16: "Par value · BV for cash",
    J17: "Refresh identity data",
    J18: "Digital IDs other than CNIC",
    J19: "BV at the till · 2FA at ATM",
  };

  for (const j of D.journeys) {
    const s = MAP[j.id.toLowerCase()];
    if (!s) continue;

    j.title = s.short || s.title;
    j.story = s.summary;
    j.summary = s.outcome;
    j.entersAt = s.from;
    j.trigger = s.from;
    j.outcome = s.outcome;
    j.actors = s.actors;
    j.rules = s.regs;
    j.timeLimits = s.time;
    j.openQuestion = s.open;
    j.whyItExists = s.summary;
    j.customerSteps = s.customer.slice();
    j.opsControls = s.ops.slice();
    j.systemInvariants = s.system.slice();
    j.regulatory = String(s.regs)
      .split(/\s*·\s*/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (s.group) j.group = s.group;
    if (s.color) j.color = s.color;
  }

  for (const g of D.nav || []) {
    for (const it of g.items || []) {
      if (NAV_SHORT[it.page]) it.label = NAV_SHORT[it.page];
    }
  }
})();
`;

fs.writeFileSync(
  "e:/MYDBDoc/js/from-map.js",
  header + JSON.stringify(MAP, null, 2) + footer
);
console.log("wrote from-map.js", fs.statSync("e:/MYDBDoc/js/from-map.js").size);

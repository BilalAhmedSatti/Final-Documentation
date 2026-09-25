/**
 * EMI pack enrichment — flows + missing detail from
 * KYC Documentation/EMI (05a, 05b, emi-journeys-data.json).
 * Runs after data.js, from-map.js, simple-content.js, workflows.js.
 */
(function () {
  const D = window.KYC_DATA;
  const W = window.KYC_WORKFLOWS;
  if (!D?.journeys || !W) return;

  /* ── Shared spine: EMI recommended screen order ── */
  D.bigPictureFlow = [
    { label: "Open wallet", note: "App or web", kind: "start" },
    { label: "Tracking ID", note: "On screen first\n(not SMS yet)", kind: "db" },
    { label: "Mobile OTP", note: "2FA · PTA mobile", kind: "process" },
    { label: "SMS Tracking ID", note: "Only after OTP", kind: "process" },
    { label: "Consents + fees", note: "EN/UR · marketing off", kind: "process" },
    { label: "Identity + photo", note: "Table-A ∪ EMI 12\nLive CNIC + face", kind: "process" },
    { label: "Screen + verify", note: "TFS then Verisys/BV", kind: "decision" },
    { label: "Cool 2 hours", note: "Then wallet number", kind: "pending" },
    { label: "Wallet live", note: "limit_tier set", kind: "end" },
  ];

  D.spineFlow = [
    { label: "0 Open", note: "Tracking ID\non screen", kind: "start" },
    { label: "1 OTP", note: "2FA · no skip\non wrong OTP", kind: "process" },
    { label: "2 SMS", note: "Tracking ID\nout-of-band", kind: "process" },
    { label: "3 Consent", note: "T&Cs · NADRA\nfees · EN/UR", kind: "process" },
    { label: "4 Identity", note: "Table-A + 2\nextra fields", kind: "process" },
    { label: "5 Live photo", note: "≠ NADRA BV", kind: "process" },
    { label: "6 Duplicate?", note: "One CNIC\n→ J12", kind: "decision" },
    { label: "7 Sanctions", note: "Fail closed\n→ J5 / J11", kind: "decision" },
    { label: "8 Risk", note: "HIGH → J6", kind: "decision" },
    { label: "9 Verify", note: "BV or Verisys\nladder", kind: "process" },
  ];

  D.activationFlow = [
    { label: "§12 verified", note: "Verisys or BV", kind: "process" },
    { label: "Pre-screen clear", note: "UNSC + ATA + PEP", kind: "process" },
    { label: "CDD complete", note: "Consents + fields", kind: "process" },
    { label: "EDD if HIGH", note: "J6 approved", kind: "decision" },
    { label: "2-hour cool-off", note: "BPRD 04", kind: "pending" },
    { label: "Issue instrument", note: "limit_tier set\nnumber late", kind: "end" },
  ];

  D.auditStoryFlow = [
    { label: "Tracking ID", note: "Case file opens\n(not a wallet yet)", kind: "db" },
    { label: "Evidence in", note: "Consent · CNIC\n· live photo", kind: "process" },
    { label: "Sanctions", note: "Clear · hit\nor wait", kind: "decision" },
    { label: "Risk rating", note: "Low/Med or\nextra checks", kind: "decision" },
    { label: "Prove identity", note: "Fingerprint\nor Verisys", kind: "process" },
    { label: "Cool 2 hours", note: "Money still\nblocked", kind: "pending" },
    { label: "Wallet number", note: "Late · full trail", kind: "end" },
  ];

  function kindFrom(nodeKind) {
    if (nodeKind === "success") return "end";
    if (nodeKind === "fail") return "danger";
    if (nodeKind === "wait") return "pending";
    if (nodeKind === "decision") return "decision";
    if (nodeKind === "action") return "process";
    return "process";
  }

  function step(label, note, kind) {
    return { label, note, kind: kind || "process" };
  }

  /** Rich beginner + workflow overlays keyed by journey id */
  const FLOWS = {
    J1: {
      plain:
        "Clean biometric onboarding: resident CNIC, first device. Capture → gates → NADRA BV → activation → 2-hour cooling-off → WALLET_ACTIVE at biometric band (commercial PKR 400,000; pilot often PKR 200,000 via licence_phase). Tracking ID appears in-app before OTP; SMS Tracking ID only after OTP. Live photo / liveness is not NADRA BV. Wallet number is late — not a bank CIF.",
      analogy:
        "Full driving licence after the normal test — strongest proof, highest limits. The licence number is printed only after every check and the waiting period.",
      flow: [
        step("Open wallet", "App / web", "start"),
        step("Tracking ID", "On screen · no SMS yet", "db"),
        step("Mobile OTP", "2FA · PTA mobile", "process"),
        step("SMS Tracking ID", "After OTP only", "process"),
        step("Consents + fees", "EN/UR · marketing off", "process"),
        step("Identity + Table-A", "EMI 12 + 2 extras", "process"),
        step("Live photo", "≠ BV", "process"),
        step("Gates", "Dup · TFS · CRP", "decision"),
        step("NADRA BV", "Primary remote", "process"),
        step("Cool 2h", "BPRD 04", "pending"),
        step("WALLET_ACTIVE · BV", "400k / pilot 200k", "end"),
      ],
      flowStages: [
        {
          stage: "0–3",
          title: "Open · Tracking ID · OTP · Consent (EMI Step 0–2)",
          steps: [
            step("Open wallet", "Creates application\nNot a bank CIF", "start"),
            step("Tracking ID on screen", "Copyable · no SMS yet", "db"),
            step("Mobile OTP · 2FA", "Wrong OTP never\nskips CONTACT_VERIFIED", "process"),
            step("SMS Tracking ID", "First out-of-band\nafter OTP success", "process"),
            step("Consents + fees", "T&Cs · privacy · NADRA/BV\nMarketing off by default", "process"),
          ],
          branches: [
            { to: "J7", label: "Leaves mid-way → save & resume (J7)" },
            { to: "J8", label: "Gives up / refused → clear stop (J8)" },
          ],
        },
        {
          stage: "OTP & terms (same journey — not a separate product)",
          title: "If phone code fails, or required terms are refused",
          steps: [
            step("Wrong OTP", "Stay on this step\nShow tries left", "danger"),
            step("Too many fails", "Cool-down timer", "pending"),
            step("Change number", "Start OTP again", "process"),
            step("Refuse required terms", "Cannot continue", "danger"),
            step("Optional: save draft", "Come back ≤ 30 days (J7)", "pending"),
          ],
        },
        {
          stage: "4–6",
          title: "Identity · live photo · eligibility gates",
          steps: [
            step("Identity + Table-A", "CNIC class + 2\nnon-face fields + live CNIC", "process"),
            step("Live photo", "Face vs ID · encrypted\nLiveness ≠ NADRA BV", "process"),
            step("Geo + IP", "CCOF F.3", "process"),
            step("One CNIC?", "EMI 12.VII", "decision"),
            step("Pre-screen", "UNSC + ATA + PEP\nFail closed if down", "decision"),
            step("Risk profile", "LOW/MED vs HIGH", "decision"),
          ],
          branches: [
            { to: "J12", label: "Duplicate → J12" },
            { to: "J5", label: "Sanctions hit → J5" },
            { to: "J6", label: "HIGH risk → J6" },
            { to: "J11", label: "Screening down → J11" },
          ],
        },
        {
          stage: "7–9",
          title: "NADRA BV · activate · cool-off",
          steps: [
            step("Attempt NADRA BV", "In-app finger/face\nin Pakistan", "process"),
            step("Activation gate", "BV + screen + CDD\n(+ EDD if needed)", "process"),
            step("Cool 2 hours", "App not operable yet", "pending"),
            step("WALLET_ACTIVE · BV", "Issue number late\n400k or pilot 200k", "end"),
          ],
          branches: [
            { to: "J2", label: "BV listed-impossible → J2 Verisys" },
            { to: "J3", label: "Debit-block open → J3" },
            { to: "J4", label: "Video / partner → J4" },
            { to: "J11", label: "NADRA outage → J11" },
          ],
        },
      ],
      remember: [
        "Tracking ID on screen before OTP; SMS only after OTP (EMI Step 0–1).",
        "Live photo / liveness is anti-impersonation — never treat as NADRA BV.",
        "limit_tier is first-class (VERISYS / BV / ENHANCED) — not a hidden Boolean KYC flag.",
        "Pilot licence: BV monthly load often PKR 200,000 via licence_phase — not always 400,000.",
        "Agents never issue wallets. Wallet number only after cooling-off.",
      ],
      extraCustomer: [
        "Sees Tracking ID on screen immediately; can copy it before SMS arrives.",
        "Marketing consents stay off by default — only mandatory T&Cs / privacy / NADRA / fees gate continue.",
      ],
      extraOps: [
        "Confirm licence_phase before quoting 400k vs 200k pilot BV band.",
        "Confirm BV adapter returned NADRA BV — not a local selfie match labelled as BV.",
      ],
      extraSystem: [
        "States: INITIATED → CONTACT_VERIFIED → CONSENT_CAPTURED → IDENTITY_CAPTURED → LIVE_PHOTO_CAPTURED → SCREENING → BV → WALLET_ACTIVE.",
        "Wrong OTP must not move the customer forward — they stay on the phone step.",
        "Ledger enforces limit_tier; trust posting at par when funded.",
      ],
      wf: {
        label: "J1 · Clean biometric",
        when: "First-time digital onboarding — BV succeeds on the shared spine",
        outcome: "WALLET_ACTIVE · BV · commercial 400k (or pilot 200k)",
        tip: "Tracking ID ≠ wallet. SMS Tracking ID only after OTP. Selfie ≠ BV.",
        steps: [
          step("Open + Tracking ID", "On screen first", "start"),
          step("OTP → SMS", "2FA then notify", "process"),
          step("Consent + ID + photo", "Table-A · live", "process"),
          step("Gates", "Dup · TFS · CRP", "decision"),
          step("NADRA BV", "Primary remote", "process"),
          step("Cool 2h → live", "Number late", "end"),
        ],
        forks: [
          { if: "Wrong OTP / lockout", then: "Stay on phone step — do not skip ahead" },
          { if: "Refuses required terms", then: "Cannot open — save draft (J7) or stop (J8)" },
          { if: "Duplicate CNIC", then: "J12 — You already have a wallet" },
          { if: "Sanctions true match", then: "J5 hard stop" },
          { if: "CRP HIGH", then: "J6 EDD before activate" },
          { if: "BV listed-impossible", then: "J2 Verisys ladder" },
          { if: "NADRA 503 / timeout", then: "J11 hold — no silent 400k" },
        ],
        walkthrough: [
          {
            n: "1",
            title: "Tracking ID before SMS",
            text: "Open wallet creates INITIATED and shows Tracking ID in-app. OTP binds PTA mobile. Only then SMS the Tracking ID. Wrong OTP never skips CONTACT_VERIFIED.",
          },
          {
            n: "2",
            title: "Capture identity properly",
            text: "Consents (marketing off by default) → EMI §12 + Table-A including two non-CNIC-face fields → live CNIC image → live photo. Liveness is not BV.",
          },
          {
            n: "3",
            title: "Gates then BV",
            text: "Uniqueness, UNSC/ATA/PEP (fail closed), CRP. Then NADRA BV. Success + CDD + cool-off → WALLET_ACTIVE at BV band.",
          },
          {
            n: "4",
            title: "System",
            text: "limit_tier=BV. Frontend never talks to NADRA. Audit: tracking → evidence → BV → screen → cool-off → wallet number.",
          },
        ],
      },
    },

    J2: {
      plain:
        "BV not possible for an SBP-listed genuine reason → Verisys bundle: NADRA Verisys + CNIC–MSISDN pairing + OTP/call-back + live photo. Outcome: WALLET_ACTIVE · VERISYS · monthly load PKR 50,000 · cash-out PKR 10,000/day. Banner invites later BV upgrade (J13). Not a convenience skip. EMI happy-path Verisys wallet (UJ-E01) lands here when BV is not the first rung.",
      analogy:
        "Provisional licence with lower limits until the full biometric test can be completed.",
      flow: [
        step("BV impossible", "Listed reason only", "start"),
        step("Explain alternate", "Limits may be lower", "process"),
        step("NADRA Verisys", "Particulars check", "process"),
        step("SIM–CNIC pair", "+ OTP / call-back", "process"),
        step("Cool 2h", "Then activate", "pending"),
        step("VERISYS 50k", "Increase-limit banner", "end"),
      ],
      flowStages: [
        {
          stage: "1",
          title: "Leave BV rung for a listed reason",
          steps: [
            step("Reach biometric", "Capture fails or\ndeclared eligible reason", "start"),
            step("Record reason", "Age>60 · disability\nunclear prints · NRP abroad", "db"),
            step("Tell customer", "Alternate verify\nlimits may be lower", "process"),
          ],
          branches: [{ to: "J11", label: "NADRA down → J11 (not fake Verisys)" }],
        },
        {
          stage: "2",
          title: "Verisys wallet path (EMI UJ-E01 controls)",
          steps: [
            step("NADRA Verisys", "Against CNIC particulars", "process"),
            step("CNIC–MSISDN pairing", "PTA / operator source", "process"),
            step("OTP or call-back", "Negative/step-wise\nconfirmations", "process"),
            step("Live photo kept", "Already on spine", "process"),
            step("Pre-screen must stay CLEAR", "Fail closed", "decision"),
          ],
          branches: [
            { to: "J3", label: "Pairing/OTP fail → J3 debit-block" },
            { to: "J4", label: "Exhausted → J4 video/partner" },
            { to: "J8", label: "Refuse / TAT → J8" },
          ],
        },
        {
          stage: "3",
          title: "Activate at Verisys band",
          steps: [
            step("Activation gate", "Verisys pack + CDD", "process"),
            step("Cool 2 hours", "BPRD 04", "pending"),
            step("WALLET_ACTIVE · VERISYS", "50k load · 10k/day cash-out", "end"),
            step("Home banner", "Complete BV for 400k → J13", "process"),
          ],
          branches: [{ to: "J13", label: "Later BV upgrade → J13" }],
        },
      ],
      remember: [
        "“Customer skipped” is not a listed BV-impossible reason.",
        "Do not grant biometric-tier limits on a Verisys-only pack.",
        "Cash-in at agents still needs BV later (J19) — and that BV opens a J13 upgrade case.",
        "limit_tier=VERISYS is explicit — not a bank debit-block pretending BV succeeded.",
      ],
      extraCustomer: [
        "Sees Wallet ready — 50,000 per month and a persistent Increase limit CTA for BV.",
      ],
      extraOps: [
        "Call-back failures escalate to a human agent — do not auto-approve.",
      ],
      extraSystem: [
        "VERISYS_PASSED only if Verisys + pairing + OTP/call-back all succeeded.",
        "Ledger enforces 50k monthly load and 10k/day cash-out.",
      ],
      wf: {
        label: "J2 · Verisys band (EMI UJ-E01)",
        when: "Spine step 10 — BV impossible for a listed genuine reason",
        outcome: "WALLET_ACTIVE · VERISYS · 50k / 10k cash-out · upgrade via J13",
        tip: "Selfie is not BV. Stay VERISYS until NADRA BV succeeds.",
        steps: [
          step("Listed BV fail", "Record reason", "start"),
          step("Verisys + pair + OTP", "Full bundle", "process"),
          step("Activate 50k", "Cool-off first", "end"),
          step("Banner → J13", "Increase limit", "process"),
        ],
        forks: [
          { if: "Pairing or OTP/call-back fails", then: "J3 or J4 — J2 did not pass" },
          { if: "Customer later completes BV", then: "New case J13 — do not edit old result" },
        ],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Told alternate verification and lower limits. Completes Verisys, SIM pairing, OTP/call-back. After cool-off sees 50k wallet + Increase limit banner.",
          },
          {
            n: "2",
            title: "Operations",
            text: "Written genuine reason. No biometric limits on Verisys pack. Call-back uses negative confirmations.",
          },
          {
            n: "3",
            title: "System",
            text: "limit_tier=VERISYS. Limit engine reads verification strength. Upgrade is J13.",
          },
        ],
      },
    },

    J3: {
      plain:
        "Sometimes a file is opened but the customer still cannot spend until stronger checks finish. That is not the same as a normal low-limit wallet (J2). Rare option: allow one credit before KYC finishes — usually keep this OFF. If it is ON and KYC never finishes, close the wallet and file a report.",
      flowStages: [
        {
          stage: "1",
          title: "Shared capture already done",
          steps: [
            step("Spine capture OK", "Tracking · OTP · ID · photo", "start"),
            step("Gates clear enough", "To open file", "process"),
            step("Verification incomplete", "BV/J2 pack not done", "decision"),
          ],
        },
        {
          stage: "2",
          title: "Open blocked instrument",
          steps: [
            step("Issue debit-blocked", "File open · cannot spend", "db"),
            step("Tell customer", "What is still required", "process"),
            step("Complete BV or J2", "Then activation path", "process"),
            step("Or decline", "J8 / close", "danger"),
          ],
          branches: [
            { to: "J1", label: "Complete BV → J1 activate" },
            { to: "J2", label: "Complete Verisys pack → J2" },
            { to: "J8", label: "Never completes → J8" },
          ],
        },
        {
          stage: "3",
          title: "Early credit before KYC finishes (rare — usually OFF)",
          steps: [
            step("Product may allow ONE credit", "Before ID is finished", "decision"),
            step("Customer finishes KYC in time", "Continue normal path", "end"),
            step("KYC never finished", "Close wallet + file report", "danger"),
          ],
          branches: [{ to: "J8", label: "Closed with clear reason → J8" }],
        },
      ],
      remember: [
        "Opened-but-blocked is not the same as a normal low-limit wallet (J2).",
        "Best default: do not allow money in before KYC finishes. If Legal turns that on, unfinished KYC must close the wallet and file a report.",
      ],
      wf: {
        label: "J3 · Opened, cannot spend",
        when: "Partial assurance — instrument exists but debit blocked",
        outcome: "DEBIT_BLOCKED until BV/J2 completes — or J8",
        tip: "Do not market this as a spending wallet.",
        steps: [
          step("Partial verify", "File may open", "start"),
          step("DEBIT_BLOCKED", "No spend", "pending"),
          step("Finish BV / J2", "Then cool-off", "process"),
          step("Live or J8", "Clear outcome", "end"),
        ],
        forks: [{ if: "One early credit allowed before KYC", then: "If KYC never finishes → close wallet and report (J8)" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Sees wallet/file opened but cannot spend until remaining checks finish. Clear EN/UR copy of what is missing.",
          },
          {
            n: "2",
            title: "System",
            text: "Debit rails blocked. Completing BV may also open J13 if moving bands. Never silent 400k.",
          },
        ],
      },
    },

    J4: {
      plain:
        "Last remote rung when BV and Verisys+MSISDN paths fail for eligible reasons: recorded video KYC and/or partner channel, still with Verisys as required. EMI UJ-E07: greenfield EMI without branches must not pretend BV succeeded — keep VERISYS 50k or book video + Verisys, then retry BV for 400k later (J13).",
      flowStages: [
        {
          stage: "1",
          title: "Remote ladder exhausted upward",
          steps: [
            step("BV eligible fail", "Do not mark BV", "danger"),
            step("Explain EN/UR", "We’ll verify another way", "process"),
            step("Choice", "Stay 50k · e-Sahulat · video KYC", "decision"),
          ],
          branches: [
            { to: "J2", label: "Stay VERISYS 50k → J2 activate" },
            { to: "J11", label: "Vendor path → J11" },
          ],
        },
        {
          stage: "2",
          title: "Video KYC + Verisys (EMI without presence)",
          steps: [
            step("Book recorded session", "Shows ID on camera", "pending"),
            step("Retain recording", "Ops evidence", "db"),
            step("Verisys still required", "Not a BV substitute", "process"),
            step("Assured or decline", "Then J13 for BV 400k", "end"),
          ],
          branches: [
            { to: "J8", label: "Fail / refuse → J8" },
            { to: "J13", label: "Later NADRA BV → J13" },
          ],
        },
      ],
      remember: [
        "Video KYC + Verisys still does not equal NADRA BV.",
        "No silent 400k after video alone.",
      ],
      wf: {
        label: "J4 · Video KYC / partner (EMI UJ-E07)",
        when: "BV and eligible Verisys+MSISDN paths failed; no branch presence",
        outcome: "Stay VERISYS / video+Verisys assured — or J8",
        tip: "Recording retained. Still not BV unless NADRA BV succeeds.",
        steps: [
          step("BV fail eligible", "Record reason", "start"),
          step("Path choice", "50k / e-Sahulat / video", "decision"),
          step("Video + Verisys", "Retain recording", "pending"),
          step("Assured", "Retry BV via J13", "end"),
        ],
        forks: [{ if: "Customer refuses video", then: "J8 decline with written reason" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Plain EN/UR choices. May keep 50k wallet with Increase limit still available, or book video KYC.",
          },
          {
            n: "2",
            title: "System",
            text: "Do not mark BV. limit_tier stays VERISYS until NADRA BV. VIDEO_KYC_PENDING while scheduled.",
          },
        ],
      },
    },

    J5: {
      plain:
        "Confirmed sanctions / proscribed / fraud true match: fail closed, no instrument, written reason, no STP retry. Customer never sees list names. Internal reason codes richer than customer text. EMI UJ-E10.",
      flowStages: [
        {
          stage: "1",
          title: "Screening moment",
          steps: [
            step("Sanctions / PEP run", "UNSC + ATA + watchlist", "start"),
            step("Potential hit", "Hold — no tip-off", "pending"),
            step("Confirmed true match", "Ops / compliance", "decision"),
          ],
          branches: [
            { to: "J1", label: "False positive cleared → resume spine" },
            { to: "J11", label: "Provider down → J11 (not CLEAR)" },
          ],
        },
        {
          stage: "2",
          title: "Hard stop",
          steps: [
            step("No instrument", "Block issue-wallet", "danger"),
            step("Written reason EN/UR", "No list names · no tip-off", "process"),
            step("TFS / STR path", "Internal", "db"),
            step("DECLINED", "Tracking ID kept → J8", "end"),
          ],
          branches: [{ to: "J8", label: "Notice + tracking lookup → J8" }],
        },
      ],
      wf: {
        label: "J5 · Sanctions hard stop (EMI UJ-E10)",
        when: "True match on UNSC / ATA / fraud",
        outcome: "No wallet · written reason · STR/TFS internal",
        tip: "Never STP retry a confirmed hit.",
        steps: [
          step("Screen", "Lists current", "start"),
          step("Potential → confirm", "Hold first", "pending"),
          step("Reject", "No instrument", "danger"),
        ],
        forks: [{ if: "False positive", then: "Return to spine — still finish every check" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Generic compliant decline. Can look up Tracking ID status. Never shown list names.",
          },
          {
            n: "2",
            title: "System",
            text: "Fail closed. Internal code ≠ customer text. No activate on hit.",
          },
        ],
      },
    },

    J6: {
      plain:
        "HIGH CRP / PEP: extra evidence (SoW/SoF), often recorded video interview, senior approval — blocks activation until approved. EMI UJ-E11. Runs in parallel with verification ladder; still need BV/screening/CDD.",
      flowStages: [
        {
          stage: "1",
          title: "Flag high risk",
          steps: [
            step("CRP = HIGH / PEP", "From spine risk", "start"),
            step("Request docs", "SoW / SoF / Annexure-J", "process"),
            step("Book video if needed", "Recorded EDD interview", "pending"),
          ],
        },
        {
          stage: "2",
          title: "Senior decision",
          steps: [
            step("Analyst review", "Ops queue", "process"),
            step("Senior approval", "Named officer", "decision"),
            step("EDD APPROVED", "Continue activate path", "end"),
            step("EDD refused", "→ J8", "danger"),
          ],
          branches: [
            { to: "J1", label: "Approved → activation / cool-off" },
            { to: "J8", label: "Refused → J8" },
            { to: "J10", label: "If wallet already live → enhanced monitoring" },
          ],
        },
      ],
      wf: {
        label: "J6 · PEP / high-risk EDD (EMI UJ-E11)",
        when: "CRP HIGH or PEP before (or during) activation",
        outcome: "EDD APPROVED → continue · or J8",
        tip: "Senior approval is ops-side — customer waits with Tracking ID visible.",
        steps: [
          step("Flag HIGH", "Block activate", "start"),
          step("Docs + video", "SoW/SoF", "process"),
          step("Senior yes/no", "Named approval", "decision"),
          step("Continue or J8", "Written outcome", "end"),
        ],
        forks: [{ if: "Material change later", then: "J10 / J17 refresh may re-open EDD" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Waits under review. Uploads income/source evidence. May attend recorded video. Sees Tracking ID.",
          },
          {
            n: "2",
            title: "Operations",
            text: "EDD evidence + senior stamp. Do not silently activate HIGH risk.",
          },
        ],
      },
    },

    J7: {
      plain:
        "Abandon and resume ≤ 30 days (EMI UJ-E19 / CCOF): server keeps last successful state under the same Tracking ID. Return lands on the last incomplete step — not the start. Day 31+ → EXPIRED; new application. Authoritative state is server-side, not the phone gallery.",
      flowStages: [
        {
          stage: "1",
          title: "Pause mid-flow",
          steps: [
            step("Leaves mid-flow", "e.g. at live photo", "start"),
            step("Persist last success", "Server state only", "db"),
            step("Draft ≤ 30 days", "Tracking ID already known", "pending"),
          ],
        },
        {
          stage: "2",
          title: "Resume or expire",
          steps: [
            step("Return day ≤ 30", "Deep link or Tracking ID", "process"),
            step("Step-up OTP", "Optional / required by policy", "process"),
            step("Re-check safety", "Device bind · list freshness\nBV age if needed", "process"),
            step("Last incomplete step", "No skip forward", "end"),
            step("Day 31+ EXPIRED", "New POST application", "danger"),
          ],
          branches: [
            { to: "J9", label: "Device unbound on resume → J9" },
            { to: "J1", label: "Continue spine" },
          ],
        },
      ],
      remember: [
        "No skip forward on resume — land on last incomplete step.",
        "On resume: re-check device bind (else J9) and screening list version.",
      ],
      wf: {
        label: "J7 · Resume ≤ 30 days (EMI UJ-E19)",
        when: "Customer exits after APPLICATION_STARTED and before terminal decision",
        outcome: "Resume same Tracking ID · or EXPIRED day 31+",
        tip: "Photos in the gallery are not the system of record.",
        steps: [
          step("Exit mid-flow", "Save server state", "start"),
          step("≤ 30 days", "Draft window", "pending"),
          step("Return + OTP", "Load application", "process"),
          step("Last incomplete step", "Continue", "end"),
        ],
        forks: [{ if: "Day 31+", then: "EXPIRED — new Tracking ID required" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Returns with Tracking ID / deep link. Lands where they left off (e.g. live photo), not Step 0.",
          },
          {
            n: "2",
            title: "System",
            text: "Persists last successful state. EXPIRED after 30 days. Re-screen if list version changed.",
          },
        ],
      },
    },

    J8: {
      plain:
        "Terminal negative: specific written reason (EN/UR), Tracking ID retained for status lookup, internal reason catalogue separate from customer text (especially J5). Also covers: customer refused required terms, or we missed the reply deadline.",
      flowStages: [
        {
          stage: "1",
          title: "Terminal negative entry",
          steps: [
            step("Enters from", "J2–J6 · J11 · J12 · J13…", "start"),
            step("Internal reason code", "Compliance catalogue", "db"),
            step("Customer notice EN/UR", "Specific · no tip-off", "process"),
            step("DECLINED / closed", "Tracking ID still works", "danger"),
          ],
          branches: [{ to: "J7", label: "If only draft/consent — may still resume ≤ 30d" }],
        },
      ],
      wf: {
        label: "J8 · Decline notice",
        when: "Any terminal refusal or policy close",
        outcome: "DECLINED · Tracking ID lookup · compliant copy",
        tip: "Vague “something went wrong” fails TAT/comms expectations.",
        steps: [
          step("Terminal event", "From any journey", "start"),
          step("Map reason codes", "Internal ≠ customer", "db"),
          step("Notify EN/UR", "In-app + SMS/email", "process"),
          step("Closed status", "Tracking ID works", "end"),
        ],
        forks: [
          { if: "TAT > 2 WD after complete file", then: "Notify breach (EMI TAT) even if still in review" },
          { if: "Only refused required terms so far", then: "May still save draft (J7) — not always a final decline" },
        ],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Sees a specific compliant reason and can look up Tracking ID status.",
          },
          {
            n: "2",
            title: "Operations",
            text: "Map internal codes to customer-safe text. Sanctions: never tip off.",
          },
        ],
      },
    },

    J9: {
      plain:
        "New unbound device after WALLET_ACTIVE: NADRA BV, notify old channels, 2-hour cooling-off before device is trusted. Password reset forbidden from unbound devices. Max devices per customer enforced.",
      flowStages: [
        {
          stage: "1",
          title: "Unbound device login",
          steps: [
            step("Login new hardware", "Device not bound", "start"),
            step("In-app NADRA BV", "Required", "process"),
            step("Notify old mobile/email", "Alert takeover risk", "process"),
            step("Cool 2 hours", "BPRD 04", "pending"),
            step("Device trusted", "Within max-device cap", "end"),
          ],
          branches: [
            { to: "J14", label: "Also changing contact → J14" },
            { to: "J11", label: "NADRA down → J11" },
          ],
        },
      ],
      wf: {
        label: "J9 · New device",
        when: "Login on unbound device after WALLET_ACTIVE",
        outcome: "Device trusted after BV + notify + cool-off",
        tip: "No password reset from unbound device.",
        steps: [
          step("New device", "Unbound", "start"),
          step("NADRA BV", "In-app", "process"),
          step("Notify + cool 2h", "Old channels", "pending"),
          step("Trusted", "Cap enforced", "end"),
        ],
        forks: [{ if: "Many CNICs on one device", then: "Fraud ops investigation" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Completes BV on new phone, receives alerts on old channels, waits two hours.",
          },
          {
            n: "2",
            title: "System",
            text: "Unbound device cannot skip BV. Cooling-off timer. Max devices policy.",
          },
        ],
      },
    },

    J10: {
      plain:
        "After the wallet is live, watching never stops. Sometimes salary or home remittance may not count toward the monthly load cap — only if the regulator allowed it — but fraud checks still run. Business wallets are a later phase.",
      flowStages: [
        {
          stage: "1",
          title: "After WALLET_ACTIVE",
          steps: [
            step("Ongoing list screening", "Periodic + event", "start"),
            step("TMS scenarios", "Structuring · mule · device", "decision"),
            step("Hold / restrict / STR", "Fail closed patterns", "danger"),
            step("Or clear", "Continue operate", "end"),
          ],
          branches: [
            { to: "J13", label: "Needs stronger verify → J13" },
            { to: "J17", label: "Refresh due → J17" },
            { to: "J5", label: "True match later → J5" },
          ],
        },
        {
          stage: "2",
          title: "Salary or home remittance (special load rules)",
          steps: [
            step("Already fingerprint-verified", "Not the low-limit path", "start"),
            step("Regulator allowed special rule?", "If no → counts to monthly load", "decision"),
            step("Salary or remittance credit", "Employer / approved path checked", "process"),
            step("Credit posts", "Fraud checks still run", "end"),
          ],
        },
        {
          stage: "3",
          title: "Business / merchant wallets (later phase)",
          steps: [
            step("Not these personal journeys", "Company docs + owners", "process"),
            step("Longer review", "About 5 working days", "pending"),
            step("One wallet per business", "With this EMI", "end"),
          ],
        },
      ],
      wf: {
        label: "J10 · Continuous monitoring",
        when: "Any time after wallet exists",
        outcome: "Operate · hold · restrict · or STR",
        tip: "Load exclusions ≠ AML off.",
        steps: [
          step("Live wallet", "Monitor", "start"),
          step("TMS + re-screen", "Patterns", "decision"),
          step("Action", "Hold / STR / clear", "end"),
        ],
        forks: [
          { if: "Till cash structuring", then: "Fail closed at J19 — case is J10" },
          { if: "Salary or remittance special load rule", then: "May skip load math if allowed — fraud checks still on" },
        ],
        walkthrough: [
          {
            n: "1",
            title: "System",
            text: "Continuous UNSC/ATA/PEP. TMS on cash-in patterns, new-device-then-cash-out, one-to-many. Exclusions only affect load counters when granted.",
          },
        ],
      },
    },

    J11: {
      plain:
        "NADRA / screening provider timeout or 503: stay IN_PROGRESS, never silent activate or silent 400k (EMI UJ-E08). Retry with backoff. Resume ≤ 30 days (J7). Max retries → video/case — still no fake BV.",
      flowStages: [
        {
          stage: "1",
          title: "Provider fail-closed",
          steps: [
            step("NADRA/list call fails", "503 / timeout", "danger"),
            step("Hold IN_PROGRESS", "Show Tracking ID\nNo Wallet ready", "pending"),
            step("Customer retry", "Idempotent restart", "process"),
            step("Vendor recovers", "Continue J1/J2/J13", "end"),
            step("Max retries", "Video or wait case", "decision"),
          ],
          branches: [
            { to: "J7", label: "Leave and resume ≤ 30d" },
            { to: "J4", label: "Alternate video path" },
            { to: "J1", label: "Recover → BV path" },
            { to: "J2", label: "Recover → Verisys path" },
          ],
        },
      ],
      wf: {
        label: "J11 · Provider timeout (EMI UJ-E08)",
        when: "NADRA or screening provider unavailable",
        outcome: "Hold · retry · recover — never silent 400k",
        tip: "Stub and real adapters share the same fail-closed port.",
        steps: [
          step("Call fails", "503/timeout", "danger"),
          step("Hold", "IN_PROGRESS", "pending"),
          step("Retry", "Backoff", "process"),
          step("Recover", "Resume journey", "end"),
        ],
        forks: [{ if: "Lists down at pre-screen", then: "Not CLEAR — same hold rules" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Sees Verification taking longer + Tracking ID. Retry CTA. Can leave and come back within 30 days.",
          },
          {
            n: "2",
            title: "System",
            text: "Map errors to PENDING/UNAVAILABLE never APPROVED. No activate on outage.",
          },
        ],
      },
    },

    J12: {
      plain:
        "One e-money instrument per CNIC per EMI (EMI §12.VII / UJ-E05). Authenticated returning customer: You already have a wallet — log in. Attackers get a generic reply (no enumeration). Not a vague Rejected by policy.",
      flowStages: [
        {
          stage: "1",
          title: "Uniqueness hit",
          steps: [
            step("CNIC entered", "Hash vs uniqueness key", "start"),
            step("Existing wallet?", "Active instrument", "decision"),
            step("Authenticated?", "Session present", "decision"),
            step("Clear copy", "You already have a wallet — log in", "process"),
            step("Login / recovery", "No second instrument", "end"),
            step("Generic reply", "Unauthenticated probe", "end"),
          ],
          branches: [
            { to: "J9", label: "Lost access → J9 device recovery" },
            { to: "J16", label: "Closed wallet re-open policy" },
            { to: "J15", label: "Minor ≠ second adult wallet" },
          ],
        },
      ],
      wf: {
        label: "J12 · Duplicate CNIC (EMI UJ-E05)",
        when: "CNIC hash matches an open wallet at this EMI",
        outcome: "Block second issue · login/recovery copy",
        tip: "Copy must say You already have a wallet — not vague reject.",
        steps: [
          step("Enter CNIC", "Identity capture", "start"),
          step("Hit existing", "Block issue", "decision"),
          step("Login copy", "EN/UR clear", "process"),
          step("Existing wallet", "No second open", "end"),
        ],
        forks: [{ if: "Closed wallet", then: "Legal re-open policy — NEEDS CONFIRMATION" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Genuine returner sees login/recovery. Never a second onboarding wizard.",
          },
          {
            n: "2",
            title: "System",
            text: "Block issue-wallet. Unauthenticated responses stay generic.",
          },
        ],
      },
    },

    J13: {
      plain:
        "Category / limit upgrade is a new verification case (CCOF F.1), not a settings toggle. Path A: VERISYS → NADRA BV → 400k commercial (or 200k pilot) via in-app / e-Sahulat / partner ATM (EMI UJ-E02). Path B: BV → Enhanced up to 1M after SoF, CNIC–SIM pairing, TMS+CRP in-house, commercial licence + PSP&OD product (EMI UJ-E03). Always re-screen + 2-hour cool-off before LIMITS_UPDATED.",
      flowStages: [
        {
          stage: "A",
          title: "Verisys → BV 400k (EMI UJ-E02)",
          steps: [
            step("Increase limit CTA", "Told 50k vs 400k", "start"),
            step("BV channel", "In-app · e-Sahulat · ATM", "decision"),
            step("NADRA BV success", "Not selfie", "process"),
            step("Re-screen + CRP", "Moment 2", "decision"),
            step("Cool 2 hours", "Old band meantime", "pending"),
            step("limit_tier=BV", "400k or pilot 200k", "end"),
          ],
          branches: [
            { to: "J11", label: "NADRA down → J11" },
            { to: "J4", label: "BV fail → retry / video" },
            { to: "J6", label: "CRP HIGH on upgrade → J6" },
          ],
        },
        {
          stage: "B",
          title: "BV → Enhanced 1M (EMI UJ-E03)",
          steps: [
            step("Request enhanced", "Product flag + commercial", "start"),
            step("Annexure-J SoF", "Income evidence", "process"),
            step("CNIC–SIM pairing", "This device", "process"),
            step("TMS + CRP in-house", "No outsourcing", "pending"),
            step("Pass → ENHANCED", "Up to PKR 1,000,000", "end"),
            step("Fail → remain BV", "Tell what is missing", "danger"),
          ],
          branches: [
            { to: "J8", label: "CDD cannot complete → J8" },
            { to: "J6", label: "EDD required → J6" },
            { to: "J10", label: "Ongoing monitoring → J10" },
          ],
        },
      ],
      remember: [
        "Selfie is not BV. licence_phase selects 400k vs 200k pilot.",
        "Enhanced verification must not be outsourced (EMI §14.III).",
        "Till BV for cash-in (J19) must open a J13 case to lift Verisys → BV — not a side-effect credit of 400k capacity.",
      ],
      extraCustomer: [
        "On BV success sees new monthly load banner (400,000 or 200,000 if pilot).",
        "On enhanced request waits with Tracking ID while SoF / pairing / TMS run.",
      ],
      extraOps: [
        "Confirm PSP&OD enhanced product already approved before offering 1M path.",
        "Cash-out limits after BV come from CRP — not a flat marketing number.",
      ],
      extraSystem: [
        "Starts BV session on same application; authenticated channel only.",
        "No raw biometric template store. Ledger policy switch on success.",
        "No silent 1M — remain BV with explicit missing-item copy.",
      ],
      wf: {
        label: "J13 · Verisys → BV → Enhanced (EMI E02/E03)",
        when: "WALLET_ACTIVE at lower band requests higher category",
        outcome: "LIMITS_UPDATED after re-verify + re-screen + cool-off — or stay / J8",
        tip: "Two ladders: BV upgrade, then optional Enhanced 1M.",
        steps: [
          step("Upgrade request", "Increase limit", "start"),
          step("BV channels", "App / e-Sahulat / ATM", "decision"),
          step("BV band", "400k / pilot 200k", "end"),
          step("Optional Enhanced", "SoF · SIM · TMS", "process"),
          step("ENHANCED 1M", "Or remain BV", "end"),
        ],
        forks: [
          { if: "BV fails", then: "Stay VERISYS 50k — do not fake BV" },
          { if: "Enhanced checks fail", then: "Remain BV — tell what is missing" },
          { if: "Till completes first BV", then: "Open J13 case — do not silently lift caps" },
        ],
        walkthrough: [
          {
            n: "1",
            title: "BV upgrade",
            text: "Customer picks in-app BVS, NADRA e-Sahulat, or partner ATM. NADRA BV success + re-screen + cool-off → limit_tier=BV.",
          },
          {
            n: "2",
            title: "Enhanced 1M",
            text: "Only after commercial + PSP&OD product. Annexure-J SoF, CNIC–SIM pairing, in-house TMS+CRP. No outsourcing.",
          },
          {
            n: "3",
            title: "System",
            text: "New verification case ID. Old band applies during cool-off. Ledger switches policy only after timer.",
          },
        ],
      },
    },

    J14: {
      plain:
        "Mobile / email / password change on a live wallet: re-run identity assurance (often BV), notify old channels, 2-hour cooling-off before new credential is fully trusted.",
      flowStages: [
        {
          stage: "1",
          title: "Credential change",
          steps: [
            step("Request change", "Mobile / email / password", "start"),
            step("Step-up / BV", "As required", "process"),
            step("Notify old channels", "Alert", "process"),
            step("Cool 2 hours", "Old value meantime", "pending"),
            step("Credential live", "Audit kept", "end"),
          ],
          branches: [
            { to: "J9", label: "Unbound device → J9 first" },
            { to: "J11", label: "BV provider down → J11" },
          ],
        },
      ],
      wf: {
        label: "J14 · Contact / credential change",
        when: "WALLET_ACTIVE customer changes mobile, email, or password",
        outcome: "New credential trusted after notify + cool-off",
        tip: "Same cooling-off discipline as new device and limit upgrade.",
        steps: [
          step("Change request", "Authenticated", "start"),
          step("BV / step-up", "Prove holder", "process"),
          step("Notify + cool 2h", "Old channels", "pending"),
          step("Updated", "Audit", "end"),
        ],
        forks: [{ if: "Change from unbound device", then: "Complete J9 before J14" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Proves identity, gets alerts on old mobile/email, waits two hours.",
          },
          {
            n: "2",
            title: "System",
            text: "Do not silently swap MSISDN without cool-off and notify.",
          },
        ],
      },
    },

    J15: {
      plain:
        "Minor wallets open only from the guardian’s app, linked, never standalone (EMI UJ-E13). Basic: VERISYS 50k, funded only from parent wallet, guardian undertaking, TMS. Freelancer minor (UJ-E14): NADRA BV → 400k, funding parent and/or verified income — still not adult Enhanced 1M. Agents never issue the child’s instrument.",
      flowStages: [
        {
          stage: "1",
          title: "Minor basic linked (EMI UJ-E13)",
          steps: [
            step("Guardian wallet live", "WALLET_ACTIVE parent", "start"),
            step("Add child in parent app", "No standalone signup", "process"),
            step("Minor identity + screen", "Minor + guardian TFS", "process"),
            step("Guardian undertaking", "Liability accepted", "process"),
            step("MINOR_BASIC 50k", "Fund only from parent", "end"),
          ],
          branches: [{ to: "J12", label: "Not a second adult wallet" }],
        },
        {
          stage: "2",
          title: "Minor freelancer enhanced (EMI UJ-E14)",
          steps: [
            step("Linked minor exists", "Still parent app only", "start"),
            step("Minor NADRA BV", "Required for 400k", "process"),
            step("Verify income source", "Parent and/or freelance evidence", "process"),
            step("MINOR_FREELANCER 400k", "Not adult 1M", "end"),
            step("Else stay 50k", "Tell what is missing", "danger"),
          ],
          branches: [
            { to: "J6", label: "High risk → J6" },
            { to: "J11", label: "NADRA down → J11" },
          ],
        },
      ],
      remember: [
        "EMI 17.VII: agents do not issue the child’s instrument.",
        "Confirm digital eligibility / Form-B with Legal — NEEDS CONFIRMATION.",
      ],
      wf: {
        label: "J15 · Minor wallets (EMI E13/E14)",
        when: "Guardian with live wallet starts Add child wallet",
        outcome: "MINOR_BASIC 50k or MINOR_FREELANCER 400k — linked only",
        tip: "No orphan minor wallet. Not adult Enhanced 1M.",
        steps: [
          step("Parent app only", "Linked", "start"),
          step("Undertaking + CDD", "Screen both", "process"),
          step("Basic 50k", "Parent-funded", "end"),
          step("Optional BV+income", "Freelancer 400k", "process"),
        ],
        forks: [{ if: "Standalone minor attempt", then: "Block — use parent app" }],
        walkthrough: [
          {
            n: "1",
            title: "Basic",
            text: "Guardian-only open. Undertaking stored. limit_tier=MINOR_BASIC. TMS on. Fund only from parent.",
          },
          {
            n: "2",
            title: "Freelancer",
            text: "Minor BV + verified income. 400k cap. Still not §14 adult enhanced 1M.",
          },
        ],
      },
    },

    J16: {
      plain:
        "Closure and cash redemption at par. Full cash redemption needs BV (EMI §15 / UJ-E12 redeem). After closure, whether CNIC may open again is policy (ties to J12). Par value redemption — no haircut charges on e-money redeem.",
      flowStages: [
        {
          stage: "1",
          title: "Close & redeem",
          steps: [
            step("Close request", "Customer or ops", "start"),
            step("Redeem at par", "BV for cash redemption", "process"),
            step("Settle trust", "Trustee bank", "db"),
            step("CLOSED", "Instrument ended", "end"),
          ],
          branches: [
            { to: "J19", label: "Cash channel → J19" },
            { to: "J12", label: "Later re-open uniqueness" },
          ],
        },
      ],
      wf: {
        label: "J16 · Close & redeem",
        when: "Customer or EMI closes the instrument",
        outcome: "CLOSED after par redemption with BV where cash",
        tip: "Agents redeem; they never issue.",
        steps: [
          step("Close intent", "Authenticated", "start"),
          step("Redeem at par", "BV if cash", "process"),
          step("CLOSED", "Audit retained", "end"),
        ],
        forks: [{ if: "Partial redeem only", then: "Wallet may stay active at lower balance" }],
        walkthrough: [
          {
            n: "1",
            title: "System",
            text: "Cash redemption requires BV. Trust posting reverses at par. Uniqueness key handling after close = Legal.",
          },
        ],
      },
    },

    J17: {
      plain:
        "Periodic / event KYC refresh (EMI UJ-E20): scheduler marks REFRESH_DUE by CRP; notify with deep link; customer updates profile/ID (may re-BV); re-screen + CRP; overdue restriction is explicit — never a silent clamp.",
      flowStages: [
        {
          stage: "1",
          title: "Refresh due",
          steps: [
            step("REFRESH_DUE", "Calendar or event", "pending"),
            step("Notify customer", "Update your KYC", "process"),
            step("Review profile / ID", "May re-BV", "process"),
            step("Re-screen + CRP", "Material change → EDD", "decision"),
            step("Complete", "Next due set", "end"),
            step("Overdue restrict", "Explicit copy + CTA", "danger"),
          ],
          branches: [
            { to: "J6", label: "Material change → J6" },
            { to: "J5", label: "True match → J5" },
            { to: "J13", label: "Upgrade requested during refresh → J13" },
          ],
        },
      ],
      wf: {
        label: "J17 · Periodic / event refresh (EMI UJ-E20)",
        when: "CRP calendar interval, ID expiry, or adverse event",
        outcome: "Refresh complete · or explicit overdue restriction",
        tip: "Overdue = clear restrict copy, not silent limit clamp.",
        steps: [
          step("Due", "Scheduler", "pending"),
          step("Notify + update", "Deep link", "process"),
          step("Re-screen", "CRP", "decision"),
          step("Done or restrict", "Explicit", "end"),
        ],
        forks: [{ if: "High assurance product", then: "BV may be re-required" }],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Gets reminder, updates fields, may re-BV, waits under review, then operable again.",
          },
          {
            n: "2",
            title: "System",
            text: "REFRESH_DUE flag. Fresh TFS/PEP. Schedule updated on success. Overdue sets explicit restrict flags.",
          },
        ],
      },
    },

    J18: {
      plain:
        "Digital IDs other than resident CNIC (NICOP/POC/ARC/POR; NRP abroad). Same spine gates; BV availability and Verisys exceptions depend on ID class and whether BV is operational abroad. Screening and uniqueness still apply.",
      flowStages: [
        {
          stage: "1",
          title: "Non-resident / alternate ID class",
          steps: [
            step("Select ID class", "NICOP/POC/ARC/POR", "start"),
            step("Capture Table-A", "Class-specific rules", "process"),
            step("BV available?", "In PK vs abroad", "decision"),
            step("BV path or Verisys exception", "Listed NRP reason", "process"),
            step("Screen + uniqueness", "Same gates", "decision"),
            step("Activate per band", "Or J8", "end"),
          ],
          branches: [
            { to: "J2", label: "NRP Verisys exception → J2" },
            { to: "J4", label: "Video if required → J4" },
            { to: "J12", label: "NICOP vs CNIC same human — open Q" },
          ],
        },
      ],
      wf: {
        label: "J18 · Foreign / overseas IDs",
        when: "Applicant ID is not a resident CNIC",
        outcome: "Class-appropriate verify → activate or J8",
        tip: "id_class is first-class. NRP_BV_NOT_OPERATIONAL is config, not a skip code.",
        steps: [
          step("ID class", "Allow-list", "start"),
          step("BV or exception", "By geography", "decision"),
          step("Gates", "TFS · unique", "process"),
          step("Activate", "Band by strength", "end"),
        ],
        forks: [{ if: "Outside PK and BV not operational", then: "Verisys path with listed NRP exception + live photo" }],
        walkthrough: [
          {
            n: "1",
            title: "System",
            text: "Branch NADRA product and BV availability on id_class. Uniqueness and screening still mandatory.",
          },
        ],
      },
    },

    J19: {
      plain:
        "Existing wallet only at SBP-approved agent / ATM / branch (EMI UJ-E12). Agents cannot open wallets. Cash-in and full cash redemption: NADRA BV. Agent cash-out: BV or 2FA if BVS challenged. ATM cash-out: 2FA mandatory. Amounts at par. Verisys-only customers who BV at till must open J13 to lift band. Structuring → J10.",
      flowStages: [
        {
          stage: "1",
          title: "Channel gate",
          steps: [
            step("Existing wallet only", "WALLET_ACTIVE", "start"),
            step("Agent cannot issue", "Open in the app", "danger"),
            step("Choose cash path", "In · out · redeem · ATM", "decision"),
          ],
        },
        {
          stage: "2",
          title: "Proof then post at par",
          steps: [
            step("Cash-in", "BV at till → credit", "process"),
            step("Agent cash-out", "BV or 2FA if challenged", "process"),
            step("ATM cash-out", "2FA mandatory", "process"),
            step("Full redemption", "BV · at par · no charges", "process"),
            step("CASH_POSTED", "Alerts · trust posting", "end"),
          ],
          branches: [
            { to: "J13", label: "First till BV on Verisys wallet → J13" },
            { to: "J10", label: "Mule / structuring → J10" },
            { to: "J11", label: "BVS down → hold / 2FA rules" },
          ],
        },
      ],
      remember: [
        "IBFT funding is allowed without till cash (EMI 15.II) — separate from agent cash-in.",
        "Verisys wallet cannot cash-in until BV — and BV starts J13 upgrade.",
      ],
      wf: {
        label: "J19 · Agent / ATM cash (EMI UJ-E12)",
        when: "WALLET_ACTIVE customer at agent, ATM, EMI or bank branch",
        outcome: "CASH_POSTED at par after BV/2FA — or declined / J10 hold",
        tip: "AGENT_CANNOT_ISSUE. Redeem needs BV.",
        steps: [
          step("Existing wallet", "Agent blocked from issue", "start"),
          step("Cash-in BV", "Credit at par", "process"),
          step("Cash-out", "BV/2FA or ATM 2FA", "process"),
          step("Redeem BV", "At par", "end"),
        ],
        forks: [
          { if: "Agent tries open wallet", then: "AGENT_CANNOT_ISSUE — send to app" },
          { if: "TMS hold", then: "Fail closed — J10 case" },
        ],
        walkthrough: [
          {
            n: "1",
            title: "Customer",
            text: "Hands cash, completes fingerprint/BV for cash-in or redemption. ATM out needs 2FA.",
          },
          {
            n: "2",
            title: "Operations",
            text: "Agents distribute/redeem only. Separate agent complaint track under consumer protection.",
          },
          {
            n: "3",
            title: "System",
            text: "Credit only after BV_PASSED on cash-in. Limit engine still enforces load and cash-out caps.",
          },
        ],
      },
    },
  };

  function applyFlow(j, f) {
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
  D.journeys = D.journeys.filter((j) => /^J\d+$/.test(j.id));
  D.nav = D.nav.filter((g) => g.id !== "emi-extras");
  for (const k of Object.keys(W)) {
    if (/^E\d+$/.test(k)) delete W[k];
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

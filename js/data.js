/**
 * KYC Journey Docs — detailed content model
 * Companion to https://kyc-journey-map.vercel.app/
 * Documentation only. Official circulars on sbp.org.pk prevail.
 */
window.KYC_DATA = {
  nav: [
    {
      id: "start",
      label: "Start here",
      items: [
        { page: "overview", label: "Overview" },
        { page: "how-to-read", label: "How to read these docs" },
        { page: "regulatory", label: "Regulatory foundations" },
        { page: "audit", label: "SBP audit readiness" },
      ],
    },
    {
      id: "capture",
      label: "Capture & gates",
      items: [
        { page: "spine", label: "Master spine (1–10)" },
        { page: "activation", label: "Activation & cooling-off" },
        { page: "ladder", label: "Verification ladder A–D" },
      ],
    },
    {
      id: "reference",
      label: "Vocabulary & details",
      items: [
        { page: "glossary", label: "Vocabulary (glossary)" },
        { page: "states", label: "State vocabulary" },
        { page: "limits", label: "Limits & EMI 14.VI" },
        { page: "annexure", label: "Annexure-J" },
      ],
    },
    {
      id: "domain",
      label: "Domain Learning",
      open: true,
      items: [
        { page: "domain", label: "Master specification" },
        { page: "domain-pillars", label: "11 pillars at a glance" },
        { page: "domain-srs", label: "SRS · Onboarding & admin" },
        { page: "domain-screens", label: "SRS · Screens & APIs" },
        { page: "domain-dropout", label: "SRS · Drop-off recovery" },
        { page: "domain-pep", label: "SRS · PEP & EDD" },
        { page: "domain-admin", label: "SRS · Admin & security" },
        { page: "domain-practice", label: "Team learning exercises" },
      ],
    },
    {
      id: "journeys",
      label: "KYC Journeys",
      open: true,
      items: [
        { page: "journeys", label: "All journeys index" },
        { page: "J1", label: "Clean biometric", depth: 2 },
        { page: "J2", label: "Listed reason, then Verisys", depth: 2 },
        { page: "J3", label: "Opened, cannot spend", depth: 2 },
        { page: "J4", label: "Video KYC / partner / decline", depth: 2 },
        { page: "J5", label: "Hard stop · no wallet", depth: 2 },
        { page: "J6", label: "Extra evidence + approval", depth: 2 },
        { page: "J7", label: "Save & resume", depth: 2 },
        { page: "J8", label: "Decline notice", depth: 2 },
        { page: "J9", label: "New device", depth: 2 },
        { page: "J10", label: "Continuous monitoring", depth: 2 },
        { page: "J11", label: "Provider timeout", depth: 2 },
        { page: "J12", label: "Duplicate CNIC", depth: 2 },
        { page: "J13", label: "Limit upgrade", depth: 2 },
        { page: "J14", label: "Contact change", depth: 2 },
        { page: "J15", label: "Minor wallet", depth: 2 },
        { page: "J16", label: "Close & redeem", depth: 2 },
        { page: "J17", label: "Periodic CDD", depth: 2 },
        { page: "J18", label: "Foreign / overseas IDs", depth: 2 },
        { page: "J19", label: "Cash-in / cash-out", depth: 2 },
      ],
    },
    {
      id: "flows",
      label: "Workflows",
      items: [{ page: "workflows", label: "Interactive diagrams" }],
    },
  ],

  spine: [
    {
      step: "01",
      phase: "Open wallet + Tracking ID on screen",
      what: "Customer opens the EMI wallet app (or web). System creates the application and shows a Tracking ID in-app immediately.",
      detail:
        "EMI recommended Step 0: Tracking ID is visible and copyable on screen before SMS. Do not SMS yet — mobile is not bound. The first screen must not reveal whether a wallet already exists for the MSISDN or CNIC (BPRD 04 A.ix). Tracking ID ≠ wallet number.",
      rule: "Tracking ID on screen first · no existence disclosure · Tracking ID ≠ wallet number.",
      trap: true,
    },
    {
      step: "02",
      phase: "Mobile OTP · 2FA then SMS Tracking ID",
      what: "PTA-registered MSISDN + OTP from the institution short code; device bind. Only after OTP success, SMS the Tracking ID out-of-band.",
      detail:
        "Wrong OTP never advances CONTACT_VERIFIED (see E06). OTP from registered short code. Device fingerprinting for later J9. First out-of-band notify is SMS Tracking ID after OTP — not before.",
      rule: "2FA required · SMS Tracking ID only after OTP · fail stays INITIATED.",
      trap: false,
    },
    {
      step: "03",
      phase: "Terms, charges, consent",
      what: "Customer accepts T&Cs, privacy, NADRA/BV purpose, and fee schedule (EN/UR). Marketing off by default.",
      detail:
        "EMI 12.VI informed consent. Mandatory boxes gate Continue (E18). UI must say incomplete applications can be saved and resumed for up to 30 days (J7).",
      rule: "EMI 12.VI · mandatory vs optional · 30-day save notice.",
      trap: false,
    },
    {
      step: "04",
      phase: "APPLICATION_STARTED confirmed",
      what: "Application exists under the Tracking ID with consents captured — still not a wallet.",
      detail:
        "This remains the most confused review concept: Tracking ID is a case/session id for an unfinished application. Wallet numbers are assigned only after the activation gate and cooling-off. Tracking ID is kept even if the journey later declines (J8).",
      rule: "Tracking ID ≠ wallet number. Resumable 30 days (J7).",
      trap: true,
    },
    {
      step: "05",
      phase: "National data + live CNIC + live photo",
      what: "Capture EMI §12 + Consolidated Table-A (including two non-face CNIC fields), live original CNIC image, and live photo.",
      detail:
        "Live photo / liveness is anti-impersonation — it is not NADRA BV. Encrypted upload; zero PII left as phone gallery source of truth. Digital ID allow-list: CNIC/NICOP/POC/POR/ARC.",
      rule: "Table-A ∪ EMI 12.I · live ID · live photo ≠ BV · no local PII cache.",
      trap: false,
    },
    {
      step: "06",
      phase: "Geo-location & IP",
      what: "Record gadget geolocation, IP address, and network headers.",
      detail:
        "CCOF F.3 treats location and network context as part of digital onboarding evidence. This supports later fraud review (mule farms, VPN clusters) and does not replace identity verification.",
      rule: "CCOF F.3 evidence.",
      trap: false,
    },
    {
      step: "07",
      phase: "Duplicate CNIC check",
      what: "Server checks whether this CNIC/ID already holds an active e-money instrument with this EMI.",
      detail:
        "EMI 12.VII: one active instrument per CNIC per EMI. If a duplicate is found, branch to J12 with clear copy You already have a wallet — log in (EMI UJ-E05). Unauthenticated callers get a generic reply so attackers cannot probe which CNICs are customers.",
      rule: "EMI 12.VII · enumeration-safe · clear login copy when authenticated.",
      trap: true,
    },
    {
      step: "08",
      phase: "Pre-screening (UNSC + ATA 1997)",
      what: "Screen the applicant and associated persons against UNSC designated lists and ATA 1997 proscribed lists.",
      detail:
        "This is screening moment 1. A confirmed hit is J5 (hard stop, no tipping-off, TFS/STR path). A provider timeout or unavailable list is J11 (fail closed) — never treat “list service down” as CLEAR. Persist the list version and timestamp with the decision. Customer sees Under review — never list names.",
      rule: "Hit → J5. Unavailable → J11. Never silent CLEAR.",
      trap: false,
    },
    {
      step: "09",
      phase: "Customer risk profile (CRP)",
      what: "Score the applicant LOW, MEDIUM, or HIGH risk.",
      detail:
        "Inputs typically include occupation, geography, product, channel, PEP indicators, and expected activity. HIGH risk does not skip verification — it adds EDD (J6): extra evidence, often a recorded video interview, and senior management approval before activation.",
      rule: "HIGH → J6 EDD blocks activation until approved.",
      trap: false,
    },
    {
      step: "10",
      phase: "Attempt NADRA biometric (or Verisys ladder)",
      what: "Primary remote verification: in-app NADRA BV. EMI happy path may land Verisys 50k first (J2) then upgrade via J13.",
      detail:
        "Success with clear screens and non-high risk continues toward J1 activation at biometric band (commercial 400k; pilot often 200k via licence_phase). If BV is impossible for an SBP-listed genuine reason, descend to J2 (Verisys 50k). Timeout/error → J11 — never silent 400k. Live photo is not BV.",
      rule: "Success → J1. Listed impossibility → J2. Timeout → J11. Selfie ≠ BV.",
      trap: false,
    },
  ],

  ladder: [
    {
      rung: "A",
      title: "Primary — NADRA biometric",
      color: "#059669",
      when: "Default whenever biometric verification is possible.",
      needs:
        "Authenticated in-app NADRA BV (finger/thumb, iris, or facial when operational). Live photo already captured on the spine. Same rung is re-run for category upgrade (J13), contact change (J14), and cash-in at till (J19).",
      outcome:
        "J1 when pre-screen is clear and risk is not high (or EDD already approved). Commercial biometric load band PKR 400,000 (pilot often PKR 200,000).",
      why:
        "Biometric match is the strongest remote assurance that the person holding the phone is the CNIC holder. Lower rungs exist only for genuine impossibility — not preference.",
    },
    {
      rung: "B",
      title: "If BV not possible — Verisys bundle",
      color: "#0284c7",
      when:
        "Only SBP-listed genuine reasons: age over 60, permanent disability affecting prints, unclear fingerprints, or NRP/POC abroad until NADRA BV exists for that population (also J18).",
      needs:
        "NADRA Verisys (demographic match) AND CNIC–MSISDN pairing AND OTP or call-back AND live photo. The reason must be logged in writing. Call-back uses negative step-wise confirmation.",
      outcome:
        "J2. Verisys band: monthly load PKR 50,000; cash withdrawal PKR 10,000/day. Cash-in at agents still requires BV later (J19).",
      why:
        "Verisys without pairing/OTP is incomplete. The bundle replaces biometric assurance with a combination of demographic truth + SIM ownership + live challenge.",
    },
    {
      rung: "C",
      title: "If A and B fail — Verisys with debit block",
      color: "#d97706",
      when:
        "Verisys itself succeeded, but CNIC–MSISDN pairing or OTP/call-back did not complete.",
      needs:
        "CCOF allows opening an instrument after Verisys with a debit block until rung A or full rung B is completed. The customer must not be able to spend.",
      outcome:
        "J3. State DEBIT_BLOCKED. Debits fail closed with DEBIT_BLOCK_KYC. This is not WALLET_ACTIVE for spending. If verification never completes, close and evaluate STR (EMI 12.IV).",
      why:
        "Lets the EMI record the relationship without creating a spendable wallet while SIM ownership remains unproven.",
    },
    {
      rung: "D",
      title: "If all remote methods fail",
      color: "#7c3aed",
      when: "Rungs A–C cannot produce a usable verified customer.",
      needs:
        "Guide to face-to-face. For an EMI without branches: recorded video KYC interview + Verisys with reasons, or third-party bank reliance — or decline (J8). Agents must not issue instruments (EMI 17.VII).",
      outcome:
        "J4. VIDEO_KYC_REQUIRED or partner path. Encrypted video retained 10 years (CCOF G.2).",
      why:
        "Remote digital onboarding has a floor. Beyond that floor, human-supervised verification or refusal is required — not a weaker silent approve.",
    },
  ],

  journeys: [], // filled below
};

/* ---- Detailed journeys ---- */
window.KYC_DATA.journeys = [
  {
    id: "J1",
    color: "#059669",
    group: "Onboarding spine",
    title: "Clean biometric onboarding",
    summary:
      "WALLET_ACTIVE at NADRA-biometric limits (commercial monthly load PKR 400,000). Wallet number only after BV + pre-screen + CDD.",
    trigger: "Customer opens the app — First-time digital onboarding. The navy spine is this journey.",
    outcome: "WALLET_ACTIVE · biometric band (commercial monthly load PKR 400,000)",
    whyItExists:
      "Primary digital onboarding path when remote NADRA biometric succeeds. Funds sit in a trustee bank; the wallet number is a claim on safeguarded e-money — not a bank deposit account.",
    entersAt:
      "Customer opens the app — First-time digital onboarding. The navy spine is this journey.",
    actors: "Customer; system. No analyst unless a later exception.",
    rules: "CCOF B, D, F, I, J, K · EMI 12 & 14.II · AML CDD · BPRD 04 A via CCOF K",
    timeLimits:
      "Decide within 2 working days of complete documents. Cooling-off 2 hours. Biometric monthly load PKR 400,000.",
    openQuestion:
      "Exact NADRA BV modality (finger vs facial) and commercial agreement: NEEDS CONFIRMATION.",
    story:
      "Resident CNIC holder completes digital onboarding on a first device. Biometric succeeds, pre-screening is clear, risk is not high, cooling-off completes, an e-money wallet is issued at the biometric limit band. This is not a bank deposit account: funds sit in a trustee bank, and the wallet number is a claim on safeguarded e-money.",
    customerSteps: [
      "Opens the app. Product is explained in English and Urdu. The app does not say whether a wallet already exists.",
      "Enters mobile, completes OTP/2FA from the institution short code, device is bound.",
      "Accepts terms and charges (EMI 12.VI). Sees that onboarding can be saved for 30 days.",
      "Receives a tracking ID by SMS (and email if given) — APPLICATION_STARTED, not a wallet number.",
      "Enters national data (CCOF Table-A plus EMI 12.I, including two fields not printed on the CNIC face, e.g. mother’s name and place of birth). Live CNIC and live photo / liveness. Progress is visible.",
      "Allows geo-location and IP capture (CCOF F.3).",
      "Passes eligibility gates: one CNIC / one wallet, UNSC + ATA 1997 pre-screen clear, risk not high.",
      "Completes in-app NADRA biometric (J1 clean path · BV_PASSED). Shown as verified — never a raw NADRA payload.",
      "Passes activation gate (BV + pre-screen + CDD). Is told about cooling-off, waits two hours (BPRD 04 A), then the wallet is ready at biometric limits (PKR 400,000).",
      "Thereafter receives real-time transaction alerts. Later lifecycle events (new device, monitoring, cash) are separate journeys.",
    ],
    opsControls: [
      "Confirm CNIC class may onboard digitally.",
      "Confirm BV came from NADRA, not a local selfie match pretending to be BV.",
      "Confirm pre-screen used current UNSC and ATA 1997 lists; store the list version.",
      "If CRP would be high, this is J6 — do not silently skip.",
      "No human override on J1. Incomplete packs do not activate.",
      "Do not treat this as a digital-bank account opening. Limits, one-wallet-per-CNIC, and activation gates are EMI §12 and §14.",
    ],
    systemInvariants: [
      "APPLICATION_STARTED with tracking ID exists before NADRA is called.",
      "Customer-typed claims are stored separately from NADRA-returned fields.",
      "Frontend never talks to NADRA. Wallet issuance needs BV_PASSED + PRE_SCREEN_CLEAR + CDD complete.",
      "Device binding record + cooling-off timer. WALLET_ACTIVE only after the timer.",
      "Audit story: tracking ID → evidence → BV → screen → risk → cooling-off end → wallet number.",
    ],
    regulatory: [
      "CCOF B, D, F, I, J, K",
      "EMI 2023 §§12 & 14.II",
      "AML/CFT CDD + pre-screening (UNSC / ATA 1997)",
      "BPRD Circular 04 of 2023 (cooling-off) via CCOF K",
    ],
    connects: [
      "On success → activation gate → cooling-off → WALLET_ACTIVE at biometric limits",
      "BV fail for listed reason → J2",
      "Timeout → J11",
      "Screen hit → J5",
      "HIGH risk → J6 before activate",
    ],
  },
  {
    id: "J2",
    color: "#0284c7",
    group: "Onboarding spine",
    title: "Listed reason, then Verisys",
    summary:
      "If J2 fully succeeds: wallet at Verisys limits (monthly load PKR 50,000) unless a later BV upgrades the customer via J13. Reason for skipping BV is recorded in writing.",
    trigger: "NADRA biometric step — BV is not possible for a listed genuine reason — the ladder falls to Verisys.",
    outcome: "WALLET_ACTIVE · Verisys band (monthly load PKR 50,000 · cash-out PKR 10,000/day)",
    whyItExists:
      "Inclusive onboarding when NADRA BV is not possible for an SBP-listed reason — without treating Verisys as a convenience skip or granting biometric-tier limits.",
    entersAt:
      "NADRA biometric step — BV is not possible for a listed genuine reason — the ladder falls to Verisys.",
    actors: "Customer; system; optionally call-centre for call-back.",
    rules: "CCOF F.1.iv–v.a–b · EMI 12 & 14.II.a–b · BPRD 04 alternate controls",
    timeLimits:
      "Still inside 2 working-day TAT. Verisys monthly load PKR 50,000; cash-out PKR 10,000/day.",
    openQuestion:
      "Who adjudicates “genuine reason”, and PTA/operator pairing source: NEEDS CONFIRMATION.",
    story:
      "NADRA BV is not possible for an SBP-listed reason (age over 60, permanent disability, unclear fingerprints, or NRP/POC abroad until BV exists). The remote ladder then requires Verisys + CNIC–MSISDN pairing + OTP or call-back, with live photo. Not a convenience skip.",
    customerSteps: [
      "Reaches biometric. Capture fails or a declared eligible reason applies.",
      "Is told an alternate verification will be used and that limits may be lower until BV is done.",
      "NADRA Verisys runs against CNIC particulars.",
      "SIM–CNIC pairing is checked. Customer completes OTP or a randomised call-back.",
      "If all J2 checks pass: cooling-off, then activation at Verisys limits, with a later upgrade path via BV (that upgrade is J13, not an edit of this pack).",
    ],
    opsControls: [
      "Record the genuine reason. “Customer skipped” is not a listed reason.",
      "Call-back uses negative/step-wise confirmations; failure goes to a human agent.",
      "Do not grant biometric-tier limits on a Verisys-only pack.",
      "If pairing or OTP/call-back fails, J2 did not pass — move to J3 or J4.",
    ],
    systemInvariants: [
      "VERISYS_PASSED only if Verisys + pairing + OTP/call-back all succeeded.",
      "Store BV-not-possible reason code.",
      "Limit engine reads verification strength, not a Boolean “KYC true.”",
      "Upgrade to BV later is a new verification case, not an edit of the old result (J13).",
    ],
    regulatory: [
      "CCOF F.1.iv–v.a–b",
      "EMI 2023 §§12 & 14.II.a–b",
      "BPRD 04 alternate controls",
      "J18 NRP abroad exception (when applicable)",
    ],
    connects: [
      "Partial failure of pairing/OTP → J3",
      "Full remote failure → J4",
      "Later BV success → J13 upgrade (new case, not edit)",
      "Cash-in at till still needs BV → J19",
    ],
  },
  {
    id: "J3",
    color: "#d97706",
    group: "Onboarding spine",
    title: "Opened, cannot spend",
    summary:
      "Instrument exists with DEBIT_BLOCKED. No debit, cash-out, P2P, or merchant pay until BV or full J2. If never verified, close and consider STR.",
    trigger: "J2 Verisys fallback — Verisys succeeded but pairing/OTP did not. Debit-blocked open.",
    outcome: "DEBIT_BLOCKED (not a spending wallet) — not WALLET_ACTIVE",
    whyItExists:
      "BV and Verisys+pairing+OTP have not both succeeded, but Verisys itself has. CCOF allows opening after Verisys with a debit block until BV or full J2 is completed. This is not WALLET_ACTIVE in the leadership sense.",
    entersAt:
      "J2 Verisys fallback — Verisys succeeded but pairing/OTP did not. Debit-blocked open.",
    actors:
      "Customer; system; operations if the block lasts; compliance if STR is considered.",
    rules:
      "CCOF F.1.v.c · EMI 12.III (tension: restricted open ≠ full activation) · EMI 12.IV · AML incomplete CDD",
    timeLimits:
      "TAT still applies. Policy needed for how long a debit block may last. Prefer not using EMI 12.IV’s one unverified credit.",
    openQuestion:
      "Legal must confirm: restricted open ≠ full activation. Whether EMI 12.IV one-credit exception is used at all.",
    story:
      "BV and Verisys+pairing+OTP have not both succeeded, but Verisys itself has. CCOF allows opening after Verisys with a debit block until BV or full J2 is completed. This is not WALLET_ACTIVE in the leadership sense.",
    customerSteps: [
      "Is told verification is incomplete. Status is “opened with restrictions” / “debit blocked.”",
      "Can see what is still required (complete BV, or pairing + OTP/call-back).",
      "Cannot send, withdraw, or pay. Attempts are declined with a restriction message.",
      "Resume stays open (J7). When (a) BV or (b) pairing + OTP/call-back succeeds, the block lifts and limits follow the new strength.",
    ],
    opsControls: [
      "Treat the block as a compliance control, not a UX flag payments can ignore.",
      "If verification never completes, close and consider STR (EMI 12.IV).",
      "Do not use J3 to onboard a sanctions-uncleared person.",
      "Pre-screen must still have been CLEAR to reach J3.",
    ],
    systemInvariants: [
      "DEBIT_BLOCKED is visible to wallets and payments. Fail closed if the flag cannot be read.",
      "A wallet number without the block is a defect.",
      "Every declined debit stores reason DEBIT_BLOCK_KYC.",
      "Lifting the block is a new event linked to a new verification result.",
    ],
    regulatory: [
      "CCOF F.1.v.c",
      "EMI 12.III (restricted open ≠ full activation — legal tension)",
      "EMI 12.IV (close unverified / STR)",
      "AML incomplete CDD",
    ],
    connects: [
      "Map path: J2 → “Verisys ok, pairing/OTP fail” → J3 Debit-blocked open → Restricted open → DEBIT_BLOCKED",
      "Complete BV or full J2 → lift block → limits follow new strength (not an edit of the old pack)",
      "Never completes → J8 Decline / close + consider STR",
      "Resume while waiting → J7",
    ],
  },
  {
    id: "J4",
    color: "#7c3aed",
    group: "Onboarding spine",
    title: "Video KYC / partner / decline",
    summary:
      "VIDEO_KYC completed and wallet decision follows verification strength, or partner bank, or J8 decline.",
    trigger: "J2 / J3 exhausted — Remote rungs a–c failed. Last resort: video KYC, partner bank, or decline.",
    outcome: "VIDEO_KYC / partner → activate path · or J8 decline with written reason",
    whyItExists:
      "BV, J2, and debit-block-after-Verisys have not produced a usable verified customer. CCOF then points to face-to-face. For an EMI without branches: recorded video KYC + Verisys with reasons, or third-party reliance on a bank that has branches. Agents must not issue e-money instruments (EMI 17.VII).",
    entersAt:
      "J2 / J3 exhausted — Remote rungs a–c failed. Last resort: video KYC, partner bank, or decline.",
    actors: "Customer; trained video-KYC officer; compliance; possibly partner bank.",
    rules:
      "CCOF F.1.v.d–f and G.2 · EMI 12.V if also high risk · EMI 17.VII · AML CDD must still be completed",
    timeLimits:
      "Strive to decide within 2 working days; notify the need for video inside TAT.",
    openQuestion:
      "Will first slice include video KYC capacity or partner-bank reliance? If neither, J4 becomes J8.",
    story:
      "BV, J2, and debit-block-after-Verisys have not produced a usable verified customer. CCOF then points to face-to-face. For an EMI without branches: recorded video KYC + Verisys with reasons, or third-party reliance on a bank that has branches. Agents must not issue e-money instruments (EMI 17.VII).",
    customerSteps: [
      "Sees that in-app verification could not be completed.",
      "Is offered a scheduled recorded video interview and/or partner-bank directions — not a dead end, and not “open at an agent.”",
      "During video KYC: ID shown, live presence, questions per approved Digital Onboarding Policy.",
      "If successful, continues to cooling-off/activation. If not, J8 with a written reason.",
    ],
    opsControls: [
      "Video KYC is a recorded interview with defined checks — not a chat, not WhatsApp.",
      "Record why BV could not be met (mandatory without physical presence).",
      "Officer must not see sanctions details that would tip off (J4 assumes screening was clear).",
      "If there is no approved Digital Onboarding Policy, this journey is blocked at governance.",
    ],
    systemInvariants: [
      "VIDEO_KYC_REQUIRED. Recording stored as an evidence object, not on an officer laptop.",
      "Outcome APPROVED / REJECTED / REVIEW is a new verification case.",
      "Retention clock on video per CCOF G.2 and 10-year CDD rules.",
    ],
    regulatory: [
      "CCOF F.1.v.d–f",
      "CCOF G.2 (video retention)",
      "EMI 12.V if also high risk",
      "EMI 17.VII (agents must not issue)",
      "AML CDD must still be completed",
    ],
    connects: [
      "Map: J2 / J3 exhausted → J4 Video KYC / partner (last remote rung)",
      "Approve → Activation gate → 2-hour cooling-off → WALLET_ACTIVE",
      "Reject → J8 Decline / close (written reason · tracking ID kept)",
      "If no video capacity and no partner bank in first slice → J4 collapses to J8",
    ],
  },
  {
    id: "J5",
    color: "#b91c1c",
    group: "Gates & exceptions",
    title: "Hard stop · no wallet",
    summary:
      "DECLINED / relationship not established. Possible STR to FMU. No wallet. Customer message is truthful but must not reveal that a suspicion report is being filed.",
    trigger: "Pre-screen UNSC + ATA 1997 — A hit (applicant or associated person) before any wallet is issued.",
    outcome: "No wallet · PRE_SCREEN_HIT · possible STR/TFS · generic decline (no tip-off)",
    whyItExists:
      "Pre-screening finds the applicant or an associated person (parent/guardian, mandate holder, later linked minor) on a UNSC designated list or ATA 1997 proscribed list, or acting on their behalf. Services must not be provided. Tipping-off rules apply. This is screening moment 1 of 4; J10, J13 and J17 cover the rest.",
    entersAt:
      "Pre-screen UNSC + ATA 1997 — A hit (applicant or associated person) before any wallet is issued.",
    actors:
      "Screening system; compliance investigator; MLRO. Not the relationship manager as a solo decider.",
    rules: "CCOF F.4 · EMI 12.III, 12.IX, 12.X · AML TFS · STR · tipping-off prohibition",
    timeLimits:
      "Decide within TAT. Possible false-positive investigation still fits the 2-day clock or the customer is notified inside TAT.",
    openQuestion:
      "Approved customer-facing decline text, match threshold, and NACTA feed: NEEDS CONFIRMATION.",
    story:
      "Pre-screening finds the applicant or an associated person (parent/guardian, mandate holder, later linked minor) on a UNSC designated list or ATA 1997 proscribed list, or acting on their behalf. Services must not be provided. Tipping-off rules apply. This is screening moment 1 of 4; J10, J13 and J17 cover the rest.",
    customerSteps: [
      "Journey stops at pre-screen — no wallet is issued.",
      "Receives a truthful generic decline message that must not reveal a sanctions hit or that an STR may be filed.",
      "Cannot reach payments or wallets on this case.",
    ],
    opsControls: [
      "True match vs false positive: investigation case. High-severity needs maker-checker.",
      "False positive: documented clearance, then return to the spine. Do not skip remaining KYC.",
      "True match: do not open; consider STR; apply TFS; notify internal compliance, not the customer, of STR.",
      "STR/CTR filing is not assigned to outsourced staff.",
    ],
    systemInvariants: [
      "PRE_SCREEN_HIT stops issuance. Payments/wallets must not be reachable.",
      "Screening result is immutable: list name, version, score, analyst disposition.",
      "Access to hit details is restricted; who viewed the case is logged.",
      "A timeout is J11. A hit is J5. Never auto-clear a hit.",
    ],
    regulatory: [
      "CCOF F.4",
      "EMI 12.III, 12.IX, 12.X",
      "AML TFS · STR · tipping-off prohibition",
      "UNSC designated lists · ATA 1997",
    ],
    connects: [
      "Map: enters at Pre-screen UNSC + ATA 1997 → J5 Sanctions / proscribed",
      "False positive cleared → return to spine at risk profile (still finish KYC)",
      "True match / TFS → J8 Decline / close (written reason · tracking ID kept)",
      "List unavailable / timeout → J11 (not auto-CLEAR)",
      "Later screening moments: J10, J13, J17",
    ],
  },
  {
    id: "J6",
    color: "#ca8a04",
    group: "Gates & exceptions",
    title: "Extra evidence + approval",
    summary:
      "EDD completed and policy approval to onboard with enhanced monitoring — or J8 if EDD cannot be completed.",
    trigger: "Customer risk profile — CRP rates the applicant high. EDD blocks activation.",
    outcome: "RISK_HIGH_EDD APPROVED → activation path · or J8 if EDD fails/refused",
    whyItExists:
      "The Customer Risk Profile rates the applicant high risk. EDD applies: additional information, and for non-face-to-face, recorded video KYC where required. EDD is additional to CDD, not instead of BV/screening. Limit upgrades (J13) and linked minors (J15) can also land here.",
    entersAt:
      "Customer risk profile — CRP rates the applicant high. EDD blocks activation.",
    actors:
      "Customer; video-KYC officer; compliance; senior management where policy requires approval.",
    rules:
      "CCOF G · EMI 12.V · AML EDD (source of funds/wealth, senior approval, enhanced monitoring)",
    timeLimits:
      "2 working days from complete documents — “complete” for high risk includes EDD documents.",
    openQuestion:
      "First-slice CRP model (what is high risk) and whether PEPs are in appetite: NEEDS CONFIRMATION.",
    story:
      "The Customer Risk Profile rates the applicant high risk. EDD applies: additional information, and for non-face-to-face, recorded video KYC where required. EDD is additional to CDD, not instead of BV/screening. Limit upgrades (J13) and linked minors (J15) can also land here.",
    customerSteps: [
      "Is asked additional questions/documents proportionate to risk (source of funds, occupation evidence, purpose, PEP).",
      "May be scheduled for recorded video KYC even if BV already passed.",
      "Is not told they are “high risk” in accusatory language.",
      "If EDD fails or is refused, the application is declined (J8), not quietly dropped to J1 limits.",
    ],
    opsControls: [
      "Store the CRP model version used for this rating.",
      "PEP follows AML EDD, not a marketing flag.",
      "Enhanced monitoring after onboarding is handed to TMS (J10), not forgotten.",
      "Do not onboard high risk on a “we’ll EDD later” promise.",
    ],
    systemInvariants: [
      "RISK_HIGH_EDD blocks WALLET_ACTIVE until the EDD case is APPROVED.",
      "Video + extra documents are evidence objects.",
      "Maker-checker if policy requires senior approval to open.",
    ],
    regulatory: [
      "CCOF G",
      "EMI 12.V",
      "AML EDD (source of funds/wealth, senior approval, enhanced monitoring)",
    ],
    connects: [
      "Map: enters at Customer risk profile → J6 High-risk EDD (blocks activation)",
      "EDD in parallel with verification ladder — still need BV/screening/CDD",
      "EDD APPROVED → Activation gate → cooling-off → WALLET_ACTIVE + enhanced monitoring (J10)",
      "EDD fails/refused → J8 Decline / close (tracking ID kept)",
      "Also reachable from J13 upgrades and J15 linked minors",
    ],
  },
  {
    id: "J7",
    color: "#0ea5e9",
    group: "Gates & exceptions",
    title: "Save and resume within 30 days",
    summary:
      "CCOF requires unfinished online applications to be resumable for up to 30 days under the same tracking ID, with authoritative state on the server.",
    trigger: "Customer pauses before completion.",
    outcome: "Resume same tracking ID · or EXPIRED after 30 days",
    whyItExists:
      "Customers drop mid-KYC. Forcing a full restart loses evidence continuity and violates the save/resume expectation.",
    customerSteps: [
      "Leaves the app mid-flow.",
      "Returns within 30 days; authenticates with 2FA.",
      "Continues from saved server state.",
    ],
    opsControls: [
      "No PII left as the phone’s source of truth.",
      "On resume: re-check device bind and screening list freshness.",
    ],
    systemInvariants: [
      "Same tracking ID for the session lifetime.",
      "EXPIRED after 30 days — new application required.",
      "Device holds pointer only.",
    ],
    regulatory: ["CCOF save/resume 30 days"],
    connects: ["Resume → continue spine/ladder", "Expired → new APPLICATION_STARTED"],
  },
  {
    id: "J8",
    color: "#64748b",
    group: "Gates & exceptions",
    title: "Decline with written reason",
    summary:
      "Standard terminal negative outcome: specific written reason (EN/UR), tracking ID retained, internal reason code stored separately.",
    trigger: "Any terminal refusal across journeys.",
    outcome: "DECLINED · tracking ID kept for lookup",
    whyItExists:
      "Vague “something went wrong” fails TAT/communication expectations and blocks customer recourse and internal QA.",
    customerSteps: [
      "Receives in-app + SMS/email notice in English and Urdu.",
      "Sees a specific compliant reason (not a sanctions tip-off).",
      "Can still look up status with tracking ID where allowed.",
    ],
    opsControls: [
      "Map internal compliance codes to customer-safe text.",
      "Send discrepancy notices inside TAT before final decline when applicable.",
    ],
    systemInvariants: [
      "Internal reason ≠ customer text (especially for J5).",
      "Tracking ID retained.",
      "Declines are catalogue-driven, not free-typed chaos.",
    ],
    regulatory: ["CCOF TAT / communication", "AML no tipping-off"],
    connects: ["Entry from J4/J5/J6/J11 aging/policy refusals"],
  },
  {
    id: "J9",
    color: "#0891b2",
    group: "After wallet exists",
    title: "New device after onboarding",
    summary:
      "An already-active customer binding a new phone/tablet must complete NADRA BV, notify old channels, and wait cooling-off — not “just log in”.",
    trigger: "Login on unbound device after WALLET_ACTIVE.",
    outcome: "Device trusted after BV + notify + 2-hour cooling-off",
    whyItExists:
      "Device takeover is a common account-takeover vector. BPRD 04 treats new devices as a verification event.",
    customerSteps: [
      "Attempts login on new hardware.",
      "Completes in-app NADRA BV.",
      "Receives alerts on old mobile/email.",
      "Waits 2-hour cooling-off before device is fully trusted.",
    ],
    opsControls: [
      "Enforce max devices per customer.",
      "Investigate multiple CNICs appearing on one device.",
      "Block password reset from unbound devices.",
    ],
    systemInvariants: [
      "Unbound device cannot skip BV.",
      "Cooling-off applies (BPRD 04).",
      "Old channels remain notification targets during the window.",
    ],
    regulatory: ["BPRD 04 via CCOF K"],
    connects: ["Related to J14 credential change controls"],
  },
  {
    id: "J10",
    color: "#db2777",
    group: "After wallet exists",
    title: "Continuous screening & monitoring",
    summary:
      "KYC does not end at issuance. List updates, periodic re-screens, and TMS rules can freeze activity under MONITORING_HOLD.",
    trigger: "List update, periodic re-screen, or TMS rule fire.",
    outcome: "MONITORING_HOLD · investigate · clear or STR",
    whyItExists:
      "Sanctions lists and mule typologies change after onboarding. One-time screening is not enough.",
    customerSteps: [
      "May experience restricted payments/app functions.",
      "Must not be tipped off about sanctions matches.",
    ],
    opsControls: [
      "Fail closed on vendor errors (HOLD, never CLEAR).",
      "Investigate with maker-checker as severity requires.",
      "File STR when suspicion exists regardless of amount.",
      "Retain audit artifacts 10 years.",
    ],
    systemInvariants: [
      "MONITORING_HOLD blocks risky services pending disposition.",
      "Distinct from J17 CDD refresh (identity data vs sanctions/TMS).",
    ],
    regulatory: ["AML ongoing monitoring", "TMS expectations", "STR rules"],
    connects: ["Confirmed hit may resemble J5 controls post-issuance"],
  },
  {
    id: "J11",
    color: "#ea580c",
    group: "Gates & exceptions",
    title: "Provider timeout (fail closed)",
    summary:
      "NADRA, screening lists, SMS/OTP, or pairing services time out or error. The system must not auto-approve.",
    trigger: "Provider unavailable, timeout, or stub mode.",
    outcome: "VERIFICATION_PENDING / MANUAL_REVIEW · retry queue",
    whyItExists:
      "Timeout-as-pass is how sanctioned or unverified traffic gets a receipt. Fail closed is a hard product rule.",
    customerSteps: [
      "Sees “verification delayed / try again” with tracking ID.",
      "Can resume later without losing the application (within J7 window).",
    ],
    opsControls: [
      "Retry queues with backoff.",
      "Label stubs clearly — stub APPROVED is never a real clean customer.",
      "Keep PII out of client caches and error logs.",
    ],
    systemInvariants: [
      "Map failures to PENDING/MANUAL_REVIEW — never APPROVED.",
      "Screening unavailable ≠ PRE_SCREEN_CLEAR.",
    ],
    regulatory: ["Fail-closed compliance design", "CCOF/AML practice"],
    connects: ["Retry → resume spine/ladder", "Abandon → J8 eventually"],
  },
  {
    id: "J12",
    color: "#4f46e5",
    group: "Gates & exceptions",
    title: "Duplicate CNIC",
    summary:
      "One active e-money instrument per CNIC per EMI. Duplicates are blocked without helping attackers enumerate accounts.",
    trigger: "Spine step 7 finds an existing active wallet for this CNIC.",
    outcome: "Block second wallet · route or generic reply",
    whyItExists:
      "EMI 12.VII prevents multiple instruments per CNIC at one EMI. Enumeration protection prevents CNIC probing.",
    customerSteps: [
      "If authenticated: routed to existing wallet / login / device recovery (J9).",
      "If unauthenticated: generic non-committal response.",
    ],
    opsControls: [
      "Investigate duplicate CNIC + new mobile for takeover fraud.",
      "Datastore uniqueness constraint per EMI tenant.",
    ],
    systemInvariants: [
      "Max one active instrument per CNIC per EMI.",
      "Unauthenticated APIs must not return “already registered” vs “not found” in distinguishable ways.",
    ],
    regulatory: ["EMI 12.VII", "BPRD 04 A.ix"],
    connects: ["Authenticated path may enter J9"],
  },
  {
    id: "J13",
    color: "#0f766e",
    group: "After wallet exists",
    title: "Limit / category upgrade",
    summary:
      "Moving Verisys → biometric → enhanced PKR 1,000,000 is identity verification again, not a settings toggle. Enhanced band needs Annexure-J.",
    trigger: "Customer requests higher band or later completes stronger verification.",
    outcome: "LIMIT_UPGRADE_PENDING → new band after cooling-off",
    whyItExists:
      "Limits are a consequence of verification strength. Raising them without re-verification breaks CCOF F.1 category upgrade rules.",
    customerSteps: [
      "Request upgrade in app.",
      "Complete required verification for target band (BV for biometric; Annexure-J + controls for 1m).",
      "Wait 2-hour cooling-off while old band still enforces.",
    ],
    opsControls: [
      "Re-run screening (screening moment 2).",
      "Verify Annexure-J document in-house (EMI 14.III — do not outsource).",
      "Confirm SIM pairing and in-house TMS for enhanced band.",
    ],
    systemInvariants: [
      "Old limits remain until cooling-off ends.",
      "Enhanced band requires SBP PSP&OD permission context where applicable.",
      "EMI 14.VI exclusions are not a fourth band and not an upgrade shortcut.",
    ],
    regulatory: ["CCOF F.1 category upgrade", "EMI §14", "Annexure-J", "EMI 14.III"],
    connects: ["From J2 Verisys wallets upgrading via BV", "Uses ladder rungs again"],
  },
  {
    id: "J14",
    color: "#0369a1",
    group: "After wallet exists",
    title: "Mobile, email or password change",
    summary:
      "Changing registered contact or credentials requires NADRA BV from a registered device, short-code OTP, alerts to old channels, and cooling-off.",
    trigger: "Customer requests mobile/email/password change.",
    outcome: "CREDENTIAL_CHANGE_PENDING → change live after cooling-off",
    whyItExists:
      "Contact hijack is account takeover. BPRD 04 (via CCOF K) hardens these modifications.",
    customerSteps: [
      "Initiate change from registered device.",
      "Complete NADRA BV.",
      "OTP to new value via short code.",
      "Old mobile/email receive immediate alerts.",
      "Wait 2 hours before change fully applies.",
    ],
    opsControls: [
      "Reject password reset on unbound devices.",
      "SIM change re-checks CNIC–MSISDN pairing.",
      "Keep old channels active for alerts during the window.",
    ],
    systemInvariants: [
      "CREDENTIAL_CHANGE_PENDING state.",
      "Cooling-off mandatory.",
      "BV required for registered email/phone modification.",
    ],
    regulatory: ["BPRD 04 via CCOF K"],
    connects: ["Shares cooling-off/BV pattern with J9"],
  },
  {
    id: "J15",
    color: "#a21caf",
    group: "Other EMI customers",
    title: "Parent-linked minor wallet",
    summary:
      "A minor wallet may be opened only inside a parent/guardian’s already-verified app, with undertaking, screening of both parties, and restricted bands.",
    trigger: "Guardian initiates child wallet in guardian app.",
    outcome: "MINOR_LINKED · basic 50k or freelancer BV 400k",
    whyItExists:
      "EMI §14.IV–V allows linked minor wallets with strict funding and limit rules — not independent adult products.",
    customerSteps: [
      "Guardian authenticated in own app.",
      "Uploads B-Form / juvenile CNIC; signs digital undertaking.",
      "Chooses basic (Verisys 50k) or freelancer minor (BV 400k).",
      "Basic minor funded only from parent wallet.",
    ],
    opsControls: [
      "Screen parent and child — hit on either is J5 stop.",
      "Prohibit adult 1m enhanced band for minors.",
      "Block street cash-in for basic minors.",
    ],
    systemInvariants: [
      "MINOR_LINKED relationship required.",
      "Cannot open minor wallet as a standalone first product.",
      "Limits capped per minor band rules.",
    ],
    regulatory: ["EMI §14.IV–V"],
    connects: ["Sanctions on either party → J5"],
  },
  {
    id: "J16",
    color: "#57534e",
    group: "After wallet exists",
    title: "Close, redeem, release CNIC",
    summary:
      "Closure redeems e-money at par with no redemption fee. Cash needs BV; IBFT to own bank needs 2FA. Records retained 10 years.",
    trigger: "Customer close, unverified expiry (EMI 12.IV), or TFS exit.",
    outcome: "WALLET_CLOSED · CNIC slot released per rules",
    whyItExists:
      "EMI §15 requires par issuance/redemption. Closure must free the CNIC uniqueness slot correctly and preserve audit.",
    customerSteps: [
      "Request closure (or is closed by policy).",
      "Redeem remaining balance at par.",
      "Cash redemption → NADRA BV; IBFT → 2FA to own bank account.",
    ],
    opsControls: [
      "Three distinct closure reason files (customer / unverified / TFS).",
      "No redemption charges.",
      "10-year retention (EMI 24.II).",
    ],
    systemInvariants: [
      "Redeem at par before or as part of close.",
      "WALLET_CLOSED terminal state with reason code.",
      "Uniqueness constraint releases only after close rules complete.",
    ],
    regulatory: ["EMI §15", "EMI 12.IV", "EMI 24.II"],
    connects: ["Unverified aging may arrive from J3"],
  },
  {
    id: "J17",
    color: "#c2410c",
    group: "After wallet exists",
    title: "Periodic CDD / expired CNIC",
    summary:
      "Identity data refresh when CNIC expires, particulars change, or periodic review is due. Distinct from J10 sanctions/TMS holds.",
    trigger: "CNIC expiry, address/name change, or review clock.",
    outcome: "CDD_REFRESH_DUE / OVERDUE · refreshed identity",
    whyItExists:
      "Ongoing CDD keeps identity facts true. Expired IDs have a CCOF token/renewal clock (commonly described as 3 months).",
    customerSteps: [
      "Notified in-app + SMS/email.",
      "Uploads renewed live ID + selfie; confirms particulars.",
      "May face payment restrictions if OVERDUE.",
    ],
    opsControls: [
      "Send discrepancy notice before restriction where required.",
      "Re-screen on new data (screening moment 3).",
      "Enforce expired-ID token clock.",
    ],
    systemInvariants: [
      "CDD_REFRESH_DUE vs OVERDUE states.",
      "Not the same codepath as MONITORING_HOLD (J10).",
    ],
    regulatory: ["AML ongoing CDD", "CCOF expired ID token rules"],
    connects: ["Re-screen may surface J5/J10 paths"],
  },
  {
    id: "J18",
    color: "#1d4ed8",
    group: "Other EMI customers",
    title: "NICOP, POC, ARC, POR / NRP",
    summary:
      "Digital onboarding ID classes other than resident CNIC under CCOF C.5, with residency/tax extras. Passport-only is not the digital path.",
    trigger: "Applicant ID is NICOP, POC, ARC, POR, or NRP abroad scenario.",
    outcome: "Same spine with foreign ID field rules · Verisys abroad until BV exists",
    whyItExists:
      "Overseas Pakistanis and certain foreign-document holders are in scope for digital onboarding — but field validation and BV availability differ.",
    customerSteps: [
      "Select ID class.",
      "Provide residency/foreign address and FATCA/CRS fields as required.",
      "Follow BV if available, else Verisys exception when abroad.",
    ],
    opsControls: [
      "Do not validate ARC/POR as if they were CNIC.",
      "Passport-only → J4 / face-to-face (EMI 12.I lists passport but CCOF digital path does not).",
      "Confirm product is EMI wallet — not RDA.",
    ],
    systemInvariants: [
      "ID-class specific validators.",
      "NRP abroad uses Verisys until NADRA BV abroad operational.",
      "Still subject to AML/CFT screening.",
    ],
    regulatory: ["CCOF C.5", "EMI 12.I", "FATCA/CRS"],
    connects: ["May use J2 Verisys path", "Passport-only → J4"],
  },
  {
    id: "J19",
    color: "#9a3412",
    group: "After wallet exists",
    title: "Cash-in / cash-out at agent, ATM or branch",
    summary:
      "Live wallets can be funded by IBFT or cash-in. Cash-in needs NADRA BV at till. ATM cash-out needs 2FA. Post at par with proof metadata.",
    trigger: "Cash deposit/withdrawal at agent till, ATM, or branch.",
    outcome: "CASH_PENDING → CASH_POSTED at par",
    whyItExists:
      "EMI 15.II and 14.II.d set channel-specific assurance for physical cash movements.",
    customerSteps: [
      "Agent till cash-in: complete NADRA finger BV at till (BVS).",
      "ATM cash-out: complete 2FA.",
      "Agent cash-out: BV/2FA per policy.",
    ],
    opsControls: [
      "Agent cannot bypass till BV for cash-in.",
      "IBFT funding remains available without till cash.",
      "Retain biometric/2FA proof with the posting.",
    ],
    systemInvariants: [
      "CASH_PENDING until proof succeeds.",
      "Credit/debit at par only after proof.",
      "Not a closure journey.",
    ],
    regulatory: ["EMI 15.II", "EMI 14.II.d", "CCOF/BPRD till BV"],
    connects: ["Verisys wallets still need BV for cash-in"],
  },
];

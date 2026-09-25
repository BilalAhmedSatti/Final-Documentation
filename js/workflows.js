/**
 * Interactive KYC diagrams — beginner-first story flows.
 * Rendered by js/site.js. Documentation only.
 */
window.KYC_WORKFLOWS = {
  overview: {
    id: "overview",
    label: "Big picture · New wallet",
    plain:
      "Every new customer walks the same hallway first: open the app, get a tracking ID (not a wallet yet), give identity data, pass safety gates, prove who they are, wait two hours, then get a wallet number.",
    when: "Someone opens the app to create a new e-money wallet",
    outcome: "WALLET_ACTIVE with a late-assigned wallet number — or a clear stop (decline / hold / resume later)",
    tip: "Tracking ID ≠ wallet number. Money only after verification + cooling-off.",
    related: "spine",
    steps: [
      { label: "1. App + 2FA", note: "Device starts the session", kind: "start" },
      { label: "2. Tracking ID", note: "Case file opens — not a wallet", kind: "db" },
      { label: "3. Capture data", note: "CNIC fields + live photo", kind: "process" },
      { label: "4. Safety gates", note: "One CNIC · sanctions · risk", kind: "decision" },
      { label: "5. Prove identity", note: "Ladder A→B→C→D", kind: "process" },
      { label: "6. Activation gate", note: "All four conditions true", kind: "process" },
      { label: "7. Wait 2 hours", note: "Cooling-off (BPRD 04)", kind: "pending" },
      { label: "8. Wallet live", note: "Number assigned late", kind: "end" },
    ],
    forks: [
      { if: "Duplicate CNIC", then: "Stop new open → J12 (login existing or generic reply)" },
      { if: "Sanctions HIT", then: "Hard stop → J5 (no tip-off, no wallet)" },
      { if: "Risk = HIGH", then: "Extra documents → J6 before activate" },
      { if: "Biometric works", then: "Happy path → J1" },
      { if: "Biometric blocked for listed reason", then: "Verisys bundle → J2 (or debit block J3)" },
      { if: "Nothing remote works", then: "Video / partner / decline → J4 → J8" },
    ],
    walkthrough: [
      {
        n: "1",
        title: "Start the case",
        text: "Customer signs in with 2FA. The system creates a tracking ID so the application can be found later. No wallet number yet.",
      },
      {
        n: "2",
        title: "Collect identity",
        text: "National ID fields, live photo, and location/IP go to the server — not left sitting on the phone.",
      },
      {
        n: "3",
        title: "Pass the gates",
        text: "One active wallet per CNIC, sanctions lists clear, and risk assessed. Any hard fail stops the journey.",
      },
      {
        n: "4",
        title: "Climb the ladder",
        text: "Try biometric (A) first. Only move down to Verisys (B), debit block (C), or video/partner (D) when the higher rung truly cannot work.",
      },
      {
        n: "5",
        title: "Activate late",
        text: "Only when verification + screening + CDD (and EDD if needed) are done, wait two hours, then assign the wallet number.",
      },
    ],
  },

  J1: {
    id: "J1",
    label: "J1 · Clean biometric",
    plain:
      "WALLET_ACTIVE at NADRA-biometric limits (commercial monthly load PKR 400,000). This is the highlighted navy-spine path: Capture → Eligibility gates → NADRA BV → Activation gate → 2-hour cooling-off → wallet number. Not a bank deposit — trustee-bank e-money claim.",
    when: "Customer opens the app — first-time digital onboarding (navy spine)",
    outcome: "WALLET_ACTIVE at biometric band · PKR 400,000 commercial monthly load",
    tip: "J1 is BV_PASSED on the shared spine — gates still apply. Wallet number only after cooling-off.",
    related: "J1",
    steps: [
      { label: "Open app", note: "Do not reveal wallet", kind: "start" },
      { label: "2FA + bind", note: "OTP short code", kind: "process" },
      { label: "Consent", note: "EMI 12.VI · 30-day", kind: "process" },
      { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
      { label: "Live ID data", note: "Table-A ∪ EMI 12.I", kind: "process" },
      { label: "Geo + IP", note: "CCOF F.3", kind: "process" },
      { label: "One CNIC?", note: "EMI 12.VII", kind: "decision" },
      { label: "Pre-screen", note: "UNSC + ATA clear", kind: "decision" },
      { label: "Risk profile", note: "Low / medium", kind: "decision" },
      { label: "NADRA BV", note: "Primary remote", kind: "process" },
      { label: "J1 path", note: "BV_PASSED · 400k", kind: "end" },
      { label: "Activation gate", note: "BV + screen + CDD", kind: "process" },
      { label: "Cool 2 hours", note: "BPRD 04 A", kind: "pending" },
      { label: "WALLET_ACTIVE", note: "Issue number late", kind: "end" },
    ],
    forks: [
      { if: "Duplicate CNIC", then: "Leave spine → J12" },
      { if: "Sanctions / proscribed HIT", then: "Hard stop → J5 (then decline path J8)" },
      { if: "CRP = HIGH", then: "EDD first → J6 (do not silently skip)" },
      { if: "NADRA / OTP unavailable", then: "Fail closed → J11" },
      { if: "BV impossible (listed reason)", then: "Verisys ladder → J2 (or J3 / J4)" },
      { if: "Wallet already live — later events", then: "J9 new device · J10 monitoring · J13 upgrade · J19 cash" },
    ],
    walkthrough: [
      {
        n: "1",
        title: "Capture",
        text: "Open app (no wallet hint) → mobile OTP + device bind → terms (30-day save) → tracking ID (APPLICATION_STARTED) → national data + live ID → geo/IP.",
      },
      {
        n: "2",
        title: "Eligibility gates",
        text: "One CNIC one wallet (EMI 12.VII) → pre-screen UNSC + ATA 1997 (fail closed if lists down) → risk low/medium. High risk is J6, not silent continue.",
      },
      {
        n: "3",
        title: "Verification ladder → J1",
        text: "Attempt NADRA biometric. On BV_PASSED this is the J1 clean path (biometric limit band). Other outcomes go to J2 / J3 / J4 / J11.",
      },
      {
        n: "4",
        title: "Decide and activate",
        text: "Activation gate needs verification + pre-screen + CDD + risk OK. Then 2-hour cooling-off (BPRD 04 A). Timer ends → issue wallet number → WALLET_ACTIVE.",
      },
    ],
  },

  J2: {
    id: "J2",
    label: "J2 · Listed reason, then Verisys",
    plain:
      "Same navy spine as J1 through Capture + Eligibility. At Attempt NADRA biometric, BV is not possible for a listed reason — dashed branch to J2 (Verisys + pairing + OTP/call-back). Full J2 success rejoins Activation gate → 2-hour cooling-off → WALLET_ACTIVE at Verisys limits (PKR 50,000 load).",
    when: "Map label: “Starts here — BV not possible” off Attempt NADRA biometric",
    outcome: "WALLET_ACTIVE · Verisys class · PKR 50,000 load · PKR 10,000 cash-out/day",
    tip: "Capture + gates already ran. J2 is only the Verisys branch; Full J2 success rejoins the shared activate path.",
    related: "J2",
    steps: [
      { label: "Capture done", note: "Shared spine 1–6", kind: "start" },
      { label: "Gates clear", note: "CNIC · screen · risk", kind: "decision" },
      { label: "Attempt NADRA BV", note: "START · not possible", kind: "decision" },
      { label: "J2 Verisys", note: "Verisys + pairing\n+ OTP/call-back", kind: "process" },
      { label: "Full J2 success", note: "Rejoin spine", kind: "db" },
      { label: "Activation gate", note: "Verify + CDD + risk", kind: "process" },
      { label: "Cool 2 hours", note: "BPRD 04 A.vii", kind: "pending" },
      { label: "WALLET_ACTIVE", note: "Verisys limit class", kind: "end" },
    ],
    forks: [
      { if: "BV passed instead", then: "Stay on solid path → J1" },
      { if: "Pairing or OTP/call-back fails", then: "J2 did not pass → J3 or J4" },
      { if: "Provider timeout", then: "J11 fail closed" },
      { if: "Later BV upgrade", then: "New case J13 — not an edit of this pack" },
    ],
    walkthrough: [
      {
        n: "1",
        title: "Shared spine first",
        text: "Customer already completed Capture and Eligibility gates. The map’s J2 dashed line only starts at Attempt NADRA biometric.",
      },
      {
        n: "2",
        title: "Starts here — BV not possible",
        text: "Listed genuine reason is recorded. J2 box = Verisys + CNIC–MSISDN pairing + OTP/call-back (all required).",
      },
      {
        n: "3",
        title: "Full J2 success rejoins",
        text: "Dashed arrow returns to Activation gate (verify + pre-screen + CDD + risk OK), then 2-hour cooling-off, then WALLET_ACTIVE with limits following Verisys class.",
      },
    ],
  },

  J3: {
    id: "J3",
    label: "J3 · Opened, cannot spend",
    plain:
      "Same navy spine through Capture + Eligibility. At Attempt NADRA BV → BV not possible → J2. Map branch “Verisys ok, pairing/OTP fail” → J3 Debit-blocked open → Restricted open → DEBIT_BLOCKED (not a spending wallet). Does not take Accept → cool-off → WALLET_ACTIVE. Never verified → dashed path to J8.",
    when: "Map: after J2 — “Verisys ok, pairing/OTP fail”",
    outcome: "DEBIT_BLOCKED · not a spending wallet · not WALLET_ACTIVE",
    tip: "Block is a compliance control. Prefer not using EMI 12.IV one unverified credit. Legal: restricted open ≠ full activation NEEDS CONFIRMATION.",
    related: "J3",
    steps: [
      { label: "Open app", note: "Capture starts", kind: "start" },
      { label: "Capture spine", note: "2FA · ID · geo", kind: "process" },
      { label: "Gates clear", note: "CNIC · screen · risk", kind: "decision" },
      { label: "Attempt NADRA BV", note: "BV not possible", kind: "decision" },
      { label: "J2 Verisys", note: "Verisys succeeds", kind: "process" },
      { label: "Pairing/OTP fail", note: "Map branch", kind: "decision" },
      { label: "J3 restricted open", note: "Not Accept path", kind: "process" },
      { label: "DEBIT_BLOCKED", note: "Not spending wallet", kind: "pending" },
    ],
    forks: [
      { if: "Any debit attempt", then: "Fail closed · store DEBIT_BLOCK_KYC" },
      { if: "Never completes verification", then: "Dashed map path → J8 Decline / close + consider STR" },
      { if: "Later BV or full pairing+OTP", then: "Lift block = new verification event" },
      { if: "Pre-screen was not CLEAR", then: "Should never reach J3 — defect" },
    ],
    walkthrough: [
      {
        n: "1",
        title: "1 Capture + 2 Gates",
        text: "Full shared spine: open app → 2FA → consent → tracking ID → live ID → geo/IP → one CNIC → pre-screen CLEAR → risk OK.",
      },
      {
        n: "2",
        title: "3 Verification ladder",
        text: "Attempt NADRA BV → “Starts here — BV not possible” → J2 Verisys → “Verisys ok, pairing/OTP fail” → J3 Debit-blocked open.",
      },
      {
        n: "3",
        title: "4 Restricted open",
        text: "Activation area takes Restricted open → DEBIT_BLOCKED (not a spending wallet). Not the Accept → 2-hour cool-off → WALLET_ACTIVE path.",
      },
      {
        n: "4",
        title: "5 If never verified",
        text: "Dashed line on the map from DEBIT_BLOCKED to J8 Decline / close; tracking ID kept; consider STR (EMI 12.IV).",
      },
    ],
  },

  J4: {
    id: "J4",
    label: "J4 · Video KYC / partner / decline",
    plain:
      "Map: J4 · enters at J2 / J3 exhausted. Shared Capture + Gates, then Attempt NADRA BV → J2 → J3 exhausted → J4 Video KYC / partner (last remote rung). Accept → Activation gate → 2-hour cool-off → WALLET_ACTIVE. Still incomplete → J8.",
    when: "Map: enters at J2 / J3 exhausted — last remote rung",
    outcome: "WALLET_ACTIVE after cool-off · or J8 decline (tracking ID kept)",
    tip: "VIDEO_KYC_REQUIRED evidence object. Agents must not issue (EMI 17.VII). No video/partner capacity → J4 becomes J8.",
    related: "J4",
    steps: [
      { label: "Open app", note: "Capture starts", kind: "start" },
      { label: "Capture spine", note: "2FA · ID · geo", kind: "process" },
      { label: "Gates clear", note: "CNIC · screen · risk", kind: "decision" },
      { label: "Attempt NADRA BV", note: "BV not possible", kind: "decision" },
      { label: "J2 Verisys", note: "Then J3 exhausted", kind: "process" },
      { label: "J4 Video / partner", note: "Last remote rung", kind: "process" },
      { label: "Activation gate", note: "Accept path", kind: "process" },
      { label: "Cool → ACTIVE", note: "Or J8 if fail", kind: "end" },
    ],
    forks: [
      { if: "J4 Accept", then: "Activation gate → 2-hour cooling-off → WALLET_ACTIVE" },
      { if: "Still incomplete", then: "Dashed map path → J8 Decline / close · tracking ID kept" },
      { if: "Only pairing/OTP failed after Verisys", then: "That is J3 DEBIT_BLOCKED — not J4" },
      { if: "No video and no partner bank in first slice", then: "J4 collapses to J8" },
    ],
    walkthrough: [
      {
        n: "1",
        title: "1 Capture + 2 Gates",
        text: "Open app → 2FA → consent → tracking ID → live ID → geo/IP → one CNIC → pre-screen CLEAR → risk OK.",
      },
      {
        n: "2",
        title: "3 Ladder into J4",
        text: "Attempt NADRA BV → BV not possible → J2 Verisys → J3 not usable / exhausted → J4 Video KYC / partner (last remote rung, or decline).",
      },
      {
        n: "3",
        title: "4 Accept path",
        text: "J4 success feeds Activation gate (Accept) → 2-hour cooling-off → WALLET_ACTIVE with limits following verification strength.",
      },
      {
        n: "4",
        title: "Still incomplete → J8",
        text: "Dashed line on the map to J8 Decline / close with written reason; tracking ID kept.",
      },
    ],
  },

  J5: {
    id: "J5",
    label: "J5 · Hard stop · no wallet",
    plain:
      "Map: enters at Pre-screen UNSC + ATA 1997. HIT on applicant or associated person → J5 Hard stop · no tipping-off. False positive cleared → back to spine (still finish KYC). True match / TFS → J8. No wallet. Possible STR — never tip off the customer.",
    when: "Pre-screen UNSC + ATA 1997 — hit before any wallet is issued",
    outcome: "No wallet · PRE_SCREEN_HIT · possible STR/TFS · or false-positive return to spine",
    tip: "Timeout = J11. Hit = J5. Never auto-clear. Open: decline text, match threshold, NACTA feed NEEDS CONFIRMATION.",
    related: "J5",
    steps: [
      { label: "Capture done", note: "Shared spine 1–6", kind: "start" },
      { label: "One CNIC?", note: "Then pre-screen", kind: "decision" },
      { label: "Pre-screen HIT", note: "UNSC + ATA · START", kind: "danger" },
      { label: "J5 Sanctions", note: "Hard stop · no tip-off", kind: "danger" },
      { label: "Investigate", note: "Maker-checker", kind: "process" },
      { label: "False positive?", note: "Clear → spine", kind: "decision" },
      { label: "True match", note: "TFS · consider STR", kind: "danger" },
      { label: "J8 Decline", note: "Tracking ID kept", kind: "danger" },
    ],
    forks: [
      { if: "Lists unavailable / timeout", then: "J11 fail closed — never auto-CLEAR" },
      { if: "False positive cleared", then: "Documented clearance → return to spine · still finish KYC" },
      { if: "True match / TFS", then: "Do not open · STR/TFS internal · J8 decline without tip-off" },
      { if: "Outsourced staff asked to file STR", then: "Not allowed — compliance / MLRO owns filing" },
    ],
    walkthrough: [
      {
        n: "1",
        title: "1 Capture",
        text: "Customer already completed open app → 2FA → consent → tracking ID → live ID → geo/IP before the gate.",
      },
      {
        n: "2",
        title: "2 Pre-screen START",
        text: "After one-CNIC check, Pre-screen UNSC + ATA 1997 runs. Fail closed if lists unavailable (J11). A HIT opens J5 — hard stop · no tipping-off.",
      },
      {
        n: "3",
        title: "Investigate",
        text: "High-severity maker-checker. Immutable result (list, version, score, disposition). Restricted access; viewers logged.",
      },
      {
        n: "4",
        title: "Exit paths on the map",
        text: "False positive cleared → back to spine at risk profile (still finish KYC). True match / TFS → J8 Decline / close with written reason; tracking ID kept; STR not revealed to customer.",
      },
    ],
  },

  J6: {
    id: "J6",
    label: "J6 · Extra evidence + approval",
    plain:
      "Map: enters at Customer risk profile when CRP = HIGH. J6 High-risk EDD blocks activation until extra evidence + policy approval. EDD runs in parallel with the verification ladder. APPROVED → gate → cool-off → WALLET_ACTIVE (+ J10 monitoring). Fail/refuse → J8 — not silent J1 limits.",
    when: "Customer risk profile — CRP rates the applicant high. EDD blocks activation",
    outcome: "EDD APPROVED → WALLET_ACTIVE with enhanced monitoring · or J8",
    tip: "Store CRP model version. No “we’ll EDD later.” Open: CRP model + PEP appetite NEEDS CONFIRMATION.",
    related: "J6",
    steps: [
      { label: "Capture + gates", note: "Screen CLEAR", kind: "start" },
      { label: "CRP = HIGH", note: "START · J6", kind: "decision" },
      { label: "EDD pack + video?", note: "Additive to BV/CDD", kind: "process" },
      { label: "Evidence stored", note: "Docs · video · CRP ver", kind: "db" },
      { label: "Policy approve?", note: "Maker-checker", kind: "decision" },
      { label: "Activation gate", note: "EDD APPROVED required", kind: "process" },
      { label: "Cool → ACTIVE", note: "Then J10 monitor", kind: "end" },
      { label: "Or J8 decline", note: "If EDD fails", kind: "danger" },
    ],
    forks: [
      { if: "EDD APPROVED", then: "Activation gate → cooling-off → WALLET_ACTIVE · hand monitoring to J10" },
      { if: "EDD fails or refused", then: "J8 Decline / close — not quietly drop to J1 limits" },
      { if: "Try to activate without EDD", then: "RISK_HIGH_EDD blocks WALLET_ACTIVE" },
      { if: "Entry from upgrade / minor", then: "Same J6 rules on J13 / J15" },
    ],
    walkthrough: [
      {
        n: "1",
        title: "1–2 Enter at CRP",
        text: "After Capture and CLEAR pre-screen, Customer risk profile rates HIGH → J6 High-risk EDD (extra evidence · blocks activation).",
      },
      {
        n: "2",
        title: "3 Parallel with ladder",
        text: "Still complete BV/Verisys ladder as usual. Collect SoF, occupation, purpose, PEP evidence; video KYC if required even when BV already passed.",
      },
      {
        n: "3",
        title: "4 Approve then activate",
        text: "RISK_HIGH_EDD clears only when EDD case is APPROVED (maker-checker if required). Then activation gate + 2-hour cooling-off → WALLET_ACTIVE.",
      },
      {
        n: "4",
        title: "Aftercare",
        text: "Enhanced monitoring goes to TMS (J10). Never onboard on a promise to EDD later.",
      },
    ],
  },

  J7: {
    "id": "J7",
    "label": "J7 · Same tracking ID",
    "plain": "Customer continues from the last completed step with the same tracking ID. After 30 days the application expires and must start again (new tracking ID). CCOF requires the online application to save an ongoing session that the customer can resume for up to 30 days without restarting. Authoritative state is server-side — not photos sitting in the phone gallery.",
    "when": "Any point after APPLICATION_STARTED and before a terminal decision.",
    "outcome": "Customer continues from the last completed step with the same tracking ID. After 30 days the application expires and must start again (new tracking ID).",
    "tip": "TAT vs 30-day clock; retention of never-completed applications; BV freshness if older than N hours.",
    "related": "J7",
    "steps": [
      {
        "label": "APPLICATION_STARTED",
        "note": "Tracking ID exists",
        "kind": "db"
      },
      {
        "label": "Customer pauses",
        "note": "Leaves the app",
        "kind": "start"
      },
      {
        "label": "Server keeps state",
        "note": "Not phone gallery",
        "kind": "db"
      },
      {
        "label": "Return ≤ 30 days",
        "note": "2FA again",
        "kind": "process"
      },
      {
        "label": "Re-check safety",
        "note": "Device · lists · freshness",
        "kind": "process"
      },
      {
        "label": "Continue spine",
        "note": "Same tracking ID",
        "kind": "end"
      }
    ],
    "forks": [],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "Any point after APPLICATION_STARTED and before a terminal decision."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Leaves the app (call dropped, photo failed, user paused). Returns within 30 days, authenticates (2FA), sees progress and remaining steps, continues."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Support can locate the application by tracking ID without reading full CNIC aloud. Do not copy a half-finished pack onto a new CNIC."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Device holds at most a pointer, not the KYC payload. Resume re-checks: device still bound or treat as J9; re-screen if list version changed; freshness of liveness/BV."
      }
    ]
  },

  J8: {
    "id": "J8",
    "label": "J8 · Tracking ID still works",
    "plain": "DECLINED (or CLOSED_UNVERIFIED). Customer can see status by tracking ID. Internal reason codes may be richer than the customer-facing text (especially J5). Any terminal negative outcome must produce a specific written reason, keep the tracking ID, and fit TAT communication rules. Vague “something went wrong” is not compliant.",
    "when": "J2/J3/J4 exhaustion, J5 true match, J6 EDD fail, J11 unresolved, J12 duplicate, J13/J15/J18 fail, or incomplete CDD at TAT.",
    "outcome": "DECLINED (or CLOSED_UNVERIFIED). Customer can see status by tracking ID. Internal reason codes may be richer than the customer-facing text (especially J5).",
    "tip": "Customer-facing reason catalogue must be approved by compliance/legal.",
    "related": "J8",
    "steps": [
      {
        "label": "Enters here",
        "note": "J2/J3/J4 exhaustion, J5 true match, J6 EDD",
        "kind": "start"
      },
      {
        "label": "Internal reason code",
        "note": "Compliance catalogue",
        "kind": "db"
      },
      {
        "label": "Customer notice EN/UR",
        "note": "Specific · no tip-off",
        "kind": "process"
      },
      {
        "label": "DECLINED",
        "note": "Tracking ID still works",
        "kind": "danger"
      }
    ],
    "forks": [
      {
        "if": "From J5 true match",
        "then": "From J5 true match"
      },
      {
        "if": "From J6 EDD fail",
        "then": "From J6 EDD fail"
      },
      {
        "if": "From J4 incomplete",
        "then": "From J4 incomplete"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "J2/J3/J4 exhaustion, J5 true match, J6 EDD fail, J11 unresolved, J12 duplicate, J13/J15/J18 fail, or incomplete CDD at TAT."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Receives written notice (in-app + SMS/email) with a specific reason appropriate to the case, in English and Urdu. Can still look up the tracking ID and see closed status."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Reason catalogue: verification failed; documents incomplete after notice; duplicate wallet; cannot offer product; identity could not be verified — plus internal-only codes for TFS/STR. If documents were incomplete, a discrepancy notice must have gone out inside TAT before a silent decline."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Terminal state is immutable. A retry is a new application (new tracking ID), except a documented sanctions false-positive clearance on the same ID. Customer-facing reason and internal reason are stored separately."
      }
    ]
  },

  J9: {
    "id": "J9",
    "label": "J9 · BV · notify · cooling-off",
    "plain": "New device bound and usable after cooling-off, or rejected. Old devices remain until removed, subject to max-device policy. After the customer already has a wallet, a new phone/tablet must be registered with NADRA BV (preferably digital), immediate notification, cooling-off, and device-limit checks. This is not “just log in with OTP.” Changing mobile, email, or password on the same device is J14, not this journey.",
    "when": "WALLET_ACTIVE (or DEBIT_BLOCKED) customer attempts access from an unbound device.",
    "outcome": "New device bound and usable after cooling-off, or rejected. Old devices remain until removed, subject to max-device policy.",
    "tip": "Primary bind key (IMEI privacy), max devices, root/jailbreak policy: NEEDS CONFIRMATION.",
    "related": "J9",
    "steps": [
      {
        "label": "WALLET_ACTIVE",
        "note": "Existing customer",
        "kind": "start"
      },
      {
        "label": "New device login",
        "note": "Not yet trusted",
        "kind": "decision"
      },
      {
        "label": "NADRA BV",
        "note": "In-app biometric",
        "kind": "process"
      },
      {
        "label": "Notify old channels",
        "note": "SMS + email",
        "kind": "process"
      },
      {
        "label": "Cool 2 hours",
        "note": "BPRD 04",
        "kind": "pending"
      },
      {
        "label": "Device trusted",
        "note": "Manage devices",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "Contact/password change is J14",
        "then": "Contact/password change is J14"
      },
      {
        "if": "Fraud pattern",
        "then": "Fraud pattern → J10"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "WALLET_ACTIVE (or DEBIT_BLOCKED) customer attempts access from an unbound device."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Opens the app on a new device. Is not in full wallet use before the device is registered. Completes NADRA BV in-app (or an approved pair of alternate controls)."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "If max devices exceeded: extra authentication, recorded justification, customer verification. If the same device is used across too many CNICs: fraud procedure; may report the device to PTA."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Unbound device session cannot move money or reset credentials. Device registry: identifiers, first-seen, notify timestamps, cooling-off end, status."
      }
    ]
  },

  J10: {
    "id": "J10",
    "label": "J10 · KYC does not end at issuance",
    "plain": "MONITORING_HOLD or freeze per TFS; investigation CLEAR (resume) or CONFIRMED (STR, exit, freeze). Screening is not one-time. After onboarding, list updates, periodic re-screens, and transaction monitoring can produce a hit. Restrict, investigate, report, and keep an audit trail without tipping off. Refreshing expired CNIC data is J17; this journey is the hit itself.",
    "when": "WALLET_ACTIVE or DEBIT_BLOCKED. List update, periodic cycle, payment, cash-out, device+behaviour scenarios. Material changes (upgrade, new linked person) re-screen in J13/J15 before they complete.",
    "outcome": "MONITORING_HOLD or freeze per TFS; investigation CLEAR (resume) or CONFIRMED (STR, exit, freeze).",
    "tip": "TMS rule catalogue, list-refresh frequency, CTR threshold, FTDH in first slice.",
    "related": "J10",
    "steps": [
      {
        "label": "WALLET_ACTIVE",
        "note": "Or DEBIT_BLOCKED",
        "kind": "start"
      },
      {
        "label": "Trigger",
        "note": "List · TMS · payment",
        "kind": "process"
      },
      {
        "label": "MONITORING_HOLD",
        "note": "Fail closed",
        "kind": "pending"
      },
      {
        "label": "Investigate",
        "note": "No tip-off",
        "kind": "process"
      },
      {
        "label": "CLEAR or STR",
        "note": "Resume · or exit",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "Confirmed TFS/exit",
        "then": "Confirmed TFS/exit → J16"
      },
      {
        "if": "Exit path may use J8 wording",
        "then": "Exit path may use J8 wording"
      },
      {
        "if": "Not the same as CDD refresh (J17)",
        "then": "Not the same as CDD refresh (J17)"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "WALLET_ACTIVE or DEBIT_BLOCKED. List update, periodic cycle, payment, cash-out, device+behaviour scenarios. Material changes (upgrade, new linked person) re-screen in J13/J15 before they complete."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "May see a payment declined or channels suspended. Must not be told “we filed an STR.” May be asked source-of-funds questions that are part of monitoring, not a casual chat."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Fail closed: rule fire or vendor timeout → HOLD, never CLEAR. Specify fraud scenarios: new device then credential reset; burst IBFT; geo change; mule-device."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Re-screen creates a new screening fact; it does not edit the onboarding screen. HOLD is visible to payments and wallets immediately."
      }
    ]
  },

  J11: {
    "id": "J11",
    "label": "J11 · Never auto-approve",
    "plain": "VERIFICATION_PENDING or PRE_SCREEN_UNAVAILABLE or MANUAL_REVIEW. No WALLET_ACTIVE. Retry, wait, or J8 if TAT expires without CDD. NADRA, screening lists, SMS/OTP, or pairing services are unavailable, time out, or are in stub mode. The product must not auto-approve. A stub APPROVED is a labelled fake — never a real clean customer.",
    "when": "Any spine step that calls a provider.",
    "outcome": "VERIFICATION_PENDING or PRE_SCREEN_UNAVAILABLE or MANUAL_REVIEW. No WALLET_ACTIVE. Retry, wait, or J8 if TAT expires without CDD.",
    "tip": "Max retries; whether operations can ever override NADRA-down (working position: no).",
    "related": "J11",
    "steps": [
      {
        "label": "Call provider",
        "note": "NADRA · lists · OTP",
        "kind": "start"
      },
      {
        "label": "Timeout / stub",
        "note": "Never auto-APPROVED",
        "kind": "danger"
      },
      {
        "label": "PENDING / UNAVAILABLE",
        "note": "Queue retry",
        "kind": "pending"
      },
      {
        "label": "Resume or J8",
        "note": "If TAT expires",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "Retry via resume (J7)",
        "then": "Retry via resume (J7)"
      },
      {
        "if": "Cannot complete CDD",
        "then": "Cannot complete CDD → J8"
      },
      {
        "if": "Hit ≠ timeout (J5)",
        "then": "Hit ≠ timeout (J5)"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "Any spine step that calls a provider."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Sees “verification delayed / try again” with tracking ID — not a green success. May resume (J7) when the service recovers."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Sandbox/stub: labelled environment only, synthetic customers, watermarked evidence. Production: queue for retry. No “force approve” without a named officer and a reason that still meets CDD (almost never NADRA-down)."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Provider errors map to PENDING/UNAVAILABLE, never APPROVED. Stub adapter and real adapter share the same port. Feature flag is configuration, not a frontend rewrite."
      }
    ]
  },

  J12: {
    "id": "J12",
    "label": "J12 · One wallet per EMI",
    "plain": "New application does not create a second wallet. Authenticated same person is routed to login / device bind (J9) / support. Attackers get a generic result, not “this CNIC is taken.” A CNIC holder may obtain only one e-money instrument with an EMI. A second attempt must be detected without helping attackers enumerate accounts.",
    "when": "Spine step 7, as soon as CNIC is known — but user-visible behaviour must not confirm existence until authenticated.",
    "outcome": "New application does not create a second wallet. Authenticated same person is routed to login / device bind (J9) / support. Attackers get a generic result, not “this CNIC is taken.”",
    "tip": "Re-open after closure; NICOP vs CNIC same human: NEEDS CONFIRMATION.",
    "related": "J12",
    "steps": [
      {
        "label": "CNIC known",
        "note": "Spine step 7",
        "kind": "start"
      },
      {
        "label": "Already active?",
        "note": "EMI 12.VII",
        "kind": "decision"
      },
      {
        "label": "Authenticated?",
        "note": "Session present?",
        "kind": "decision"
      },
      {
        "label": "Path · Existing",
        "note": "Login / J9",
        "kind": "end"
      },
      {
        "label": "Path · Generic",
        "note": "No enumeration",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "Lost access",
        "then": "Lost access → J9 recovery"
      },
      {
        "if": "CNIC free only after J16 policy",
        "then": "CNIC free only after J16 policy"
      },
      {
        "if": "Minor ≠ second guardian wallet",
        "then": "Minor ≠ second guardian wallet"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "Spine step 7, as soon as CNIC is known — but user-visible behaviour must not confirm existence until authenticated."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Genuine returning customer: after authentication, sees the existing wallet, not a second onboarding. Person who lost access: recovery with BV on a new device (J9) — not a second wallet."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Same CNIC + different mobile claiming to open: possible takeover or mule; do not open a second wallet; investigate. Whether a closed wallet frees the CNIC: see J16. Working position after full closure and cooling policy — NEEDS CONFIRMATION."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Uniqueness of active instrument per CNIC per EMI is an invariant. Lookup is server-side; response to unauthenticated clients stays generic."
      }
    ]
  },

  J13: {
    "id": "J13",
    "label": "J13 · Verisys → BV → enhanced",
    "plain": "LIMITS_UPDATED after a new verification case, re-screen, CRP, and 2-hour cooling-off — or stay on the old band, or J8 if CDD for the new band cannot be completed. CCOF F.1 treats change or upgradation of wallet category as identity verification again — not a settings toggle. A Verisys customer who later completes NADRA BV moves to the biometric band. A biometric customer who later qualifies for the SBP-approved enhan",
    "when": "WALLET_ACTIVE at a lower band, or DEBIT_BLOCKED customer completing BV / full J2.",
    "outcome": "LIMITS_UPDATED after a new verification case, re-screen, CRP, and 2-hour cooling-off — or stay on the old band, or J8 if CDD for the new band cannot be completed.",
    "tip": "When PSP&OD enhanced-wallet and 14.VI exclusion permissions are sought; first-slice licence stage (pilot vs commercial) — NEEDS CONFIRMATION.",
    "related": "J13",
    "steps": [
      {
        "label": "WALLET_ACTIVE",
        "note": "Lower band today",
        "kind": "start"
      },
      {
        "label": "Upgrade request",
        "note": "Or later BV",
        "kind": "process"
      },
      {
        "label": "Re-verify ID",
        "note": "BV / Annexure-J",
        "kind": "process"
      },
      {
        "label": "Re-screen + CRP",
        "note": "Moment 2",
        "kind": "decision"
      },
      {
        "label": "Cool 2 hours",
        "note": "Old band meantime",
        "kind": "pending"
      },
      {
        "label": "LIMITS_UPDATED",
        "note": "Or stay / J8",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "CRP high on upgrade",
        "then": "CRP high on upgrade → J6"
      },
      {
        "if": "Provider down",
        "then": "Provider down → J11"
      },
      {
        "if": "Upgrade CDD fails",
        "then": "Upgrade CDD fails → J8"
      },
      {
        "if": "Till BV may open J13 case",
        "then": "Till BV may open J13 case"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "WALLET_ACTIVE at a lower band, or DEBIT_BLOCKED customer completing BV / full J2."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Requests a higher monthly load, or is prompted after a successful later BV. Completes the verification required for the target band (BV for PKR 400,000; for PKR 1,000,000: one Annexure-J income document + SIM pairing + extra questions)."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Re-run identity verification for the new category. Do not copy the onboarding BV result and call it an upgrade. Re-screen the customer (and any associated person) before the new band goes live — screening moment 2."
      },
      {
        "n": "4",
        "title": "System",
        "text": "UPGRADE_CASE is a new verification + screening + CRP bundle linked to the existing wallet, not a new CNIC. Limit engine reads current verification strength and licence stage. Payments honour the old band until cooling-off ends."
      }
    ]
  },

  J14: {
    "id": "J14",
    "label": "J14 · BV · notify · cooling-off",
    "plain": "CREDENTIAL_UPDATED after BV (or listed alternate pair), notification, and cooling-off — or rejected. Wallet spend on the old mobile/email continues until the timer ends. BPRD 04 (pulled into EMI digital onboarding by CCOF K) requires NADRA BV for modification of registered email or phone, credential reset only from a registered device, OTP from the institution short code, and a two-hour cooling-off before the change ",
    "when": "WALLET_ACTIVE (or DEBIT_BLOCKED) customer requests change of MSISDN, email, user ID or password from a registered device.",
    "outcome": "CREDENTIAL_UPDATED after BV (or listed alternate pair), notification, and cooling-off — or rejected. Wallet spend on the old mobile/email continues until the timer ends.",
    "tip": "Whether a Verisys-band wallet must repeat full J2 pairing on every SIM change: working position yes. PTA feed for pairing: NEEDS CONFIRMATION.",
    "related": "J14",
    "steps": [
      {
        "label": "Registered device",
        "note": "Required start",
        "kind": "start"
      },
      {
        "label": "NADRA BV",
        "note": "Or listed alternate",
        "kind": "process"
      },
      {
        "label": "OTP / pairing",
        "note": "New mobile",
        "kind": "process"
      },
      {
        "label": "Notify old channels",
        "note": "SMS + email",
        "kind": "process"
      },
      {
        "label": "Cool 2 hours",
        "note": "Old value still live",
        "kind": "pending"
      },
      {
        "label": "CREDENTIAL_UPDATED",
        "note": "Change live",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "New phone is J9 (may fire together)",
        "then": "New phone is J9 (may fire together)"
      },
      {
        "if": "Fraud pattern",
        "then": "Fraud pattern → J10"
      },
      {
        "if": "BV timeout",
        "then": "BV timeout → J11"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "WALLET_ACTIVE (or DEBIT_BLOCKED) customer requests change of MSISDN, email, user ID or password from a registered device."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Starts the change from an already registered device (password reset on an unbound device is refused — see J9). Completes NADRA BV, or two listed alternate controls if BV is not possible (disability, mehndi/bandage, NRP, foreign national)."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Do not fold this into J9. A new phone is a device bind; a new SIM on the same phone is this journey — both can fire together. Password reset: registered device + OTP auto-fetch/sender binding, or robocall / call-back / in-app BV. Randomised negative confirmations on call-back."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Pending change is a dated case: old value, requested value, BV/pairing results, notify timestamps, cooling-off end. Payments, alerts and OTP delivery keep using the old mobile/email until the timer ends."
      }
    ]
  },

  J15: {
    "id": "J15",
    "label": "J15 · Opened inside guardian’s app",
    "plain": "MINOR_WALLET_ACTIVE, linked to the guardian’s instrument, at the matching minor band — or J8 if guardian or child CDD fails. EMI §14.IV–V allows a minor’s e-money wallet only when it is opened in link with a parent/guardian’s already-verified wallet, through that parent’s app. The guardian gives a written or digital undertaking of liability. Basic minor: Verisys, monthly load PKR 50,000, funded only from the parent w",
    "when": "Guardian has WALLET_ACTIVE. Journey runs inside the guardian’s authenticated app — never as a child’s standalone J1.",
    "outcome": "MINOR_WALLET_ACTIVE, linked to the guardian’s instrument, at the matching minor band — or J8 if guardian or child CDD fails.",
    "tip": "B-Form vs juvenile CNIC as the child’s ID; age floor; whether BPRD 2026 teenager-wallet overlay is in appetite — NEEDS CONFIRMATION.",
    "related": "J15",
    "steps": [
      {
        "label": "Guardian WALLET_ACTIVE",
        "note": "Authenticated app",
        "kind": "start"
      },
      {
        "label": "Child ID + link",
        "note": "B-Form / juvenile",
        "kind": "process"
      },
      {
        "label": "Screen both",
        "note": "Hit either → J5",
        "kind": "decision"
      },
      {
        "label": "Band choice",
        "note": "50k or BV 400k",
        "kind": "process"
      },
      {
        "label": "Undertaking",
        "note": "Liability signed",
        "kind": "db"
      },
      {
        "label": "MINOR_LINKED",
        "note": "Cool-off then live",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "Hit on either",
        "then": "Hit on either → J5"
      },
      {
        "if": "CDD fails",
        "then": "CDD fails → J8"
      },
      {
        "if": "Do not reuse adult J1 for child",
        "then": "Do not reuse adult J1 for child"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "Guardian has WALLET_ACTIVE. Journey runs inside the guardian’s authenticated app — never as a child’s standalone J1."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Guardian, already onboarded, chooses “open a wallet for my child” in their own app. Supplies the minor’s identity evidence (B-Form / juvenile ID / CNIC if issued) and relationship proof."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "CDD both people. Screen both. A hit on either person is J5 — do not open the child wallet. Guardian must already be verified. Do not onboard parent and child as one mixed J1 pack."
      },
      {
        "n": "4",
        "title": "System",
        "text": "Child instrument stores guardian_wallet_id, undertaking evidence, relationship type, minor band, funding constraint. Uniqueness: one active minor instrument per child identity with this EMI; guardian may link more than one child."
      }
    ]
  },

  J16: {
    "id": "J16",
    "label": "J16 · Par value · BV for cash",
    "plain": "WALLET_CLOSED. Balance redeemed at par to a verified destination. CNIC-release policy applied. Records retained 10 years after relationship end. EMI §15 requires issuance and redemption at par, with no charges on redemption, and NADRA BV when e-money is redeemed in cash. Customer-requested closure, unverified-instrument closure (EMI 12.IV), and TFS/exit are different reasons that must not share one “delete account” b",
    "when": "WALLET_ACTIVE, DEBIT_BLOCKED never verified, or MONITORING_HOLD confirmed TFS / offboarding.",
    "outcome": "WALLET_CLOSED. Balance redeemed at par to a verified destination. CNIC-release policy applied. Records retained 10 years after relationship end.",
    "tip": "Cooling period before the same CNIC may return; IBFT-only vs cash redemption in first slice — NEEDS CONFIRMATION.",
    "related": "J16",
    "steps": [
      {
        "label": "Close request",
        "note": "Or unverified / TFS",
        "kind": "start"
      },
      {
        "label": "Redeem path",
        "note": "Cash BV · or IBFT 2FA",
        "kind": "decision"
      },
      {
        "label": "Pay at par",
        "note": "No redemption fee",
        "kind": "db"
      },
      {
        "label": "WALLET_CLOSED",
        "note": "10-yr retain",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "Uniqueness / re-open policy",
        "then": "Uniqueness / re-open policy"
      },
      {
        "if": "Not the same as live cash (J19)",
        "then": "Not the same as live cash (J19)"
      },
      {
        "if": "TFS exit from monitoring",
        "then": "TFS exit from monitoring"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "WALLET_ACTIVE, DEBIT_BLOCKED never verified, or MONITORING_HOLD confirmed TFS / offboarding."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Requests closure, or is told the instrument is being closed (unverified / TFS wording that does not tip off). For cash redemption: completes NADRA BV. For IBFT redemption: destination account is their own, with 2FA."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Three closure reasons, three files: (a) customer request, (b) never-verified + consider STR, (c) TFS/exit. Do not mix customer-facing text. Cash-out of remaining e-money: BV, or 2FA at ATM as EMI 14.II.d. Agent cash-out: BV or 2FA where BVS is a genuine constraint."
      },
      {
        "n": "4",
        "title": "System",
        "text": "CLOSED is terminal. A later application is a new tracking ID and a new uniqueness check. Redemption payment is an auditable disbursement at par, linked to BV/2FA evidence."
      }
    ]
  },

  J17: {
    "id": "J17",
    "label": "J17 · Refresh identity data",
    "plain": "CDD_CURRENT after new evidence + re-screen, or RESTRICTED / J16 close if the customer will not refresh, or J10 if screening now hits. AML ongoing CDD is not the same as J10’s sanctions/TMS hit. NADRA particulars change (name after marriage, address), CNIC expiry, and timed CCOF obligations (expired ID + NADRA token: lodge the renewed copy within 3 months) all require a refresh case. Until it completes, services may b",
    "when": "WALLET_ACTIVE. Triggers: CNIC expiry approaching; NADRA data change; periodic review due; CCOF 3-month renewed-ID clock.",
    "outcome": "CDD_CURRENT after new evidence + re-screen, or RESTRICTED / J16 close if the customer will not refresh, or J10 if screening now hits.",
    "tip": "Review cycle by risk band; whether liveness is required on every CNIC renew; restriction set while OVERDUE.",
    "related": "J17",
    "steps": [
      {
        "label": "Refresh due",
        "note": "Expiry · change · review",
        "kind": "start"
      },
      {
        "label": "Notify customer",
        "note": "In-app + SMS",
        "kind": "process"
      },
      {
        "label": "Upload renewed ID",
        "note": "Live capture",
        "kind": "process"
      },
      {
        "label": "Re-screen",
        "note": "Moment 3",
        "kind": "decision"
      },
      {
        "label": "CDD_CURRENT",
        "note": "Or OVERDUE restrict",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "New hit",
        "then": "New hit → J10"
      },
      {
        "if": "Also a band change",
        "then": "Also a band change → J13"
      },
      {
        "if": "CRP becomes high",
        "then": "CRP becomes high → J6"
      },
      {
        "if": "NADRA down",
        "then": "NADRA down → J11"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "WALLET_ACTIVE. Triggers: CNIC expiry approaching; NADRA data change; periodic review due; CCOF 3-month renewed-ID clock."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Is notified in-app + SMS/email that identity documents must be updated, with a tracking ID for the refresh case. Captures a live image of the renewed CNIC (and live photo if policy requires a fresh liveness)."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Discrepancy notice inside a defined SLA. Do not restrict without having notified. Re-screen on the new particulars (screening moment 3). A new hit is J10, not “we’ll ignore because they were clear in 2026.”"
      },
      {
        "n": "4",
        "title": "System",
        "text": "CDD_REFRESH_DUE / IN_PROGRESS / CURRENT / OVERDUE are states payments can read. New CNIC image and NADRA result are new evidence objects; old ones stay in the audit trail."
      }
    ]
  },

  J18: {
    "id": "J18",
    "label": "J18 · Digital IDs other than CNIC",
    "plain": "Wallet at the verification-strength band after the same gates as J1–J4, with residency/ID type stored — or J8 if the ID class cannot be onboarded digitally. CCOF C.5 allows digital onboarding only for CNIC, NICOP, POC, POR or ARC holders. EMI 12.I also lists passport, but a passport-only customer is not on the digital path — they go J4/face-to-face. Non-resident Pakistanis and POC holders outside Pakistan may use Ver",
    "when": "Spine at national-data capture when ID type is not a resident CNIC.",
    "outcome": "Wallet at the verification-strength band after the same gates as J1–J4, with residency/ID type stored — or J8 if the ID class cannot be onboarded digitally.",
    "tip": "When NADRA BV is operational for NRP/POC abroad; NICOP and CNIC as one person for EMI 12.VII — NEEDS CONFIRMATION.",
    "related": "J18",
    "steps": [
      {
        "label": "Select ID class",
        "note": "NICOP/POC/ARC/POR",
        "kind": "start"
      },
      {
        "label": "Extra residency fields",
        "note": "Table-A tax etc.",
        "kind": "process"
      },
      {
        "label": "BV or Verisys?",
        "note": "NRP abroad exception",
        "kind": "decision"
      },
      {
        "label": "Same spine gates",
        "note": "Screen · risk · activate",
        "kind": "process"
      },
      {
        "label": "Wallet / J8",
        "note": "Or passport → J4",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "NRP/POC abroad Verisys",
        "then": "NRP/POC abroad Verisys → J2"
      },
      {
        "if": "Passport-only",
        "then": "Passport-only → J4 F2F"
      },
      {
        "if": "NICOP vs CNIC uniqueness open",
        "then": "NICOP vs CNIC uniqueness open"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "Spine at national-data capture when ID type is not a resident CNIC."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "Selects ID type. Is not offered a digital path for passport-only or undocumented status. Provides the extra residency evidence the ID class needs (e.g. POC particulars, ARC/POR for Afghan refugees, overseas status)."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Do not invent extra Pakistan digital ID types. CCOF C.5 is a closed list. Passport appears on EMI 12.I but not on CCOF digital-onboarding eligibility — treat passport-only as non-digital (J4)."
      },
      {
        "n": "4",
        "title": "System",
        "text": "id_class is a first-class field (CNIC / NICOP / POC / ARC / POR). Validation, NADRA product, and BV availability branch on it. NRP_BV_NOT_OPERATIONAL is a dated configuration flag, not a customer skip code."
      }
    ]
  },

  J19: {
    "id": "J19",
    "label": "J19 · BV at the till · 2FA at ATM",
    "plain": "CASH_POSTED at par after BV (cash-in) or 2FA/BV (cash-out) — or declined. Wallet stays WALLET_ACTIVE. A mule / structuring pattern is J10, not a successful till event. EMI 15.II lets a live wallet be funded by IBFT or by cash-in at EMI branches, agents, ATMs or bank branches — cash-in is subject to NADRA biometric verification. EMI 14.II.d requires 2FA for ATM cash-out and BV (or 2FA where BVS is a genuine constraint",
    "when": "WALLET_ACTIVE customer presents at an agent, ATM, EMI branch or bank branch to load or withdraw cash.",
    "outcome": "CASH_POSTED at par after BV (cash-in) or 2FA/BV (cash-out) — or declined. Wallet stays WALLET_ACTIVE. A mule / structuring pattern is J10, not a successful till event.",
    "tip": "Which cash-in channels ship in the first slice (agent vs ATM vs bank branch); BVS-constraint policy for agent 2FA fallback — NEEDS CONFIRMATION.",
    "related": "J19",
    "steps": [
      {
        "label": "WALLET_ACTIVE",
        "note": "At channel",
        "kind": "start"
      },
      {
        "label": "Cash-in",
        "note": "Till BV required",
        "kind": "process"
      },
      {
        "label": "ATM cash-out",
        "note": "2FA required",
        "kind": "process"
      },
      {
        "label": "CASH_PENDING",
        "note": "Await proof",
        "kind": "pending"
      },
      {
        "label": "CASH_POSTED",
        "note": "At par",
        "kind": "end"
      }
    ],
    "forks": [
      {
        "if": "Verisys + till BV",
        "then": "Verisys + till BV → also J13 upgrade"
      },
      {
        "if": "TMS / mule",
        "then": "TMS / mule → J10"
      },
      {
        "if": "BVS timeout",
        "then": "BVS timeout → J11"
      },
      {
        "if": "Closure redeem is J16",
        "then": "Closure redeem is J16"
      }
    ],
    "walkthrough": [
      {
        "n": "1",
        "title": "Enters at",
        "text": "WALLET_ACTIVE customer presents at an agent, ATM, EMI branch or bank branch to load or withdraw cash."
      },
      {
        "n": "2",
        "title": "Customer",
        "text": "IBFT from their own bank account credits the wallet without this journey. For cash-in: presents at an EMI branch, agent, ATM or bank branch and completes NADRA BV. E-money is issued at par only after BV succeeds."
      },
      {
        "n": "3",
        "title": "Operations",
        "text": "Do not fold this into J16. J16 redeems the remaining balance on close. J19 is cash in or out while the wallet is live. Agents distribute and redeem e-money; they never issue the instrument (EMI 17.VII). No “open wallet at the till.”"
      },
      {
        "n": "4",
        "title": "System",
        "text": "CASH_CASE stores channel (agent / ATM / EMI branch / bank), direction (in/out), amount, BV or 2FA evidence, and par-value posting. Credit the wallet only after BV_PASSED on cash-in (EMI 15.I–II). Debit cash-out only after 14.II.d is satisfied and HOLD/DEBIT_BLOCKED are clear."
      }
    ]
  },
};

/**
 * Synced from https://kyc-journey-map.vercel.app/assets/data.js
 * Fills every journey with full Customer / Operations / System detail from the live map.
 */
(function () {
  const D = window.KYC_DATA;
  if (!D?.journeys) return;

  const MAP = {
  "j1": {
    "id": "j1",
    "num": "J1",
    "title": "Clean biometric onboarding",
    "short": "NADRA BV succeeds",
    "color": "#059669",
    "group": "Onboarding spine",
    "summary": "Resident CNIC holder completes digital onboarding on a first device. Biometric succeeds, pre-screening is clear, risk is not high, cooling-off completes, an e-money wallet is issued at the biometric limit band. This is not a bank deposit account: funds sit in a trustee bank, and the wallet number is a claim on safeguarded e-money.",
    "outcome": "WALLET_ACTIVE at NADRA-biometric limits (commercial monthly load PKR 400,000). Wallet number only after BV + pre-screen + CDD.",
    "actors": "Customer; system. No analyst unless a later exception.",
    "from": "Master spine steps 1–9 all pass; BV succeeds.",
    "regs": "CCOF B, D, F, I, J, K · EMI 12 & 14.II · AML CDD · BPRD 04 A via CCOF K",
    "customer": [
      "Opens the app. Product is explained in English and Urdu. The app does not say whether a wallet already exists.",
      "Enters mobile, completes OTP/2FA from the institution short code, device is bound.",
      "Accepts terms and charges. Sees that onboarding can be saved for 30 days.",
      "Receives a tracking ID by SMS (and email if given).",
      "Enters national data (CCOF Table-A plus EMI 12.I, including two fields not printed on the CNIC face, e.g. mother’s name and place of birth). Live CNIC and live photo / liveness. Progress is visible.",
      "Completes in-app NADRA biometric. Shown as verified — never a raw NADRA payload.",
      "Is told about cooling-off, waits two hours, then the wallet is ready at biometric limits.",
      "Thereafter receives real-time transaction alerts."
    ],
    "ops": [
      "Confirm CNIC class may onboard digitally.",
      "Confirm BV came from NADRA, not a local selfie match pretending to be BV.",
      "Confirm pre-screen used current UNSC and ATA 1997 lists; store the list version.",
      "If CRP would be high, this is J6 — do not silently skip.",
      "No human override on J1. Incomplete packs do not activate.",
      "Do not treat this as a digital-bank account opening. Limits, one-wallet-per-CNIC, and activation gates are EMI §12 and §14."
    ],
    "system": [
      "APPLICATION_STARTED with tracking ID exists before NADRA is called.",
      "Customer-typed claims are stored separately from NADRA-returned fields.",
      "Frontend never talks to NADRA. Wallet issuance needs BV_PASSED + PRE_SCREEN_CLEAR + CDD complete.",
      "Device binding record + cooling-off timer. WALLET_ACTIVE only after the timer.",
      "Audit story: tracking ID → evidence → BV → screen → risk → cooling-off end → wallet number."
    ],
    "time": "Decide within 2 working days of complete documents. Cooling-off 2 hours. Biometric monthly load PKR 400,000.",
    "open": "Exact NADRA BV modality (finger vs facial) and commercial agreement: NEEDS CONFIRMATION."
  },
  "j2": {
    "id": "j2",
    "num": "J2",
    "title": "Biometric not possible (Verisys)",
    "short": "Listed reason, then Verisys",
    "color": "#1b6b93",
    "group": "Onboarding spine",
    "summary": "NADRA BV is not possible for an SBP-listed reason (age over 60, permanent disability, unclear fingerprints, or NRP/POC abroad until BV exists). The remote ladder then requires Verisys + CNIC–MSISDN pairing + OTP or call-back, with live photo. Not a convenience skip.",
    "outcome": "If J2 fully succeeds: wallet at Verisys limits (monthly load PKR 50,000) unless a later BV upgrades the customer via J13. Reason for skipping BV is recorded in writing.",
    "actors": "Customer; system; optionally call-centre for call-back.",
    "from": "Spine step 10 when BV cannot be performed for a listed genuine reason.",
    "regs": "CCOF F.1.iv–v.a–b · EMI 12 & 14.II.a–b · BPRD 04 alternate controls",
    "customer": [
      "Reaches biometric. Capture fails or a declared eligible reason applies.",
      "Is told an alternate verification will be used and that limits may be lower until BV is done.",
      "NADRA Verisys runs against CNIC particulars.",
      "SIM–CNIC pairing is checked. Customer completes OTP or a randomised call-back.",
      "If all J2 checks pass: cooling-off, then activation at Verisys limits, with a later upgrade path via BV (that upgrade is J13, not an edit of this pack)."
    ],
    "ops": [
      "Record the genuine reason. “Customer skipped” is not a listed reason.",
      "Call-back uses negative/step-wise confirmations; failure goes to a human agent.",
      "Do not grant biometric-tier limits on a Verisys-only pack.",
      "If pairing or OTP/call-back fails, J2 did not pass — move to J3 or J4."
    ],
    "system": [
      "VERISYS_PASSED only if Verisys + pairing + OTP/call-back all succeeded.",
      "Store BV-not-possible reason code.",
      "Limit engine reads verification strength, not a Boolean “KYC true.”",
      "Upgrade to BV later is a new verification case, not an edit of the old result (J13)."
    ],
    "time": "Still inside 2 working-day TAT. Verisys monthly load PKR 50,000; cash-out PKR 10,000/day.",
    "open": "Who adjudicates “genuine reason”, and PTA/operator pairing source: NEEDS CONFIRMATION."
  },
  "j3": {
    "id": "j3",
    "num": "J3",
    "title": "Verisys with debit block",
    "short": "Opened, cannot spend",
    "color": "#d97706",
    "group": "Onboarding spine",
    "summary": "BV and Verisys+pairing+OTP have not both succeeded, but Verisys itself has. CCOF allows opening after Verisys with a debit block until BV or full J2 is completed. This is not WALLET_ACTIVE in the leadership sense.",
    "outcome": "Instrument exists with DEBIT_BLOCKED. No debit, cash-out, P2P, or merchant pay until BV or full J2. If never verified, close and consider STR.",
    "actors": "Customer; system; operations if the block lasts; compliance if STR is considered.",
    "from": "J1 BV failed or not possible, and J2 pairing/OTP also failed, but Verisys succeeded.",
    "regs": "CCOF F.1.v.c · EMI 12.III (tension: restricted open ≠ full activation) · EMI 12.IV · AML incomplete CDD",
    "customer": [
      "Is told verification is incomplete. Status is “opened with restrictions” / “debit blocked.”",
      "Can see what is still required (complete BV, or pairing + OTP/call-back).",
      "Cannot send, withdraw, or pay. Attempts are declined with a restriction message.",
      "Resume stays open (J7). When (a) or (b) succeeds, the block lifts and limits follow the new strength."
    ],
    "ops": [
      "Treat the block as a compliance control, not a UX flag payments can ignore.",
      "If verification never completes, close and consider STR (EMI 12.IV).",
      "Do not use J3 to onboard a sanctions-uncleared person.",
      "Pre-screen must still have been CLEAR to reach J3."
    ],
    "system": [
      "DEBIT_BLOCKED is visible to wallets and payments. Fail closed if the flag cannot be read.",
      "A wallet number without the block is a defect.",
      "Every declined debit stores reason DEBIT_BLOCK_KYC.",
      "Lifting the block is a new event linked to a new verification result."
    ],
    "time": "TAT still applies. Policy needed for how long a debit block may last. Prefer not using EMI 12.IV’s one unverified credit.",
    "open": "Legal must confirm: restricted open ≠ full activation. Whether EMI 12.IV one-credit exception is used at all."
  },
  "j4": {
    "id": "j4",
    "num": "J4",
    "title": "Remote methods fail",
    "short": "Video KYC / partner / decline",
    "color": "#7c3aed",
    "group": "Onboarding spine",
    "summary": "BV, J2, and debit-block-after-Verisys have not produced a usable verified customer. CCOF then points to face-to-face. For an EMI without branches: recorded video KYC + Verisys with reasons, or third-party reliance on a bank that has branches. Agents must not issue e-money instruments (EMI 17.VII).",
    "outcome": "VIDEO_KYC completed and wallet decision follows verification strength, or partner bank, or J8 decline.",
    "actors": "Customer; trained video-KYC officer; compliance; possibly partner bank.",
    "from": "CCOF F.1.v.d–f after (a)(b)(c) fail, or BV not met and EMI has no branch.",
    "regs": "CCOF F.1.v.d–f and G.2 · EMI 12.V if also high risk · EMI 17.VII · AML CDD must still be completed",
    "customer": [
      "Sees that in-app verification could not be completed.",
      "Is offered a scheduled recorded video interview and/or partner-bank directions — not a dead end, and not “open at an agent.”",
      "During video KYC: ID shown, live presence, questions per approved Digital Onboarding Policy.",
      "If successful, continues to cooling-off/activation. If not, J8 with a written reason."
    ],
    "ops": [
      "Video KYC is a recorded interview with defined checks — not a chat, not WhatsApp.",
      "Record why BV could not be met (mandatory without physical presence).",
      "Officer must not see sanctions details that would tip off (J4 assumes screening was clear).",
      "If there is no approved Digital Onboarding Policy, this journey is blocked at governance."
    ],
    "system": [
      "VIDEO_KYC_REQUIRED. Recording stored as an evidence object, not on an officer laptop.",
      "Outcome APPROVED / REJECTED / REVIEW is a new verification case.",
      "Retention clock on video per CCOF G.2 and 10-year CDD rules."
    ],
    "time": "Strive to decide within 2 working days; notify the need for video inside TAT.",
    "open": "Will first slice include video KYC capacity or partner-bank reliance? If neither, J4 becomes J8."
  },
  "j5": {
    "id": "j5",
    "num": "J5",
    "title": "Sanctions or proscribed-person hit",
    "short": "Hard stop · no wallet",
    "color": "#b91c1c",
    "group": "Gates & exceptions",
    "summary": "Pre-screening finds the applicant or an associated person (parent/guardian, mandate holder, later linked minor) on a UNSC designated list or ATA 1997 proscribed list, or acting on their behalf. Services must not be provided. Tipping-off rules apply. This is screening moment 1 of 4; J10, J13 and J17 cover the rest.",
    "outcome": "DECLINED / relationship not established. Possible STR to FMU. No wallet. Customer message is truthful but must not reveal that a suspicion report is being filed.",
    "actors": "Screening system; compliance investigator; MLRO. Not the relationship manager as a solo decider.",
    "from": "Spine step 8, or later list refresh (then J10).",
    "regs": "CCOF F.4 · EMI 12.III, 12.IX, 12.X · AML TFS · STR · tipping-off prohibition",
    "customer": [
      "Must not be coached to “try a different name.”",
      "Receives a J8 decline with legally safe wording — not “you are on a sanctions list,” never that an STR was filed.",
      "Cannot complete onboarding. Tracking ID still shows the application is closed."
    ],
    "ops": [
      "True match vs false positive: investigation case. High-severity needs maker-checker.",
      "False positive: documented clearance, then return to the spine. Do not skip remaining KYC.",
      "True match: do not open; consider STR; apply TFS; notify internal compliance, not the customer, of STR.",
      "STR/CTR filing is not assigned to outsourced staff."
    ],
    "system": [
      "PRE_SCREEN_HIT stops issuance. Payments/wallets must not be reachable.",
      "Screening result is immutable: list name, version, score, analyst disposition.",
      "Access to hit details is restricted; who viewed the case is logged.",
      "A timeout is J11. A hit is J5. Never auto-clear a hit."
    ],
    "time": "Decide within TAT. Possible false-positive investigation still fits the 2-day clock or the customer is notified inside TAT.",
    "open": "Approved customer-facing decline text, match threshold, and NACTA feed: NEEDS CONFIRMATION."
  },
  "j6": {
    "id": "j6",
    "num": "J6",
    "title": "High-risk customer (EDD)",
    "short": "Extra evidence + approval",
    "color": "#b0892e",
    "group": "Gates & exceptions",
    "summary": "The Customer Risk Profile rates the applicant high risk. EDD applies: additional information, and for non-face-to-face, recorded video KYC where required. EDD is additional to CDD, not instead of BV/screening. Limit upgrades (J13) and linked minors (J15) can also land here.",
    "outcome": "EDD completed and policy approval to onboard with enhanced monitoring — or J8 if EDD cannot be completed.",
    "actors": "Customer; video-KYC officer; compliance; senior management where policy requires approval.",
    "from": "Spine step 9 after data is sufficient to rate risk. Can also trigger mid-J1 if NADRA data changes the profile, or on J13 upgrade.",
    "regs": "CCOF G · EMI 12.V · AML EDD (source of funds/wealth, senior approval, enhanced monitoring)",
    "customer": [
      "Is asked additional questions/documents proportionate to risk (source of funds, occupation evidence, purpose, PEP).",
      "May be scheduled for recorded video KYC even if BV already passed.",
      "Is not told they are “high risk” in accusatory language.",
      "If EDD fails or is refused, the application is declined (J8), not quietly dropped to J1 limits."
    ],
    "ops": [
      "Store the CRP model version used for this rating.",
      "PEP follows AML EDD, not a marketing flag.",
      "Enhanced monitoring after onboarding is handed to TMS (J10), not forgotten.",
      "Do not onboard high risk on a “we’ll EDD later” promise."
    ],
    "system": [
      "RISK_HIGH_EDD blocks WALLET_ACTIVE until the EDD case is APPROVED.",
      "Video + extra documents are evidence objects.",
      "Maker-checker if policy requires senior approval to open."
    ],
    "time": "2 working days from complete documents — “complete” for high risk includes EDD documents.",
    "open": "First-slice CRP model (what is high risk) and whether PEPs are in appetite: NEEDS CONFIRMATION."
  },
  "j7": {
    "id": "j7",
    "num": "J7",
    "title": "Save and resume within 30 days",
    "short": "Same tracking ID",
    "color": "#0ea5e9",
    "group": "Gates & exceptions",
    "summary": "CCOF requires the online application to save an ongoing session that the customer can resume for up to 30 days without restarting. Authoritative state is server-side — not photos sitting in the phone gallery.",
    "outcome": "Customer continues from the last completed step with the same tracking ID. After 30 days the application expires and must start again (new tracking ID).",
    "actors": "Customer; system; support if they cannot find the application.",
    "from": "Any point after APPLICATION_STARTED and before a terminal decision.",
    "regs": "CCOF J.iii, J.iv, I, K.iv · BPRD 04 re-auth",
    "customer": [
      "Leaves the app (call dropped, photo failed, user paused).",
      "Returns within 30 days, authenticates (2FA), sees progress and remaining steps, continues.",
      "If 30 days passed: told to start a new application; old tracking ID shows expired."
    ],
    "ops": [
      "Support can locate the application by tracking ID without reading full CNIC aloud.",
      "Do not copy a half-finished pack onto a new CNIC."
    ],
    "system": [
      "Device holds at most a pointer, not the KYC payload.",
      "Resume re-checks: device still bound or treat as J9; re-screen if list version changed; freshness of liveness/BV.",
      "Expiry after 30 days sets EXPIRED.",
      "Do not reset to a weaker verification path because the user is tired."
    ],
    "time": "30-day resume window. Working position: TAT starts when documents are complete, not when the session first opened.",
    "open": "TAT vs 30-day clock; retention of never-completed applications; BV freshness if older than N hours."
  },
  "j8": {
    "id": "j8",
    "num": "J8",
    "title": "Decline with written reason",
    "short": "Tracking ID still works",
    "color": "#64748b",
    "group": "Gates & exceptions",
    "summary": "Any terminal negative outcome must produce a specific written reason, keep the tracking ID, and fit TAT communication rules. Vague “something went wrong” is not compliant.",
    "outcome": "DECLINED (or CLOSED_UNVERIFIED). Customer can see status by tracking ID. Internal reason codes may be richer than the customer-facing text (especially J5).",
    "actors": "System; operations/compliance for reason code; customer; support.",
    "from": "J2/J3/J4 exhaustion, J5 true match, J6 EDD fail, J11 unresolved, J12 duplicate, J13/J15/J18 fail, or incomplete CDD at TAT.",
    "regs": "CCOF I.2–I.4 · AML incomplete CDD · EMI 12.IV · no tipping-off",
    "customer": [
      "Receives written notice (in-app + SMS/email) with a specific reason appropriate to the case, in English and Urdu.",
      "Can still look up the tracking ID and see closed status.",
      "Is pointed to 24/7 support for questions that are allowed to be answered."
    ],
    "ops": [
      "Reason catalogue: verification failed; documents incomplete after notice; duplicate wallet; cannot offer product; identity could not be verified — plus internal-only codes for TFS/STR.",
      "If documents were incomplete, a discrepancy notice must have gone out inside TAT before a silent decline.",
      "STR consideration documented internally when AML requires it."
    ],
    "system": [
      "Terminal state is immutable. A retry is a new application (new tracking ID), except a documented sanctions false-positive clearance on the same ID.",
      "Customer-facing reason and internal reason are stored separately.",
      "Do not leak existence of others’ wallets or list names."
    ],
    "time": "Notice within 2 working days of complete documents, or discrepancy notice earlier if incomplete.",
    "open": "Customer-facing reason catalogue must be approved by compliance/legal."
  },
  "j9": {
    "id": "j9",
    "num": "J9",
    "title": "New device after onboarding",
    "short": "BV · notify · cooling-off",
    "color": "#0891b2",
    "group": "After the wallet exists",
    "summary": "After the customer already has a wallet, a new phone/tablet must be registered with NADRA BV (preferably digital), immediate notification, cooling-off, and device-limit checks. This is not “just log in with OTP.” Changing mobile, email, or password on the same device is J14, not this journey.",
    "outcome": "New device bound and usable after cooling-off, or rejected. Old devices remain until removed, subject to max-device policy.",
    "actors": "Customer; system; call-centre if call-back fallback; fraud unit if anomalies.",
    "from": "WALLET_ACTIVE (or DEBIT_BLOCKED) customer attempts access from an unbound device.",
    "regs": "BPRD 04 A.i.b, A.iii, A.v–viii · CCOF K (BPRD 04 pulled into EMI digital onboarding)",
    "customer": [
      "Opens the app on a new device. Is not in full wallet use before the device is registered.",
      "Completes NADRA BV in-app (or an approved pair of alternate controls).",
      "Immediately receives SMS and email that a new device was registered.",
      "Waits two hours before the new device can operate the wallet.",
      "Sees the device under “manage devices.” If they did not initiate it, they contact support."
    ],
    "ops": [
      "If max devices exceeded: extra authentication, recorded justification, customer verification.",
      "If the same device is used across too many CNICs: fraud procedure; may report the device to PTA.",
      "Password reset on the new device is forbidden until it is a registered device (then J14 still applies, with cooling-off).",
      "CCOF K pulls BPRD 04 device-binding into EMI digital onboarding even though the 2023 circular was addressed to banks/MFBs."
    ],
    "system": [
      "Unbound device session cannot move money or reset credentials.",
      "Device registry: identifiers, first-seen, notify timestamps, cooling-off end, status.",
      "NEW_DEVICE_REGISTERED is available to fraud monitoring."
    ],
    "time": "Immediate notification. 2-hour cooling-off. Separate from onboarding TAT.",
    "open": "Primary bind key (IMEI privacy), max devices, root/jailbreak policy: NEEDS CONFIRMATION."
  },
  "j10": {
    "id": "j10",
    "num": "J10",
    "title": "Continuous screening / monitoring",
    "short": "KYC does not end at issuance",
    "color": "#be185d",
    "group": "After the wallet exists",
    "summary": "Screening is not one-time. After onboarding, list updates, periodic re-screens, and transaction monitoring can produce a hit. Restrict, investigate, report, and keep an audit trail without tipping off. Refreshing expired CNIC data is J17; this journey is the hit itself.",
    "outcome": "MONITORING_HOLD or freeze per TFS; investigation CLEAR (resume) or CONFIRMED (STR, exit, freeze).",
    "actors": "TMS / screening batch; investigator; maker-checker; MLRO; payments (must honour HOLD).",
    "from": "WALLET_ACTIVE or DEBIT_BLOCKED. List update, periodic cycle, payment, cash-out, device+behaviour scenarios. Material changes (upgrade, new linked person) re-screen in J13/J15 before they complete.",
    "regs": "AML ongoing monitoring · EMI 12.IX–X · BPRD 04 D · 10-year records",
    "customer": [
      "May see a payment declined or channels suspended. Must not be told “we filed an STR.”",
      "May be asked source-of-funds questions that are part of monitoring, not a casual chat.",
      "If cleared, service resumes; if confirmed TFS, services stop as required by law."
    ],
    "ops": [
      "Fail closed: rule fire or vendor timeout → HOLD, never CLEAR.",
      "Specify fraud scenarios: new device then credential reset; burst IBFT; geo change; mule-device.",
      "Four screening moments must exist: (1) pre-relationship J5, (2) before material change J13/J14/J15, (3) periodic / list update here, (4) event-driven payments and cash-out here.",
      "STR regardless of amount if suspicion exists, including attempted transactions.",
      "Do not confuse FTDH fraud clocks with AML STR clocks."
    ],
    "system": [
      "Re-screen creates a new screening fact; it does not edit the onboarding screen.",
      "HOLD is visible to payments and wallets immediately.",
      "Case file: trigger, transactions, device, investigator, disposition, STR internal id."
    ],
    "time": "Real-time for payment screening; batch SLA for list refresh.",
    "open": "TMS rule catalogue, list-refresh frequency, CTR threshold, FTDH in first slice."
  },
  "j11": {
    "id": "j11",
    "num": "J11",
    "title": "Provider timeout (fail closed)",
    "short": "Never auto-approve",
    "color": "#ea580c",
    "group": "Gates & exceptions",
    "summary": "NADRA, screening lists, SMS/OTP, or pairing services are unavailable, time out, or are in stub mode. The product must not auto-approve. A stub APPROVED is a labelled fake — never a real clean customer.",
    "outcome": "VERIFICATION_PENDING or PRE_SCREEN_UNAVAILABLE or MANUAL_REVIEW. No WALLET_ACTIVE. Retry, wait, or J8 if TAT expires without CDD.",
    "actors": "Customer; system; operations queue. Never a developer flipping a flag on a real applicant.",
    "from": "Any spine step that calls a provider.",
    "regs": "AML: if CDD cannot be completed, do not open · CCOF TAT discrepancy notice · EMI 12.III",
    "customer": [
      "Sees “verification delayed / try again” with tracking ID — not a green success.",
      "May resume (J7) when the service recovers.",
      "If the institution cannot complete CDD in time: J8, not a mercy activation."
    ],
    "ops": [
      "Sandbox/stub: labelled environment only, synthetic customers, watermarked evidence.",
      "Production: queue for retry. No “force approve” without a named officer and a reason that still meets CDD (almost never NADRA-down)."
    ],
    "system": [
      "Provider errors map to PENDING/UNAVAILABLE, never APPROVED.",
      "Stub adapter and real adapter share the same port. Feature flag is configuration, not a frontend rewrite.",
      "Do not cache NADRA secrets on the device while retrying. Do not log full CNIC in error traces."
    ],
    "time": "Does not pause legal TAT magically — notify the customer (CCOF I.2).",
    "open": "Max retries; whether operations can ever override NADRA-down (working position: no)."
  },
  "j12": {
    "id": "j12",
    "num": "J12",
    "title": "Duplicate CNIC",
    "short": "One wallet per EMI",
    "color": "#4338ca",
    "group": "Gates & exceptions",
    "summary": "A CNIC holder may obtain only one e-money instrument with an EMI. A second attempt must be detected without helping attackers enumerate accounts.",
    "outcome": "New application does not create a second wallet. Authenticated same person is routed to login / device bind (J9) / support. Attackers get a generic result, not “this CNIC is taken.”",
    "actors": "Customer (genuine returning or fraudster); system; support for takeover cases.",
    "from": "Spine step 7, as soon as CNIC is known — but user-visible behaviour must not confirm existence until authenticated.",
    "regs": "EMI 12.VII · BPRD 04 A.ix enumeration control",
    "customer": [
      "Genuine returning customer: after authentication, sees the existing wallet, not a second onboarding.",
      "Person who lost access: recovery with BV on a new device (J9) — not a second wallet.",
      "Fraudster using a leaked CNIC: generic failure / login path, no helpful “already registered to 03xx.”"
    ],
    "ops": [
      "Same CNIC + different mobile claiming to open: possible takeover or mule; do not open a second wallet; investigate.",
      "Whether a closed wallet frees the CNIC: see J16. Working position after full closure and cooling policy — NEEDS CONFIRMATION.",
      "A parent-linked minor wallet (J15) is not a second wallet for the guardian’s CNIC. The child’s B-Form/ID uniqueness is a separate invariant."
    ],
    "system": [
      "Uniqueness of active instrument per CNIC per EMI is an invariant.",
      "Lookup is server-side; response to unauthenticated clients stays generic.",
      "Link duplicate attempts to fraud monitoring."
    ],
    "time": "Immediate. Not a TAT onboarding decision for a new product.",
    "open": "Re-open after closure; NICOP vs CNIC same human: NEEDS CONFIRMATION."
  },
  "j13": {
    "id": "j13",
    "num": "J13",
    "title": "Limit / category upgrade",
    "short": "Verisys → BV → enhanced",
    "color": "#0f766e",
    "group": "After the wallet exists",
    "summary": "CCOF F.1 treats change or upgradation of wallet category as identity verification again — not a settings toggle. A Verisys customer who later completes NADRA BV moves to the biometric band. A biometric customer who later qualifies for the SBP-approved enhanced band (up to PKR 1,000,000) must supply one Annexure-J source-of-funds document, CNIC/SIM pairing, in-house TMS and detailed CRP. Those extra controls must not be outsourced. EMI 14.VI salary, remittance and utility exclusions are not this journey: they sit beside the band after a separate SBP permission.",
    "outcome": "LIMITS_UPDATED after a new verification case, re-screen, CRP, and 2-hour cooling-off — or stay on the old band, or J8 if CDD for the new band cannot be completed.",
    "actors": "Existing wallet holder; system; compliance for enhanced-band evidence; senior approval if CRP becomes high (J6).",
    "from": "WALLET_ACTIVE at a lower band, or DEBIT_BLOCKED customer completing BV / full J2.",
    "regs": "CCOF F.1 (opening or change/upgradation of category) · EMI 14.II–III · EMI 14.VI (exclusions, not a band) · Annexure-J · EMI 12.V if high risk · BPRD 04 cooling-off on limit change",
    "customer": [
      "Requests a higher monthly load, or is prompted after a successful later BV.",
      "Completes the verification required for the target band (BV for PKR 400,000; for PKR 1,000,000: one Annexure-J income document + SIM pairing + extra questions).",
      "Is told limits will not move until cooling-off ends. Old band still applies during the wait.",
      "If the upgrade is refused or incomplete, keeps the current band — is not silently given the higher ceiling.",
      "Salary paid via the employer’s bank, PRI remittances, and utility bills are not an upgrade request. Those may sit outside the monthly cap only after SBP grants 14.VI — never for a minor."
    ],
    "ops": [
      "Re-run identity verification for the new category. Do not copy the onboarding BV result and call it an upgrade.",
      "Re-screen the customer (and any associated person) before the new band goes live — screening moment 2.",
      "Enhanced band: commercial licence plus SBP permission; CNIC/SIM pairing; in-house TMS (one-to-many, many-to-one); detailed CRP. Not outsourced.",
      "Annexure-J — any one document in the matching column: salaried (latest salary slip, salary certificate, payment record, account statement, tax statement/return/certificate, pension/terminal benefits if retired); non-salaried (payment against work, account statement, income-provider particulars such as family/guardian/stipend/social benefit, tax statement, or other evidencing document); alternates (inheritance, agriculture, securities/bonds/shares, property, rent, interest).",
      "14.VI is not a fourth band. After commercial operations and PSP&OD permission, BV adult wallets may exclude (i) employer credits from the nominated bank — EMI verifies the employer, (ii) inward remittances through authorised dealers up to PKR 1,500,000, (iii) utility bill payments. Minors never receive 14.VI. Payments and receipts are counted separately (14.II.a).",
      "Pilot vs commercial ceilings are different (biometric PKR 200,000 in pilot, PKR 400,000 in commercial). The engine must know the licence stage.",
      "If CRP becomes high on upgrade, J6 blocks the new band until EDD is approved."
    ],
    "system": [
      "UPGRADE_CASE is a new verification + screening + CRP bundle linked to the existing wallet, not a new CNIC.",
      "Limit engine reads current verification strength and licence stage. Payments honour the old band until cooling-off ends.",
      "Store before/after band, annexure_j_doc_type, evidence hashes, list version, CRP version.",
      "14.VI flags (salary_ex, remittance_ex, utility_ex) sit beside the band. Remittance exclusion has its own PKR 1,500,000 cap. Load, payments and receipts are separate counters.",
      "Fail closed on NADRA/list timeout (J11). Do not park the customer on the higher band “temporarily.”"
    ],
    "time": "Treat as a material change: 2-hour cooling-off on the new limits (BPRD 04). Individual decision TAT 2 working days from complete upgrade documents (including the Annexure-J item).",
    "open": "When PSP&OD enhanced-wallet and 14.VI exclusion permissions are sought; first-slice licence stage (pilot vs commercial) — NEEDS CONFIRMATION."
  },
  "j14": {
    "id": "j14",
    "num": "J14",
    "title": "Mobile, email or password change",
    "short": "BV · notify · cooling-off",
    "color": "#0369a1",
    "group": "After the wallet exists",
    "summary": "BPRD 04 (pulled into EMI digital onboarding by CCOF K) requires NADRA BV for modification of registered email or phone, credential reset only from a registered device, OTP from the institution short code, and a two-hour cooling-off before the change takes effect. SIM-swap and inbox-takeover are first-class Pakistani fraud paths, not “profile edits.”",
    "outcome": "CREDENTIAL_UPDATED after BV (or listed alternate pair), notification, and cooling-off — or rejected. Wallet spend on the old mobile/email continues until the timer ends.",
    "actors": "Customer; system; call-centre for call-back; fraud unit if the change pattern matches TMS.",
    "from": "WALLET_ACTIVE (or DEBIT_BLOCKED) customer requests change of MSISDN, email, user ID or password from a registered device.",
    "regs": "BPRD 04 A.i.c, A.iii, A.viii · CCOF K.i.b · CCOF F.1 if pairing is part of verification strength",
    "customer": [
      "Starts the change from an already registered device (password reset on an unbound device is refused — see J9).",
      "Completes NADRA BV, or two listed alternate controls if BV is not possible (disability, mehndi/bandage, NRP, foreign national).",
      "For a new mobile: CNIC–MSISDN pairing is re-checked. OTP auto-fetches from the institution short code.",
      "Is told beforehand that the change waits two hours. Receives SMS and email on the old channels.",
      "If they did not request it, they contact 24/7 support immediately."
    ],
    "ops": [
      "Do not fold this into J9. A new phone is a device bind; a new SIM on the same phone is this journey — both can fire together.",
      "Password reset: registered device + OTP auto-fetch/sender binding, or robocall / call-back / in-app BV. Randomised negative confirmations on call-back.",
      "If BV for contact change times out, fail closed (J11) — do not take the new number on OTP alone.",
      "Pattern “new device then password reset then IBFT” is a J10 fraud scenario, not a successful J14."
    ],
    "system": [
      "Pending change is a dated case: old value, requested value, BV/pairing results, notify timestamps, cooling-off end.",
      "Payments, alerts and OTP delivery keep using the old mobile/email until the timer ends.",
      "CNIC–MSISDN pairing result is stored as a new fact. If pairing fails, the mobile change does not complete.",
      "If the customer’s verification strength depended on pairing (J2), losing pairing may force a limit downgrade or debit block — do not ignore that."
    ],
    "time": "Immediate notification on old channels. 2-hour cooling-off before the change is live.",
    "open": "Whether a Verisys-band wallet must repeat full J2 pairing on every SIM change: working position yes. PTA feed for pairing: NEEDS CONFIRMATION."
  },
  "j15": {
    "id": "j15",
    "num": "J15",
    "title": "Parent-linked minor wallet",
    "short": "Opened inside guardian’s app",
    "color": "#a21caf",
    "group": "Other EMI customers",
    "summary": "EMI §14.IV–V allows a minor’s e-money wallet only when it is opened in link with a parent/guardian’s already-verified wallet, through that parent’s app. The guardian gives a written or digital undertaking of liability. Basic minor: Verisys, monthly load PKR 50,000, funded only from the parent wallet. Freelancer-enhanced minor: NADRA BV, PKR 400,000, source of income verified. Adult PKR 1,000,000 enhanced limits do not apply to minors. Do not reuse J1 for a child.",
    "outcome": "MINOR_WALLET_ACTIVE, linked to the guardian’s instrument, at the matching minor band — or J8 if guardian or child CDD fails.",
    "actors": "Parent/guardian (already WALLET_ACTIVE); minor; system; compliance (both persons screened); TMS on the linked pair.",
    "from": "Guardian has WALLET_ACTIVE. Journey runs inside the guardian’s authenticated app — never as a child’s standalone J1.",
    "regs": "EMI 14.IV–V · EMI 12 CDD for both persons · CCOF associated-person CDD · CCOF F.4 screen both · AML minors · BPRD 2026 C1 conversion at majority (overlay)",
    "customer": [
      "Guardian, already onboarded, chooses “open a wallet for my child” in their own app.",
      "Supplies the minor’s identity evidence (B-Form / juvenile ID / CNIC if issued) and relationship proof.",
      "Completes the verification required for the chosen minor band (Verisys basic, or BV for freelancer-enhanced).",
      "Signs a written or digital undertaking to accept liability for the minor’s actions.",
      "Sees that the child’s wallet is funded from the parent wallet (basic) or from verified sources (enhanced freelancer).",
      "At majority, the same wallet is converted to an adult instrument only after adult CDD (not a silent birthday flag)."
    ],
    "ops": [
      "CDD both people. Screen both. A hit on either person is J5 — do not open the child wallet.",
      "Guardian must already be verified. Do not onboard parent and child as one mixed J1 pack.",
      "Basic minor: fund only from parent wallet; cash-out PKR 10,000/day; adult enhanced limits (14.I–III) do not apply.",
      "Enhanced freelancer minor: source of income verified; BV; still not the adult PKR 1,000,000 product.",
      "Deploy TMS on the pair (parent many-to-one / child mule patterns).",
      "EMI 17.VII still applies: agents do not issue the child’s instrument."
    ],
    "system": [
      "Child instrument stores guardian_wallet_id, undertaking evidence, relationship type, minor band, funding constraint.",
      "Uniqueness: one active minor instrument per child identity with this EMI; guardian may link more than one child.",
      "Payments engine rejects credits to a basic minor wallet that are not from the linked parent wallet.",
      "Majority conversion is a J13-like category change with adult CDD — new verification case, not an UPDATE of age."
    ],
    "time": "Individual TAT 2 working days from complete documents for both persons. Cooling-off 2 hours before the child wallet can operate.",
    "open": "B-Form vs juvenile CNIC as the child’s ID; age floor; whether BPRD 2026 teenager-wallet overlay is in appetite — NEEDS CONFIRMATION."
  },
  "j16": {
    "id": "j16",
    "num": "J16",
    "title": "Close, redeem, release CNIC",
    "short": "Par value · BV for cash",
    "color": "#57534e",
    "group": "After the wallet exists",
    "summary": "EMI §15 requires issuance and redemption at par, with no charges on redemption, and NADRA BV when e-money is redeemed in cash. Customer-requested closure, unverified-instrument closure (EMI 12.IV), and TFS/exit are different reasons that must not share one “delete account” button. Until J16 completes, J12 still treats the CNIC as taken.",
    "outcome": "WALLET_CLOSED. Balance redeemed at par to a verified destination. CNIC-release policy applied. Records retained 10 years after relationship end.",
    "actors": "Customer or compliance (TFS/exit); system; cash-out channel (agent/ATM/IBFT); MLRO if STR/TFS.",
    "from": "WALLET_ACTIVE, DEBIT_BLOCKED never verified, or MONITORING_HOLD confirmed TFS / offboarding.",
    "regs": "EMI 15.I–III · EMI 12.IV unverified close+STR · EMI 12.VII uniqueness · EMI 24.II retention · AML exit CDD · CCOF I written reason",
    "customer": [
      "Requests closure, or is told the instrument is being closed (unverified / TFS wording that does not tip off).",
      "For cash redemption: completes NADRA BV. For IBFT redemption: destination account is their own, with 2FA.",
      "Receives the remaining e-money at par, without a closure fee.",
      "Sees a written reason and a closed tracking/wallet status. Cannot spend after closure.",
      "Is not promised that they can immediately open a new wallet on the same CNIC unless policy says the CNIC is free."
    ],
    "ops": [
      "Three closure reasons, three files: (a) customer request, (b) never-verified + consider STR, (c) TFS/exit. Do not mix customer-facing text.",
      "Cash-out of remaining e-money: BV, or 2FA at ATM as EMI 14.II.d. Agent cash-out: BV or 2FA where BVS is a genuine constraint.",
      "Do not redeem to a third party’s account as a “favour.”",
      "If TFS freeze applies, redemption may be legally blocked — that is not a customer-service close.",
      "After closure, J12 uniqueness depends on the confirmed re-open policy."
    ],
    "system": [
      "CLOSED is terminal. A later application is a new tracking ID and a new uniqueness check.",
      "Redemption payment is an auditable disbursement at par, linked to BV/2FA evidence.",
      "Retain CDD and correspondence 10 years after relationship end (EMI 24.II / AML).",
      "Do not hard-delete the customer row to “free the CNIC.” Release is a policy flag, not a vacuum."
    ],
    "time": "Redeem without delay at par on request (EMI 15). TFS clocks are legal clocks, not this SLA.",
    "open": "Cooling period before the same CNIC may return; IBFT-only vs cash redemption in first slice — NEEDS CONFIRMATION."
  },
  "j17": {
    "id": "j17",
    "num": "J17",
    "title": "Periodic CDD / expired CNIC",
    "short": "Refresh identity data",
    "color": "#c2410c",
    "group": "After the wallet exists",
    "summary": "AML ongoing CDD is not the same as J10’s sanctions/TMS hit. NADRA particulars change (name after marriage, address), CNIC expiry, and timed CCOF obligations (expired ID + NADRA token: lodge the renewed copy within 3 months) all require a refresh case. Until it completes, services may be restricted. A list hit found during refresh becomes J10/J5.",
    "outcome": "CDD_CURRENT after new evidence + re-screen, or RESTRICTED / J16 close if the customer will not refresh, or J10 if screening now hits.",
    "actors": "Existing customer; system (expiry batch); operations for discrepancy notices; compliance if risk rating changes.",
    "from": "WALLET_ACTIVE. Triggers: CNIC expiry approaching; NADRA data change; periodic review due; CCOF 3-month renewed-ID clock.",
    "regs": "AML ongoing CDD · CCOF Table-A footnote (expired ID + token, renewed copy in 3 months) · CCOF F.1 if category also changes · EMI 12.I live ID",
    "customer": [
      "Is notified in-app + SMS/email that identity documents must be updated, with a tracking ID for the refresh case.",
      "Captures a live image of the renewed CNIC (and live photo if policy requires a fresh liveness).",
      "If NADRA name/address changed, confirms the new legal particulars — the app does not let them keep the old name as a nickname for CDD.",
      "If they ignore the notice past policy/CCOF clocks: channels restrict, then possible closure — not a silent unlimited wallet."
    ],
    "ops": [
      "Discrepancy notice inside a defined SLA. Do not restrict without having notified.",
      "Re-screen on the new particulars (screening moment 3). A new hit is J10, not “we’ll ignore because they were clear in 2026.”",
      "If the refresh is also a limit upgrade, run J13 — do not hide a band change inside a document update.",
      "CRP may change when occupation/address/expected behaviour is updated. High becomes J6.",
      "Expired-at-onboarding exception (token + 3 months) is a clock with an owner, not a comment."
    ],
    "system": [
      "CDD_REFRESH_DUE / IN_PROGRESS / CURRENT / OVERDUE are states payments can read.",
      "New CNIC image and NADRA result are new evidence objects; old ones stay in the audit trail.",
      "Do not overwrite the original onboarding pack. Append.",
      "Fail closed if NADRA is down during refresh (J11) — do not mark CURRENT because the batch job failed."
    ],
    "time": "CCOF: renewed ID within 3 months of opening on expired ID + token. Periodic-review frequency: policy / AML risk band — NEEDS CONFIRMATION.",
    "open": "Review cycle by risk band; whether liveness is required on every CNIC renew; restriction set while OVERDUE."
  },
  "j18": {
    "id": "j18",
    "num": "J18",
    "title": "NICOP, POC, ARC, POR / NRP",
    "short": "Digital IDs other than CNIC",
    "color": "#1d4ed8",
    "group": "Other EMI customers",
    "summary": "CCOF C.5 allows digital onboarding only for CNIC, NICOP, POC, POR or ARC holders. EMI 12.I also lists passport, but a passport-only customer is not on the digital path — they go J4/face-to-face. Non-resident Pakistanis and POC holders outside Pakistan may use Verisys until NADRA BV for that population is operational (CCOF F.1.iv.b). Same spine, extra residency and ID rules — not a second product, and not a Roshan Digital Account (that is a bank product).",
    "outcome": "Wallet at the verification-strength band after the same gates as J1–J4, with residency/ID type stored — or J8 if the ID class cannot be onboarded digitally.",
    "actors": "Applicant with NICOP/POC/ARC/POR (or NRP abroad); system; compliance on residency and TFS; possibly video KYC.",
    "from": "Spine at national-data capture when ID type is not a resident CNIC.",
    "regs": "CCOF C.5 · CCOF F.1.iv.b and F.1.v (NRP/POC exception) · EMI 12.I ID list · AML residency / tax · not RDA",
    "customer": [
      "Selects ID type. Is not offered a digital path for passport-only or undocumented status.",
      "Provides the extra residency evidence the ID class needs (e.g. POC particulars, ARC/POR for Afghan refugees, overseas status).",
      "If outside Pakistan and BV is not operational for that class: Verisys path with the listed NRP exception, live photo still captured.",
      "If inside Pakistan with NICOP/POC/ARC/POR: BV is still primary, same ladder as J1–J4.",
      "Sees the same tracking ID, 30-day resume, and written decline rules."
    ],
    "ops": [
      "Do not invent extra Pakistan digital ID types. CCOF C.5 is a closed list.",
      "Passport appears on EMI 12.I but not on CCOF digital-onboarding eligibility — treat passport-only as non-digital (J4).",
      "ARC/POR: apply AML/CFT for that population; do not copy CNIC field validation onto a POR number.",
      "This is not RDA, not a foreign-currency account, not a digital-bank product. EMI inward remittance (EMI 13) is a later permissioned service on an already-issued PKR wallet.",
      "Screening and uniqueness still apply. NICOP vs CNIC for the same human: J12 open question."
    ],
    "system": [
      "id_class is a first-class field (CNIC / NICOP / POC / ARC / POR). Validation, NADRA product, and BV availability branch on it.",
      "NRP_BV_NOT_OPERATIONAL is a dated configuration flag, not a customer skip code.",
      "Store residency self-declaration and tax fields (FATCA/CRS) from Table-A.",
      "Same activation gate: verification + pre-screen + CDD. Same cooling-off."
    ],
    "time": "Same 2 working-day individual TAT. NRP/POC abroad remains on Verisys until BV for that class is operational.",
    "open": "When NADRA BV is operational for NRP/POC abroad; NICOP and CNIC as one person for EMI 12.VII — NEEDS CONFIRMATION."
  },
  "j19": {
    "id": "j19",
    "num": "J19",
    "title": "Cash-in / cash-out at agent, ATM or branch",
    "short": "BV at the till · 2FA at ATM",
    "color": "#9a3412",
    "group": "After the wallet exists",
    "summary": "EMI 15.II lets a live wallet be funded by IBFT or by cash-in at EMI branches, agents, ATMs or bank branches — cash-in is subject to NADRA biometric verification. EMI 14.II.d requires 2FA for ATM cash-out and BV (or 2FA where BVS is a genuine constraint) for agent cash-out. This is not closure (J16) and not a limit upgrade (J13). IBFT load does not use this journey.",
    "outcome": "CASH_POSTED at par after BV (cash-in) or 2FA/BV (cash-out) — or declined. Wallet stays WALLET_ACTIVE. A mule / structuring pattern is J10, not a successful till event.",
    "actors": "Existing wallet holder; agent or ATM/bank channel; system; TMS. Agents still do not issue instruments (EMI 17.VII).",
    "from": "WALLET_ACTIVE customer presents at an agent, ATM, EMI branch or bank branch to load or withdraw cash.",
    "regs": "EMI 15.I–II · EMI 14.II.b–d · EMI 17.VII · CCOF F.1 biometric · BPRD 04 2FA · AML cash TMS",
    "customer": [
      "IBFT from their own bank account credits the wallet without this journey.",
      "For cash-in: presents at an EMI branch, agent, ATM or bank branch and completes NADRA BV. E-money is issued at par only after BV succeeds.",
      "For ATM cash-out: completes 2FA. For agent cash-out: completes BV, or 2FA only where BVS availability is a genuine constraint.",
      "Verisys-only wallets cannot cash-in until BV is done. That BV is also a J13 upgrade to the biometric band — not a till override of Verisys limits.",
      "A debit-blocked or monitoring-hold wallet cannot cash-out. Basic minors cannot take street cash-in; they are funded from the parent wallet only.",
      "Failed BV does not load or pay. The existing wallet is unchanged."
    ],
    "ops": [
      "Do not fold this into J16. J16 redeems the remaining balance on close. J19 is cash in or out while the wallet is live.",
      "Agents distribute and redeem e-money; they never issue the instrument (EMI 17.VII). No “open wallet at the till.”",
      "Cash-in without BV is a defect. ATM cash-out without 2FA is a defect. “Agent knows the customer” is not 2FA.",
      "A Verisys customer who completes BV at the till must open a J13 case for the biometric band. Do not credit PKR 400,000 capacity as a side effect of one cash-in.",
      "Minors: basic band funded only from the linked parent wallet; cash-out PKR 10,000/day. 14.VI exclusions never apply to minors.",
      "Structuring, smurfing, one-to-many cash-in, or “new device then cash-out” is J10. The till transaction fails closed if TMS says hold."
    ],
    "system": [
      "CASH_CASE stores channel (agent / ATM / EMI branch / bank), direction (in/out), amount, BV or 2FA evidence, and par-value posting.",
      "Credit the wallet only after BV_PASSED on cash-in (EMI 15.I–II). Debit cash-out only after 14.II.d is satisfied and HOLD/DEBIT_BLOCKED are clear.",
      "Limit engine still enforces monthly load, separate payment and receipt counters, and cash-out daily caps. 14.VI flags apply only if PSP&OD has granted them.",
      "Agent terminal never calls NADRA from a shop-floor PC as if it were onboarding. Same BV service as J1/J13, different case type.",
      "Fail closed on NADRA/BVS timeout (J11). Do not take cash against a paper CNIC photocopy."
    ],
    "time": "Post at par without delay once BV/2FA succeeds (EMI 15). Daily cash-out: PKR 10,000 for Verisys; EMI-defined by risk profile after BV (14.II.c). Agent/ATM 2FA/BV as 14.II.d.",
    "open": "Which cash-in channels ship in the first slice (agent vs ATM vs bank branch); BVS-constraint policy for agent 2FA fallback — NEEDS CONFIRMATION."
  }
};

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

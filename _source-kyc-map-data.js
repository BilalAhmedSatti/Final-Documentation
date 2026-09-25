window.KYC = {
  meta: {
    title: "KYC Journey Map J1–J19",
    slice: "Pakistan EMI e-money wallet — not a digital bank. Resident CNIC is the spine; J13–J19 close EMI gaps the first slice deferred.",
    note: "J1 is the spine. Other journeys are named branches of one EMI wallet, not nineteen products, and not a bank deposit account."
  },

  journeys: {
    j1: {
      id: "j1", num: "J1", title: "Clean biometric onboarding",
      short: "NADRA BV succeeds",
      color: "#059669",
      group: "Onboarding spine",
      summary: "Resident CNIC holder completes digital onboarding on a first device. Biometric succeeds, pre-screening is clear, risk is not high, cooling-off completes, an e-money wallet is issued at the biometric limit band. This is not a bank deposit account: funds sit in a trustee bank, and the wallet number is a claim on safeguarded e-money.",
      outcome: "WALLET_ACTIVE at NADRA-biometric limits (commercial monthly load PKR 400,000). Wallet number only after BV + pre-screen + CDD.",
      actors: "Customer; system. No analyst unless a later exception.",
      from: "Master spine steps 1–9 all pass; BV succeeds.",
      regs: "CCOF B, D, F, I, J, K · EMI 12 & 14.II · AML CDD · BPRD 04 A via CCOF K",
      customer: [
        "Opens the app. Product is explained in English and Urdu. The app does not say whether a wallet already exists.",
        "Enters mobile, completes OTP/2FA from the institution short code, device is bound.",
        "Accepts terms and charges. Sees that onboarding can be saved for 30 days.",
        "Receives a tracking ID by SMS (and email if given).",
        "Enters national data (CCOF Table-A plus EMI 12.I, including two fields not printed on the CNIC face, e.g. mother’s name and place of birth). Live CNIC and live photo / liveness. Progress is visible.",
        "Completes in-app NADRA biometric. Shown as verified — never a raw NADRA payload.",
        "Is told about cooling-off, waits two hours, then the wallet is ready at biometric limits.",
        "Thereafter receives real-time transaction alerts."
      ],
      ops: [
        "Confirm CNIC class may onboard digitally.",
        "Confirm BV came from NADRA, not a local selfie match pretending to be BV.",
        "Confirm pre-screen used current UNSC and ATA 1997 lists; store the list version.",
        "If CRP would be high, this is J6 — do not silently skip.",
        "No human override on J1. Incomplete packs do not activate.",
        "Do not treat this as a digital-bank account opening. Limits, one-wallet-per-CNIC, and activation gates are EMI §12 and §14."
      ],
      system: [
        "APPLICATION_STARTED with tracking ID exists before NADRA is called.",
        "Customer-typed claims are stored separately from NADRA-returned fields.",
        "Frontend never talks to NADRA. Wallet issuance needs BV_PASSED + PRE_SCREEN_CLEAR + CDD complete.",
        "Device binding record + cooling-off timer. WALLET_ACTIVE only after the timer.",
        "Audit story: tracking ID → evidence → BV → screen → risk → cooling-off end → wallet number."
      ],
      time: "Decide within 2 working days of complete documents. Cooling-off 2 hours. Biometric monthly load PKR 400,000.",
      open: "Exact NADRA BV modality (finger vs facial) and commercial agreement: NEEDS CONFIRMATION."
    },
    j2: {
      id: "j2", num: "J2", title: "Biometric not possible (Verisys)",
      short: "Listed reason, then Verisys",
      color: "#1b6b93",
      group: "Onboarding spine",
      summary: "NADRA BV is not possible for an SBP-listed reason (age over 60, permanent disability, unclear fingerprints, or NRP/POC abroad until BV exists). The remote ladder then requires Verisys + CNIC–MSISDN pairing + OTP or call-back, with live photo. Not a convenience skip.",
      outcome: "If J2 fully succeeds: wallet at Verisys limits (monthly load PKR 50,000) unless a later BV upgrades the customer via J13. Reason for skipping BV is recorded in writing.",
      actors: "Customer; system; optionally call-centre for call-back.",
      from: "Spine step 10 when BV cannot be performed for a listed genuine reason.",
      regs: "CCOF F.1.iv–v.a–b · EMI 12 & 14.II.a–b · BPRD 04 alternate controls",
      customer: [
        "Reaches biometric. Capture fails or a declared eligible reason applies.",
        "Is told an alternate verification will be used and that limits may be lower until BV is done.",
        "NADRA Verisys runs against CNIC particulars.",
        "SIM–CNIC pairing is checked. Customer completes OTP or a randomised call-back.",
        "If all J2 checks pass: cooling-off, then activation at Verisys limits, with a later upgrade path via BV (that upgrade is J13, not an edit of this pack)."
      ],
      ops: [
        "Record the genuine reason. “Customer skipped” is not a listed reason.",
        "Call-back uses negative/step-wise confirmations; failure goes to a human agent.",
        "Do not grant biometric-tier limits on a Verisys-only pack.",
        "If pairing or OTP/call-back fails, J2 did not pass — move to J3 or J4."
      ],
      system: [
        "VERISYS_PASSED only if Verisys + pairing + OTP/call-back all succeeded.",
        "Store BV-not-possible reason code.",
        "Limit engine reads verification strength, not a Boolean “KYC true.”",
        "Upgrade to BV later is a new verification case, not an edit of the old result (J13)."
      ],
      time: "Still inside 2 working-day TAT. Verisys monthly load PKR 50,000; cash-out PKR 10,000/day.",
      open: "Who adjudicates “genuine reason”, and PTA/operator pairing source: NEEDS CONFIRMATION."
    },
    j3: {
      id: "j3", num: "J3", title: "Verisys with debit block",
      short: "Opened, cannot spend",
      color: "#d97706",
      group: "Onboarding spine",
      summary: "BV and Verisys+pairing+OTP have not both succeeded, but Verisys itself has. CCOF allows opening after Verisys with a debit block until BV or full J2 is completed. This is not WALLET_ACTIVE in the leadership sense.",
      outcome: "Instrument exists with DEBIT_BLOCKED. No debit, cash-out, P2P, or merchant pay until BV or full J2. If never verified, close and consider STR.",
      actors: "Customer; system; operations if the block lasts; compliance if STR is considered.",
      from: "J1 BV failed or not possible, and J2 pairing/OTP also failed, but Verisys succeeded.",
      regs: "CCOF F.1.v.c · EMI 12.III (tension: restricted open ≠ full activation) · EMI 12.IV · AML incomplete CDD",
      customer: [
        "Is told verification is incomplete. Status is “opened with restrictions” / “debit blocked.”",
        "Can see what is still required (complete BV, or pairing + OTP/call-back).",
        "Cannot send, withdraw, or pay. Attempts are declined with a restriction message.",
        "Resume stays open (J7). When (a) or (b) succeeds, the block lifts and limits follow the new strength."
      ],
      ops: [
        "Treat the block as a compliance control, not a UX flag payments can ignore.",
        "If verification never completes, close and consider STR (EMI 12.IV).",
        "Do not use J3 to onboard a sanctions-uncleared person.",
        "Pre-screen must still have been CLEAR to reach J3."
      ],
      system: [
        "DEBIT_BLOCKED is visible to wallets and payments. Fail closed if the flag cannot be read.",
        "A wallet number without the block is a defect.",
        "Every declined debit stores reason DEBIT_BLOCK_KYC.",
        "Lifting the block is a new event linked to a new verification result."
      ],
      time: "TAT still applies. Policy needed for how long a debit block may last. Prefer not using EMI 12.IV’s one unverified credit.",
      open: "Legal must confirm: restricted open ≠ full activation. Whether EMI 12.IV one-credit exception is used at all."
    },
    j4: {
      id: "j4", num: "J4", title: "Remote methods fail",
      short: "Video KYC / partner / decline",
      color: "#7c3aed",
      group: "Onboarding spine",
      summary: "BV, J2, and debit-block-after-Verisys have not produced a usable verified customer. CCOF then points to face-to-face. For an EMI without branches: recorded video KYC + Verisys with reasons, or third-party reliance on a bank that has branches. Agents must not issue e-money instruments (EMI 17.VII).",
      outcome: "VIDEO_KYC completed and wallet decision follows verification strength, or partner bank, or J8 decline.",
      actors: "Customer; trained video-KYC officer; compliance; possibly partner bank.",
      from: "CCOF F.1.v.d–f after (a)(b)(c) fail, or BV not met and EMI has no branch.",
      regs: "CCOF F.1.v.d–f and G.2 · EMI 12.V if also high risk · EMI 17.VII · AML CDD must still be completed",
      customer: [
        "Sees that in-app verification could not be completed.",
        "Is offered a scheduled recorded video interview and/or partner-bank directions — not a dead end, and not “open at an agent.”",
        "During video KYC: ID shown, live presence, questions per approved Digital Onboarding Policy.",
        "If successful, continues to cooling-off/activation. If not, J8 with a written reason."
      ],
      ops: [
        "Video KYC is a recorded interview with defined checks — not a chat, not WhatsApp.",
        "Record why BV could not be met (mandatory without physical presence).",
        "Officer must not see sanctions details that would tip off (J4 assumes screening was clear).",
        "If there is no approved Digital Onboarding Policy, this journey is blocked at governance."
      ],
      system: [
        "VIDEO_KYC_REQUIRED. Recording stored as an evidence object, not on an officer laptop.",
        "Outcome APPROVED / REJECTED / REVIEW is a new verification case.",
        "Retention clock on video per CCOF G.2 and 10-year CDD rules."
      ],
      time: "Strive to decide within 2 working days; notify the need for video inside TAT.",
      open: "Will first slice include video KYC capacity or partner-bank reliance? If neither, J4 becomes J8."
    },
    j5: {
      id: "j5", num: "J5", title: "Sanctions or proscribed-person hit",
      short: "Hard stop · no wallet",
      color: "#b91c1c",
      group: "Gates & exceptions",
      summary: "Pre-screening finds the applicant or an associated person (parent/guardian, mandate holder, later linked minor) on a UNSC designated list or ATA 1997 proscribed list, or acting on their behalf. Services must not be provided. Tipping-off rules apply. This is screening moment 1 of 4; J10, J13 and J17 cover the rest.",
      outcome: "DECLINED / relationship not established. Possible STR to FMU. No wallet. Customer message is truthful but must not reveal that a suspicion report is being filed.",
      actors: "Screening system; compliance investigator; MLRO. Not the relationship manager as a solo decider.",
      from: "Spine step 8, or later list refresh (then J10).",
      regs: "CCOF F.4 · EMI 12.III, 12.IX, 12.X · AML TFS · STR · tipping-off prohibition",
      customer: [
        "Must not be coached to “try a different name.”",
        "Receives a J8 decline with legally safe wording — not “you are on a sanctions list,” never that an STR was filed.",
        "Cannot complete onboarding. Tracking ID still shows the application is closed."
      ],
      ops: [
        "True match vs false positive: investigation case. High-severity needs maker-checker.",
        "False positive: documented clearance, then return to the spine. Do not skip remaining KYC.",
        "True match: do not open; consider STR; apply TFS; notify internal compliance, not the customer, of STR.",
        "STR/CTR filing is not assigned to outsourced staff."
      ],
      system: [
        "PRE_SCREEN_HIT stops issuance. Payments/wallets must not be reachable.",
        "Screening result is immutable: list name, version, score, analyst disposition.",
        "Access to hit details is restricted; who viewed the case is logged.",
        "A timeout is J11. A hit is J5. Never auto-clear a hit."
      ],
      time: "Decide within TAT. Possible false-positive investigation still fits the 2-day clock or the customer is notified inside TAT.",
      open: "Approved customer-facing decline text, match threshold, and NACTA feed: NEEDS CONFIRMATION."
    },
    j6: {
      id: "j6", num: "J6", title: "High-risk customer (EDD)",
      short: "Extra evidence + approval",
      color: "#b0892e",
      group: "Gates & exceptions",
      summary: "The Customer Risk Profile rates the applicant high risk. EDD applies: additional information, and for non-face-to-face, recorded video KYC where required. EDD is additional to CDD, not instead of BV/screening. Limit upgrades (J13) and linked minors (J15) can also land here.",
      outcome: "EDD completed and policy approval to onboard with enhanced monitoring — or J8 if EDD cannot be completed.",
      actors: "Customer; video-KYC officer; compliance; senior management where policy requires approval.",
      from: "Spine step 9 after data is sufficient to rate risk. Can also trigger mid-J1 if NADRA data changes the profile, or on J13 upgrade.",
      regs: "CCOF G · EMI 12.V · AML EDD (source of funds/wealth, senior approval, enhanced monitoring)",
      customer: [
        "Is asked additional questions/documents proportionate to risk (source of funds, occupation evidence, purpose, PEP).",
        "May be scheduled for recorded video KYC even if BV already passed.",
        "Is not told they are “high risk” in accusatory language.",
        "If EDD fails or is refused, the application is declined (J8), not quietly dropped to J1 limits."
      ],
      ops: [
        "Store the CRP model version used for this rating.",
        "PEP follows AML EDD, not a marketing flag.",
        "Enhanced monitoring after onboarding is handed to TMS (J10), not forgotten.",
        "Do not onboard high risk on a “we’ll EDD later” promise."
      ],
      system: [
        "RISK_HIGH_EDD blocks WALLET_ACTIVE until the EDD case is APPROVED.",
        "Video + extra documents are evidence objects.",
        "Maker-checker if policy requires senior approval to open."
      ],
      time: "2 working days from complete documents — “complete” for high risk includes EDD documents.",
      open: "First-slice CRP model (what is high risk) and whether PEPs are in appetite: NEEDS CONFIRMATION."
    },
    j7: {
      id: "j7", num: "J7", title: "Save and resume within 30 days",
      short: "Same tracking ID",
      color: "#0ea5e9",
      group: "Gates & exceptions",
      summary: "CCOF requires the online application to save an ongoing session that the customer can resume for up to 30 days without restarting. Authoritative state is server-side — not photos sitting in the phone gallery.",
      outcome: "Customer continues from the last completed step with the same tracking ID. After 30 days the application expires and must start again (new tracking ID).",
      actors: "Customer; system; support if they cannot find the application.",
      from: "Any point after APPLICATION_STARTED and before a terminal decision.",
      regs: "CCOF J.iii, J.iv, I, K.iv · BPRD 04 re-auth",
      customer: [
        "Leaves the app (call dropped, photo failed, user paused).",
        "Returns within 30 days, authenticates (2FA), sees progress and remaining steps, continues.",
        "If 30 days passed: told to start a new application; old tracking ID shows expired."
      ],
      ops: [
        "Support can locate the application by tracking ID without reading full CNIC aloud.",
        "Do not copy a half-finished pack onto a new CNIC."
      ],
      system: [
        "Device holds at most a pointer, not the KYC payload.",
        "Resume re-checks: device still bound or treat as J9; re-screen if list version changed; freshness of liveness/BV.",
        "Expiry after 30 days sets EXPIRED.",
        "Do not reset to a weaker verification path because the user is tired."
      ],
      time: "30-day resume window. Working position: TAT starts when documents are complete, not when the session first opened.",
      open: "TAT vs 30-day clock; retention of never-completed applications; BV freshness if older than N hours."
    },
    j8: {
      id: "j8", num: "J8", title: "Decline with written reason",
      short: "Tracking ID still works",
      color: "#64748b",
      group: "Gates & exceptions",
      summary: "Any terminal negative outcome must produce a specific written reason, keep the tracking ID, and fit TAT communication rules. Vague “something went wrong” is not compliant.",
      outcome: "DECLINED (or CLOSED_UNVERIFIED). Customer can see status by tracking ID. Internal reason codes may be richer than the customer-facing text (especially J5).",
      actors: "System; operations/compliance for reason code; customer; support.",
      from: "J2/J3/J4 exhaustion, J5 true match, J6 EDD fail, J11 unresolved, J12 duplicate, J13/J15/J18 fail, or incomplete CDD at TAT.",
      regs: "CCOF I.2–I.4 · AML incomplete CDD · EMI 12.IV · no tipping-off",
      customer: [
        "Receives written notice (in-app + SMS/email) with a specific reason appropriate to the case, in English and Urdu.",
        "Can still look up the tracking ID and see closed status.",
        "Is pointed to 24/7 support for questions that are allowed to be answered."
      ],
      ops: [
        "Reason catalogue: verification failed; documents incomplete after notice; duplicate wallet; cannot offer product; identity could not be verified — plus internal-only codes for TFS/STR.",
        "If documents were incomplete, a discrepancy notice must have gone out inside TAT before a silent decline.",
        "STR consideration documented internally when AML requires it."
      ],
      system: [
        "Terminal state is immutable. A retry is a new application (new tracking ID), except a documented sanctions false-positive clearance on the same ID.",
        "Customer-facing reason and internal reason are stored separately.",
        "Do not leak existence of others’ wallets or list names."
      ],
      time: "Notice within 2 working days of complete documents, or discrepancy notice earlier if incomplete.",
      open: "Customer-facing reason catalogue must be approved by compliance/legal."
    },
    j9: {
      id: "j9", num: "J9", title: "New device after onboarding",
      short: "BV · notify · cooling-off",
      color: "#0891b2",
      group: "After the wallet exists",
      summary: "After the customer already has a wallet, a new phone/tablet must be registered with NADRA BV (preferably digital), immediate notification, cooling-off, and device-limit checks. This is not “just log in with OTP.” Changing mobile, email, or password on the same device is J14, not this journey.",
      outcome: "New device bound and usable after cooling-off, or rejected. Old devices remain until removed, subject to max-device policy.",
      actors: "Customer; system; call-centre if call-back fallback; fraud unit if anomalies.",
      from: "WALLET_ACTIVE (or DEBIT_BLOCKED) customer attempts access from an unbound device.",
      regs: "BPRD 04 A.i.b, A.iii, A.v–viii · CCOF K (BPRD 04 pulled into EMI digital onboarding)",
      customer: [
        "Opens the app on a new device. Is not in full wallet use before the device is registered.",
        "Completes NADRA BV in-app (or an approved pair of alternate controls).",
        "Immediately receives SMS and email that a new device was registered.",
        "Waits two hours before the new device can operate the wallet.",
        "Sees the device under “manage devices.” If they did not initiate it, they contact support."
      ],
      ops: [
        "If max devices exceeded: extra authentication, recorded justification, customer verification.",
        "If the same device is used across too many CNICs: fraud procedure; may report the device to PTA.",
        "Password reset on the new device is forbidden until it is a registered device (then J14 still applies, with cooling-off).",
        "CCOF K pulls BPRD 04 device-binding into EMI digital onboarding even though the 2023 circular was addressed to banks/MFBs."
      ],
      system: [
        "Unbound device session cannot move money or reset credentials.",
        "Device registry: identifiers, first-seen, notify timestamps, cooling-off end, status.",
        "NEW_DEVICE_REGISTERED is available to fraud monitoring."
      ],
      time: "Immediate notification. 2-hour cooling-off. Separate from onboarding TAT.",
      open: "Primary bind key (IMEI privacy), max devices, root/jailbreak policy: NEEDS CONFIRMATION."
    },
    j10: {
      id: "j10", num: "J10", title: "Continuous screening / monitoring",
      short: "KYC does not end at issuance",
      color: "#be185d",
      group: "After the wallet exists",
      summary: "Screening is not one-time. After onboarding, list updates, periodic re-screens, and transaction monitoring can produce a hit. Restrict, investigate, report, and keep an audit trail without tipping off. Refreshing expired CNIC data is J17; this journey is the hit itself.",
      outcome: "MONITORING_HOLD or freeze per TFS; investigation CLEAR (resume) or CONFIRMED (STR, exit, freeze).",
      actors: "TMS / screening batch; investigator; maker-checker; MLRO; payments (must honour HOLD).",
      from: "WALLET_ACTIVE or DEBIT_BLOCKED. List update, periodic cycle, payment, cash-out, device+behaviour scenarios. Material changes (upgrade, new linked person) re-screen in J13/J15 before they complete.",
      regs: "AML ongoing monitoring · EMI 12.IX–X · BPRD 04 D · 10-year records",
      customer: [
        "May see a payment declined or channels suspended. Must not be told “we filed an STR.”",
        "May be asked source-of-funds questions that are part of monitoring, not a casual chat.",
        "If cleared, service resumes; if confirmed TFS, services stop as required by law."
      ],
      ops: [
        "Fail closed: rule fire or vendor timeout → HOLD, never CLEAR.",
        "Specify fraud scenarios: new device then credential reset; burst IBFT; geo change; mule-device.",
        "Four screening moments must exist: (1) pre-relationship J5, (2) before material change J13/J14/J15, (3) periodic / list update here, (4) event-driven payments and cash-out here.",
        "STR regardless of amount if suspicion exists, including attempted transactions.",
        "Do not confuse FTDH fraud clocks with AML STR clocks."
      ],
      system: [
        "Re-screen creates a new screening fact; it does not edit the onboarding screen.",
        "HOLD is visible to payments and wallets immediately.",
        "Case file: trigger, transactions, device, investigator, disposition, STR internal id."
      ],
      time: "Real-time for payment screening; batch SLA for list refresh.",
      open: "TMS rule catalogue, list-refresh frequency, CTR threshold, FTDH in first slice."
    },
    j11: {
      id: "j11", num: "J11", title: "Provider timeout (fail closed)",
      short: "Never auto-approve",
      color: "#ea580c",
      group: "Gates & exceptions",
      summary: "NADRA, screening lists, SMS/OTP, or pairing services are unavailable, time out, or are in stub mode. The product must not auto-approve. A stub APPROVED is a labelled fake — never a real clean customer.",
      outcome: "VERIFICATION_PENDING or PRE_SCREEN_UNAVAILABLE or MANUAL_REVIEW. No WALLET_ACTIVE. Retry, wait, or J8 if TAT expires without CDD.",
      actors: "Customer; system; operations queue. Never a developer flipping a flag on a real applicant.",
      from: "Any spine step that calls a provider.",
      regs: "AML: if CDD cannot be completed, do not open · CCOF TAT discrepancy notice · EMI 12.III",
      customer: [
        "Sees “verification delayed / try again” with tracking ID — not a green success.",
        "May resume (J7) when the service recovers.",
        "If the institution cannot complete CDD in time: J8, not a mercy activation."
      ],
      ops: [
        "Sandbox/stub: labelled environment only, synthetic customers, watermarked evidence.",
        "Production: queue for retry. No “force approve” without a named officer and a reason that still meets CDD (almost never NADRA-down)."
      ],
      system: [
        "Provider errors map to PENDING/UNAVAILABLE, never APPROVED.",
        "Stub adapter and real adapter share the same port. Feature flag is configuration, not a frontend rewrite.",
        "Do not cache NADRA secrets on the device while retrying. Do not log full CNIC in error traces."
      ],
      time: "Does not pause legal TAT magically — notify the customer (CCOF I.2).",
      open: "Max retries; whether operations can ever override NADRA-down (working position: no)."
    },
    j12: {
      id: "j12", num: "J12", title: "Duplicate CNIC",
      short: "One wallet per EMI",
      color: "#4338ca",
      group: "Gates & exceptions",
      summary: "A CNIC holder may obtain only one e-money instrument with an EMI. A second attempt must be detected without helping attackers enumerate accounts.",
      outcome: "New application does not create a second wallet. Authenticated same person is routed to login / device bind (J9) / support. Attackers get a generic result, not “this CNIC is taken.”",
      actors: "Customer (genuine returning or fraudster); system; support for takeover cases.",
      from: "Spine step 7, as soon as CNIC is known — but user-visible behaviour must not confirm existence until authenticated.",
      regs: "EMI 12.VII · BPRD 04 A.ix enumeration control",
      customer: [
        "Genuine returning customer: after authentication, sees the existing wallet, not a second onboarding.",
        "Person who lost access: recovery with BV on a new device (J9) — not a second wallet.",
        "Fraudster using a leaked CNIC: generic failure / login path, no helpful “already registered to 03xx.”"
      ],
      ops: [
        "Same CNIC + different mobile claiming to open: possible takeover or mule; do not open a second wallet; investigate.",
        "Whether a closed wallet frees the CNIC: see J16. Working position after full closure and cooling policy — NEEDS CONFIRMATION.",
        "A parent-linked minor wallet (J15) is not a second wallet for the guardian’s CNIC. The child’s B-Form/ID uniqueness is a separate invariant."
      ],
      system: [
        "Uniqueness of active instrument per CNIC per EMI is an invariant.",
        "Lookup is server-side; response to unauthenticated clients stays generic.",
        "Link duplicate attempts to fraud monitoring."
      ],
      time: "Immediate. Not a TAT onboarding decision for a new product.",
      open: "Re-open after closure; NICOP vs CNIC same human: NEEDS CONFIRMATION."
    },
    j13: {
      id: "j13", num: "J13", title: "Limit / category upgrade",
      short: "Verisys → BV → enhanced",
      color: "#0f766e",
      group: "After the wallet exists",
      summary: "CCOF F.1 treats change or upgradation of wallet category as identity verification again — not a settings toggle. A Verisys customer who later completes NADRA BV moves to the biometric band. A biometric customer who later qualifies for the SBP-approved enhanced band (up to PKR 1,000,000) must supply one Annexure-J source-of-funds document, CNIC/SIM pairing, in-house TMS and detailed CRP. Those extra controls must not be outsourced. EMI 14.VI salary, remittance and utility exclusions are not this journey: they sit beside the band after a separate SBP permission.",
      outcome: "LIMITS_UPDATED after a new verification case, re-screen, CRP, and 2-hour cooling-off — or stay on the old band, or J8 if CDD for the new band cannot be completed.",
      actors: "Existing wallet holder; system; compliance for enhanced-band evidence; senior approval if CRP becomes high (J6).",
      from: "WALLET_ACTIVE at a lower band, or DEBIT_BLOCKED customer completing BV / full J2.",
      regs: "CCOF F.1 (opening or change/upgradation of category) · EMI 14.II–III · EMI 14.VI (exclusions, not a band) · Annexure-J · EMI 12.V if high risk · BPRD 04 cooling-off on limit change",
      customer: [
        "Requests a higher monthly load, or is prompted after a successful later BV.",
        "Completes the verification required for the target band (BV for PKR 400,000; for PKR 1,000,000: one Annexure-J income document + SIM pairing + extra questions).",
        "Is told limits will not move until cooling-off ends. Old band still applies during the wait.",
        "If the upgrade is refused or incomplete, keeps the current band — is not silently given the higher ceiling.",
        "Salary paid via the employer’s bank, PRI remittances, and utility bills are not an upgrade request. Those may sit outside the monthly cap only after SBP grants 14.VI — never for a minor."
      ],
      ops: [
        "Re-run identity verification for the new category. Do not copy the onboarding BV result and call it an upgrade.",
        "Re-screen the customer (and any associated person) before the new band goes live — screening moment 2.",
        "Enhanced band: commercial licence plus SBP permission; CNIC/SIM pairing; in-house TMS (one-to-many, many-to-one); detailed CRP. Not outsourced.",
        "Annexure-J — any one document in the matching column: salaried (latest salary slip, salary certificate, payment record, account statement, tax statement/return/certificate, pension/terminal benefits if retired); non-salaried (payment against work, account statement, income-provider particulars such as family/guardian/stipend/social benefit, tax statement, or other evidencing document); alternates (inheritance, agriculture, securities/bonds/shares, property, rent, interest).",
        "14.VI is not a fourth band. After commercial operations and PSP&OD permission, BV adult wallets may exclude (i) employer credits from the nominated bank — EMI verifies the employer, (ii) inward remittances through authorised dealers up to PKR 1,500,000, (iii) utility bill payments. Minors never receive 14.VI. Payments and receipts are counted separately (14.II.a).",
        "Pilot vs commercial ceilings are different (biometric PKR 200,000 in pilot, PKR 400,000 in commercial). The engine must know the licence stage.",
        "If CRP becomes high on upgrade, J6 blocks the new band until EDD is approved."
      ],
      system: [
        "UPGRADE_CASE is a new verification + screening + CRP bundle linked to the existing wallet, not a new CNIC.",
        "Limit engine reads current verification strength and licence stage. Payments honour the old band until cooling-off ends.",
        "Store before/after band, annexure_j_doc_type, evidence hashes, list version, CRP version.",
        "14.VI flags (salary_ex, remittance_ex, utility_ex) sit beside the band. Remittance exclusion has its own PKR 1,500,000 cap. Load, payments and receipts are separate counters.",
        "Fail closed on NADRA/list timeout (J11). Do not park the customer on the higher band “temporarily.”"
      ],
      time: "Treat as a material change: 2-hour cooling-off on the new limits (BPRD 04). Individual decision TAT 2 working days from complete upgrade documents (including the Annexure-J item).",
      open: "When PSP&OD enhanced-wallet and 14.VI exclusion permissions are sought; first-slice licence stage (pilot vs commercial) — NEEDS CONFIRMATION."
    },
    j14: {
      id: "j14", num: "J14", title: "Mobile, email or password change",
      short: "BV · notify · cooling-off",
      color: "#0369a1",
      group: "After the wallet exists",
      summary: "BPRD 04 (pulled into EMI digital onboarding by CCOF K) requires NADRA BV for modification of registered email or phone, credential reset only from a registered device, OTP from the institution short code, and a two-hour cooling-off before the change takes effect. SIM-swap and inbox-takeover are first-class Pakistani fraud paths, not “profile edits.”",
      outcome: "CREDENTIAL_UPDATED after BV (or listed alternate pair), notification, and cooling-off — or rejected. Wallet spend on the old mobile/email continues until the timer ends.",
      actors: "Customer; system; call-centre for call-back; fraud unit if the change pattern matches TMS.",
      from: "WALLET_ACTIVE (or DEBIT_BLOCKED) customer requests change of MSISDN, email, user ID or password from a registered device.",
      regs: "BPRD 04 A.i.c, A.iii, A.viii · CCOF K.i.b · CCOF F.1 if pairing is part of verification strength",
      customer: [
        "Starts the change from an already registered device (password reset on an unbound device is refused — see J9).",
        "Completes NADRA BV, or two listed alternate controls if BV is not possible (disability, mehndi/bandage, NRP, foreign national).",
        "For a new mobile: CNIC–MSISDN pairing is re-checked. OTP auto-fetches from the institution short code.",
        "Is told beforehand that the change waits two hours. Receives SMS and email on the old channels.",
        "If they did not request it, they contact 24/7 support immediately."
      ],
      ops: [
        "Do not fold this into J9. A new phone is a device bind; a new SIM on the same phone is this journey — both can fire together.",
        "Password reset: registered device + OTP auto-fetch/sender binding, or robocall / call-back / in-app BV. Randomised negative confirmations on call-back.",
        "If BV for contact change times out, fail closed (J11) — do not take the new number on OTP alone.",
        "Pattern “new device then password reset then IBFT” is a J10 fraud scenario, not a successful J14."
      ],
      system: [
        "Pending change is a dated case: old value, requested value, BV/pairing results, notify timestamps, cooling-off end.",
        "Payments, alerts and OTP delivery keep using the old mobile/email until the timer ends.",
        "CNIC–MSISDN pairing result is stored as a new fact. If pairing fails, the mobile change does not complete.",
        "If the customer’s verification strength depended on pairing (J2), losing pairing may force a limit downgrade or debit block — do not ignore that."
      ],
      time: "Immediate notification on old channels. 2-hour cooling-off before the change is live.",
      open: "Whether a Verisys-band wallet must repeat full J2 pairing on every SIM change: working position yes. PTA feed for pairing: NEEDS CONFIRMATION."
    },
    j15: {
      id: "j15", num: "J15", title: "Parent-linked minor wallet",
      short: "Opened inside guardian’s app",
      color: "#a21caf",
      group: "Other EMI customers",
      summary: "EMI §14.IV–V allows a minor’s e-money wallet only when it is opened in link with a parent/guardian’s already-verified wallet, through that parent’s app. The guardian gives a written or digital undertaking of liability. Basic minor: Verisys, monthly load PKR 50,000, funded only from the parent wallet. Freelancer-enhanced minor: NADRA BV, PKR 400,000, source of income verified. Adult PKR 1,000,000 enhanced limits do not apply to minors. Do not reuse J1 for a child.",
      outcome: "MINOR_WALLET_ACTIVE, linked to the guardian’s instrument, at the matching minor band — or J8 if guardian or child CDD fails.",
      actors: "Parent/guardian (already WALLET_ACTIVE); minor; system; compliance (both persons screened); TMS on the linked pair.",
      from: "Guardian has WALLET_ACTIVE. Journey runs inside the guardian’s authenticated app — never as a child’s standalone J1.",
      regs: "EMI 14.IV–V · EMI 12 CDD for both persons · CCOF associated-person CDD · CCOF F.4 screen both · AML minors · BPRD 2026 C1 conversion at majority (overlay)",
      customer: [
        "Guardian, already onboarded, chooses “open a wallet for my child” in their own app.",
        "Supplies the minor’s identity evidence (B-Form / juvenile ID / CNIC if issued) and relationship proof.",
        "Completes the verification required for the chosen minor band (Verisys basic, or BV for freelancer-enhanced).",
        "Signs a written or digital undertaking to accept liability for the minor’s actions.",
        "Sees that the child’s wallet is funded from the parent wallet (basic) or from verified sources (enhanced freelancer).",
        "At majority, the same wallet is converted to an adult instrument only after adult CDD (not a silent birthday flag)."
      ],
      ops: [
        "CDD both people. Screen both. A hit on either person is J5 — do not open the child wallet.",
        "Guardian must already be verified. Do not onboard parent and child as one mixed J1 pack.",
        "Basic minor: fund only from parent wallet; cash-out PKR 10,000/day; adult enhanced limits (14.I–III) do not apply.",
        "Enhanced freelancer minor: source of income verified; BV; still not the adult PKR 1,000,000 product.",
        "Deploy TMS on the pair (parent many-to-one / child mule patterns).",
        "EMI 17.VII still applies: agents do not issue the child’s instrument."
      ],
      system: [
        "Child instrument stores guardian_wallet_id, undertaking evidence, relationship type, minor band, funding constraint.",
        "Uniqueness: one active minor instrument per child identity with this EMI; guardian may link more than one child.",
        "Payments engine rejects credits to a basic minor wallet that are not from the linked parent wallet.",
        "Majority conversion is a J13-like category change with adult CDD — new verification case, not an UPDATE of age."
      ],
      time: "Individual TAT 2 working days from complete documents for both persons. Cooling-off 2 hours before the child wallet can operate.",
      open: "B-Form vs juvenile CNIC as the child’s ID; age floor; whether BPRD 2026 teenager-wallet overlay is in appetite — NEEDS CONFIRMATION."
    },
    j16: {
      id: "j16", num: "J16", title: "Close, redeem, release CNIC",
      short: "Par value · BV for cash",
      color: "#57534e",
      group: "After the wallet exists",
      summary: "EMI §15 requires issuance and redemption at par, with no charges on redemption, and NADRA BV when e-money is redeemed in cash. Customer-requested closure, unverified-instrument closure (EMI 12.IV), and TFS/exit are different reasons that must not share one “delete account” button. Until J16 completes, J12 still treats the CNIC as taken.",
      outcome: "WALLET_CLOSED. Balance redeemed at par to a verified destination. CNIC-release policy applied. Records retained 10 years after relationship end.",
      actors: "Customer or compliance (TFS/exit); system; cash-out channel (agent/ATM/IBFT); MLRO if STR/TFS.",
      from: "WALLET_ACTIVE, DEBIT_BLOCKED never verified, or MONITORING_HOLD confirmed TFS / offboarding.",
      regs: "EMI 15.I–III · EMI 12.IV unverified close+STR · EMI 12.VII uniqueness · EMI 24.II retention · AML exit CDD · CCOF I written reason",
      customer: [
        "Requests closure, or is told the instrument is being closed (unverified / TFS wording that does not tip off).",
        "For cash redemption: completes NADRA BV. For IBFT redemption: destination account is their own, with 2FA.",
        "Receives the remaining e-money at par, without a closure fee.",
        "Sees a written reason and a closed tracking/wallet status. Cannot spend after closure.",
        "Is not promised that they can immediately open a new wallet on the same CNIC unless policy says the CNIC is free."
      ],
      ops: [
        "Three closure reasons, three files: (a) customer request, (b) never-verified + consider STR, (c) TFS/exit. Do not mix customer-facing text.",
        "Cash-out of remaining e-money: BV, or 2FA at ATM as EMI 14.II.d. Agent cash-out: BV or 2FA where BVS is a genuine constraint.",
        "Do not redeem to a third party’s account as a “favour.”",
        "If TFS freeze applies, redemption may be legally blocked — that is not a customer-service close.",
        "After closure, J12 uniqueness depends on the confirmed re-open policy."
      ],
      system: [
        "CLOSED is terminal. A later application is a new tracking ID and a new uniqueness check.",
        "Redemption payment is an auditable disbursement at par, linked to BV/2FA evidence.",
        "Retain CDD and correspondence 10 years after relationship end (EMI 24.II / AML).",
        "Do not hard-delete the customer row to “free the CNIC.” Release is a policy flag, not a vacuum."
      ],
      time: "Redeem without delay at par on request (EMI 15). TFS clocks are legal clocks, not this SLA.",
      open: "Cooling period before the same CNIC may return; IBFT-only vs cash redemption in first slice — NEEDS CONFIRMATION."
    },
    j17: {
      id: "j17", num: "J17", title: "Periodic CDD / expired CNIC",
      short: "Refresh identity data",
      color: "#c2410c",
      group: "After the wallet exists",
      summary: "AML ongoing CDD is not the same as J10’s sanctions/TMS hit. NADRA particulars change (name after marriage, address), CNIC expiry, and timed CCOF obligations (expired ID + NADRA token: lodge the renewed copy within 3 months) all require a refresh case. Until it completes, services may be restricted. A list hit found during refresh becomes J10/J5.",
      outcome: "CDD_CURRENT after new evidence + re-screen, or RESTRICTED / J16 close if the customer will not refresh, or J10 if screening now hits.",
      actors: "Existing customer; system (expiry batch); operations for discrepancy notices; compliance if risk rating changes.",
      from: "WALLET_ACTIVE. Triggers: CNIC expiry approaching; NADRA data change; periodic review due; CCOF 3-month renewed-ID clock.",
      regs: "AML ongoing CDD · CCOF Table-A footnote (expired ID + token, renewed copy in 3 months) · CCOF F.1 if category also changes · EMI 12.I live ID",
      customer: [
        "Is notified in-app + SMS/email that identity documents must be updated, with a tracking ID for the refresh case.",
        "Captures a live image of the renewed CNIC (and live photo if policy requires a fresh liveness).",
        "If NADRA name/address changed, confirms the new legal particulars — the app does not let them keep the old name as a nickname for CDD.",
        "If they ignore the notice past policy/CCOF clocks: channels restrict, then possible closure — not a silent unlimited wallet."
      ],
      ops: [
        "Discrepancy notice inside a defined SLA. Do not restrict without having notified.",
        "Re-screen on the new particulars (screening moment 3). A new hit is J10, not “we’ll ignore because they were clear in 2026.”",
        "If the refresh is also a limit upgrade, run J13 — do not hide a band change inside a document update.",
        "CRP may change when occupation/address/expected behaviour is updated. High becomes J6.",
        "Expired-at-onboarding exception (token + 3 months) is a clock with an owner, not a comment."
      ],
      system: [
        "CDD_REFRESH_DUE / IN_PROGRESS / CURRENT / OVERDUE are states payments can read.",
        "New CNIC image and NADRA result are new evidence objects; old ones stay in the audit trail.",
        "Do not overwrite the original onboarding pack. Append.",
        "Fail closed if NADRA is down during refresh (J11) — do not mark CURRENT because the batch job failed."
      ],
      time: "CCOF: renewed ID within 3 months of opening on expired ID + token. Periodic-review frequency: policy / AML risk band — NEEDS CONFIRMATION.",
      open: "Review cycle by risk band; whether liveness is required on every CNIC renew; restriction set while OVERDUE."
    },
    j18: {
      id: "j18", num: "J18", title: "NICOP, POC, ARC, POR / NRP",
      short: "Digital IDs other than CNIC",
      color: "#1d4ed8",
      group: "Other EMI customers",
      summary: "CCOF C.5 allows digital onboarding only for CNIC, NICOP, POC, POR or ARC holders. EMI 12.I also lists passport, but a passport-only customer is not on the digital path — they go J4/face-to-face. Non-resident Pakistanis and POC holders outside Pakistan may use Verisys until NADRA BV for that population is operational (CCOF F.1.iv.b). Same spine, extra residency and ID rules — not a second product, and not a Roshan Digital Account (that is a bank product).",
      outcome: "Wallet at the verification-strength band after the same gates as J1–J4, with residency/ID type stored — or J8 if the ID class cannot be onboarded digitally.",
      actors: "Applicant with NICOP/POC/ARC/POR (or NRP abroad); system; compliance on residency and TFS; possibly video KYC.",
      from: "Spine at national-data capture when ID type is not a resident CNIC.",
      regs: "CCOF C.5 · CCOF F.1.iv.b and F.1.v (NRP/POC exception) · EMI 12.I ID list · AML residency / tax · not RDA",
      customer: [
        "Selects ID type. Is not offered a digital path for passport-only or undocumented status.",
        "Provides the extra residency evidence the ID class needs (e.g. POC particulars, ARC/POR for Afghan refugees, overseas status).",
        "If outside Pakistan and BV is not operational for that class: Verisys path with the listed NRP exception, live photo still captured.",
        "If inside Pakistan with NICOP/POC/ARC/POR: BV is still primary, same ladder as J1–J4.",
        "Sees the same tracking ID, 30-day resume, and written decline rules."
      ],
      ops: [
        "Do not invent extra Pakistan digital ID types. CCOF C.5 is a closed list.",
        "Passport appears on EMI 12.I but not on CCOF digital-onboarding eligibility — treat passport-only as non-digital (J4).",
        "ARC/POR: apply AML/CFT for that population; do not copy CNIC field validation onto a POR number.",
        "This is not RDA, not a foreign-currency account, not a digital-bank product. EMI inward remittance (EMI 13) is a later permissioned service on an already-issued PKR wallet.",
        "Screening and uniqueness still apply. NICOP vs CNIC for the same human: J12 open question."
      ],
      system: [
        "id_class is a first-class field (CNIC / NICOP / POC / ARC / POR). Validation, NADRA product, and BV availability branch on it.",
        "NRP_BV_NOT_OPERATIONAL is a dated configuration flag, not a customer skip code.",
        "Store residency self-declaration and tax fields (FATCA/CRS) from Table-A.",
        "Same activation gate: verification + pre-screen + CDD. Same cooling-off."
      ],
      time: "Same 2 working-day individual TAT. NRP/POC abroad remains on Verisys until BV for that class is operational.",
      open: "When NADRA BV is operational for NRP/POC abroad; NICOP and CNIC as one person for EMI 12.VII — NEEDS CONFIRMATION."
    },
    j19: {
      id: "j19", num: "J19", title: "Cash-in / cash-out at agent, ATM or branch",
      short: "BV at the till · 2FA at ATM",
      color: "#9a3412",
      group: "After the wallet exists",
      summary: "EMI 15.II lets a live wallet be funded by IBFT or by cash-in at EMI branches, agents, ATMs or bank branches — cash-in is subject to NADRA biometric verification. EMI 14.II.d requires 2FA for ATM cash-out and BV (or 2FA where BVS is a genuine constraint) for agent cash-out. This is not closure (J16) and not a limit upgrade (J13). IBFT load does not use this journey.",
      outcome: "CASH_POSTED at par after BV (cash-in) or 2FA/BV (cash-out) — or declined. Wallet stays WALLET_ACTIVE. A mule / structuring pattern is J10, not a successful till event.",
      actors: "Existing wallet holder; agent or ATM/bank channel; system; TMS. Agents still do not issue instruments (EMI 17.VII).",
      from: "WALLET_ACTIVE customer presents at an agent, ATM, EMI branch or bank branch to load or withdraw cash.",
      regs: "EMI 15.I–II · EMI 14.II.b–d · EMI 17.VII · CCOF F.1 biometric · BPRD 04 2FA · AML cash TMS",
      customer: [
        "IBFT from their own bank account credits the wallet without this journey.",
        "For cash-in: presents at an EMI branch, agent, ATM or bank branch and completes NADRA BV. E-money is issued at par only after BV succeeds.",
        "For ATM cash-out: completes 2FA. For agent cash-out: completes BV, or 2FA only where BVS availability is a genuine constraint.",
        "Verisys-only wallets cannot cash-in until BV is done. That BV is also a J13 upgrade to the biometric band — not a till override of Verisys limits.",
        "A debit-blocked or monitoring-hold wallet cannot cash-out. Basic minors cannot take street cash-in; they are funded from the parent wallet only.",
        "Failed BV does not load or pay. The existing wallet is unchanged."
      ],
      ops: [
        "Do not fold this into J16. J16 redeems the remaining balance on close. J19 is cash in or out while the wallet is live.",
        "Agents distribute and redeem e-money; they never issue the instrument (EMI 17.VII). No “open wallet at the till.”",
        "Cash-in without BV is a defect. ATM cash-out without 2FA is a defect. “Agent knows the customer” is not 2FA.",
        "A Verisys customer who completes BV at the till must open a J13 case for the biometric band. Do not credit PKR 400,000 capacity as a side effect of one cash-in.",
        "Minors: basic band funded only from the linked parent wallet; cash-out PKR 10,000/day. 14.VI exclusions never apply to minors.",
        "Structuring, smurfing, one-to-many cash-in, or “new device then cash-out” is J10. The till transaction fails closed if TMS says hold."
      ],
      system: [
        "CASH_CASE stores channel (agent / ATM / EMI branch / bank), direction (in/out), amount, BV or 2FA evidence, and par-value posting.",
        "Credit the wallet only after BV_PASSED on cash-in (EMI 15.I–II). Debit cash-out only after 14.II.d is satisfied and HOLD/DEBIT_BLOCKED are clear.",
        "Limit engine still enforces monthly load, separate payment and receipt counters, and cash-out daily caps. 14.VI flags apply only if PSP&OD has granted them.",
        "Agent terminal never calls NADRA from a shop-floor PC as if it were onboarding. Same BV service as J1/J13, different case type.",
        "Fail closed on NADRA/BVS timeout (J11). Do not take cash against a paper CNIC photocopy."
      ],
      time: "Post at par without delay once BV/2FA succeeds (EMI 15). Daily cash-out: PKR 10,000 for Verisys; EMI-defined by risk profile after BV (14.II.c). Agent/ATM 2FA/BV as 14.II.d.",
      open: "Which cash-in channels ship in the first slice (agent vs ATM vs bank branch); BVS-constraint policy for agent 2FA fallback — NEEDS CONFIRMATION."
    }
  },

  ladder: [
    { rung: "a", title: "Primary — NADRA biometric", body: "Finger/thumb, iris, or facial when operational, through authenticated means, in-app. Live photo already captured. This is J1 when screens are clear and risk is not high. The same rung is re-run on J13 category upgrade, J14 contact change, and J19 cash-in / agent cash-out." },
    { rung: "b", title: "If BV is not possible — Verisys bundle", body: "Only for listed genuine reasons (including NRP/POC abroad until BV exists — J18). NADRA Verisys and CNIC–MSISDN pairing and OTP or call-back, plus live photo. Wallet, if activated, sits at Verisys limits (J2)." },
    { rung: "c", title: "If a and b fail — Verisys with debit block", body: "Wallet may be opened after Verisys with a debit block until a or b is completed. The customer must not be able to spend (J3). Not full activation." },
    { rung: "d", title: "If all remote methods fail", body: "Guide to face-to-face. For an EMI without branches: recorded video KYC + Verisys with reasons, or third-party bank reliance — or decline (J4 → J8). Agents must not issue the instrument." }
  ],

  states: [
    ["APPLICATION_STARTED", "Tracking ID exists; session may be resumed (J7)."],
    ["EVIDENCE_COLLECTED", "National data, live photo, live ID, device, geo/IP captured; nothing left on the phone."],
    ["PRE_SCREEN_CLEAR / HIT / UNAVAILABLE", "Screening is a dated fact with list version. Unavailable is J11, not a pass."],
    ["VERIFICATION_PENDING / BV_PASSED / VERISYS_PASSED / DEBIT_BLOCKED / VIDEO_KYC_REQUIRED / VERIFICATION_FAILED", "Verification strength drives limits. It is not a Boolean KYC flag."],
    ["RISK_LOW_OR_MEDIUM / RISK_HIGH_EDD", "High risk blocks activation until EDD is approved (J6)."],
    ["COOLING_OFF", "App not yet fully active (2-hour rule). Also applies to device, mobile, email, limits, password reset."],
    ["WALLET_ACTIVE", "Number assigned; limits match verification strength. E-money claim, not a bank deposit."],
    ["LIMIT_UPGRADE_PENDING", "J13 case open; old band still enforced until cooling-off ends."],
    ["CREDENTIAL_CHANGE_PENDING", "J14 case open; old mobile/email still used for alerts and OTP."],
    ["CDD_REFRESH_DUE / OVERDUE", "J17 identity data must be updated; payments may restrict if overdue."],
    ["MINOR_LINKED", "Child instrument tied to a guardian wallet (J15)."],
    ["DECLINED / CLOSED_UNVERIFIED / WALLET_CLOSED", "With reason code; STR considered where required (J8 / J16)."],
    ["MONITORING_HOLD", "Later hit; services restricted pending investigation (J10)."],
    ["CASH_PENDING / CASH_POSTED", "J19 till case. Cash-in waits for BV; ATM cash-out waits for 2FA. Credit or debit at par only after. Not a close."]
  ],

  limits: [
    ["NADRA Verisys only (J2)", "PKR 50,000 monthly load", "Cash withdrawal PKR 10,000 per day. Cash-in still needs BV (J19) — that BV is also a J13 upgrade."],
    ["NADRA biometric (J1)", "PKR 400,000 commercial (pilot 200,000)", "Cash-out by risk profile (14.II.c). ATM 2FA; agent cash-out BV or 2FA if BVS is a genuine constraint (J19)."],
    ["Enhanced wallet (J13)", "Up to PKR 1,000,000 after SBP permission", "One Annexure-J document, CNIC/SIM pairing, in-house TMS and CRP — not outsourced."],
    ["Basic minor (J15)", "PKR 50,000 monthly load", "Opened in guardian’s app; funded only from parent wallet; cash-out PKR 10,000/day. No 14.VI."],
    ["Enhanced freelancer minor (J15)", "PKR 400,000 on BV", "Source of income verified. Adult PKR 1m band and 14.VI exclusions do not apply."],
    ["Payments vs receipts (14.II.a)", "Counted separately", "Monthly load is not a combined payments+receipts bucket. Both still honour the band."],
    ["14.VI salary credit", "Outside the load cap if SBP allows", "BV adults only, not minors. Credit from employer’s nominated bank. EMI verifies the employer."],
    ["14.VI inward remittance", "Up to PKR 1,500,000 outside the cap", "Through authorised dealers / PRI. BV adults only. Needs PSP&OD permission after a commercial track record."],
    ["14.VI utility bills", "Outside the load cap if SBP allows", "BV adults only, not minors. Same SBP permission as the other 14.VI items."]
  ],

  annexureJ: {
    title: "Annexure-J — source of income for the enhanced band (J13)",
    intro: "Indicative list from EMI Regulations Annexure-J. Any one document in the matching column suffices for the PKR 1,000,000 band. These controls must not be outsourced (14.III).",
    salaried: [
      "Latest salary slip",
      "Salary certificate",
      "Payment slips / record",
      "Account statement",
      "Tax statement / return / certificate",
      "Retired: terminal benefits / pension book",
      "Any other document evidencing source of income"
    ],
    nonSalaried: [
      "Receipt of payment against the work",
      "Account statement",
      "Particulars of income/funds providers (family / guardian / stipend / social benefit)",
      "Tax statement / return / certificate",
      "Any other document evidencing source of income"
    ],
    alternate: [
      "Inheritance",
      "Agriculture income",
      "Investment in securities, bonds, shares",
      "Investment in property",
      "Rental income",
      "Interest income"
    ]
  },

  exclusions14vi: {
    title: "EMI 14.VI — exclusions from the monthly load cap",
    intro: "Not a category upgrade and not a fourth band. Fully licensed EMIs with a proven commercial track record may apply to SBP. Applies only to biometrically verified adult wallets — never to minors."
  },

  connections: [
    { from: "Spine", happen: "BV success, screen clear, not high risk", go: "J1 → cooling-off → active", path: "j1" },
    { from: "Spine", happen: "BV not possible for a listed reason", go: "J2", path: "j2" },
    { from: "J1 or J2", happen: "Screen hit", go: "J5 (can also fire before BV)", path: "j5" },
    { from: "Spine", happen: "CRP high", go: "J6 (blocks activation until EDD is done)", path: "j6" },
    { from: "J2 incomplete", happen: "Verisys ok, pairing/OTP fail", go: "J3 debit block", path: "j3" },
    { from: "J3", happen: "Customer completes BV or full J2", go: "Lift block; limits follow new strength", path: "j3" },
    { from: "J3", happen: "Never verified", go: "Close + consider STR → J8 / J16", path: "j8" },
    { from: "J1–J3 fail", happen: "No branch of our own", go: "J4 video / partner or J8", path: "j4" },
    { from: "Any in-progress", happen: "Customer leaves", go: "J7 resume (≤30 days)", path: "j7" },
    { from: "Any terminal no", happen: "Need written reason", go: "J8", path: "j8" },
    { from: "Active customer", happen: "New phone", go: "J9", path: "j9" },
    { from: "Active customer", happen: "List or TMS hit", go: "J10", path: "j10" },
    { from: "Any provider call", happen: "Timeout / stub", go: "J11 — never auto-approve", path: "j11" },
    { from: "CNIC captured", happen: "Active wallet exists", go: "J12", path: "j12" },
    { from: "Active customer", happen: "Wants a higher limit band", go: "J13 (re-verify category)", path: "j13" },
    { from: "Active customer", happen: "Changes mobile, email or password", go: "J14", path: "j14" },
    { from: "Guardian wallet", happen: "Opens a wallet for a child", go: "J15", path: "j15" },
    { from: "Active / blocked / hold", happen: "Close or redeem remaining e-money", go: "J16", path: "j16" },
    { from: "Active customer", happen: "CNIC expired or particulars changed", go: "J17", path: "j17" },
    { from: "Active customer", happen: "Cash-in at agent/ATM/branch, or cash-out", go: "J19 (BV at till · 2FA at ATM)", path: "j19" },
    { from: "National data", happen: "ID is NICOP / POC / ARC / POR / NRP", go: "J18 then the same gates", path: "j18" }
  ],

  entry: {
    j1: { node: "open", at: "Customer opens the app", trigger: "First-time digital onboarding. The navy spine is this journey." },
    j2: { node: "bv", at: "NADRA biometric step", trigger: "BV is not possible for a listed genuine reason — the ladder falls to Verisys." },
    j3: { node: "j2", at: "J2 Verisys fallback", trigger: "Verisys succeeded but pairing/OTP did not. Debit-blocked open." },
    j4: { node: "j2", at: "J2 / J3 exhausted", trigger: "Remote rungs a–c failed. Last resort: video KYC, partner bank, or decline." },
    j5: { node: "prescreen", at: "Pre-screen UNSC + ATA 1997", trigger: "A hit (applicant or associated person) before any wallet is issued." },
    j6: { node: "crp", at: "Customer risk profile", trigger: "CRP rates the applicant high. EDD blocks activation." },
    j7: { node: "tracking", at: "Tracking ID issued", trigger: "Customer leaves an unfinished application and comes back within 30 days." },
    j8: { node: "j8", at: "Any terminal ‘no’", trigger: "This is an arrival point, not a start. You reach it from J4, J5, J6, J11, J12, J13, J15 or J16." },
    j9: { node: "active", at: "WALLET_ACTIVE", trigger: "Existing customer opens the app on a phone that is not yet bound." },
    j10: { node: "active", at: "WALLET_ACTIVE", trigger: "Existing wallet: list refresh, periodic re-screen, or a TMS rule fire." },
    j11: { node: "prescreen", at: "Any provider call", trigger: "NADRA, lists, OTP or pairing time out or are in stub mode — fail closed." },
    j12: { node: "dup", at: "One CNIC, one wallet?", trigger: "CNIC is known and an active instrument already exists with this EMI." },
    j13: { node: "active", at: "WALLET_ACTIVE", trigger: "Existing customer requests a higher limit band, or later completes BV." },
    j14: { node: "active", at: "WALLET_ACTIVE", trigger: "Existing customer changes mobile, email or password from a registered device." },
    j15: { node: "active", at: "WALLET_ACTIVE (guardian)", trigger: "Already-onboarded parent opens a child wallet inside their own app — not a child’s J1." },
    j16: { node: "active", at: "WALLET_ACTIVE", trigger: "Customer asks to close, or compliance closes an unverified / TFS instrument." },
    j17: { node: "active", at: "WALLET_ACTIVE", trigger: "CNIC expired, NADRA particulars changed, or periodic CDD is due." },
    j18: { node: "collect", at: "National data + live ID", trigger: "ID type is NICOP, POC, ARC, POR, or NRP — not a resident CNIC." },
    j19: { node: "active", at: "WALLET_ACTIVE", trigger: "Existing customer presents cash at an agent, ATM, EMI branch or bank branch — not IBFT, and not closure." }
  },

  glossary: [
    { re: "BPRD\\s+Circular\\s+04(?:\\s+of\\s+2023)?", term: "BPRD Circular 04", full: "SBP BPRD Circular No. 04 of 2023", hint: "Bank circular on digital onboarding: device binding, OTP, cooling-off, and contact change. Pulled into EMI onboarding by CCOF K." },
    { re: "BPRD\\s*0?4", term: "BPRD 04", full: "SBP BPRD Circular No. 04 of 2023", hint: "Device binding, short-code OTP, two-hour cooling-off, and NADRA BV for mobile/email change." },
    { re: "BPRD\\s*2026", term: "BPRD 2026", full: "SBP BPRD circulars issued in 2026", hint: "Cited here for the teenager/majority-conversion overlay on a parent-linked minor wallet — not the 2023 device-binding circular." },
    { re: "CNIC[–\\-/]MSISDN", term: "CNIC–MSISDN", full: "CNIC paired with the mobile number (MSISDN)", hint: "NADRA/PTA check that this SIM is registered to this identity. Required on Verisys onboarding and on a mobile-number change." },
    { re: "CNIC\\/SIM", term: "CNIC/SIM", full: "CNIC paired with the SIM", hint: "Same pairing check: the mobile SIM must belong to this identity card holder." },
    { re: "AML\\/CFT", term: "AML/CFT", full: "Anti-Money Laundering / Combating the Financing of Terrorism", hint: "Pakistan’s AML/CFT regime (and SBP’s AML/CFT regulations) sits beside EMI and CCOF — CDD, EDD, screening, STR, and TFS." },
    { re: "FATCA\\/CRS", term: "FATCA/CRS", full: "FATCA and the Common Reporting Standard", hint: "US FATCA plus OECD CRS tax-residency reporting. Captured in CCOF Table-A; not a KYC substitute." },
    { re: "STR\\/CTR", term: "STR/CTR", full: "Suspicious Transaction Report / Currency Transaction Report", hint: "STR is suspicion-based (any amount). CTR is a threshold cash report. Neither is filed by outsourced staff." },
    { re: "TFS\\/STR", term: "TFS/STR", full: "Targeted Financial Sanctions and Suspicious Transaction Report", hint: "A true list match is TFS (freeze/do not serve). STR is the report to FMU. The customer must not be tipped off." },
    { re: "SMS\\/OTP", term: "SMS/OTP", full: "SMS one-time password", hint: "OTP delivered by text from the institution’s short code — not a random SMS sender." },
    { re: "OTP\\/2FA", term: "OTP/2FA", full: "One-time password / two-factor authentication", hint: "The second factor on mobile bind and later high-risk actions." },
    { re: "NADRA\\s+BV", term: "NADRA BV", full: "NADRA Biometric Verification", hint: "Finger, iris, or facial match through NADRA — the primary remote KYC rung. Not a local selfie check." },
    { re: "PSP&OD", term: "PSP&OD", full: "SBP Payment Systems Policy & Oversight Department", hint: "The SBP unit whose permission is needed for the enhanced (PKR 1,000,000) e-money wallet band." },
    { re: "Table-A", term: "Table-A", full: "CCOF Table-A", hint: "Mandatory national-information fields for digital onboarding, including two particulars not printed on the CNIC face." },
    { re: "Annexure-J", term: "Annexure-J", full: "EMI Regulations Annexure-J", hint: "Indicative source-of-funds list for the enhanced PKR 1,000,000 band: salary slip, tax return, account statement, or listed alternates (inheritance, rent, agriculture). Any one item suffices. Not outsourced." },
    { re: "B-Form", term: "B-Form", full: "NADRA B-Form (child registration certificate)", hint: "Identity evidence for a minor who does not yet hold a CNIC." },
    { re: "Verisys", term: "Verisys", full: "NADRA Verisys", hint: "Demographic verification of CNIC particulars — weaker than biometric. Wallet, if opened, sits at the Verisys limit band." },
    { re: "NICOP", term: "NICOP", full: "National Identity Card for Overseas Pakistanis", hint: "Digital-onboarding ID class (CCOF C.5). Same spine as CNIC, with residency extras (J18)." },
    { re: "MSISDN", term: "MSISDN", full: "Mobile Station International Subscriber Directory Number", hint: "The full international mobile number used in SIM–CNIC pairing." },
    { re: "NADRA", term: "NADRA", full: "National Database and Registration Authority", hint: "Pakistan’s identity authority. Issues CNIC/NICOP and runs biometric verification and Verisys. The app never talks to NADRA directly." },
    { re: "UNSC", term: "UNSC", full: "United Nations Security Council", hint: "Designated-person lists used in pre-screening and ongoing TFS. Store the list version with the result." },
    { re: "CNICs?", term: "CNIC", full: "Computerized National Identity Card", hint: "Resident Pakistan ID. One active e-money instrument per CNIC per EMI (EMI 12.VII)." },
    { re: "MFBs?", term: "MFB", full: "Microfinance Bank", hint: "BPRD 04 was addressed to banks and MFBs; CCOF K applies those device-binding rules to EMI digital onboarding." },
    { re: "PEPs?", term: "PEP", full: "Politically Exposed Person", hint: "AML EDD category — not a marketing flag. Appetite is a board/compliance decision." },
    { re: "IBAN", term: "IBAN", full: "International Bank Account Number", hint: "A bank deposit identifier. An EMI wallet number is a claim on safeguarded e-money, not an IBAN." },
    { re: "IBFT", term: "IBFT", full: "Inter Bank Fund Transfer", hint: "Pakistan’s account-to-account rail. EMI 15.II.a allows IBFT funding without agent BV; cash-in at a till is J19 and still needs BV. Burst IBFT after a device or password change is a fraud scenario (J10)." },
    { re: "IMEI", term: "IMEI", full: "International Mobile Equipment Identity", hint: "Handset serial that may be used as a device-bind key. Privacy trade-off vs UUID/ICCID is an open question." },
    { re: "IMSI", term: "IMSI", full: "International Mobile Subscriber Identity", hint: "SIM subscriber identity; one of the device-fingerprint candidates." },
    { re: "ICCID", term: "ICCID", full: "Integrated Circuit Card Identifier", hint: "The SIM card’s serial number; one of the device-fingerprint candidates." },
    { re: "UUID", term: "UUID", full: "Universally Unique Identifier", hint: "App-generated device id. Weaker than hardware identifiers if the app is reinstalled." },
    { re: "FTDH", term: "FTDH", full: "Fraud, Theft, Dacoity and Hijacking", hint: "SBP operational-incident reporting. Those clocks are not the AML STR clock." },
    { re: "FATCA", term: "FATCA", full: "Foreign Account Tax Compliance Act", hint: "US tax-residency reporting collected at onboarding (Table-A)." },
    { re: "MLRO", term: "MLRO", full: "Money Laundering Reporting Officer", hint: "The named officer who owns STR/TFS decisions. Not the relationship manager acting alone." },
    { re: "CCOF", term: "CCOF", full: "Customer Onboarding Framework (SBP, 2025)", hint: "Digital-onboarding circular. Cited by section: F (verification ladder), K (BPRD 04), I (notices), Table-A (fields)." },
    { re: "BPRD", term: "BPRD", full: "Banking Policy & Regulations Department", hint: "The SBP department that issues bank/DFI circulars, including Circular 04 of 2023." },
    { re: "KYC", term: "KYC", full: "Know Your Customer", hint: "The overall identity-and-due-diligence process. Not a single Boolean flag — verification strength drives limits." },
    { re: "AML", term: "AML", full: "Anti-Money Laundering", hint: "Requires CDD/EDD, ongoing monitoring, and STR where suspicion exists. Incomplete CDD → do not activate." },
    { re: "CFT", term: "CFT", full: "Combating the Financing of Terrorism", hint: "Paired with AML. Feeds TFS screening and STR/FMU reporting." },
    { re: "EDD", term: "EDD", full: "Enhanced Due Diligence", hint: "Extra information (and often video KYC) for high-risk customers. Additional to CDD, never instead of BV/screening." },
    { re: "CDD", term: "CDD", full: "Customer Due Diligence", hint: "Identity, verification, purpose, and risk information that must be complete before a wallet is active." },
    { re: "CRP", term: "CRP", full: "Customer Risk Profile", hint: "The rating model (occupation, geography, PEP, product, channel). High risk is J6 and blocks activation." },
    { re: "TFS", term: "TFS", full: "Targeted Financial Sanctions", hint: "UNSC/ATA list obligations: do not provide services, freeze where required, do not tip off." },
    { re: "STR", term: "STR", full: "Suspicious Transaction Report", hint: "Filed to Pakistan’s FMU when suspicion exists, including attempted transactions. Never mentioned to the customer." },
    { re: "CTR", term: "CTR", full: "Currency Transaction Report", hint: "Threshold-based cash report, distinct from suspicion-based STR." },
    { re: "TMS", term: "TMS", full: "Transaction Monitoring System", hint: "Rules and scenarios after the wallet exists (J10). Enhanced-band TMS must stay in-house, not outsourced." },
    { re: "OTP", term: "OTP", full: "One-Time Password", hint: "Must come from the institution’s own short code (auto-fetch / sender binding), not a spoofable SMS." },
    { re: "2FA", term: "2FA", full: "Two-Factor Authentication", hint: "Something the customer has (device/OTP) plus something they know. Required on bind, ATM cash-out, and IBFT redemption." },
    { re: "SBP", term: "SBP", full: "State Bank of Pakistan", hint: "The regulator. EMI Regulations, CCOF, AML/CFT, and BPRD circulars all come from here. sbp.org.pk prevails." },
    { re: "EMI", term: "EMI", full: "Electronic Money Institution", hint: "SBP-licensed e-money issuer (Regulations 2023). This product is a wallet, not a bank deposit. Numbered cites are those regulations." },
    { re: "PKR", term: "PKR", full: "Pakistani Rupee", hint: "Wallet limits are monthly load in PKR, set by verification strength and EMI paragraph 14." },
    { re: "TAT", term: "TAT", full: "Turnaround Time", hint: "Decide within 2 working days of complete documents, and send discrepancy notices inside that clock (CCOF I)." },
    { re: "BV", term: "BV", full: "Biometric Verification", hint: "NADRA finger, iris, or facial match. Primary remote method (ladder rung a). Re-run on limit upgrade and contact change." },
    { re: "SIM", term: "SIM", full: "Subscriber Identity Module", hint: "The mobile chip. SIM-swap is a first-class fraud path — a new number is J14, not a profile edit." },
    { re: "SMS", term: "SMS", full: "Short Message Service", hint: "Used for tracking ID, OTP, and cooling-off alerts. Credential-change notices go to the old number until the timer ends." },
    { re: "PTA", term: "PTA", full: "Pakistan Telecommunication Authority", hint: "Source of SIM–CNIC pairing. Devices used across too many CNICs may be reported here." },
    { re: "FMU", term: "FMU", full: "Financial Monitoring Unit", hint: "Pakistan’s financial-intelligence unit. STRs are filed here, not discussed with the customer." },
    { re: "ATA", term: "ATA", full: "Anti-Terrorism Act, 1997", hint: "Domestic proscribed-person lists, screened alongside UNSC designations." },
    { re: "POC", term: "POC", full: "Pakistan Origin Card", hint: "Digital-onboarding ID class (CCOF C.5). Abroad, Verisys may be used until NADRA BV exists for that population." },
    { re: "ARC", term: "ARC", full: "Afghan Citizen Card", hint: "Digital-onboarding ID class (CCOF C.5). AML/CFT still applies; do not validate it as if it were a CNIC." },
    { re: "POR", term: "POR", full: "Proof of Registration", hint: "Afghan-refugee registration document. Eligible for digital onboarding under CCOF C.5; field rules differ from CNIC." },
    { re: "NRP", term: "NRP", full: "Non-Resident Pakistani", hint: "May use Verisys until NADRA BV is operational for that class (CCOF F.1.iv.b). Not a Roshan Digital Account." },
    { re: "RDA", term: "RDA", full: "Roshan Digital Account", hint: "A bank product for non-residents. An EMI wallet is not RDA and not a foreign-currency account." },
    { re: "P2P", term: "P2P", full: "Person-to-Person transfer", hint: "Wallet-to-wallet send. Blocked on a debit-blocked instrument (J3)." },
    { re: "PRI", term: "PRI", full: "Pakistan Remittance Initiative", hint: "Home-remittance channel via authorised dealers. EMI 14.VI may exclude inward remittances up to PKR 1,500,000 from the load cap after SBP permission." },
    { re: "ATM", term: "ATM", full: "Automated Teller Machine", hint: "Cash-out channel. EMI 14.II.d requires 2FA at ATM. Cash-in at ATM is J19 and needs NADRA BV." },
    { re: "BVS", term: "BVS", full: "Biometric Verification System", hint: "Agent/ATM biometric kit. If BV is a genuine constraint, 2FA may be the cash-out fallback." },
    { re: "SLA", term: "SLA", full: "Service Level Agreement", hint: "Internal clock (list refresh, discrepancy notice). Does not pause legal TAT." },
    { re: "CRS", term: "CRS", full: "Common Reporting Standard", hint: "OECD automatic exchange of tax information. Collected with FATCA fields in Table-A." },
    { re: "QA", term: "QA", full: "Quality Assurance", hint: "Later test packs follow these named arrows — not random screens." }
  ]
};

(function buildGraph(K) {
  const W = 252;
  const H = 64;
  const n = (id, x, y, kind, title, sub, extra) => Object.assign({
    id, x, y, w: W, h: H, kind, title, sub: sub || ""
  }, extra || {});

  const nodes = [
    n("open", 148, 56, "start", "Customer opens the app", "Do not reveal if a wallet exists"),
    n("mobile", 148, 150, "spine", "Mobile + 2FA + device bind", "OTP from institution short code"),
    n("consent", 148, 244, "spine", "Terms, charges, consent", "EMI 12.VI · 30-day save notice"),
    n("tracking", 148, 338, "spine", "Tracking ID issued", "APPLICATION_STARTED"),
    n("j7", 456, 338, "journey", "J7  Save & resume", "Same ID for up to 30 days", { w: 248, color: "#0ea5e9", journey: "j7" }),
    n("collect", 148, 432, "spine", "National data + live ID", "Table-A ∪ EMI 12.I · not on device"),
    n("j18", 456, 432, "journey", "J18  NICOP / POC / ARC / POR", "Same spine · extra residency rules", { color: "#1d4ed8", journey: "j18", h: 70 }),
    n("geoip", 148, 526, "spine", "Geo-location and IP", "CCOF F.3 · device fingerprint"),

    n("dup", 148, 638, "decision", "One CNIC, one wallet?", "EMI 12.VII · no enumeration"),
    n("j12", 456, 622, "journey", "J12  Duplicate CNIC", "Do not open wallet #2", { color: "#4338ca", journey: "j12", h: 70 }),
    n("login", 764, 622, "terminal", "Login / recovery / J9", "Generic result if unauthenticated", { kind: "terminal", extra: "life", h: 70 }),

    n("prescreen", 148, 760, "decision", "Pre-screen UNSC + ATA 1997", "Fail closed if lists unavailable"),
    n("j5", 456, 732, "journey", "J5  Sanctions / proscribed", "Hard stop · no tipping-off", { color: "#b91c1c", journey: "j5", h: 72 }),
    n("fp", 764, 718, "spine", "False positive cleared", "Return to spine · still finish KYC", { w: 248, h: 58 }),
    n("j11", 764, 800, "journey", "J11  Provider timeout", "PENDING · never auto-approve", { color: "#ea580c", journey: "j11", h: 70 }),

    n("crp", 148, 890, "decision", "Customer risk profile", "Low / medium, or high → EDD"),
    n("j6", 456, 882, "journey", "J6  High-risk EDD", "Extra evidence · blocks activation", { color: "#b0892e", journey: "j6", h: 72 }),

    n("bv", 148, 1048, "decision", "Attempt NADRA biometric", "Primary remote verification"),
    n("j1", 148, 1174, "journey", "J1  Clean biometric path", "BV_PASSED · biometric limit band", { color: "#059669", journey: "j1", h: 70 }),
    n("j2", 456, 1174, "journey", "J2  Verisys fallback", "Verisys + pairing + OTP/call-back", { color: "#1b6b93", journey: "j2", h: 70 }),
    n("j11b", 764, 1048, "journey", "J11  NADRA / OTP down", "VERIFICATION_PENDING", { color: "#ea580c", journey: "j11", h: 64 }),
    n("j3", 456, 1294, "journey", "J3  Debit-blocked open", "Verisys ok · cannot spend", { color: "#d97706", journey: "j3", h: 70 }),
    n("j4", 764, 1294, "journey", "J4  Video KYC / partner", "Last remote rung, or decline", { color: "#7c3aed", journey: "j4", h: 70 }),

    n("gate", 148, 1458, "gate", "Activation gate", "Verify + pre-screen + CDD + EDD if high", { w: 268, h: 70 }),
    n("debit", 456, 1458, "terminal", "DEBIT_BLOCKED", "Not a spending wallet", { extra: "warn", h: 70 }),
    n("cooling", 148, 1568, "spine", "2-hour cooling-off", "BPRD 04 A.viii · app not yet live"),
    n("active", 148, 1668, "terminal", "WALLET_ACTIVE", "E-money issued · limits follow strength", { extra: "ok", w: 268, h: 72 }),
    n("j19", 456, 1668, "journey", "J19  Cash-in / cash-out", "BV at till · 2FA at ATM", { color: "#9a3412", journey: "j19", h: 72 }),

    n("j9", 148, 1810, "journey", "J9  New device", "BV · notify · 2-hour cooling-off", { color: "#0891b2", journey: "j9", h: 70 }),
    n("j10", 456, 1810, "journey", "J10  Ongoing screening", "List update or TMS hit", { color: "#be185d", journey: "j10", h: 70 }),
    n("hold", 764, 1810, "terminal", "MONITORING_HOLD", "Restrict · investigate · no tipping-off", { extra: "warn", h: 70 }),

    n("j13", 148, 1940, "journey", "J13  Limit / category upgrade", "Re-verify · re-screen · cooling-off", { color: "#0f766e", journey: "j13", h: 70 }),
    n("j14", 456, 1940, "journey", "J14  Mobile / email / password", "BV · old channels notified", { color: "#0369a1", journey: "j14", h: 70 }),
    n("j16", 764, 1940, "journey", "J16  Close / redeem", "Par value · BV for cash", { color: "#57534e", journey: "j16", h: 70 }),
    n("closed", 1096, 1940, "terminal", "WALLET_CLOSED", "CNIC-release per policy", { extra: "bad", w: 236, h: 70 }),

    n("j17", 148, 2088, "journey", "J17  Periodic CDD / expired CNIC", "Refresh data · not a TMS hit", { color: "#c2410c", journey: "j17", h: 70 }),
    n("j15", 456, 2088, "journey", "J15  Parent-linked minor", "Inside guardian’s app only", { color: "#a21caf", journey: "j15", h: 70 }),
    n("minor", 764, 2088, "terminal", "MINOR_WALLET_ACTIVE", "Linked · own limit band", { extra: "life", h: 70 }),

    n("j8", 1096, 732, "terminal", "J8  Decline / close", "Written reason · tracking ID kept", { extra: "bad", w: 236, h: 220, journey: "j8" })
  ];

  const e = (id, from, to, label, cls, exit, enter) => ({
    id, from, to, label: label || "", cls: cls || "", exit: exit || "bottom", enter: enter || "top"
  });

  const edges = [
    e("e1", "open", "mobile"),
    e("e2", "mobile", "consent"),
    e("e3", "consent", "tracking"),
    e("e4", "tracking", "collect"),
    e("e5", "collect", "geoip"),
    e("e6", "geoip", "dup"),
    e("e7", "tracking", "j7", "Starts here · leaves / pauses", "dash", "right", "left"),
    e("e8", "j7", "collect", "Resume ≤ 30 days", "dash ok", "left", "right"),
    e("e61", "collect", "j18", "Starts here · not resident CNIC", "dash", "right", "left"),
    e("e62", "j18", "geoip", "Then same spine", "dash ok", "bottom", "right"),
    e("e63", "j18", "j8", "ID class not digital", "bad", "right", "left"),

    e("e9", "dup", "prescreen", "No", "ok"),
    e("e10", "dup", "j12", "Starts here · already held", "bad", "right", "left"),
    e("e11", "j12", "login", "Same person, authenticated", "ok", "right", "left"),
    e("e12", "j12", "j8", "Reject second instrument", "bad", "right", "left"),

    e("e13", "prescreen", "crp", "Clear", "ok"),
    e("e14", "prescreen", "j5", "Starts here · hit", "bad", "right", "left"),
    e("e15", "prescreen", "j11", "Starts here · lists down", "warn", "right", "left"),
    e("e16", "j5", "fp", "False positive", "ok", "right", "left"),
    e("e17", "fp", "crp", "Back to spine", "ok dash", "bottom", "right"),
    e("e18", "j5", "j8", "True match / TFS", "bad", "right", "left"),
    e("e19", "j11", "j8", "CDD never completes", "bad", "right", "left"),

    e("e20", "crp", "bv", "Low / medium", "ok"),
    e("e21", "crp", "j6", "Starts here · high risk", "warn", "right", "left"),
    e("e22", "j6", "bv", "EDD in parallel", "dash", "bottom", "right"),
    e("e23", "j6", "j8", "EDD failed / refused", "bad", "right", "left"),

    e("e24", "bv", "j1", "BV passed", "ok"),
    e("e25", "bv", "j2", "Starts here · BV not possible", "", "right", "left"),
    e("e26", "bv", "j11b", "Timeout / stub", "warn", "right", "left"),
    e("e27", "j11b", "j11", "Fail closed", "warn dash", "top", "bottom"),

    e("e28", "j1", "gate", "CDD complete", "ok"),
    e("e29", "j2", "gate", "Full J2 success", "ok", "left", "right"),
    e("e30", "j2", "j3", "Verisys ok, pairing/OTP fail", "warn"),
    e("e31", "j2", "j4", "Verisys also failed", "bad", "right", "left"),
    e("e32", "j3", "debit", "Restricted open", "warn"),
    e("e33", "j3", "j4", "Still not usable", "", "right", "left"),
    e("e34", "debit", "gate", "Later completes a or b", "ok", "left", "right"),
    e("e35", "debit", "j8", "Never verified · close + STR", "bad", "right", "left"),
    e("e36", "j4", "gate", "Video / partner OK", "ok", "left", "right"),
    e("e37", "j4", "j8", "Still incomplete", "bad", "right", "left"),
    e("e38", "j6", "gate", "EDD approved", "ok dash", "left", "right"),

    e("e39", "gate", "cooling", "Accept", "ok"),
    e("e40", "cooling", "active", "Timer ends · issue number", "ok"),
    e("e67", "active", "j19", "Starts here · cash in / cash out", "dash", "right", "left"),
    e("e68", "j19", "j10", "TMS / mule pattern", "warn"),

    e("e41", "active", "j9", "Starts here · new phone", "dash"),
    e("e66", "j9", "cooling", "New device waits 2 hours", "ok dash", "left", "left"),
    e("e42", "active", "j10", "Starts here · list / TMS", "dash", "right", "left"),
    e("e43", "j10", "hold", "Hit / rule fire", "warn", "right", "left"),
    e("e44", "hold", "active", "Cleared — resume", "ok dash", "left", "right"),
    e("e45", "hold", "j8", "Confirmed TFS / exit", "bad", "rail", "right"),

    e("e46", "active", "j13", "Starts here · higher limits", "dash", "left", "left"),
    e("e47", "j13", "cooling", "New band waits 2 hours", "ok dash", "right", "right"),
    e("e48", "j13", "j8", "Upgrade CDD fails", "bad", "rail", "right"),
    e("e49", "active", "j14", "Starts here · SIM / email / password", "dash", "gutter", "left"),
    e("e50", "j14", "j10", "Fraud pattern", "warn", "top", "bottom"),
    e("e51", "j14", "cooling", "Change waits 2 hours", "ok dash", "left", "right"),
    e("e52", "active", "j16", "Starts here · close / redeem", "dash", "gutter", "left"),
    e("e53", "j16", "closed", "Redeemed at par", "ok", "right", "left"),
    e("e54", "debit", "j16", "Never verified → close", "bad dash", "right", "top"),
    e("e55", "hold", "j16", "TFS / exit close", "bad dash", "bottom", "top"),
    e("e56", "active", "j17", "Starts here · refresh CDD", "dash", "left", "left"),
    e("e57", "j17", "j10", "Refresh screen hits", "warn", "right", "bottom"),
    e("e58", "j17", "j13", "Also a band change", "dash", "right", "left"),
    e("e59", "active", "j15", "Starts here · guardian’s app", "dash", "gutter", "left"),
    e("e60", "j15", "minor", "Linked minor issued", "ok", "right", "left"),
    e("e64", "j15", "j8", "Guardian or child CDD fails", "bad", "rail", "right"),
    e("e65", "j13", "j6", "Upgrade CRP high", "warn dash", "right", "bottom")
  ];

  const bands = [
    { y: 24, h: 568, title: "1  ·  Capture" },
    { y: 604, h: 368, title: "2  ·  Eligibility gates" },
    { y: 988, h: 400, title: "3  ·  Verification ladder" },
    { y: 1404, h: 348, title: "4  ·  Decide and activate" },
    { y: 1768, h: 268, title: "5  ·  After the wallet exists" },
    { y: 2052, h: 160, title: "6  ·  Linked customers and CDD refresh" }
  ];

  const spine = ["open", "mobile", "consent", "tracking", "collect", "geoip", "dup", "prescreen", "crp", "bv"];
  const after = ["gate", "cooling", "active"];

  K.graph = { nodes, edges, bands, size: { w: 1380, h: 2240 } };
  K.paths = {
    all: { nodes: nodes.map((x) => x.id), edges: edges.map((x) => x.id) },
    j1: { nodes: [...spine, "j1", ...after], edges: ["e1", "e2", "e3", "e4", "e5", "e6", "e9", "e13", "e20", "e24", "e28", "e39", "e40"] },
    j2: { nodes: [...spine, "j2", ...after], edges: ["e1", "e2", "e3", "e4", "e5", "e6", "e9", "e13", "e20", "e25", "e29", "e39", "e40"] },
    j3: { nodes: [...spine, "j2", "j3", "debit", "gate", "cooling", "active", "j8"], edges: ["e1", "e2", "e3", "e4", "e5", "e6", "e9", "e13", "e20", "e25", "e30", "e32", "e34", "e35", "e39", "e40"] },
    j4: { nodes: [...spine, "j2", "j3", "j4", "gate", "cooling", "active", "j8"], edges: ["e1", "e2", "e3", "e4", "e5", "e6", "e9", "e13", "e20", "e25", "e31", "e33", "e36", "e37", "e39", "e40"] },
    j5: { nodes: ["open", "mobile", "consent", "tracking", "collect", "geoip", "dup", "prescreen", "j5", "fp", "crp", "j8"], edges: ["e1", "e2", "e3", "e4", "e5", "e6", "e9", "e14", "e16", "e17", "e18"] },
    j6: { nodes: [...spine, "j6", "bv", "j1", "gate", "cooling", "active", "j8"], edges: ["e1", "e2", "e3", "e4", "e5", "e6", "e9", "e13", "e21", "e22", "e23", "e38", "e24", "e28", "e39", "e40"] },
    j7: { nodes: ["open", "mobile", "consent", "tracking", "j7", "collect"], edges: ["e1", "e2", "e3", "e7", "e8"] },
    j8: { nodes: ["j8", "j5", "j6", "j4", "debit", "j11", "j12", "hold"], edges: ["e18", "e23", "e37", "e35", "e19", "e12", "e45"] },
    j9: { nodes: ["active", "j9", "cooling"], edges: ["e41", "e66"] },
    j10: { nodes: ["active", "j10", "hold"], edges: ["e42", "e43", "e44"] },
    j11: { nodes: ["prescreen", "j11", "j11b", "bv"], edges: ["e15", "e26", "e27"] },
    j12: { nodes: ["collect", "geoip", "dup", "j12", "login"], edges: ["e5", "e6", "e10", "e11"] },
    j13: { nodes: ["active", "j13", "cooling"], edges: ["e46", "e47"] },
    j14: { nodes: ["active", "j14", "cooling"], edges: ["e49", "e51"] },
    j15: { nodes: ["active", "j15", "minor"], edges: ["e59", "e60"] },
    j16: { nodes: ["active", "j16", "closed"], edges: ["e52", "e53"] },
    j17: { nodes: ["active", "j17"], edges: ["e56"] },
    j18: { nodes: ["open", "mobile", "consent", "tracking", "collect", "j18", "geoip"], edges: ["e1", "e2", "e3", "e4", "e61", "e62"] },
    j19: { nodes: ["active", "j19"], edges: ["e67"] }
  };

  K.nodeCopy = {
    open: { kicker: "Spine", title: "Open the app", text: "The customer installs or opens the mobile app. Product explanation in English and Urdu is encouraged. The app must not reveal whether a wallet already exists (BPRD 04 A.ix). This product is an EMI e-money wallet, not a digital-bank deposit account." },
    mobile: { kicker: "Spine", title: "Mobile, 2FA, device", text: "Capture mobile number, complete 2FA, register a device fingerprint (Device ID / UUID / ICCID / IMEI / IMSI as policy selects). OTP should auto-fetch from the institution short code." },
    consent: { kicker: "Spine", title: "Consent", text: "Present terms, charges, privacy and KYC notices. Capture acknowledgement (EMI 12.VI). Tell the customer the session can be saved for 30 days." },
    tracking: { kicker: "APPLICATION_STARTED", title: "Tracking ID", text: "Generate a tracking ID when onboarding starts and notify the customer (CCOF I). This is not a wallet number. The session is resumable for 30 days (J7)." },
    collect: { kicker: "EVIDENCE_COLLECTED", title: "National information", text: "Union of CCOF Table-A and EMI 12.I: identity, ID type and number, two fields not printed on the CNIC face, live original ID image, live digital photo, addresses, mobile, tax/purpose, associated persons if any. Transfer encrypted in real time. Nothing remains on the phone (CCOF K.iv). Non-CNIC IDs branch to J18." },
    geoip: { kicker: "Spine", title: "Channel evidence", text: "Record geo-location and IP of the gadget used for digital onboarding (CCOF F.3), plus device fingerprint for binding (BPRD 04 via CCOF K)." },
    dup: { kicker: "Gate", title: "One CNIC, one wallet", text: "As soon as the ID is known, check uniqueness of the active instrument. User-visible behaviour must not confirm existence until the person is authenticated (J12). Closure (J16) is what may later free the ID." },
    prescreen: { kicker: "Gate", title: "Pre-relationship screening", text: "Screen the customer and any associated person against UNSC designated lists and ATA 1997 proscribed persons. EMI activates only after verification and pre-screening. Unavailable lists are J11, not a silent pass. This is screening moment 1 of 4." },
    crp: { kicker: "Gate", title: "Customer risk profile", text: "Build the risk rating from occupation, geography, PEP, expected turnover, product and channel. High risk becomes J6 and blocks activation until EDD is done. Re-rate on J13 upgrades and J17 refreshes." },
    bv: { kicker: "Ladder", title: "NADRA biometric", text: "Primary remote method. Success with clear screens and non-high risk is J1. Listed genuine impossibility is J2. Timeout is J11. Remaining failures walk J2 → J3 → J4. Re-used on J13, J14 and J19 cash-in / agent cash-out." },
    gate: { kicker: "Leadership rule", title: "Activation gate", text: "Wallet number is a late event. Required: verification strength + PRE_SCREEN_CLEAR + complete CDD + EDD approved if high risk. A tracking ID is not a wallet. A debit-blocked instrument is not a spending wallet. The number is a claim on safeguarded e-money, not a bank IBAN." },
    cooling: { kicker: "COOLING_OFF", title: "Two-hour cooling-off", text: "Before activating the app for newly registered customers, and before key changes (device, mobile, email, limits, password reset) — BPRD 04 A.viii, applied to EMI digital onboarding via CCOF K." },
    active: { kicker: "WALLET_ACTIVE", title: "Wallet issued", text: "Assign the wallet number, apply the matching limit band, notify the customer, list the bound device, and start ongoing monitoring (J10). Real-time transaction alerts from here (EMI 12.VIII). Lifecycle journeys J9, J13–J17 and J19 (cash-in / cash-out) start here. IBFT load is 15.II.a and does not wait for a till BV." },
    debit: { kicker: "DEBIT_BLOCKED", title: "Restricted instrument", text: "Credits may be constrained by policy. No debit, cash-out, P2P send, or merchant pay until BV or full J2. If credentials are never verified, close (J16) and consider STR." },
    login: { kicker: "J12 outcome", title: "Existing customer path", text: "Authenticated returning customer continues to the existing wallet or J9 device bind / recovery. Unauthenticated callers receive a generic result." },
    fp: { kicker: "J5 branch", title: "False positive", text: "Documented clearance with maker-checker. Return to the spine and still complete BV, CDD and remaining gates. Do not skip KYC because screening was painful." },
    hold: { kicker: "MONITORING_HOLD", title: "Restrict pending investigation", text: "Payments and wallets honour HOLD immediately. Fail closed on vendor timeout. Disposition is CLEAR, escalate, or exit + TFS + STR (then J16). Never tell the customer an STR was filed." },
    j11b: { kicker: "J11", title: "NADRA or OTP down", text: "Timeout, 5xx, empty list file, SMS gateway down, or explicit stub mode. Map to PENDING/UNAVAILABLE, never APPROVED." },
    closed: { kicker: "J16 outcome", title: "Wallet closed", text: "E-money redeemed at par. Records retained. CNIC-release is a policy flag, not a deleted row. A later application is a new tracking ID." },
    minor: { kicker: "J15 outcome", title: "Linked minor wallet", text: "Child instrument is tied to the guardian’s wallet, with its own EMI §14.IV/V band. Adult enhanced PKR 1,000,000 limits do not apply." }
  };
})(window.KYC);
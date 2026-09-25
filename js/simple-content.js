/**
 * Beginner-friendly overlays: plain English + simple visual flows.
 * Attached onto KYC_DATA after load.
 */
(function () {
  const D = window.KYC_DATA;
  if (!D) return;

  D.bigPictureFlow = [
    { label: "Open app", note: "Customer starts", kind: "start" },
    { label: "Prove phone", note: "OTP + bind device", kind: "process" },
    { label: "Fill identity", note: "CNIC + live photo", kind: "process" },
    { label: "Safety checks", note: "Duplicate? Sanctions? Risk?", kind: "decision" },
    { label: "Prove identity", note: "Fingerprint / Verisys ladder", kind: "process" },
    { label: "Wait 2 hours", note: "Cooling-off", kind: "pending" },
    { label: "Wallet ready", note: "Can use money", kind: "end" },
  ];

  D.spineFlow = [
    { label: "1 App", note: "Open wallet app", kind: "start" },
    { label: "2 Phone", note: "OTP + device", kind: "process" },
    { label: "3 Consent", note: "Accept terms", kind: "process" },
    { label: "4 Tracking ID", note: "Application number\n(not wallet yet)", kind: "db" },
    { label: "5 ID data", note: "CNIC + selfie", kind: "process" },
    { label: "6 Location", note: "GPS + IP", kind: "process" },
    { label: "7 Duplicate?", note: "Already a wallet?", kind: "decision" },
    { label: "8 Sanctions", note: "Banned person?", kind: "decision" },
    { label: "9 Risk score", note: "Low / Med / High", kind: "decision" },
    { label: "10 Biometric", note: "NADRA check", kind: "process" },
  ];

  D.ladderFlow = [
    { label: "A · Fingerprint", note: "Best option\n(try first)", kind: "end" },
    { label: "B · Verisys", note: "If fingerprint\nimpossible", kind: "process" },
    { label: "C · Debit block", note: "Opened but\ncannot spend", kind: "pending" },
    { label: "D · Video call", note: "Last remote\noption", kind: "decision" },
  ];

  D.activationFlow = [
    { label: "Identity proven", note: "BV or Verisys OK", kind: "process" },
    { label: "Sanctions clear", note: "Not on banned list", kind: "process" },
    { label: "Forms complete", note: "CDD done", kind: "process" },
    { label: "High risk OK?", note: "EDD approved\nif needed", kind: "decision" },
    { label: "2-hour wait", note: "Cooling-off", kind: "pending" },
    { label: "Wallet number", note: "Now you can pay", kind: "end" },
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

  /** Simple words + tiny flow for each journey */
  const beginner = {
    J1: {
      plain:
        "WALLET_ACTIVE at NADRA-biometric limits (commercial monthly load PKR 400,000). Wallet number only after BV + pre-screen + CDD. A resident CNIC holder completes first-device digital onboarding: biometric succeeds, screening is clear, risk is not high, cooling-off finishes, then an e-money wallet is issued. This is not a bank deposit — funds sit in a trustee bank; the wallet number is a claim on safeguarded e-money.",
      analogy:
        "Like getting a full driving licence after passing the normal test — strongest proof, highest limits. The licence number is only printed after every check and the waiting period.",
      flow: [
        { label: "Open app", note: "Do not reveal\nif wallet exists", kind: "start" },
        { label: "2FA + bind", note: "OTP short code", kind: "process" },
        { label: "Consent", note: "EMI 12.VI · 30-day save", kind: "process" },
        { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
        { label: "Live ID data", note: "Table-A ∪ EMI 12.I", kind: "process" },
        { label: "Geo + IP", note: "CCOF F.3", kind: "process" },
        { label: "One CNIC?", note: "EMI 12.VII", kind: "decision" },
        { label: "Pre-screen", note: "UNSC + ATA · clear", kind: "decision" },
        { label: "Risk profile", note: "Low / medium", kind: "decision" },
        { label: "NADRA BV", note: "Primary remote", kind: "process" },
        { label: "J1 path", note: "BV_PASSED · 400k band", kind: "end" },
        { label: "Activation gate", note: "BV + screen + CDD", kind: "process" },
        { label: "Cool 2 hours", note: "BPRD 04 A", kind: "pending" },
        { label: "WALLET_ACTIVE", note: "Issue number late", kind: "end" },
      ],
      flowStages: [
        {
          stage: "1",
          title: "Capture",
          steps: [
            { label: "Open app", note: "Do not reveal\nif wallet exists", kind: "start" },
            { label: "Mobile + 2FA", note: "OTP · device bind", kind: "process" },
            { label: "Terms & consent", note: "EMI 12.VI\n30-day save notice", kind: "process" },
            { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
            { label: "National + live ID", note: "Table-A ∪ EMI 12.I", kind: "process" },
            { label: "Geo + IP", note: "CCOF F.3\ndevice fingerprint", kind: "process" },
          ],
        },
        {
          stage: "2",
          title: "Eligibility gates",
          steps: [
            { label: "One CNIC?", note: "EMI 12.VII\nno duplication", kind: "decision" },
            { label: "Pre-screen", note: "UNSC + ATA 1997\nfail closed if down", kind: "decision" },
            { label: "Risk profile", note: "Low / medium\nvs high → EDD", kind: "decision" },
          ],
          branches: [
            { to: "J12", label: "Duplicate → J12" },
            { to: "J5", label: "Sanctions hit → J5" },
            { to: "J6", label: "High risk → J6" },
            { to: "J8", label: "Decline → J8" },
          ],
        },
        {
          stage: "3",
          title: "Verification ladder",
          steps: [
            { label: "Attempt NADRA BV", note: "Primary remote\nverification", kind: "process" },
            { label: "J1 clean path", note: "BV_PASSED\nbiometric limit band", kind: "end" },
          ],
          branches: [
            { to: "J11", label: "NADRA / OTP down → J11" },
            { to: "J2", label: "Verisys fallback → J2" },
            { to: "J3", label: "Debit-block open → J3" },
            { to: "J4", label: "Video / partner → J4" },
          ],
        },
        {
          stage: "4",
          title: "Decide and activate",
          steps: [
            { label: "Activation gate", note: "BV + pre-screen\n+ CDD + risk OK", kind: "process" },
            { label: "2-hour cool-off", note: "BPRD 04 A\napp not yet live", kind: "pending" },
            { label: "WALLET_ACTIVE", note: "Issue number\nPKR 400,000 band", kind: "end" },
          ],
          branches: [{ to: "J19", label: "Later cash-in / cash-out → J19" }],
        },
        {
          stage: "5",
          title: "After the wallet exists (not part of opening — lifecycle)",
          steps: [
            { label: "New device", note: "J9", kind: "process" },
            { label: "Ongoing screen", note: "J10", kind: "pending" },
            { label: "Limit upgrade", note: "J13", kind: "process" },
          ],
          branches: [
            { to: "J9", label: "J9 New device" },
            { to: "J10", label: "J10 Monitoring" },
            { to: "J13", label: "J13 Upgrade" },
          ],
        },
      ],
      remember: [
        "Navy spine: Capture → Eligibility gates → Verification ladder → Decide & activate.",
        "J1 is the highlighted BV_PASSED path on that spine — not a shortcut around gates.",
        "Wallet number is issued only after activation gate + 2-hour cooling-off.",
        "Open question: exact NADRA modality (finger vs facial) and commercial agreement still needs confirmation.",
      ],
    },
    J2: {
      plain:
        "If J2 fully succeeds: wallet at Verisys limits (monthly load PKR 50,000) unless a later BV upgrades the customer via J13. Reason for skipping BV is recorded in writing. NADRA BV is not possible for an SBP-listed reason (age over 60, permanent disability, unclear fingerprints, or NRP/POC abroad until BV exists). The remote ladder then requires Verisys + CNIC–MSISDN pairing + OTP or call-back, with live photo — not a convenience skip.",
      analogy:
        "You cannot take the fingerprint test for an allowed reason, so you take an alternate ID check — but you get a learner’s permit with lower limits, not the full licence. Upgrading later means taking the full test again (J13).",
      flow: [
        { label: "Open app", note: "Shared spine", kind: "start" },
        { label: "Capture…", note: "2FA · ID · geo", kind: "process" },
        { label: "Gates clear", note: "CNIC · screen · risk", kind: "decision" },
        { label: "NADRA BV?", note: "START · not possible", kind: "decision" },
        { label: "J2 Verisys", note: "Verisys + pairing\n+ OTP/call-back", kind: "process" },
        { label: "Activation gate", note: "Full J2 success", kind: "process" },
        { label: "Cool 2 hours", note: "BPRD 04 A.vii", kind: "pending" },
        { label: "WALLET_ACTIVE", note: "Verisys limit class", kind: "end" },
      ],
      flowStages: [
        {
          stage: "1",
          title: "Capture (shared navy spine — already done before J2)",
          steps: [
            { label: "Open app", note: "Do not reveal\nif wallet exists", kind: "start" },
            { label: "Mobile + 2FA", note: "OTP · device bind", kind: "process" },
            { label: "Terms & consent", note: "EMI 12.VI\n30-day save", kind: "process" },
            { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
            { label: "National + live ID", note: "Table-A ∪ EMI 12.I", kind: "process" },
            { label: "Geo + IP", note: "CCOF F.3\ndevice fingerprint", kind: "process" },
          ],
        },
        {
          stage: "2",
          title: "Eligibility gates (shared — must be clear before BV)",
          steps: [
            { label: "One CNIC?", note: "EMI 12.VII\nno enumeration", kind: "decision" },
            { label: "Pre-screen", note: "UNSC + ATA 1997\nfail closed if down", kind: "decision" },
            { label: "Risk profile", note: "Low / medium\n(high → J6 EDD)", kind: "decision" },
          ],
          branches: [
            { to: "J12", label: "Duplicate → J12" },
            { to: "J5", label: "Sanctions → J5" },
            { to: "J6", label: "High risk → J6" },
          ],
        },
        {
          stage: "3",
          title: "Verification ladder — J2 starts here (BV not possible)",
          steps: [
            { label: "Attempt NADRA BV", note: "Primary remote\nSTART", kind: "decision" },
            { label: "BV not possible", note: "Listed reason\nrecorded in writing", kind: "decision" },
            { label: "J2 Verisys fallback", note: "Verisys + pairing\n+ OTP/call-back", kind: "process" },
            { label: "Full J2 success", note: "VERISYS_PASSED\nrejoin spine", kind: "db" },
          ],
          branches: [
            { to: "J1", label: "BV passed instead → J1" },
            { to: "J3", label: "Pairing/OTP fail → J3" },
            { to: "J4", label: "Remote exhausted → J4" },
            { to: "J11", label: "Provider down → J11" },
          ],
        },
        {
          stage: "4",
          title: "Decide and activate (rejoin navy spine after Full J2 success)",
          steps: [
            { label: "Activation gate", note: "Verify + pre-screen\n+ CDD + risk OK", kind: "process" },
            { label: "2-hour cool-off", note: "BPRD 04 A.vii\napp not yet live", kind: "pending" },
            { label: "WALLET_ACTIVE", note: "Limits follow\nVerisys class", kind: "end" },
          ],
          branches: [
            { to: "J13", label: "Later BV upgrade → J13" },
            { to: "J19", label: "Cash-in still needs BV → J19" },
          ],
        },
      ],
      remember: [
        "On the map, J2 is a dashed branch off “Attempt NADRA biometric” — Capture + gates already ran.",
        "Label on the map: “Starts here — BV not possible” → J2 box → “Full J2 success” rejoins activation.",
        "VERISYS_PASSED only if Verisys + pairing + OTP/call-back all succeeded.",
        "Do not grant biometric-tier limits on a Verisys-only pack.",
        "Open question: who adjudicates “genuine reason”, and PTA/operator pairing source — NEEDS CONFIRMATION.",
      ],
    },
    J3: {
      plain:
        "Instrument exists with DEBIT_BLOCKED. No debit, cash-out, P2P, or merchant pay until BV or full J2. If never verified, close and consider STR. This is not WALLET_ACTIVE.",
      analogy:
        "Your file is opened at the office, but the cash drawer stays locked until you finish paperwork. Opening the drawer later is a new event — not rewriting the old stamp.",
      flow: [
        { label: "Open app", note: "Shared spine", kind: "start" },
        { label: "Capture…", note: "2FA · ID · geo", kind: "process" },
        { label: "Gates clear", note: "CNIC · screen · risk", kind: "decision" },
        { label: "NADRA BV?", note: "BV not possible", kind: "decision" },
        { label: "J2 Verisys", note: "Verisys OK", kind: "process" },
        { label: "Pairing/OTP fail", note: "→ J3 branch", kind: "decision" },
        { label: "Restricted open", note: "Not full activate", kind: "process" },
        { label: "DEBIT_BLOCKED", note: "Not spending wallet", kind: "pending" },
      ],
      flowStages: [
        {
          stage: "1",
          title: "Capture (shared navy spine)",
          steps: [
            { label: "Open app", note: "Do not reveal\nif wallet exists", kind: "start" },
            { label: "Mobile + 2FA", note: "OTP · device bind", kind: "process" },
            { label: "Terms & consent", note: "EMI 12.VI\n30-day save", kind: "process" },
            { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
            { label: "National + live ID", note: "Table-A ∪ EMI 12.I", kind: "process" },
            { label: "Geo + IP", note: "CCOF F.3\ndevice fingerprint", kind: "process" },
          ],
        },
        {
          stage: "2",
          title: "Eligibility gates (must be CLEAR before J3)",
          steps: [
            { label: "One CNIC?", note: "EMI 12.VII\nno enumeration", kind: "decision" },
            { label: "Pre-screen", note: "UNSC + ATA 1997\nfail closed if down", kind: "decision" },
            { label: "Risk profile", note: "Low / medium\n(high → J6)", kind: "decision" },
          ],
          branches: [
            { to: "J12", label: "Duplicate → J12" },
            { to: "J5", label: "Sanctions → J5" },
            { to: "J6", label: "High risk → J6" },
            { to: "J8", label: "Decline / close → J8" },
          ],
        },
        {
          stage: "3",
          title: "Verification ladder — map path into J3",
          steps: [
            { label: "Attempt NADRA BV", note: "Primary remote", kind: "decision" },
            { label: "BV not possible", note: "Starts here\n(dashed on map)", kind: "decision" },
            { label: "J2 Verisys fallback", note: "Verisys + pairing\n+ OTP/call-back", kind: "process" },
            { label: "Verisys ok,\npairing/OTP fail", note: "Map branch label", kind: "decision" },
            { label: "J3 Debit-blocked open", note: "Verisys ok\ncannot spend", kind: "pending" },
          ],
          branches: [
            { to: "J1", label: "BV passed → J1 (not this path)" },
            { to: "J2", label: "Full J2 success → activate (not this path)" },
            { to: "J4", label: "Remote exhausted → J4" },
            { to: "J11", label: "Provider down → J11" },
          ],
        },
        {
          stage: "4",
          title: "Decide and activate — Restricted open (J3 path on the map)",
          steps: [
            { label: "Activation gate", note: "Restricted open\n(not Accept → cool-off)", kind: "process" },
            { label: "DEBIT_BLOCKED", note: "Not a spending wallet", kind: "pending" },
            { label: "Any debit try", note: "Pay / P2P / cash-out", kind: "process" },
            { label: "Fail closed", note: "DEBIT_BLOCK_KYC", kind: "danger" },
          ],
          branches: [
            { to: "J8", label: "Never completes → J8 Decline / close + STR" },
            { to: "J7", label: "Resume while waiting → J7" },
            { to: "J1", label: "Later BV → lift block (new event)" },
            { to: "J2", label: "Finish pairing/OTP → lift block" },
          ],
        },
        {
          stage: "5",
          title: "After — if block never lifts (map dashed line to J8)",
          steps: [
            { label: "Aging DEBIT_BLOCKED", note: "Policy time limit", kind: "pending" },
            { label: "J8 Decline / close", note: "Tracking ID kept\nconsider STR", kind: "danger" },
          ],
        },
      ],
      remember: [
        "Map nodes in order: Attempt NADRA BV → BV not possible → J2 → “Verisys ok, pairing/OTP fail” → J3 → Restricted open → DEBIT_BLOCKED.",
        "J3 does NOT take Accept → 2-hour cooling-off → WALLET_ACTIVE (that path is for J1/full J2).",
        "Dashed line on the map: DEBIT_BLOCKED → J8 Decline / close if never verified.",
        "Pre-screen must already be CLEAR — do not use J3 for sanctions-uncleared people.",
        "Open question: legal must confirm restricted open ≠ full activation; EMI 12.IV one-credit exception — NEEDS CONFIRMATION.",
      ],
    },
    J4: {
      plain:
        "VIDEO_KYC completed and wallet decision follows verification strength, or partner bank, or J8 decline. Entered when J2 / J3 (remote rungs a–c) are exhausted. Agents must not issue the wallet (EMI 17.VII).",
      analogy:
        "Online tests failed — you must meet someone on a recorded video call (or a partner bank with branches), or the application is refused in writing. A shop agent cannot hand you a wallet.",
      flow: [
        { label: "Open app", note: "Capture starts", kind: "start" },
        { label: "Gates clear", note: "CNIC · screen · risk", kind: "decision" },
        { label: "NADRA BV?", note: "Not possible / fail", kind: "decision" },
        { label: "J2 then J3", note: "Rungs exhausted", kind: "process" },
        { label: "J4 Video/partner", note: "Last remote rung", kind: "process" },
        { label: "Accept?", note: "Or still incomplete", kind: "decision" },
        { label: "Cool 2 hours", note: "Then WALLET_ACTIVE", kind: "pending" },
        { label: "Or J8", note: "Written decline", kind: "danger" },
      ],
      flowStages: [
        {
          stage: "1",
          title: "Capture (shared navy spine)",
          steps: [
            { label: "Open app", note: "Do not reveal\nif wallet exists", kind: "start" },
            { label: "Mobile + 2FA", note: "OTP from institution\nshort code", kind: "process" },
            { label: "Terms & consent", note: "EMI 12.VI\n30-day save", kind: "process" },
            { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
            { label: "National + live ID", note: "Table-A ∪ EMI 12.I\nnot on device", kind: "process" },
            { label: "Geo + IP", note: "CCOF F.3\ndevice fingerprint", kind: "process" },
          ],
        },
        {
          stage: "2",
          title: "Eligibility gates",
          steps: [
            { label: "One CNIC?", note: "EMI 12.VII\nno enumeration", kind: "decision" },
            { label: "Pre-screen", note: "UNSC + ATA 1997\nfail closed if down", kind: "decision" },
            { label: "Risk profile", note: "Low / medium\nor high → EDD", kind: "decision" },
          ],
          branches: [
            { to: "J12", label: "Duplicate → J12" },
            { to: "J5", label: "Sanctions / proscribed → J5" },
            { to: "J6", label: "High-risk EDD → J6" },
            { to: "J8", label: "Decline / close → J8" },
          ],
        },
        {
          stage: "3",
          title: "Verification ladder — map: enters at J2 / J3 exhausted → J4",
          steps: [
            { label: "Attempt NADRA BV", note: "Primary remote", kind: "decision" },
            { label: "BV not possible", note: "Leave solid J1 path", kind: "decision" },
            { label: "J2 Verisys fallback", note: "Verisys + pairing\n+ OTP/call-back", kind: "process" },
            { label: "J3 Debit-blocked", note: "Verisys ok\ncannot spend", kind: "pending" },
            { label: "J4 Video KYC / partner", note: "Last remote rung\nor decline · START", kind: "process" },
          ],
          branches: [
            { to: "J1", label: "BV passed → J1 (not this path)" },
            { to: "J2", label: "Full J2 success → activate (not this path)" },
            { to: "J3", label: "Pairing/OTP fail only → J3" },
            { to: "J8", label: "Still incomplete → J8 Decline / close" },
          ],
        },
        {
          stage: "4",
          title: "Decide and activate (J4 Accept path on the map)",
          steps: [
            { label: "Activation gate", note: "Accept from J4\nVerify + CDD + risk", kind: "process" },
            { label: "2-hour cool-off", note: "BPRD 04 A.vii\napp not yet live", kind: "pending" },
            { label: "WALLET_ACTIVE", note: "E-money issued\nlimits follow strength", kind: "end" },
          ],
          branches: [
            { to: "J8", label: "J4 fail / still incomplete → J8 (written reason · tracking ID kept)" },
            { to: "J3", label: "J3 DEBIT_BLOCKED is a different map branch" },
          ],
        },
        {
          stage: "5",
          title: "After the wallet exists (or if J4 has no capacity)",
          steps: [
            { label: "J9 New device", note: "Lifecycle", kind: "process" },
            { label: "J10 Monitoring", note: "Ongoing screen", kind: "pending" },
            { label: "No video/partner?", note: "First-slice gap", kind: "decision" },
            { label: "J4 → J8", note: "Open question", kind: "danger" },
          ],
          branches: [
            { to: "J9", label: "J9 New device" },
            { to: "J10", label: "J10 Ongoing screening" },
            { to: "J8", label: "No capacity → treat as J8" },
          ],
        },
      ],
      remember: [
        "Map title: J4 · enters at J2 / J3 exhausted.",
        "Ladder order on map: Attempt NADRA BV → J2 → J3 → J4 Video KYC / partner (last remote rung).",
        "J4 Accept → Activation gate → 2-hour cooling-off → WALLET_ACTIVE.",
        "Still incomplete → dashed path to J8 Decline / close (tracking ID kept).",
        "Open question: if first slice has neither video KYC nor partner bank, J4 becomes J8.",
      ],
    },
    J5: {
      plain:
        "DECLINED / relationship not established. Possible STR to FMU. No wallet. Customer message is truthful but must not reveal that a suspicion report is being filed. Enters at Pre-screen UNSC + ATA 1997 — screening moment 1 of 4.",
      analogy:
        "Security stops you at the door. The public message is generic; the real list match and any STR stay internal. If it was a false alarm, you rejoin the queue and still finish every check.",
      flow: [
        { label: "Open app", note: "Capture starts", kind: "start" },
        { label: "Capture…", note: "2FA · ID · geo", kind: "process" },
        { label: "One CNIC?", note: "Then pre-screen", kind: "decision" },
        { label: "Pre-screen HIT", note: "UNSC + ATA · START", kind: "danger" },
        { label: "J5 investigate", note: "Hard stop · no tip-off", kind: "danger" },
        { label: "True or false?", note: "Maker-checker", kind: "decision" },
        { label: "J8 or spine", note: "Decline · or continue KYC", kind: "end" },
      ],
      flowStages: [
        {
          stage: "1",
          title: "Capture (shared navy spine — before the hit)",
          steps: [
            { label: "Open app", note: "Do not reveal\nif wallet exists", kind: "start" },
            { label: "Mobile + 2FA", note: "OTP · device bind", kind: "process" },
            { label: "Terms & consent", note: "EMI 12.VI\n30-day save", kind: "process" },
            { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
            { label: "National + live ID", note: "Table-A ∪ EMI 12.I", kind: "process" },
            { label: "Geo + IP", note: "CCOF F.3", kind: "process" },
          ],
        },
        {
          stage: "2",
          title: "Eligibility gates — map: enters at Pre-screen UNSC + ATA 1997",
          steps: [
            { label: "One CNIC?", note: "EMI 12.VII\nno enumeration", kind: "decision" },
            { label: "Pre-screen UNSC + ATA", note: "Fail closed if\nlists unavailable · START", kind: "danger" },
            { label: "J5 Sanctions / proscribed", note: "Hard stop\nno tipping-off", kind: "danger" },
          ],
          branches: [
            { to: "J12", label: "Duplicate → J12" },
            { to: "J11", label: "Lists down / timeout → J11 (never auto-CLEAR)" },
            { to: "J6", label: "If CLEAR, risk HIGH → J6 (not this path)" },
          ],
        },
        {
          stage: "3",
          title: "J5 investigation (map dashed branches)",
          steps: [
            { label: "Maker-checker case", note: "True match vs\nfalse positive", kind: "process" },
            { label: "False positive cleared", note: "Documented\nreturn to spine", kind: "end" },
            { label: "True match / TFS", note: "Do not open\nconsider STR", kind: "danger" },
            { label: "J8 Decline / close", note: "Written reason\ntracking ID kept", kind: "danger" },
          ],
          branches: [
            { to: "J8", label: "True match → J8 (no tip-off of STR)" },
            { to: "spine", label: "False positive → back to spine · still finish KYC" },
          ],
        },
      ],
      remember: [
        "Map: J5 · enters at Pre-screen UNSC + ATA 1997.",
        "Hard stop · no tipping-off. No wallet. Possible STR to FMU — never tell the customer an STR is being filed.",
        "False positive cleared → return to spine and still finish KYC. True match → J8.",
        "Timeout is J11; hit is J5. Never auto-clear a hit.",
        "Open question: approved decline text, match threshold, NACTA feed — NEEDS CONFIRMATION.",
      ],
    },
    J6: {
      plain:
        "EDD completed and policy approval to onboard with enhanced monitoring — or J8 if EDD cannot be completed. CRP rates the applicant high; EDD blocks activation. Extra evidence is additional to CDD/BV/screening — not instead of them.",
      analogy:
        "Airport extra screening — you still fly, but only after more checks and a supervisor stamp. You are not quietly waved through on a tourist ticket.",
      flow: [
        { label: "Open app", note: "Capture starts", kind: "start" },
        { label: "Gates…", note: "CNIC · screen CLEAR", kind: "decision" },
        { label: "CRP = HIGH", note: "START · J6", kind: "decision" },
        { label: "EDD pack", note: "Docs + video?", kind: "process" },
        { label: "Approve?", note: "Senior / policy", kind: "decision" },
        { label: "Activate / J8", note: "Cool-off · or decline", kind: "end" },
      ],
      flowStages: [
        {
          stage: "1",
          title: "Capture (shared navy spine)",
          steps: [
            { label: "Open app", note: "Do not reveal\nif wallet exists", kind: "start" },
            { label: "Mobile + 2FA", note: "OTP · device bind", kind: "process" },
            { label: "Terms & consent", note: "EMI 12.VI\n30-day save", kind: "process" },
            { label: "Tracking ID", note: "APPLICATION_STARTED", kind: "db" },
            { label: "National + live ID", note: "Table-A ∪ EMI 12.I", kind: "process" },
            { label: "Geo + IP", note: "CCOF F.3", kind: "process" },
          ],
        },
        {
          stage: "2",
          title: "Eligibility gates — map: enters at Customer risk profile",
          steps: [
            { label: "One CNIC?", note: "EMI 12.VII", kind: "decision" },
            { label: "Pre-screen", note: "UNSC + ATA\nCLEAR required", kind: "decision" },
            { label: "Customer risk profile", note: "Low / medium\nor HIGH → EDD", kind: "decision" },
            { label: "J6 High-risk EDD", note: "Extra evidence\nblocks activation · START", kind: "pending" },
          ],
          branches: [
            { to: "J12", label: "Duplicate → J12" },
            { to: "J5", label: "Sanctions → J5" },
            { to: "J8", label: "EDD refused / failed → J8" },
          ],
        },
        {
          stage: "3",
          title: "Verification ladder — EDD runs in parallel (still required)",
          steps: [
            { label: "Attempt NADRA BV", note: "Or Verisys ladder\nJ1–J4 as usual", kind: "process" },
            { label: "Collect EDD pack", note: "SoF · occupation\nPEP · purpose", kind: "process" },
            { label: "Video KYC if needed", note: "Even if BV passed", kind: "process" },
            { label: "Store evidence", note: "CRP model version\n+ docs + video", kind: "db" },
          ],
          branches: [
            { to: "J1", label: "BV path still applies" },
            { to: "J2", label: "Verisys path still applies" },
            { to: "J4", label: "Video may overlap J4 controls" },
          ],
        },
        {
          stage: "4",
          title: "Decide and activate — EDD must be APPROVED",
          steps: [
            { label: "Senior / policy approve", note: "Maker-checker\nif required", kind: "decision" },
            { label: "Activation gate", note: "CDD + screen\n+ EDD APPROVED", kind: "process" },
            { label: "2-hour cool-off", note: "BPRD 04", kind: "pending" },
            { label: "WALLET_ACTIVE", note: "Then enhanced\nmonitoring → J10", kind: "end" },
          ],
          branches: [
            { to: "J8", label: "Refuse / incomplete EDD → J8 (not silent J1 limits)" },
            { to: "J10", label: "After activate → hand to TMS (J10)" },
            { to: "J13", label: "Also used on upgrades (J13)" },
            { to: "J15", label: "Also linked minors (J15)" },
          ],
        },
      ],
      remember: [
        "Map: J6 · enters at Customer risk profile — CRP high · EDD blocks activation.",
        "EDD is additional to CDD/BV/screening — never a substitute, never “EDD later.”",
        "Do not tell the customer they are “high risk” in accusatory language.",
        "Fail/refuse → J8, not quietly dropped to J1 limits.",
        "Open question: first-slice CRP model and PEP appetite — NEEDS CONFIRMATION.",
      ],
    },
    J7: {
      "plain": "Customer continues from the last completed step with the same tracking ID. After 30 days the application expires and must start again (new tracking ID). CCOF requires the online application to save an ongoing session that the customer can resume for up to 30 days without restarting. Authoritative state is server-side — not photos sitting in the phone gallery.",
      "analogy": "Map short: Same tracking ID. Enters at: Any point after APPLICATION_STARTED and before a terminal decision.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Pause mid-application (map: any point after APPLICATION_STARTED)",
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
            }
          ]
        },
        {
          "stage": "2",
          "title": "Resume within 30 days",
          "steps": [
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
          "branches": [
            {
              "to": "J9",
              "label": "Device unbound → treat as J9"
            },
            {
              "to": "J8",
              "label": "After 30 days → new application"
            }
          ]
        }
      ],
      "remember": [
        "Map: J7 · Same tracking ID.",
        "Enters at: Any point after APPLICATION_STARTED and before a terminal decision.",
        "Open question: TAT vs 30-day clock; retention of never-completed applications; BV freshness if older than N hours.",
        "Actors: Customer; system; support if they cannot find the application."
      ]
    },

    J8: {
      "plain": "DECLINED (or CLOSED_UNVERIFIED). Customer can see status by tracking ID. Internal reason codes may be richer than the customer-facing text (especially J5). Any terminal negative outcome must produce a specific written reason, keep the tracking ID, and fit TAT communication rules. Vague “something went wrong” is not compliant.",
      "analogy": "Map short: Tracking ID still works. Enters at: J2/J3/J4 exhaustion, J5 true match, J6 EDD fail, J11 unresolved, J12 duplicate, J13/J15/J18 fail, or incomplete CDD at TAT.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Terminal negative from any journey",
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
          "branches": [
            {
              "to": "J5",
              "label": "From J5 true match"
            },
            {
              "to": "J6",
              "label": "From J6 EDD fail"
            },
            {
              "to": "J4",
              "label": "From J4 incomplete"
            }
          ]
        }
      ],
      "remember": [
        "Map: J8 · Tracking ID still works.",
        "Enters at: J2/J3/J4 exhaustion, J5 true match, J6 EDD fail, J11 unresolved, J12 duplicate, J13/J15/J18 fail, or incomplete CDD at TAT.",
        "Open question: Customer-facing reason catalogue must be approved by compliance/legal.",
        "Actors: System; operations/compliance for reason code; customer; support."
      ]
    },

    J9: {
      "plain": "New device bound and usable after cooling-off, or rejected. Old devices remain until removed, subject to max-device policy. After the customer already has a wallet, a new phone/tablet must be registered with NADRA BV (preferably digital), immediate notification, cooling-off, and device-limit checks. This is not “just log in with OTP.” Changing mobile, email, or password on the same device is J14, not this journey.",
      "analogy": "Map short: BV · notify · cooling-off. Enters at: WALLET_ACTIVE (or DEBIT_BLOCKED) customer attempts access from an unbound device.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "After wallet exists — new unbound device",
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
          "branches": [
            {
              "to": "J14",
              "label": "Contact/password change is J14"
            },
            {
              "to": "J10",
              "label": "Fraud pattern → J10"
            }
          ]
        }
      ],
      "remember": [
        "Map: J9 · BV · notify · cooling-off.",
        "Enters at: WALLET_ACTIVE (or DEBIT_BLOCKED) customer attempts access from an unbound device.",
        "Open question: Primary bind key (IMEI privacy), max devices, root/jailbreak policy: NEEDS CONFIRMATION.",
        "Actors: Customer; system; call-centre if call-back fallback; fraud unit if anomalies."
      ]
    },

    J10: {
      "plain": "MONITORING_HOLD or freeze per TFS; investigation CLEAR (resume) or CONFIRMED (STR, exit, freeze). Screening is not one-time. After onboarding, list updates, periodic re-screens, and transaction monitoring can produce a hit. Restrict, investigate, report, and keep an audit trail without tipping off. Refreshing expired CNIC data is J17; this journey is the hit itself.",
      "analogy": "Map short: KYC does not end at issuance. Enters at: WALLET_ACTIVE or DEBIT_BLOCKED. List update, periodic cycle, payment, cash-out, device+behaviour scenarios. Material changes (upgrade, new linked person) re-screen in J13/J15 before they complete.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "After issuance — list update / TMS / periodic",
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
          "branches": [
            {
              "to": "J16",
              "label": "Confirmed TFS/exit → J16"
            },
            {
              "to": "J8",
              "label": "Exit path may use J8 wording"
            },
            {
              "to": "J17",
              "label": "Not the same as CDD refresh (J17)"
            }
          ]
        }
      ],
      "remember": [
        "Map: J10 · KYC does not end at issuance.",
        "Enters at: WALLET_ACTIVE or DEBIT_BLOCKED. List update, periodic cycle, payment, cash-out, device+behaviour scenarios. Material changes (upgrade, new linked person) re-screen in J13/J15 before they complete.",
        "Open question: TMS rule catalogue, list-refresh frequency, CTR threshold, FTDH in first slice.",
        "Actors: TMS / screening batch; investigator; maker-checker; MLRO; payments (must honour HOLD)."
      ]
    },

    J11: {
      "plain": "VERIFICATION_PENDING or PRE_SCREEN_UNAVAILABLE or MANUAL_REVIEW. No WALLET_ACTIVE. Retry, wait, or J8 if TAT expires without CDD. NADRA, screening lists, SMS/OTP, or pairing services are unavailable, time out, or are in stub mode. The product must not auto-approve. A stub APPROVED is a labelled fake — never a real clean customer.",
      "analogy": "Map short: Never auto-approve. Enters at: Any spine step that calls a provider.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Any provider call fails closed",
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
          "branches": [
            {
              "to": "J7",
              "label": "Retry via resume (J7)"
            },
            {
              "to": "J8",
              "label": "Cannot complete CDD → J8"
            },
            {
              "to": "J5",
              "label": "Hit ≠ timeout (J5)"
            }
          ]
        }
      ],
      "remember": [
        "Map: J11 · Never auto-approve.",
        "Enters at: Any spine step that calls a provider.",
        "Open question: Max retries; whether operations can ever override NADRA-down (working position: no).",
        "Actors: Customer; system; operations queue. Never a developer flipping a flag on a real applicant."
      ]
    },

    J12: {
      "plain": "New application does not create a second wallet. Authenticated same person is routed to login / device bind (J9) / support. Attackers get a generic result, not “this CNIC is taken.” A CNIC holder may obtain only one e-money instrument with an EMI. A second attempt must be detected without helping attackers enumerate accounts.",
      "analogy": "Map short: One wallet per EMI. Enters at: Spine step 7, as soon as CNIC is known — but user-visible behaviour must not confirm existence until authenticated.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Spine uniqueness gate",
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
          "branches": [
            {
              "to": "J9",
              "label": "Lost access → J9 recovery"
            },
            {
              "to": "J16",
              "label": "CNIC free only after J16 policy"
            },
            {
              "to": "J15",
              "label": "Minor ≠ second guardian wallet"
            }
          ]
        }
      ],
      "remember": [
        "Map: J12 · One wallet per EMI.",
        "Enters at: Spine step 7, as soon as CNIC is known — but user-visible behaviour must not confirm existence until authenticated.",
        "Open question: Re-open after closure; NICOP vs CNIC same human: NEEDS CONFIRMATION.",
        "Actors: Customer (genuine returning or fraudster); system; support for takeover cases."
      ]
    },

    J13: {
      "plain": "LIMITS_UPDATED after a new verification case, re-screen, CRP, and 2-hour cooling-off — or stay on the old band, or J8 if CDD for the new band cannot be completed. CCOF F.1 treats change or upgradation of wallet category as identity verification again — not a settings toggle. A Verisys customer who later completes NADRA BV moves to the biometric band. A biometric customer who later qualifies for the SBP-approved enhan",
      "analogy": "Map short: Verisys → BV → enhanced. Enters at: WALLET_ACTIVE at a lower band, or DEBIT_BLOCKED customer completing BV / full J2.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "After wallet exists — higher band request",
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
          "branches": [
            {
              "to": "J6",
              "label": "CRP high on upgrade → J6"
            },
            {
              "to": "J11",
              "label": "Provider down → J11"
            },
            {
              "to": "J8",
              "label": "Upgrade CDD fails → J8"
            },
            {
              "to": "J19",
              "label": "Till BV may open J13 case"
            }
          ]
        }
      ],
      "remember": [
        "Map: J13 · Verisys → BV → enhanced.",
        "Enters at: WALLET_ACTIVE at a lower band, or DEBIT_BLOCKED customer completing BV / full J2.",
        "Open question: When PSP&OD enhanced-wallet and 14.VI exclusion permissions are sought; first-slice licence stage (pilot vs commercial) — NEEDS CONFIRMATION.",
        "Actors: Existing wallet holder; system; compliance for enhanced-band evidence; senior approval if CRP becomes high (J6)."
      ]
    },

    J14: {
      "plain": "CREDENTIAL_UPDATED after BV (or listed alternate pair), notification, and cooling-off — or rejected. Wallet spend on the old mobile/email continues until the timer ends. BPRD 04 (pulled into EMI digital onboarding by CCOF K) requires NADRA BV for modification of registered email or phone, credential reset only from a registered device, OTP from the institution short code, and a two-hour cooling-off before the change ",
      "analogy": "Map short: BV · notify · cooling-off. Enters at: WALLET_ACTIVE (or DEBIT_BLOCKED) customer requests change of MSISDN, email, user ID or password from a registered device.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "After wallet exists — mobile / email / password",
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
          "branches": [
            {
              "to": "J9",
              "label": "New phone is J9 (may fire together)"
            },
            {
              "to": "J10",
              "label": "Fraud pattern → J10"
            },
            {
              "to": "J11",
              "label": "BV timeout → J11"
            }
          ]
        }
      ],
      "remember": [
        "Map: J14 · BV · notify · cooling-off.",
        "Enters at: WALLET_ACTIVE (or DEBIT_BLOCKED) customer requests change of MSISDN, email, user ID or password from a registered device.",
        "Open question: Whether a Verisys-band wallet must repeat full J2 pairing on every SIM change: working position yes. PTA feed for pairing: NEEDS CONFIRMATION.",
        "Actors: Customer; system; call-centre for call-back; fraud unit if the change pattern matches TMS."
      ]
    },

    J15: {
      "plain": "MINOR_WALLET_ACTIVE, linked to the guardian’s instrument, at the matching minor band — or J8 if guardian or child CDD fails. EMI §14.IV–V allows a minor’s e-money wallet only when it is opened in link with a parent/guardian’s already-verified wallet, through that parent’s app. The guardian gives a written or digital undertaking of liability. Basic minor: Verisys, monthly load PKR 50,000, funded only from the parent w",
      "analogy": "Map short: Opened inside guardian’s app. Enters at: Guardian has WALLET_ACTIVE. Journey runs inside the guardian’s authenticated app — never as a child’s standalone J1.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Inside guardian’s already-verified app",
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
          "branches": [
            {
              "to": "J5",
              "label": "Hit on either → J5"
            },
            {
              "to": "J8",
              "label": "CDD fails → J8"
            },
            {
              "to": "J1",
              "label": "Do not reuse adult J1 for child"
            }
          ]
        }
      ],
      "remember": [
        "Map: J15 · Opened inside guardian’s app.",
        "Enters at: Guardian has WALLET_ACTIVE. Journey runs inside the guardian’s authenticated app — never as a child’s standalone J1.",
        "Open question: B-Form vs juvenile CNIC as the child’s ID; age floor; whether BPRD 2026 teenager-wallet overlay is in appetite — NEEDS CONFIRMATION.",
        "Actors: Parent/guardian (already WALLET_ACTIVE); minor; system; compliance (both persons screened); TMS on the linked pair."
      ]
    },

    J16: {
      "plain": "WALLET_CLOSED. Balance redeemed at par to a verified destination. CNIC-release policy applied. Records retained 10 years after relationship end. EMI §15 requires issuance and redemption at par, with no charges on redemption, and NADRA BV when e-money is redeemed in cash. Customer-requested closure, unverified-instrument closure (EMI 12.IV), and TFS/exit are different reasons that must not share one “delete account” b",
      "analogy": "Map short: Par value · BV for cash. Enters at: WALLET_ACTIVE, DEBIT_BLOCKED never verified, or MONITORING_HOLD confirmed TFS / offboarding.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Close / redeem / release CNIC",
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
          "branches": [
            {
              "to": "J12",
              "label": "Uniqueness / re-open policy"
            },
            {
              "to": "J19",
              "label": "Not the same as live cash (J19)"
            },
            {
              "to": "J10",
              "label": "TFS exit from monitoring"
            }
          ]
        }
      ],
      "remember": [
        "Map: J16 · Par value · BV for cash.",
        "Enters at: WALLET_ACTIVE, DEBIT_BLOCKED never verified, or MONITORING_HOLD confirmed TFS / offboarding.",
        "Open question: Cooling period before the same CNIC may return; IBFT-only vs cash redemption in first slice — NEEDS CONFIRMATION.",
        "Actors: Customer or compliance (TFS/exit); system; cash-out channel (agent/ATM/IBFT); MLRO if STR/TFS."
      ]
    },

    J17: {
      "plain": "CDD_CURRENT after new evidence + re-screen, or RESTRICTED / J16 close if the customer will not refresh, or J10 if screening now hits. AML ongoing CDD is not the same as J10’s sanctions/TMS hit. NADRA particulars change (name after marriage, address), CNIC expiry, and timed CCOF obligations (expired ID + NADRA token: lodge the renewed copy within 3 months) all require a refresh case. Until it completes, services may b",
      "analogy": "Map short: Refresh identity data. Enters at: WALLET_ACTIVE. Triggers: CNIC expiry approaching; NADRA data change; periodic review due; CCOF 3-month renewed-ID clock.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Periodic CDD / expired CNIC refresh",
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
          "branches": [
            {
              "to": "J10",
              "label": "New hit → J10"
            },
            {
              "to": "J13",
              "label": "Also a band change → J13"
            },
            {
              "to": "J6",
              "label": "CRP becomes high → J6"
            },
            {
              "to": "J11",
              "label": "NADRA down → J11"
            }
          ]
        }
      ],
      "remember": [
        "Map: J17 · Refresh identity data.",
        "Enters at: WALLET_ACTIVE. Triggers: CNIC expiry approaching; NADRA data change; periodic review due; CCOF 3-month renewed-ID clock.",
        "Open question: Review cycle by risk band; whether liveness is required on every CNIC renew; restriction set while OVERDUE.",
        "Actors: Existing customer; system (expiry batch); operations for discrepancy notices; compliance if risk rating changes."
      ]
    },

    J18: {
      "plain": "Wallet at the verification-strength band after the same gates as J1–J4, with residency/ID type stored — or J8 if the ID class cannot be onboarded digitally. CCOF C.5 allows digital onboarding only for CNIC, NICOP, POC, POR or ARC holders. EMI 12.I also lists passport, but a passport-only customer is not on the digital path — they go J4/face-to-face. Non-resident Pakistanis and POC holders outside Pakistan may use Ver",
      "analogy": "Map short: Digital IDs other than CNIC. Enters at: Spine at national-data capture when ID type is not a resident CNIC.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "National-data capture when ID ≠ resident CNIC",
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
          "branches": [
            {
              "to": "J2",
              "label": "NRP/POC abroad Verisys → J2"
            },
            {
              "to": "J4",
              "label": "Passport-only → J4 F2F"
            },
            {
              "to": "J12",
              "label": "NICOP vs CNIC uniqueness open"
            }
          ]
        }
      ],
      "remember": [
        "Map: J18 · Digital IDs other than CNIC.",
        "Enters at: Spine at national-data capture when ID type is not a resident CNIC.",
        "Open question: When NADRA BV is operational for NRP/POC abroad; NICOP and CNIC as one person for EMI 12.VII — NEEDS CONFIRMATION.",
        "Actors: Applicant with NICOP/POC/ARC/POR (or NRP abroad); system; compliance on residency and TFS; possibly video KYC."
      ]
    },

    J19: {
      "plain": "CASH_POSTED at par after BV (cash-in) or 2FA/BV (cash-out) — or declined. Wallet stays WALLET_ACTIVE. A mule / structuring pattern is J10, not a successful till event. EMI 15.II lets a live wallet be funded by IBFT or by cash-in at EMI branches, agents, ATMs or bank branches — cash-in is subject to NADRA biometric verification. EMI 14.II.d requires 2FA for ATM cash-out and BV (or 2FA where BVS is a genuine constraint",
      "analogy": "Map short: BV at the till · 2FA at ATM. Enters at: WALLET_ACTIVE customer presents at an agent, ATM, EMI branch or bank branch to load or withdraw cash.",
      "flow": [
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
      "flowStages": [
        {
          "stage": "1",
          "title": "Live wallet cash-in / cash-out (not closure)",
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
          "branches": [
            {
              "to": "J13",
              "label": "Verisys + till BV → also J13 upgrade"
            },
            {
              "to": "J10",
              "label": "TMS / mule → J10"
            },
            {
              "to": "J11",
              "label": "BVS timeout → J11"
            },
            {
              "to": "J16",
              "label": "Closure redeem is J16"
            }
          ]
        }
      ],
      "remember": [
        "Map: J19 · BV at the till · 2FA at ATM.",
        "Enters at: WALLET_ACTIVE customer presents at an agent, ATM, EMI branch or bank branch to load or withdraw cash.",
        "Open question: Which cash-in channels ship in the first slice (agent vs ATM vs bank branch); BVS-constraint policy for agent 2FA fallback — NEEDS CONFIRMATION.",
        "Actors: Existing wallet holder; agent or ATM/bank channel; system; TMS. Agents still do not issue instruments (EMI 17.VII)."
      ]
    },
  };

  for (const j of D.journeys) {
    const b = beginner[j.id];
    if (!b) continue;
    j.plain = b.plain;
    j.analogy = b.analogy;
    j.flow = b.flow;
    j.remember = b.remember;
    if (b.flowStages) j.flowStages = b.flowStages;
  }

  // Simpler spine blurbs for newcomers
  for (const s of D.spine) {
    s.simple =
      {
        "01": "Customer opens the wallet app (English / Urdu).",
        "02": "Enter mobile number, get OTP, lock this phone to the profile.",
        "03": "Accept terms. Told they can save and continue within 30 days.",
        "04": "System gives an application number (tracking ID). This is NOT the wallet number yet.",
        "05": "Enter CNIC details and take a live photo of the card + face.",
        "06": "App records location and IP for security evidence.",
        "07": "Check: does this CNIC already have a wallet here? If yes → J12.",
        "08": "Check banned lists. If match → stop (J5). If system down → wait (J11).",
        "09": "Score risk low/medium/high. High → extra checks (J6).",
        "10": "Try NADRA fingerprint/face. Success → J1 path. Cannot → ladder J2–J4.",
      }[s.step] || s.what;
  }
})();

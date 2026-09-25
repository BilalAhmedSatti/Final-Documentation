/** Reference tables + expanded Vocabulary for KYC docs */
(function () {
  const D = (window.KYC_DATA = window.KYC_DATA || {});

  D.states = [
    { code: "APPLICATION_STARTED", meaning: "Tracking ID exists; unfinished application may be resumed (J7). Not a wallet." },
    { code: "EVIDENCE_COLLECTED", meaning: "National data, live photo, live ID, device, geo/IP captured; nothing left as SoR on the phone." },
    { code: "PRE_SCREEN_CLEAR", meaning: "Screening clear with list version + timestamp recorded." },
    { code: "PRE_SCREEN_HIT", meaning: "UNSC/ATA match — J5 hard stop. Immutable." },
    { code: "PRE_SCREEN_UNAVAILABLE", meaning: "List provider down/timeout — J11 fail closed. Not a pass." },
    { code: "VERIFICATION_PENDING", meaning: "Provider retry queue; never auto-approve." },
    { code: "BV_PASSED", meaning: "NADRA biometric succeeded (rung A)." },
    { code: "VERISYS_PASSED", meaning: "Verisys + pairing + OTP/call-back all true (rung B)." },
    { code: "DEBIT_BLOCKED", meaning: "Instrument opened after Verisys but cannot spend (J3)." },
    { code: "VIDEO_KYC_REQUIRED", meaning: "Remote ladder exhausted; video/partner path (J4)." },
    { code: "VERIFICATION_FAILED", meaning: "Verification terminal failure toward decline." },
    { code: "RISK_LOW_OR_MEDIUM", meaning: "CRP allows activation without EDD gate." },
    { code: "RISK_HIGH_EDD", meaning: "HIGH risk; blocks activation until senior EDD approval (J6)." },
    { code: "COOLING_OFF", meaning: "2-hour BPRD 04 window before full operation (also device/contact/limits)." },
    { code: "WALLET_ACTIVE", meaning: "Wallet number assigned; limits match verification strength; e-money claim." },
    { code: "LIMIT_UPGRADE_PENDING", meaning: "J13 in flight; old band still enforced." },
    { code: "CREDENTIAL_CHANGE_PENDING", meaning: "J14 in flight; old channels still alert/OTP." },
    { code: "CDD_REFRESH_DUE / OVERDUE", meaning: "J17 identity refresh required; may restrict if overdue." },
    { code: "MINOR_LINKED", meaning: "Child instrument tied to guardian wallet (J15)." },
    { code: "DECLINED", meaning: "Terminal negative with reason catalogue (J8)." },
    { code: "CLOSED_UNVERIFIED", meaning: "Unverified instrument closed (EMI 12.IV); STR evaluated." },
    { code: "WALLET_CLOSED", meaning: "Closed after redeem/rules; CNIC slot handling complete." },
    { code: "MONITORING_HOLD", meaning: "Post-issuance hit/anomaly; services restricted (J10)." },
    { code: "CASH_PENDING / CASH_POSTED", meaning: "J19 till/ATM cash case awaiting or completed with proof." },
  ];

  D.limits = [
    { band: "Verisys (J2)", load: "PKR 50,000 / month", cash: "PKR 10,000 / day", notes: "Full Verisys bundle required. Cash-in still needs BV (J19)." },
    { band: "Biometric (J1)", load: "PKR 400,000 commercial (pilot often 200,000)", cash: "By risk profile (EMI 14.II.c)", notes: "Primary adult band after NADRA BV." },
    { band: "Enhanced (J13)", load: "Up to PKR 1,000,000", cash: "By risk profile", notes: "Annexure-J (1 doc), SIM pairing, in-house TMS, cooling-off; SBP PSP&OD permission context." },
    { band: "Basic minor (J15)", load: "PKR 50,000", cash: "PKR 10,000 / day", notes: "Parent app only. Funded ONLY from parent wallet." },
    { band: "Freelancer minor (J15)", load: "PKR 400,000", cash: "By risk profile", notes: "Requires BV + income evidence. Adult 1m prohibited." },
  ];

  D.exclusions14vi = [
    "Not a category upgrade and not a fourth limit band.",
    "Fully licensed EMIs with proven track record may apply to SBP for these exclusions.",
    "Applies only to biometrically verified adult wallets — never to minors.",
    "Salary credits disbursed via the employer bank account (EMI verifies employer).",
    "Inward home remittances via authorised dealers / PRI up to PKR 1,500,000 per transaction outside the monthly load cap.",
    "Direct utility bill payments do not consume load capacity.",
    "Payments and receipts are counted separately (EMI 14.II.a).",
  ];

  D.annexureJ = {
    salaried: ["Latest salary slip", "Salary certificate from employer", "Payment slips / payroll record", "Bank account statement showing salary", "Tax statement / return / certificate", "Retired: terminal benefits / pension book", "Any other document evidencing source of income"],
    nonSalaried: ["Receipt of payment against the work", "Account statement", "Particulars of income/funds providers (family / guardian / stipend / social benefit)", "Tax statement / return / certificate", "Any other document evidencing source of income"],
    alternate: ["Inheritance", "Agriculture income", "Investment in securities, bonds, shares", "Investment in property", "Rental income", "Interest income"],
  };

  /**
   * Vocabulary — expanded dictionary for newcomers.
   * category · term · plain · detail · alsoCalled · seeAlso · journey
   */
  D.glossary = [
    // —— Regulators & laws ——
    { category: "Regulators & laws", term: "SBP", plain: "State Bank of Pakistan — the country’s central bank and main finance regulator.", detail: "SBP issues the rules EMIs must follow (EMI Regulations, CCOF, BPRD circulars). Official text on sbp.org.pk always wins over this companion site.", alsoCalled: "Central bank", seeAlso: "EMI, CCOF, BPRD 04", journey: "" },
    { category: "Regulators & laws", term: "EMI", plain: "Electronic Money Institution — a company licensed to issue digital money (wallets), not a full bank.", detail: "Under EMI Regulations 2023, an EMI holds customer value as safeguarded e-money in a trustee bank. The customer has a claim on that e-money — not a bank deposit account.", alsoCalled: "E-money issuer", seeAlso: "Wallet, Trustee bank, RDA", journey: "" },
    { category: "Regulators & laws", term: "EMI Regulations 2023", plain: "The main SBP rulebook for e-money businesses in Pakistan.", detail: "Important parts for this map: §12 (CDD, consent, one CNIC), §14 (limits, minors), §14.VI (load exclusions), §15 (par redemption, cash-in BV), §17 (agents), Annexure-J, record retention.", alsoCalled: "EMI regs", seeAlso: "Limits, Annexure-J", journey: "" },
    { category: "Regulators & laws", term: "CCOF 2025", plain: "Customer Onboarding Framework — SBP rules for opening accounts/wallets digitally (remote).", detail: "Defines what data to capture (Table-A), how remote verification must work (ladder F.1.v), 30-day save/resume, category upgrades, ID classes (C.5), and evidence retention.", alsoCalled: "Customer Onboarding Framework", seeAlso: "Ladder, Table-A, Tracking ID", journey: "" },
    { category: "Regulators & laws", term: "BPRD Circular 04 of 2023", plain: "SBP circular about digital onboarding security: device binding, OTP, cooling-off, contact changes.", detail: "Pulled into EMI digital onboarding via CCOF section K. Drives the 2-hour cooling-off, short-code OTP, new-device BV (J9), and mobile/email change BV (J14).", alsoCalled: "BPRD 04", seeAlso: "Cooling-off, Device binding, OTP", journey: "J9, J14" },
    { category: "Regulators & laws", term: "AML / CFT", plain: "Anti-Money Laundering / Combating the Financing of Terrorism — laws against dirty money and terror funding.", detail: "In the product this means screening lists, CDD/EDD, transaction monitoring, STR/TFS, and “no tipping-off”.", alsoCalled: "AML/CFT", seeAlso: "Screening, STR, TFS, TMS", journey: "J5, J10" },
    { category: "Regulators & laws", term: "ATA 1997", plain: "Anti-Terrorism Act 1997 — Pakistan law that includes proscribed (banned) persons/organisations.", detail: "Pre-screening must check ATA proscribed lists as well as UNSC lists. A hit is journey J5.", alsoCalled: "Proscribed lists", seeAlso: "UNSC, TFS, J5", journey: "J5" },
    { category: "Regulators & laws", term: "UNSC", plain: "United Nations Security Council — issues international sanctions / designated person lists.", detail: "Customers and related persons are screened against UNSC designated lists before a wallet can open.", alsoCalled: "UN sanctions lists", seeAlso: "TFS, Screening, J5", journey: "J5" },
    { category: "Regulators & laws", term: "FMU", plain: "Financial Monitoring Unit — Pakistan’s financial intelligence unit that receives STRs.", detail: "Suspicious reports go to FMU. Front-line staff must not tell the customer an STR was filed.", alsoCalled: "Financial intelligence unit", seeAlso: "STR, Tip-off", journey: "J5, J10" },
    { category: "Regulators & laws", term: "PSP&OD", plain: "SBP department that oversees payment systems and related operators (context for enhanced limits).", detail: "Enhanced PKR 1,000,000 band and some 14.VI exclusions sit in a permission / track-record context with SBP.", alsoCalled: "Payment Systems Policy & Oversight", seeAlso: "Enhanced band, EMI 14.VI", journey: "J13" },

    // —— Product basics ——
    { category: "Product basics", term: "Wallet", plain: "The customer’s digital money account inside the EMI app.", detail: "After activation it has a wallet number and limits based on how strongly identity was verified. It is e-money, not a bank current/savings deposit.", alsoCalled: "E-money instrument", seeAlso: "Wallet number, EMI, Limits", journey: "J1" },
    { category: "Product basics", term: "Wallet number", plain: "The real account number assigned only after all checks pass and cooling-off finishes.", detail: "Do not confuse with Tracking ID. Until the wallet number exists and cooling-off ends, the customer should not be able to spend freely.", alsoCalled: "Instrument number", seeAlso: "Tracking ID, Cooling-off, WALLET_ACTIVE", journey: "J1" },
    { category: "Product basics", term: "Tracking ID", plain: "Application / ticket number for an unfinished signup.", detail: "Created at spine step 4 (APPLICATION_STARTED). Kept if the case is declined (J8). Can be resumed for up to 30 days (J7). It is NOT money and NOT a wallet.", alsoCalled: "Application ID, Case ID", seeAlso: "J7, J8, APPLICATION_STARTED", journey: "J7" },
    { category: "Product basics", term: "E-money", plain: "Digital value issued by an EMI, backed by safeguarded funds.", detail: "Customer balance is a claim on safeguarded e-money in a trustee bank arrangement — not a deposit with deposit insurance like a bank account.", alsoCalled: "Electronic money", seeAlso: "EMI, Trustee bank", journey: "" },
    { category: "Product basics", term: "Trustee bank", plain: "The bank that holds safeguarded funds backing customer e-money.", detail: "Used to explain why an EMI wallet is not the same as depositing money in a commercial bank account product.", alsoCalled: "Safeguarding bank", seeAlso: "EMI, E-money", journey: "" },
    { category: "Product basics", term: "RDA", plain: "Roshan Digital Account — a State Bank initiative for overseas Pakistanis to open bank accounts.", detail: "Often confused with EMI wallets. An EMI wallet is a different product. J18 overseas IDs still open an EMI wallet, not RDA.", alsoCalled: "Roshan Digital Account", seeAlso: "NRP, NICOP, EMI", journey: "J18" },
    { category: "Product basics", term: "Instrument", plain: "Formal word for the e-money wallet/account record.", detail: "Regulations say things like “one instrument per CNIC”. In product language we usually say wallet.", alsoCalled: "E-money instrument", seeAlso: "Wallet, CNIC", journey: "J12" },
    { category: "Product basics", term: "Par value / at par", plain: "Redeem or issue money 1:1 with no extra fee on the face value.", detail: "EMI §15: issuance and redemption at par; no charges on redemption. Used heavily in closure (J16) and cash posting (J19).", alsoCalled: "At par", seeAlso: "Redeem, J16", journey: "J16, J19" },
    { category: "Product basics", term: "Load / monthly load", plain: "How much money can be put into the wallet in a month (top-up ceiling).", detail: "Load caps depend on verification strength (Verisys vs biometric vs enhanced). Some salary/remittance/utility items may be excluded under 14.VI for BV adults.", alsoCalled: "Top-up limit, Load cap", seeAlso: "Limits, EMI 14.VI", journey: "J1, J2, J13" },
    { category: "Product basics", term: "Cash-out / withdrawal", plain: "Taking money out as cash (ATM, agent, branch).", detail: "Verisys wallets have a low daily cash-out cap (e.g. PKR 10,000/day). ATM cash-out needs 2FA (J19).", alsoCalled: "Withdrawal", seeAlso: "J19, 2FA, Limits", journey: "J19" },
    { category: "Product basics", term: "Cash-in / deposit", plain: "Putting cash into the wallet at an agent till, ATM, or branch.", detail: "Cash-in at till requires NADRA biometric at the till (BVS). Agents must not skip this (J19).", alsoCalled: "Cash deposit", seeAlso: "BVS, J19, BV", journey: "J19" },

    // —— Identity & IDs ——
    { category: "Identity & IDs", term: "KYC", plain: "Know Your Customer — proving who the customer is before giving financial services.", detail: "In this map, KYC covers the spine, ladder, journeys J1–J19, and ongoing checks after the wallet exists.", alsoCalled: "Know Your Customer", seeAlso: "CDD, eKYC, Ladder", journey: "" },
    { category: "Identity & IDs", term: "eKYC", plain: "Electronic / remote KYC done through the app and providers (not only branch paper forms).", detail: "Uses live ID capture, NADRA checks, and screening. Provider timeouts must fail closed (J11).", alsoCalled: "Digital KYC", seeAlso: "NADRA, Ladder, J11", journey: "" },
    { category: "Identity & IDs", term: "CNIC", plain: "Computerized National Identity Card — standard resident Pakistani ID.", detail: "EMI 12.VII: only one active e-money instrument per CNIC per EMI. Duplicate attempts are J12.", alsoCalled: "National ID card", seeAlso: "J12, NICOP", journey: "J1, J12" },
    { category: "Identity & IDs", term: "NICOP", plain: "National Identity Card for Overseas Pakistanis.", detail: "Allowed for digital onboarding under CCOF C.5 (journey J18). Same spine idea as CNIC with overseas extras.", alsoCalled: "", seeAlso: "J18, CCOF C.5, NRP", journey: "J18" },
    { category: "Identity & IDs", term: "POC", plain: "Pakistan Origin Card — for foreign nationals of Pakistani origin.", detail: "Digital onboarding ID class (CCOF C.5). Abroad, Verisys may be used until NADRA BV exists for that population.", alsoCalled: "Pakistan Origin Card", seeAlso: "J18, Verisys", journey: "J18" },
    { category: "Identity & IDs", term: "ARC", plain: "Afghan Citizen Card.", detail: "Eligible digital ID class under CCOF C.5. Do not validate it as if it were a CNIC; field rules differ. AML/CFT still applies.", alsoCalled: "Afghan Citizen Card", seeAlso: "POR, J18", journey: "J18" },
    { category: "Identity & IDs", term: "POR", plain: "Proof of Registration — Afghan refugee registration document.", detail: "Eligible under CCOF C.5 with distinct fields from CNIC.", alsoCalled: "Proof of Registration", seeAlso: "ARC, J18", journey: "J18" },
    { category: "Identity & IDs", term: "NRP", plain: "Non-Resident Pakistani — Pakistani citizen living abroad.", detail: "Remote onboarding may use Verisys exception until NADRA BV abroad is operational. Still an EMI wallet — not RDA.", alsoCalled: "Non-resident Pakistani", seeAlso: "RDA, Verisys, J18", journey: "J18" },
    { category: "Identity & IDs", term: "B-Form", plain: "NADRA child registration certificate (for minors without adult CNIC yet).", detail: "Used when a parent opens a linked minor wallet (J15).", alsoCalled: "CRC, Child Registration Certificate", seeAlso: "J15, Minor wallet", journey: "J15" },
    { category: "Identity & IDs", term: "Passport-only customer", plain: "Someone who only has a passport, not CNIC/NICOP/POC/POR/ARC.", detail: "EMI 12.I may list passport, but CCOF digital path is for listed digital ID classes. Passport-only usually goes face-to-face / video path (J4), not pure digital CNIC flow.", alsoCalled: "", seeAlso: "J4, J18", journey: "J4, J18" },
    { category: "Identity & IDs", term: "Live photo / live ID capture", plain: "Taking the CNIC picture and selfie right now in the app — not uploading an old gallery scan.", detail: "Spine step 5. Evidence must not stay as the only copy on the phone; server is the record.", alsoCalled: "Liveness capture", seeAlso: "Spine, Evidence", journey: "" },
    { category: "Identity & IDs", term: "Table-A", plain: "CCOF table of minimum personal data fields to collect for onboarding.", detail: "Captured together with EMI 12.I fields (including required non-face fields for remote onboarding).", alsoCalled: "CCOF Table A", seeAlso: "EMI 12.I, CDD", journey: "" },
    { category: "Identity & IDs", term: "EMI 12.I fields", plain: "Identity/CDD data elements listed in EMI Regulation 12.I.", detail: "Union with CCOF Table-A is what the app must capture on the spine.", alsoCalled: "", seeAlso: "Table-A, CDD", journey: "" },

    // —— Verification ladder ——
    { category: "Verification ladder", term: "NADRA", plain: "National Database and Registration Authority — Pakistan’s national ID authority.", detail: "Provides biometric verification and Verisys demographic checks through market adapters. The phone app never talks to NADRA directly.", alsoCalled: "", seeAlso: "BV, Verisys, Adapter", journey: "" },
    { category: "Verification ladder", term: "NADRA BV / Biometric Verification", plain: "Matching the customer’s fingerprint, iris, or face to NADRA records.", detail: "Primary remote method (ladder rung A). Used in J1, limit upgrades, contact changes, and till cash-in.", alsoCalled: "BV, Biometric", seeAlso: "Ladder rung A, J1, BVS", journey: "J1" },
    { category: "Verification ladder", term: "Verisys", plain: "NADRA check of name/demographics without a biometric match.", detail: "Weaker than BV. Only allowed for listed genuine reasons as part of a bundle (Verisys + SIM pairing + OTP). Lower limits (J2).", alsoCalled: "Demographic verification", seeAlso: "J2, CNIC–MSISDN pairing", journey: "J2" },
    { category: "Verification ladder", term: "Remote verification ladder", plain: "Ordered list of identity methods: try the strongest first; go down only if needed.", detail: "Rungs A→B→C→D. Never skip down for convenience. Defined in CCOF F.1.v.", alsoCalled: "Ladder, F.1.v", seeAlso: "BV, Verisys, Debit block, Video KYC", journey: "J1–J4" },
    { category: "Verification ladder", term: "Ladder rung A", plain: "Primary option — NADRA biometric in-app.", detail: "Best proof → biometric limit band when screens are clear.", alsoCalled: "Primary biometric", seeAlso: "J1", journey: "J1" },
    { category: "Verification ladder", term: "Ladder rung B", plain: "Fallback — full Verisys bundle when BV is impossible for a listed reason.", detail: "Needs Verisys AND CNIC–MSISDN pairing AND OTP/call-back AND live photo.", alsoCalled: "Verisys bundle", seeAlso: "J2", journey: "J2" },
    { category: "Verification ladder", term: "Ladder rung C", plain: "Verisys passed but pairing/OTP failed — open with debit block.", detail: "Customer cannot spend until A or full B is completed (J3).", alsoCalled: "Debit-blocked open", seeAlso: "DEBIT_BLOCKED, J3", journey: "J3" },
    { category: "Verification ladder", term: "Ladder rung D", plain: "All remote methods failed — video KYC, partner bank, or decline.", detail: "Agents must not issue the instrument (EMI 17.VII). Journey J4 / J8.", alsoCalled: "Remote methods fail", seeAlso: "Video KYC, J4", journey: "J4" },
    { category: "Verification ladder", term: "CNIC–MSISDN pairing", plain: "Check that the mobile SIM is legally registered to the same CNIC.", detail: "Required for Verisys onboarding and when the customer changes SIM/mobile (J14).", alsoCalled: "SIM pairing, SIM ownership check", seeAlso: "MSISDN, Verisys, J2", journey: "J2, J14" },
    { category: "Verification ladder", term: "MSISDN", plain: "The mobile number (technical name for the phone number on the network).", detail: "Captured at spine step 2; used for OTP and pairing checks.", alsoCalled: "Mobile number", seeAlso: "OTP, Pairing", journey: "" },
    { category: "Verification ladder", term: "OTP", plain: "One-Time Password — short code sent to prove you control the phone.", detail: "Must come from the institution’s short code where required (BPRD 04). Used in login, Verisys bundle, and changes.", alsoCalled: "One-time passcode", seeAlso: "Short code, 2FA", journey: "" },
    { category: "Verification ladder", term: "Short code", plain: "Special SMS sender ID/number registered to the EMI for OTPs.", detail: "Customers should receive OTPs from the official short code, not random long numbers.", alsoCalled: "SMS short code", seeAlso: "OTP, BPRD 04", journey: "" },
    { category: "Verification ladder", term: "Call-back", plain: "Institution calls the customer to confirm details (used in some Verisys flows).", detail: "Should use negative step-wise confirmation and must not tip off sanctions information.", alsoCalled: "Outbound verification call", seeAlso: "Verisys, J2", journey: "J2" },
    { category: "Verification ladder", term: "Video KYC", plain: "Recorded video interview to prove identity when remote automated methods fail.", detail: "Checks live presence, original ID, policy questions. Video stored encrypted for long retention (e.g. 10 years). Journey J4.", alsoCalled: "Video interview", seeAlso: "J4, Ladder D", journey: "J4" },
    { category: "Verification ladder", term: "BVS", plain: "Biometric Verification System — hardware at agent till/ATM for fingerprints.", detail: "Used so cash-in can complete NADRA BV at the till (J19).", alsoCalled: "Biometric terminal", seeAlso: "J19, BV", journey: "J19" },
    { category: "Verification ladder", term: "Device binding", plain: "Locking the customer profile to a specific phone/device fingerprint.", detail: "New unknown devices must re-verify (J9). Helps stop account takeover.", alsoCalled: "Device registration", seeAlso: "J9, BPRD 04", journey: "J9" },
    { category: "Verification ladder", term: "2FA", plain: "Two-Factor Authentication — password/PIN plus a second proof (OTP, biometric, etc.).", detail: "Required for ATM cash-out (EMI 14.II.d) and for IBFT redemption to own bank on closure (J16).", alsoCalled: "Two-factor auth", seeAlso: "OTP, J19, J16", journey: "J19, J16" },

    // —— Risk, AML, screening ——
    { category: "Risk, AML & screening", term: "Screening", plain: "Checking a person against banned / sanctions / watch lists.", detail: "Done at onboarding (pre-screen) and later when lists update or periodically (J10). Timeout must be HOLD/pending — never silent CLEAR (J11).", alsoCalled: "Sanctions screening, List screening", seeAlso: "UNSC, ATA, J5, J10", journey: "J5, J10" },
    { category: "Risk, AML & screening", term: "Pre-screening", plain: "The first sanctions/proscribed check during signup (spine step 8).", detail: "Hit → J5. Unavailable → J11. Store list version with the decision.", alsoCalled: "Screening moment 1", seeAlso: "J5, J11", journey: "" },
    { category: "Risk, AML & screening", term: "CDD", plain: "Customer Due Diligence — collecting and checking basic customer facts.", detail: "Identity, address, purpose/occupation, required fields. Must be complete before WALLET_ACTIVE.", alsoCalled: "Customer Due Diligence", seeAlso: "EDD, Table-A", journey: "" },
    { category: "Risk, AML & screening", term: "EDD", plain: "Enhanced Due Diligence — extra checks for higher-risk customers.", detail: "Extra income/wealth evidence, often video, senior management approval (J6). Adds to CDD — does not replace BV or screening.", alsoCalled: "Enhanced Due Diligence", seeAlso: "CRP, J6", journey: "J6" },
    { category: "Risk, AML & screening", term: "CRP", plain: "Customer Risk Profile — score saying Low, Medium, or High risk.", detail: "Built from occupation, geography, product, channel, PEP flags, etc. HIGH triggers EDD (J6).", alsoCalled: "Risk rating, Risk score", seeAlso: "EDD, J6", journey: "J6" },
    { category: "Risk, AML & screening", term: "PEP", plain: "Politically Exposed Person — someone with prominent public role (and often close associates/family).", detail: "Usually increases risk score and may require EDD / extra monitoring.", alsoCalled: "Politically Exposed Person", seeAlso: "CRP, EDD", journey: "J6" },
    { category: "Risk, AML & screening", term: "TFS", plain: "Targeted Financial Sanctions — legal duty to freeze/deny services to designated persons.", detail: "On a true hit: hard stop, no wallet, no tip-off, internal freeze/report path (J5).", alsoCalled: "Targeted Financial Sanctions", seeAlso: "UNSC, ATA, J5", journey: "J5" },
    { category: "Risk, AML & screening", term: "STR", plain: "Suspicious Transaction Report — report to FMU when activity looks suspicious.", detail: "Can be any amount if suspicion exists. Customer must not be tipped off. Different from CTR.", alsoCalled: "Suspicious Transaction Report", seeAlso: "CTR, FMU, Tip-off", journey: "J5, J10" },
    { category: "Risk, AML & screening", term: "CTR", plain: "Currency Transaction Report — report of cash transactions above a threshold.", detail: "Threshold-driven cash reporting. Do not confuse with suspicion-driven STR.", alsoCalled: "Currency Transaction Report", seeAlso: "STR", journey: "" },
    { category: "Risk, AML & screening", term: "TMS", plain: "Transaction Monitoring System — rules that watch payments after the wallet is live.", detail: "Looks for mule patterns, bursts, odd behaviour. Can place MONITORING_HOLD (J10).", alsoCalled: "Transaction monitoring", seeAlso: "J10, MONITORING_HOLD", journey: "J10" },
    { category: "Risk, AML & screening", term: "Tip-off / tipping-off", plain: "Illegally warning a customer that they are under sanctions/suspicion investigation.", detail: "Banned. Customer messages must stay generic on J5/J10. Internal codes stay internal.", alsoCalled: "No tipping-off", seeAlso: "J5, J8, STR", journey: "J5" },
    { category: "Risk, AML & screening", term: "Fail closed", plain: "If a safety check fails or times out, stop or hold — never silently approve.", detail: "Applies to screening, NADRA, OTP/pairing. Journey J11. Opposite of “fail open”.", alsoCalled: "Fail-safe", seeAlso: "J11, HOLD", journey: "J11" },
    { category: "Risk, AML & screening", term: "Maker-checker", plain: "Two-person control — one prepares, another approves.", detail: "Used for high-severity sanctions cases and senior EDD approvals.", alsoCalled: "Four-eyes principle", seeAlso: "J5, J6", journey: "J5, J6" },
    { category: "Risk, AML & screening", term: "MLRO", plain: "Money Laundering Reporting Officer — senior compliance role for AML reports.", detail: "Owns STR/TFS dispositions and FMU reporting quality.", alsoCalled: "Money Laundering Reporting Officer", seeAlso: "STR, FMU", journey: "" },
    { category: "Risk, AML & screening", term: "FTDH", plain: "Fraud, Theft, Dacoity and Hijacking — SBP operational incident reporting category.", detail: "Different clocks and process from AML STR filings.", alsoCalled: "", seeAlso: "STR", journey: "" },

    // —— Limits & money ——
    { category: "Limits & money", term: "Verification strength", plain: "How strongly identity was proven (biometric vs Verisys, etc.).", detail: "Drives which limit band applies. Not a simple yes/no “KYC flag”.", alsoCalled: "KYC strength", seeAlso: "Limits, Ladder", journey: "" },
    { category: "Limits & money", term: "Verisys band", plain: "Lower limits after Verisys bundle (example: PKR 50,000 monthly load).", detail: "Cash withdrawal often capped (e.g. PKR 10,000/day). Cash-in still needs BV later.", alsoCalled: "50k band", seeAlso: "J2, Limits", journey: "J2" },
    { category: "Limits & money", term: "Biometric band", plain: "Higher adult limits after NADRA BV (example: PKR 400,000 commercial monthly load).", detail: "Pilot stage may use a lower commercial figure (e.g. 200,000). Primary J1 outcome.", alsoCalled: "400k band", seeAlso: "J1, Limits", journey: "J1" },
    { category: "Limits & money", term: "Enhanced band", plain: "Highest adult band (up to PKR 1,000,000) after extra income proof.", detail: "Needs Annexure-J document verified in-house, SIM pairing, in-house TMS, cooling-off (J13).", alsoCalled: "1m band", seeAlso: "Annexure-J, J13", journey: "J13" },
    { category: "Limits & money", term: "Annexure-J", plain: "Official list of example income documents for the enhanced limit band.", detail: "Any one matching document can be enough. Must be checked in-house (EMI 14.III) — not outsourced.", alsoCalled: "Income evidence catalogue", seeAlso: "Enhanced band, J13", journey: "J13" },
    { category: "Limits & money", term: "EMI 14.VI exclusions", plain: "Special cases that do not count toward the monthly load cap (salary, remittance, utilities) for some BV adults.", detail: "Not a fourth band and not a category upgrade. Never for minors. Needs SBP permission context.", alsoCalled: "Load cap exclusions", seeAlso: "Load, PRI, Limits", journey: "" },
    { category: "Limits & money", term: "IBFT", plain: "Inter-Bank Fund Transfer — sending money between bank accounts / wallets via rails.", detail: "Can fund a wallet without till cash. Also used to redeem balance to own bank on closure with 2FA (J16).", alsoCalled: "Interbank transfer", seeAlso: "J16, J19, Raast", journey: "J16" },
    { category: "Limits & money", term: "Raast", plain: "Pakistan’s instant payment system (SBP).", detail: "Common rail for account-to-account payments in Pakistan market adapters (broader platform docs).", alsoCalled: "Raast IPS", seeAlso: "IBFT", journey: "" },
    { category: "Limits & money", term: "PRI", plain: "Pakistan Remittance Initiative related channels for home remittances.", detail: "Inward remittances may sit outside monthly load under 14.VI (with caps/conditions).", alsoCalled: "", seeAlso: "EMI 14.VI", journey: "" },
    { category: "Limits & money", term: "Redeem", plain: "Giving the customer their remaining e-money value back when closing or cashing out.", detail: "At par, no redemption fee (EMI §15). Cash redeem needs BV; bank transfer needs 2FA (J16).", alsoCalled: "Redemption", seeAlso: "Par value, J16", journey: "J16" },
    { category: "Limits & money", term: "Debit", plain: "Money going out of the wallet (payment, transfer, cash-out).", detail: "On DEBIT_BLOCKED wallets every debit must be rejected (J3).", alsoCalled: "Outgoing payment", seeAlso: "DEBIT_BLOCKED, J3", journey: "J3" },
    { category: "Limits & money", term: "Credit", plain: "Money coming into the wallet (top-up, cash-in, incoming transfer).", detail: "Cash-in credits wait for BV proof at till (CASH_PENDING → CASH_POSTED).", alsoCalled: "Incoming funds", seeAlso: "Cash-in, J19", journey: "J19" },

    // —— Process & states ——
    { category: "Process & states", term: "Spine / master spine", plain: "The shared signup steps everyone starts on (steps 1–10).", detail: "Other journeys are branches from this spine, not separate products.", alsoCalled: "Master capture spine", seeAlso: "J1, Ladder", journey: "" },
    { category: "Process & states", term: "Journey (J1–J19)", plain: "A named situation or path in the wallet lifecycle.", detail: "J1 is the happy biometric path. J2–J19 cover fallbacks, blocks, lifecycle events (new phone, cash, minors, closure…).", alsoCalled: "Named branch", seeAlso: "Spine", journey: "" },
    { category: "Process & states", term: "Cooling-off", plain: "Mandatory 2-hour wait before full use after sensitive events.", detail: "After first activation, new device (J9), contact/password change (J14), limit upgrade (J13). From BPRD 04.", alsoCalled: "2-hour wait, Cooling-off period", seeAlso: "BPRD 04, WALLET_ACTIVE", journey: "J1, J9, J13, J14" },
    { category: "Process & states", term: "Consent", plain: "Customer agrees to terms, fees, privacy, and KYC notice.", detail: "EMI 12.VI. Also tell them the application can be saved 30 days (J7).", alsoCalled: "Terms acceptance", seeAlso: "J7", journey: "" },
    { category: "Process & states", term: "Enumeration protection", plain: "Not revealing whether a CNIC/mobile already has a wallet to strangers.", detail: "Unauthenticated duplicate checks must answer vaguely (BPRD 04 A.ix). Journey J12.", alsoCalled: "Anti-enumeration", seeAlso: "J12", journey: "J12" },
    { category: "Process & states", term: "DEBIT_BLOCKED", plain: "Wallet opened but spending is locked until verification finishes.", detail: "J3 state. Reject debits with DEBIT_BLOCK_KYC. Not a normal active wallet.", alsoCalled: "Debit block", seeAlso: "J3, Ladder C", journey: "J3" },
    { category: "Process & states", term: "DEBIT_BLOCK_KYC", plain: "Error/reject code when a debit-blocked customer tries to spend.", detail: "Payments engine must fail closed on this code.", alsoCalled: "", seeAlso: "DEBIT_BLOCKED, J3", journey: "J3" },
    { category: "Process & states", term: "WALLET_ACTIVE", plain: "Wallet number assigned and ready to operate (after cooling-off).", detail: "Limits match verification strength. E-money claim, not a bank deposit.", alsoCalled: "Active wallet", seeAlso: "Cooling-off, Wallet number", journey: "J1" },
    { category: "Process & states", term: "MONITORING_HOLD", plain: "Temporary freeze/restriction because monitoring found a problem.", detail: "Used in J10. Investigate without tipping off. Different from J17 identity refresh.", alsoCalled: "Monitoring hold", seeAlso: "J10, TMS", journey: "J10" },
    { category: "Process & states", term: "VERIFICATION_PENDING", plain: "Waiting because a provider timed out or failed — retry later.", detail: "J11. Never auto-approve.", alsoCalled: "Pending verification", seeAlso: "J11, Fail closed", journey: "J11" },
    { category: "Process & states", term: "MINOR_LINKED", plain: "Child wallet tied to a parent/guardian wallet.", detail: "Opened only inside parent app (J15). Basic child funded only from parent.", alsoCalled: "Parent-linked minor", seeAlso: "J15, B-Form", journey: "J15" },
    { category: "Process & states", term: "Save & resume", plain: "Continue an unfinished application within 30 days using the same tracking ID.", detail: "Server holds the truth. Re-check device and list freshness on resume (J7).", alsoCalled: "30-day resume", seeAlso: "Tracking ID, J7", journey: "J7" },
    { category: "Process & states", term: "Decline notice", plain: "Written explanation (English & Urdu) when the application is refused.", detail: "Must be specific and compliant. Tracking ID kept. Journey J8.", alsoCalled: "Rejection notice", seeAlso: "J8, Tip-off", journey: "J8" },
    { category: "Process & states", term: "Associated person", plain: "Someone linked to the applicant (guardian, mandate holder, later linked minor).", detail: "Also screened. Hit on associated person can stop the journey (J5 / J15).", alsoCalled: "Related party", seeAlso: "Screening, J5, J15", journey: "J5, J15" },
    { category: "Process & states", term: "TAT", plain: "Turnaround time — how quickly the institution must communicate decisions.", detail: "Decline and discrepancy notices should follow CCOF communication/TAT expectations (J8).", alsoCalled: "Turnaround time", seeAlso: "J8", journey: "J8" },

    // —— Channels & tech ——
    { category: "Channels & technology", term: "Agent", plain: "Shop/retail partner who helps with cash-in/out — cannot issue wallets by themselves.", detail: "EMI 17.VII: agents must not issue the instrument. Till cash-in needs BV (J19).", alsoCalled: "Retail agent, Merchant agent", seeAlso: "J4, J19, BVS", journey: "J19" },
    { category: "Channels & technology", term: "Adapter / port", plain: "Software boundary: product talks to a stable interface; adapter talks to NADRA/Raast/lists.", detail: "Keeps market provider details out of core banking logic.", alsoCalled: "Market adapter", seeAlso: "NADRA, Fail closed", journey: "" },
    { category: "Channels & technology", term: "Stub / mock APPROVED", plain: "Fake test response that looks like approval.", detail: "Must be labelled fake. Never treat stub APPROVED as a real clean customer (J11 lesson).", alsoCalled: "Mock approval", seeAlso: "J11", journey: "J11" },
    { category: "Channels & technology", term: "Geo / IP capture", plain: "Recording location and internet address during signup.", detail: "CCOF F.3 evidence for digital onboarding (spine step 6).", alsoCalled: "Geolocation", seeAlso: "Spine", journey: "" },
    { category: "Channels & technology", term: "FATCA / CRS", plain: "International tax reporting frameworks for foreign tax residency.", detail: "Collect tax fields on overseas/foreign ID onboarding (J18).", alsoCalled: "Tax residency self-certification", seeAlso: "J18", journey: "J18" },
    { category: "Channels & technology", term: "Guardian / parent undertaking", plain: "Parent’s written/digital promise when opening a child wallet.", detail: "Required under EMI minor wallet rules (J15).", alsoCalled: "Undertaking", seeAlso: "J15", journey: "J15" },
    { category: "Channels & technology", term: "Tenant", plain: "Which operator/bank brand/market the request belongs to.", detail: "Every request is tenant-scoped in the wider platform architecture.", alsoCalled: "Operator context", seeAlso: "", journey: "" },
    { category: "Channels & technology", term: "SoR (system of record)", plain: "The one trusted place for a fact (for money balances, the ledger).", detail: "Identity evidence lives in identity/KYC stores; balances must not be invented in the wallet UI service.", alsoCalled: "System of record", seeAlso: "E-money", journey: "" },
  ];

  D.glossaryCategories = [
    "Regulators & laws",
    "Product basics",
    "Identity & IDs",
    "Verification ladder",
    "Risk, AML & screening",
    "Limits & money",
    "Process & states",
    "Channels & technology",
  ];
})();

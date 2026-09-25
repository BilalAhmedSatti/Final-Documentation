# Appendix A — Regulatory Requirement Catalog (Clause-Level)

> Classification: **A** mandatory · **B** expectation · **C** practice · **D** bank-specific.  
> Paraphrased — consult primary PDFs. Not legal advice.

| ID | Source | Section | Exact requirement (summary) | Class | Practical interpretation | App impact | DB | API/Service | Audit |
|----|--------|---------|----------------------------|-------|--------------------------|------------|-----|-------------|-------|
| A-001 | Consolidated 2025 | B.1 | Applies to Banks, DFIs, MFBs, Digital Banks, EMIs | A | Digital bank in scope | Policy flag `RE_TYPE=DIGITAL_BANK` | — | config | — |
| A-002 | Consolidated 2025 | C.4–5 | Remote digital channels allowed; only CNIC/NICOP/POC/POR/ARC | A | Validate ID type before journey | Block ineligible types | `customer_identities` | `/identity` | ID_TYPE_REJECT |
| A-003 | Consolidated 2025 | D Table-A | Collect basic, ID, contact, FATCA/CRS, SoI if applicable | A | Full CDD form | Multi-step profile | identities/contacts/tax/income | `/identity` `/profile` | PROFILE_CAPTURE |
| A-004 | Consolidated 2025 | D fn2 | ID record via BV, Verisys, or verified copy | A | Prefer BV | Verification orchestrator | `kyc_verifications` | `/identity/verify` | VERIFY_METHOD |
| A-005 | Consolidated 2025 | D fn3 | Expired ID + NADRA token; renew in 3 months | A | Reminder + restriction | Refresh jobs | identities + refresh | refresh APIs | ID_RENEWAL |
| A-006 | Consolidated 2025 | D | Live photo for digital onboarding vs ID picture | A | Capture + match | Camera SDK | `face_checks` | `/live-photo` | LIVE_PHOTO |
| A-007 | Consolidated 2025 | F.1.i | BV from NADRA before relationship | A | Gate account activation | NADRA adapter | verifications | `/biometric/verify` | BV_RESULT |
| A-008 | Consolidated 2025 | F.1.iv | Verisys alternate for disability, >60, NRP abroad | A | Reason-coded fallback | Rules engine | verifications | verify | VERISYS_ALT |
| A-009 | Consolidated 2025 | F.1.v.a–e | Tiered digital verification + debit block + branch guidance | A | Implement ladder | State machine tiers | verifications, accounts | verify + decision | TIER_PATH |
| A-010 | Consolidated 2025 | F.1.v.f | Digital banks without branches: video KYC+Verisys or third-party reliance | A | Exception ops | Video sessions | cases, documents | video-kyc | VIDEO_KYC |
| A-011 | Consolidated 2025 | F.3 | Collect geo-location/IP | A | Permissioned capture | On start/submit | `kyc_applications` | POST applications | GEO_IP |
| A-012 | Consolidated 2025 | F.4 | Pre-screen UNSC + ATA lists | A | Hard compliance gate | Sanctions service | `screening_results` | `/screen` | SANCTIONS |
| A-013 | Consolidated 2025 | G | EDD for high risk; video KYC for NFTF EDD | A | Case + recording | EDD workflow | cases | case APIs | EDD |
| A-014 | Consolidated 2025 | I.1 | Individual TAT 2 WD; entity 5 WD | A | SLA clocks | Timers/alerts | `tat_due_at` | status APIs | TAT |
| A-015 | Consolidated 2025 | I.2–4 | Tracking ID; notify; status portals; written decline reasons | A | Generate + show in-app at start; SMS/email notify after contact verified | Tracking UX | `tracking_id`, rejection reasons | GET tracking; `/decision` | TRACK/DECLINE |
| A-016 | Consolidated 2025 | J.iii | Resume up to 30 days | A | Persist draft | Resume token | applications | GET application | RESUME |
| A-017 | Consolidated 2025 | J.v | 24/7 customer support | A | Ops staffing | Support integration | — | — | — |
| A-018 | Consolidated 2025 | K.i | Comply mobile/digital security circulars | A | AppSec program | Gateway/WAF | — | gateway | SEC_CTRL |
| A-019 | Consolidated 2025 | K.ii | Anti-impersonation / ID theft measures | A | Fraud+BV+face | Fraud service | fraud tables | — | FRAUD |
| A-020 | Consolidated 2025 | K.iii | Encouraged AI face/fraud/liveness | B/C | Add liveness vendor | Face SDK | `face_checks` | live-photo | LIVENESS |
| A-021 | Consolidated 2025 | K.iv | No device storage; encrypted realtime transfer | A | Mobile architecture | Secure upload | documents | upload | DATA_XFER |
| A-022 | Consolidated 2025 | K.v | Periodic audit; remediate in 3 months | A | Audit calendar | GRC tracking | — | — | AUDIT_FINDING |
| A-023 | Consolidated 2025 | Annex-B | SoI docs; self-declaration if low risk/low turnover/informal profession | A | Risk-based docs | Doc policy engine | occupations_income, documents | `/profile` | SOI |
| A-024 | AML Regs | Reg–1 | Risk-based approach | A | CRP model | Risk engine | risk tables | `/risk-assessment` | RISK |
| A-025 | AML Regs | Reg–2 | CDD / ongoing DD | A | Onboarding + refresh | Full KYC lifecycle | customers, refresh | refresh | CDD |
| A-026 | AML Regs | Reg–3/TFS | Targeted financial sanctions | A | List screening | Sanctions | screening_results | `/screen` | TFS |
| A-027 | AML Regs | Reg–5 | PEPs | A | Detect + EDD + senior approval | PEP+cases | screening_results | screen/cases | PEP |
| A-028 | AML Regs | Reg–7 | STR/CTR | A | FMU reporting | TMS+cases | alerts | reporting | STR |
| A-029 | AML Regs | Reg–8 | Record keeping | A | Retention | Storage classes | all | — | RETAIN |
| A-030 | AML Regs | Reg–12 | New technologies risk assess | A | Launch checklist | Change risk | — | — | NEW_TECH |
| A-031 | BPRD CL22/2023 | e-KYC | Shared e-KYC implementation / participation | A when mandated | Consent-gated adapter | e-KYC adapter | consents | adapter | EKYC |
| A-032 | Digital Banks Framework 2022 | Licensing | NOC/IPA/pilot/commercial phases | A | Configurable limits by phase | Product config | applications.regulatory_phase | config | PHASE |
| A-033 | Historical Digital Onboarding 2021/22 | — | Earlier digital ADA/ADRA rules | Historical | Do not implement as primary | Reference only | — | — | — |

### A/B/C/D examples outside strict clauses

| Item | Class |
|------|-------|
| Device binding | C |
| Adverse media screening | B/C |
| Maker-checker on all manual KYC | B |
| Competitor selfie UX details | D |

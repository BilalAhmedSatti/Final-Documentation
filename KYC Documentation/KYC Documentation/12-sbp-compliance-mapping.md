# 25–26. Regulatory Reporting & SBP Compliance Mapping

> Greenfield baseline status uses **NOT IMPLEMENTED** with design-ready controls. Update statuses during build.  
> Paraphrased requirements — always read primary circular text. Not legal advice.

---

## 25. Regulatory reporting

| Obligation | Authority | System support |
|------------|-----------|----------------|
| STR | FMU / AML Act | Case Management + TMS export package |
| CTR | FMU | Core/TMS threshold reporting |
| Internal ML/TF risk assessment | SBP AML | Periodic IRAR inputs from KYC metrics |
| Onboarding audit remediation | SBP Consolidated §K | Track findings to closure ≤ 3 months |
| Supervisory information requests | SBP | Reconstruct KYC file pack from SoR + audit |

**KYC file pack contents (typical):** application data, consents, verification refs, screening results + list versions, risk assessments, decisions, cases, account limits, notifications of decline/approve.

---

## 26. Master SBP compliance mapping

| SBP Requirement | Regulation / Clause | Requirement (summary) | Our KYC Component | Database Table | API/Service | Evidence/Control | Compliance Status |
|-----------------|---------------------|-----------------------|-------------------|----------------|-------------|------------------|-------------------|
| Risk-based AML | AML Reg–1 | Assess risks; apply RBA | Risk Engine | `customer_risk_assessments` | `/risk-assessment` | Approved CRP policy + model version | NOT IMPLEMENTED |
| CDD identification & verification | AML Reg–2; Consolidated §D/F | Identify/verify customer | Identity + NADRA Adapter | `customer_identities`, `kyc_verifications` | `/identity`, `/identity/verify` | Vendor refs retained | NOT IMPLEMENTED |
| Eligible digital ID types | Consolidated §C.5 | Digital only CNIC/NICOP/POC/POR/ARC | Identity validation | `customer_identities.id_type` | `/identity` | Validation rules | NOT IMPLEMENTED |
| Table-A individual data | Consolidated §D Table-A | Collect listed fields | Onboarding/KYC | identities/contacts/addresses/tax/income | `/identity`, `/profile` | Field checklist QA | NOT IMPLEMENTED |
| Live photo digital | Consolidated §D | Live photo vs ID picture | Face checks + Docs | `face_checks`, `kyc_documents` | `/live-photo` | Stored object + match score | NOT IMPLEMENTED |
| Biometric verification NADRA | Consolidated §F.1.i | BV prior to relationship | NADRA Adapter | `kyc_verifications` | `/biometric/verify` | BV success evidence | NOT IMPLEMENTED |
| Verisys alternate conditions | Consolidated §F.1.iv | Limited alternate cases | KYC Service rules | `kyc_verifications` | verify APIs | Reason codes recorded | NOT IMPLEMENTED |
| Digital tier BV→Verisys+MSISDN+OTP | Consolidated §F.1.v | Tiered remote verification | KYC orchestration | verifications + contacts | verify APIs | Tier audit trail | NOT IMPLEMENTED |
| Debit block path | Consolidated §F.1.v.c | Open with debit block if needed | Account Service | `accounts.debit_block` | decision + account APIs | Flag + notices | NOT IMPLEMENTED |
| Video KYC for branchless DB | Consolidated §F.1.v.f | Video + Verisys or third-party reliance | Case Mgmt | `kyc_cases`, documents | video-kyc APIs | Recording retained | NOT IMPLEMENTED |
| Geo/IP capture | Consolidated §F.3 | Record geo/IP | Onboarding | `kyc_applications` | start application | Mandatory fields | NOT IMPLEMENTED |
| Sanctions pre-screening | Consolidated §F.4; AML TFS | UNSC + ATA lists | Sanctions Service | `screening_results` | `/screen` | List version + decision | NOT IMPLEMENTED |
| EDD high risk | Consolidated §G; AML Reg–2/5 | Additional info; video for NFTF EDD | Case Mgmt + Risk | `kyc_cases` | case APIs | EDD checklist | NOT IMPLEMENTED |
| PEP controls | AML Reg–5 | Detect PEP; senior approval; SoW/SoF; enhanced monitoring | PEP + Risk + Cases | `screening_results`, risk | `/screen`, cases | Approval records | NOT IMPLEMENTED |
| Individual TAT 2 WD | Consolidated §I.1 | Accept/decline ≤ 2 WD | Onboarding TAT | `tat_due_at` | tracking APIs | SLA dashboard | NOT IMPLEMENTED |
| Tracking ID | Consolidated §I.2/4 | Generate & enable status tracking | Onboarding | `tracking_id` | GET tracking | In-app ID at start; SMS after OTP; email if collected | NOT IMPLEMENTED |
| Written decline reason | Consolidated §I.3 | Specific reason in writing | KYC Decision | `kyc_rejection_reasons` | `/decision` | Customer notice template | NOT IMPLEMENTED |
| Resume 30 days | Consolidated §J.iii | Save/resume ≤ 30 days | Onboarding | application state | GET/PATCH application | Expiry job | NOT IMPLEMENTED |
| 24/7 support | Consolidated §J.v | Customer support availability | Ops/Notification | — | — | Support roster | NOT IMPLEMENTED |
| Digital onboarding security stack | Consolidated §K.i | Mobile app & digital banking security circulars | Gateway + AppSec | — | Gateway | Security test evidence | NOT IMPLEMENTED |
| Anti-impersonation | Consolidated §K.ii | Identity theft controls | Fraud + Face + BV | fraud/face tables | — | Control testing | NOT IMPLEMENTED |
| No device storage; realtime encrypted transfer | Consolidated §K.iv | No local KYC data store on device | Mobile + Docs | object store | upload APIs | Mobile security review | NOT IMPLEMENTED |
| Periodic onboarding audit | Consolidated §K.v | Audit + remediate ≤ 3 months | Audit / GRC | findings tracker | — | Audit reports | NOT IMPLEMENTED |
| Shared e-KYC connectivity | CL22/2023; Consolidated §H | Connect when operational; consent | e-KYC Adapter | consents + ekyc refs | adapter | Participation cert | NOT IMPLEMENTED / REQUIRES CLARIFICATION |
| Record keeping | AML Reg–8 | Retain CDD/txn records | Audit + Docs | all KYC tables | — | Retention policy | NOT IMPLEMENTED |
| STR/CTR | AML Reg–7 | Report to FMU | TMS + Cases | alerts | reporting export | Filing logs | NOT IMPLEMENTED |
| Beneficial owners (entities) | AML + Consolidated §E | Identify BOs | Phase-2 Entity KYC | BO tables | — | — | NOT APPLICABLE (v1 individuals) |
| Liveness AI | Consolidated §K.iii | Encouraged | Face vendor | `face_checks` | live-photo | Vendor config | NOT IMPLEMENTED (optional **B/C**) |
| Device binding | — | Industry practice | Fraud Service | `device_bindings` | auth | — | NOT IMPLEMENTED (**C**) |

### Status legend

- **COMPLIANT** — Implemented and evidenced  
- **PARTIALLY COMPLIANT** — Partial control  
- **NOT IMPLEMENTED** — Designed, not built  
- **NOT APPLICABLE** — Out of scope phase  
- **REQUIRES CLARIFICATION** — Confirm with SBP/PBA/Legal  

---

## Classification reminder

| Feature | Tag |
|---------|-----|
| NADRA BV, sanctions, Table-A, TAT, tracking, live photo, geo/IP, debit-block tier, video KYC path, no device storage | **A** |
| Strong CRP documentation, maker-checker, enhanced fraud analytics | **B** |
| Device binding, adverse media, AI liveness beyond encouragement | **C** |
| Exact UX of a peer bank | **D** |

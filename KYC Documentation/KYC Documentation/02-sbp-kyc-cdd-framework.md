# 5–7. SBP KYC / CDD / Digital Onboarding Framework

> Primary current onboarding source: **Consolidated Customer Onboarding Framework** (BPRD Circular No. 01 of 2025, 25 July 2025).  
> Primary AML source: **AML/CFT/CPF Regulations for SBP-REs** (updated to 28 Nov 2022 + later circular letters).  
> Classification: **A** mandatory · **B** expectation · **C** industry practice · **D** bank-specific.  
> Not legal advice.

Clause-level catalog with implementation mapping: [appendices/A-regulatory-requirement-catalog.md](appendices/A-regulatory-requirement-catalog.md).

---

## 5. SBP KYC/CDD regulatory framework (AML/CFT/CPF)

### 5.1 Risk-based approach — Regulation–1 (**A**)

| Field | Content |
|-------|---------|
| Requirement | Identify, assess, understand ML/TF/PF risks; apply risk-based CDD; document risk assessments and CRP |
| Practical interpretation | Maintain board-approved AML policy, CRP model, product/channel risk assessments including digital onboarding |
| App impact | Risk Engine service; risk factors at onboarding and periodic review |
| Data | `customer_risk_profiles`, `customer_risk_assessments` |
| API/Service | `POST /kyc/applications/{id}/risk-assessment`; Risk Engine |
| Audit | Risk score, factors, model version, decision path |

### 5.2 Customer Due Diligence — Regulation–2 (**A**)

Core CDD outcomes:

- Identify and verify customer (and beneficial owners where applicable) using reliable, independent sources  
- Understand purpose and intended nature of relationship  
- Conduct ongoing due diligence on business relationship and transactions  
- Apply SDD or EDD per risk  
- No anonymous or fictitious accounts  

**Identity documents (AML Definitions §34):** CNIC/SNIC, NICOP/SNICOP, Passport (foreign), POC, ARC, POR, Form-B/Juvenile for minors.

### 5.3 Beneficial ownership (**A**)

For legal persons/arrangements: identify natural persons with controlling ownership (AML Act + AML regs; Consolidated Framework entity section uses **20%** generally and **10%** in EDD contexts — implement per latest AML + Consolidated text and legal confirmation).

### 5.4 PEPs — Regulation–5 (**A**)

- Have risk management systems to determine whether customer/BO is a PEP (including family/close associates as defined)  
- Obtain senior management approval for PEP relationships  
- Take reasonable measures on source of wealth/funds  
- Conduct enhanced ongoing monitoring  

### 5.5 Targeted financial sanctions — Regulation–3 / Consolidated §F.4 (**A**)

Pre-screen customer and associated persons against:

- UNSC designated lists  
- Proscribed persons under ATA 1997  

Do not provide services to designated/proscribed persons or those acting on their behalf.

### 5.6 Third-party reliance for CDD (**A** with conditions)

AML regs allow reliance on third-party FIs for certain CDD elements subject to conditions (ultimate responsibility remains with relying RE). Consolidated Framework also allows digital banks/EMIs without branches to establish third-party reliance with banks having physical presence when BV cannot be completed.

### 5.7 Ongoing monitoring, STR/CTR, record-keeping (**A**)

| Topic | Regulation | Practical |
|-------|------------|-----------|
| STR/CTR | Reg–7 | File with FMU per AML Act thresholds/suspicion |
| Record keeping | Reg–8 | Retain CDD/transaction records for prescribed periods (commonly 5 years after end of relationship/transaction — confirm current text) |
| New technologies | Reg–12 | Assess ML/TF risks of new products/channels before launch |
| Internal controls | Reg–13 | AML compliance program, training, independent audit |

### 5.8 Periodic KYC refresh (**A/B**)

AML ongoing CDD implies periodic update of customer information proportionate to risk. Exact refresh intervals are typically set in bank policy CRP (**B** as interval policy; **A** as ongoing CDD obligation).

---

## 6. Consolidated Customer Onboarding Framework (current)

**Circular:** BPRD Circular No. 01 of 2025 (25 July 2025)  
**PDF:** https://bafblob.blob.core.windows.net/data/circulars/sbp/C1-Consolidated-Customer-Onboarding-Framework.pdf  
**Compliance window:** within **3 months** of issuance (circular body).

### 6.1 Scope (**A**)

- SBP REs with customer relationships: Banks, DFIs, MFBs, **Digital Banks**, EMIs  
- In-branch and remote/digital  
- Individuals and entities; LCY/FCY including RDA contexts as applicable  

### 6.2 Digital channel eligibility (**A**)

Digital onboarding only for holders of **CNIC / NICOP / POC / POR / ARC** (as defined in AML regs).

Allowed remote mediums: website/portal, mobile app, digital kiosks, other approved digital mediums after risk assessment.

### 6.3 Natural person information (Table-A) (**A**)

Minimum information categories:

1. **Basic:** Full name (per ID), mother’s maiden name, DOB, place of birth, father/spouse name, gender  
2. **ID document:** Number, issue date, expiry; passport issuing country for foreign nationals  
3. **Contact:** Current mailing address, permanent address (per ID), contact number (preferably mobile), personal email (where available), emergency contact  
4. **FATCA/CRS:** Resident/NRP status, other tax residencies, other nationalities; declarations/evidence as applicable  
5. **Source of income/funds (if applicable):** Profession/source; indicative documents Annex-B  
6. **Purpose of account/wallet;** expected behavior fields appear in SAOF CDD section  

**Documents / verification artefacts:**

- Record of valid ID via **Biometric Verification**, **NADRA Verisys copy**, or verified ID copy (see footnotes)  
- **Live photo** verified with picture on valid ID (**digital onboarding**)  
- Signature wet/digital/electronic if applicable  
- Expired ID: may open on NADRA receipt/token + expired ID; obtain renewed ID within **3 months**  

### 6.4 Identity verification hierarchy — §F (**A**)

**Primary rule:** Conduct **Biometric Verification (BV)** from NADRA (finger/thumb, iris, or facial recognition once operational) for CNIC/NICOP/POC/ARC/POR **prior to** establishing relationship.

**Verisys alternate** allowed for: permanent physical disability / unclear fingerprints; seniors **>60**; NRPs/POC outside Pakistan until BV service available.

**Digital/remote tiered approach** (except AMA special rules; except NRP/POC abroad):

| Tier | Control |
|------|---------|
| a | Primarily BV via authenticated means (+ live photo) |
| b | If BV not possible per allowed reasons: Verisys + **CNIC–MSISDN pairing** + OTP or call-back |
| c | If a/b fail: Verisys with **debit block** until a or b complied |
| d | If all fail: guide to nearest branch (face-to-face) |
| e | Face-to-face: primarily BV; else Verisys + original-seen record |
| f | **Digital banks/EMIs without physical presence:** recorded **video KYC/interview** + NADRA Verisys; record reasons BV not met; **or** third-party reliance with banks having physical presence |

**Location:** Collect and record **geo-location / IP** of digital gadgets used for digital onboarding (**A**).

**Sanctions:** Pre-screen customer and each associated person vs UNSC + ATA lists (**A**).

### 6.5 EDD — §G (**A**)

- EDD for high-risk per CRP model; may obtain additional info/docs  
- For non-face-to-face EDD: **recorded video KYC/interview**; parameters in approved Digital Onboarding Policy; retain per record-retention rules  

### 6.6 TAT & tracking — §§I–J (**A** / encouraged)

| Rule | Requirement | Class |
|------|-------------|-------|
| Individual decision TAT | Max **2 working days** from complete docs | **A** |
| Entity decision TAT | Max **5 working days** | **A** |
| Tracking ID | Generate; notify initiation; status on web/branch systems | **A** |

**Notify initiation (practical):** Generate and **show** Tracking ID as soon as the application is created (in-app). SMS/email that ID only after the customer has provided a verified mobile (OTP success) and, if collected, email. There is no contact channel at “Open account.”
| Decline | Specific reason in writing | **A** |
| Session resume | Save/resume up to **30 days** | **A** |
| Progress bar | Encouraged | **B/C** |
| 24/7 support | Shall ensure | **A** |
| Chat | Encouraged | **C** |

### 6.7 Security & infrastructure — §K (**A** / encouraged)

| Control | Class |
|---------|-------|
| Integrity, privacy, confidentiality of digital onboarding data | **A** |
| Comply with Mobile App Security Guidelines, digital banking security circulars, PSD security, Enterprise Tech Governance | **A** |
| Impersonation / identity theft controls | **A** |
| AI for facial recognition, fraud detection, **liveness** | **Encouraged** → **B/C** (not a substitute for NADRA BV mandate) |
| **No data stored on collection devices**; encrypted; **real-time transfer** to bank systems | **A** |
| Periodic audit of digital onboarding; remediate within 3 months | **A** |

### 6.8 Branch smart interface — §H

Encouraged computerized AOF with biometric/NADRA API, shared e-KYC connectivity when live, centralized tracking, auto name screening (**B/C** for digital-only banks with no branches — still relevant if agent/partner channels exist).

### 6.9 Source of income / funds — Annex-B (**A** with risk-based documentary flexibility)

- Indicative document lists for salaried / self-employed  
- **Self-declaration** may suffice if: low risk per CRP **and** low expected turnover **and** profession where formal docs uncommon (labor, student, housewife, farmer, etc.)  
- Self-declaration includes fund provider name, ID number, relationship  
- Exceeding bank thresholds → additional KYC/docs  

### 6.10 Relationship to 2021 Digital Onboarding Framework

Treat **Customers’ Digital Onboarding Framework (2021/2022)** as **historical**. Many themes (Verisys/BV, MSISDN pairing, geo, sanctions, 2-day TAT, self-declaration) reappear in Consolidated Framework with updates (e.g., digital-bank video KYC path, live photo rules, debit-block tiering). **Implement to Consolidated Framework + AML regs**, not the superseded annex alone.

---

## 7. Digital onboarding requirements — implementation checklist

| # | Requirement | Class | Our component |
|---|-------------|-------|---------------|
| 1 | Mobile/web onboarding channels | A | Mobile App + API Gateway |
| 2 | Eligible ID types only | A | Identity Service validation |
| 3 | Table-A data capture | A | KYC application APIs |
| 4 | Consent / T&Cs / KFS acknowledgment | A/B | Consent Service |
| 5 | Live photo + face match to ID photo | A (+ C for match tech) | Biometric/Face adapters |
| 6 | NADRA BV primary | A | NADRA Adapter |
| 7 | Tiered Verisys + MSISDN + OTP | A | Identity + Notification |
| 8 | Debit block path | A | Account Service limits |
| 9 | Video KYC for digital bank BV fallback / EDD | A | Case Mgmt + Document store |
| 10 | Geo/IP capture | A | Onboarding metadata |
| 11 | Sanctions pre-screen | A | Sanctions Service |
| 12 | PEP determination | A | PEP Service + Risk |
| 13 | CRP risk rating | A | Risk Engine |
| 14 | EDD workflow | A | Case Management |
| 15 | Tracking ID + status | A | Onboarding Service |
| 16 | 2-day TAT SLA | A | Ops dashboard + alerts |
| 17 | 30-day resume | A | Application persistence |
| 18 | Device non-persistence + encryption + realtime sync | A | Mobile security + API |
| 19 | Shared e-KYC connect when operational | A (when live) | e-KYC Adapter |
| 20 | Liveness / AI fraud | B/C | Face/Liveness vendor |
| 21 | Device binding | C | Fraud Service |
| 22 | Adverse media | B/C | Screening vendor |

---

## Practical interpretation for Conventional DRB

1. Design **straight-through** path: OTP → consent → identity → BV + live photo → profile/CDD → sanctions/PEP → risk → approve → CIF/account.  
2. Design **exception** paths: Verisys+MSISDN, debit-blocked account, video KYC, manual EDD, reject with written reason.  
3. Keep **NADRA BV** as the compliance backbone; treat selfie/liveness as **supporting** anti-impersonation (**B/C**), not as replacement for BV.  
4. Encode Annex-B self-declaration rules in Risk Engine + document policy — do not hardcode “always require salary slip.”

Next: [03-shared-ekyc-platform.md](03-shared-ekyc-platform.md).

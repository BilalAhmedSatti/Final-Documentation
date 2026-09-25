# 9–10. KYC Processes of Digital Banks & Comparative Notes

> Only **publicly evidenced** steps are marked Yes. Internal AML engines are almost never fully disclosed — use **Not publicly disclosed**.  
> Distinguish **SBP requirement (A)** from **bank implementation (D)**.  
> Our bank model remains Conventional DRB. Raqami is Islamic — process benchmark only.  
> Not legal advice.

Full matrix: [appendices/B-comparative-kyc-matrix.md](appendices/B-comparative-kyc-matrix.md).

---

## Method

Sources used: official bank websites, FAQs, account upgrade pages, Terms & Conditions PDFs, SBP license/status sources.  
App UI reverse-engineering was **not** performed beyond public marketing/FAQ claims.

---

## Easypaisa Bank Limited

### Public journey (individual / mobile account heritage)

| Step | Public evidence |
|------|-----------------|
| Channel | Mobile app (Play/App Store FAQs) |
| Mobile number | Yes — enter mobile |
| OTP | Yes — OTP auto-fetch described in FAQs |
| CNIC | Yes — CNIC number |
| CNIC issue date | Yes — FAQs require date of issuance |
| Email | Not highlighted as mandatory in basic FAQ signup |
| Consent / T&Cs | Yes — read and accept T&Cs |
| PIN | Yes — 5-digit PIN |
| Biometric | Public **upgrade** path: in-app hand scan biometric; also agent/retailer BV historically |
| One account rule | T&Cs: one BB account per CNIC and mobile |
| MSISDN pairing | Implied by T&Cs (mobile must be registered in customer name per PTA) |
| Screening / risk / EDD | Not publicly disclosed (process detail) |

Sources:

- https://easypaisa.com.pk/faqs/  
- https://easypaisa.com.pk/upgrade-easypaisa-account/  
- BB Account Holder T&Cs PDF (easypaisa.com.pk)

### Regulatory vs implementation

| Feature | Class |
|---------|-------|
| CNIC + mobile ownership expectations | Aligns with **A** (identity + MSISDN pairing themes) |
| OTP | **B/C** common control; also fits Consolidated OTP/callback tier |
| In-app biometric upgrade | **D** UX implementing **A** BV |
| Minimal FAQ field set vs Table-A full CDD | Public FAQ is incomplete vs Consolidated Table-A — bank may collect more in-app (**Not fully publicly disclosed**) |

---

## Mashreq Bank Pakistan Limited (NEO)

### Public journey signals (T&Cs + marketing)

| Step | Public evidence |
|------|-----------------|
| Channel | Mashreq Mobile App; “open in ~5 minutes” marketing |
| Eligibility | Individual resident Pakistanis 18+; valid CNIC/NICOP |
| Mobile | Mobile registered in customer name (for some account types) |
| CNIC/SNIC scan upload | Yes — T&Cs |
| FATCA/CRS digital | Yes — digital forms; consent via Proceed/Accept |
| Biometric / BVS / liveness | T&C packages titled with Biometric; BVS consent language |
| Additional docs | Bank may request; proof of income on upgrade |
| EDD | Bank may refer customer for EDD; may decline without assigning reason (contractual — regulatory decline-reason rules still apply to RE) |
| Islamic + conventional products | Public product list includes both |

Sources:

- https://www.mashreq.com/en/pk/neo/  
- NEO conventional/Islamic T&Cs (mashreq.com jssmedia PDFs)

### Regulatory vs implementation

| Feature | Class |
|---------|-------|
| CNIC scan + FATCA/CRS | Supports **A** |
| Biometric/liveness packaging | Implements **A** BV + **B/C** liveness |
| Income proof on upgrade | Aligns with risk-based Annex-B (**A/B**) |
| Exact PEP/sanctions vendor flow | **Not publicly disclosed** |

---

## Raqami Islamic Digital Bank Limited

| Area | Public evidence |
|------|-----------------|
| License | Commercial DRB / Islamic; scheduled-bank reports 2026 |
| Channel | Mobile app digital account opening (bank marketing) |
| Products | Savings, term deposits, PayPak debit (bank communications) |
| Detailed KYC field list / selfie / liveness / screening | **Not publicly disclosed** in sufficient technical detail |

Use only as existence proof that Islamic DRB commercial onboarding is live — **do not invent** their KYC stack.

---

## HugoBank Limited

| Area | Public evidence |
|------|-----------------|
| Status | IPA; pilot authorization reported 2026 |
| Onboarding | Historical waitlist registration on website |
| Full KYC journey | **Not publicly disclosed** (commercial journey may not be generally available) |

---

## KT Bank / Buraq Bank

| Area | Public evidence |
|------|-----------------|
| Status | IPA / readiness; rename reports |
| Onboarding journey | **Not publicly disclosed** |

---

## Step-by-step analysis template (for our bank vs peers)

### Step 1 — Application initiation

| Element | SBP | Easypaisa | Mashreq | Raqami | Hugo | KT/Buraq |
|---------|-----|-----------|---------|--------|------|----------|
| Mobile app / web | A (digital channels allowed) | Yes | Yes | Yes (app) | Waitlist web | NPD |
| Mobile number | A (contact) | Yes | Yes | NPD | NPD | NPD |
| Email | A where available | NPD mandatory | NPD | NPD | NPD | NPD |
| CNIC/NICOP/POC | A | CNIC | CNIC/NICOP | NPD | NPD | NPD |
| Consent / T&Cs | A/B | Yes | Yes | NPD | NPD | NPD |

NPD = Not publicly disclosed

### Step 2 — Identity information

Public banks disclose subsets. **Our bank must collect Consolidated Table-A**, not the FAQ minimum of any peer.

### Step 3 — Identity verification

| Control | SBP | Peer public evidence |
|---------|-----|----------------------|
| CNIC verification | A | Easypaisa, Mashreq |
| NADRA verification | A | Implied via BV/BVS language |
| Biometric | A | Easypaisa upgrade; Mashreq BVS |
| Selfie / live photo | A live photo digital | Mashreq scan + biometric packaging; others NPD |
| Liveness | B/C encouraged | Mashreq T&C biometric packages |
| Face matching | B/C (to meet live photo vs ID) | NPD algorithms |
| OTP | A as tier control / B general | Easypaisa Yes |
| SIM / MSISDN pairing | A in Verisys tier | Easypaisa/Mashreq T&Cs ownership rules |
| Device verification | C | NPD |

### Step 4 — Screening

| Control | SBP | Peer public |
|---------|-----|-------------|
| PEP | A | NPD (process) |
| Sanctions / TF lists | A | NPD (process) |
| Adverse media | B/C | NPD |

### Step 5 — Risk assessment

Peers do not publish CRP models. Our bank must document CRP (**A**) with automated + manual paths (**B/C**).

### Step 6 — Account opening

Public: app-based account creation, PINs, debit cards (varies). IBAN/CIF internals **NPD**. Design ours via Core Banking integration.

### Step 7 — Post-onboarding

Public: limit upgrades via biometric (Easypaisa); income proof on upgrade (Mashreq). Full TMS/refresh **NPD** — still **A** under AML ongoing monitoring.

---

## Key benchmarking conclusions for OUR Conventional DRB

1. **Do not copy FAQ-minimal onboarding** — meet Consolidated Table-A + AML.  
2. Peers normalize **app + CNIC + mobile ownership + OTP + T&Cs + biometric**.  
3. Mashreq’s public T&Cs are the richest **conventional digital** disclosure among the cohort for FATCA/CRS, scans, BVS, EDD referral.  
4. Treat all screening/risk engines as **must-build** from SBP rules, not from peer marketing.  
5. Where peers are silent, mark matrix **Not publicly disclosed** and implement per **A/B**.

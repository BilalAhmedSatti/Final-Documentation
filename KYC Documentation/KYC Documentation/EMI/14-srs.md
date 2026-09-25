# 14. Software Requirements Specification — EMI wallet KYC / CDD

> Extracted from EMI Regulations §7–24, Consolidated Customer Onboarding Framework (BPRD C1/2025), AML/CFT overlay, and this pack’s journeys, state machine, and API.  
> **Not legal advice.** Confirm with Compliance and Legal before freezing a build. Do not invent NADRA APIs.

| | |
|--|--|
| Product | SBP-licensed **Electronic Money Institution** wallet (e-money instrument, not a bank deposit) |
| Audience | Product, engineering, QA, compliance |
| Sources | [Appendix A](appendices/A-regulatory-requirement-catalog.md), [02 framework](02-sbp-emi-kyc-cdd-framework.md), [05 process](05-recommended-emi-kyc-process.md), [08 states](08-state-machine.md), [09 API](09-api-specification.md), [12 mapping](12-sbp-compliance-mapping.md) |
| Companion | [15 — Use cases](15-use-cases.md) |
| Class tags | **A** mandatory · **B** expectation · **C** industry practice · **D** this EMI’s choice |

---

## 1. Purpose and scope

### 1.1 Purpose

Specify what the system **must** do to onboard a natural-person wallet holder, raise the instrument’s limit tier, enforce §14 limits, and fail closed on sanctions, duplicates, and unverified one-credit — without treating the product as a digital-bank deposit account.

### 1.2 In scope

- Customer-facing digital onboarding and category upgrade (Verisys → BV → enhanced).  
- Tracking ID, 2FA, consents, §12 / Table-A identity, live photo, TFS/PEP screen, NADRA Verisys/BV adapters, video KYC fallback.  
- One instrument per CNIC; `limit_tier` as a first-class state; ledger enforcement.  
- Agent **cash-in/out** only; trust-account posting at par; real-time alerts; audit reconstructability.

### 1.3 Out of scope (this SRS)

- Conventional Digital Retail Bank deposit KYC (parent-folder pack).  
- NADRA proprietary request/response payloads.  
- Agent recruitment, STR casework UI, FMU filing ops (see [10](10-aml-risk-edd-ops.md)).  
- Trustee-bank core, IBFT rails internals, virtual currencies.  
- Device bind as an E01/E02 issuance gate (C until Legal upgrades BPRD 04).  
- Minting Tracking ID only after OTP (unsigned; pack default is generate at Step 0).

### 1.4 Licence phases (constraint)

| `licence_phase` | Allowed load after BV | Enhanced 1M |
|-----------------|----------------------|-------------|
| `PILOT` | PKR **200,000**/month | No |
| `COMMERCIAL` | PKR **400,000**/month | Only after PSP&OD approval + §14.III |

The app **must not** display a cap the licence cannot grant (**A-E03**).

---

## 2. Actors

| Actor | May | Must not |
|-------|-----|----------|
| **Customer** (adult digital-ID holder) | Open wallet, 2FA, upgrade limits, view tracking/status, cash-in/out as rules allow | Hold two instruments at this EMI; skip 2FA |
| **Guardian** | Open linked **minor** wallet from *their* app | Open a standalone adult wallet for the minor |
| **Agent** | Cash-in / cash-out for an existing wallet | `POST /wallets` or create applications |
| **KYC Service** | Write KYC states, uniqueness, evidence | Move money |
| **Ledger** | Post e-money, enforce limits, fire alerts | Change KYC state or `limit_tier` eligibility |
| **NADRA adapter** | Verisys / BV / pairing **refs** | Store raw biometric templates |
| **Screening** | TFS/PEP results | Approve wallets |
| **Ops / compliance** | EDD, STR, declines, video KYC | Appear in customer happy-path UX as “approve to skip NADRA” |

---

## 3. Assumptions and open items

| ID | Item | Until signed | System does |
|----|------|--------------|-------------|
| O-01 | “Initiation” = first tap vs OTP success | Legal | Generate Tracking ID at `INITIATED`; SMS after OTP (**D** placement) |
| O-02 | BPRD 04 device bind binds this EMI as A | Legal | No bind gate on E01/E02; §14.III pairing on enhanced |
| O-03 | NADRA facial BioVerisys operational | NADRA contract | Finger / multi-finger is the only NADRA BV |
| O-04 | Digital open for NICOP/POC/POR/ARC | Legal vs CCOF §C.5 | Happy path = adult CNIC/SNIC |
| O-05 | CCOF debit-block on EMI wallets | Compliance | Do not use bank debit-block; keep `limit_tier=VERISYS` |
| O-06 | v1 enhanced 1M / minors / exclusions | Product + PSP&OD | Journeys exist; feature-flag off until approved |
| O-07 | Record retention 10y vs AML 5y | Legal | Implement the **stricter** rule |

---

## 4. Functional requirements

Priority: **P0** must ship before first digital open; **P1** Verisys wallet; **P2** BV; **P3** EDD/video; **P4** cash/TMS/refresh; **P5–P6** enhanced / minors / exclusions.

Each FR cites Appendix A (`A-E*`) and the use case (`UC-E*` / `UC-S*`).

### 4.1 Application, tracking, resume

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E01 | On Open wallet, create a `kyc_application` in `INITIATED` and issue a **system-generated Tracking ID**. Show it **in-app immediately**. Do not SMS until `CONTACT_VERIFIED`. | A tracking; D placement | P0 | A-E18, UC-E01, UC-S01 |
| FR-E02 | Customer can look up status with Tracking ID on app/web **without extra PII**. Rate-limit; no enumeration. | A | P0 | A-E18, UC-S01 |
| FR-E03 | Incomplete applications are **resumable ≤ 30 days** at the last incomplete step. Day 31+ → `EXPIRED`; new application. | A | P0 | A-E18, UC-E19 |
| FR-E04 | Individual decision TAT is **2 working days** from a **complete** file. If exceeded, notify. Entity TAT **5 WD** (merchant/entity path). Decline states a **specific reason in writing**. | A | P1 | A-E18, UC-E09 |
| FR-E05 | Capture channel, device hash, IP, and geo of the digital gadget used to open (**A** location). Do not store KYC artefacts on the device; realtime encrypted upload. | A | P1 | A-E18, CCOF §K |

### 4.2 Contact / 2FA

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E06 | At least **two-factor authentication** to verify the customer (EMI §12.II). Typical: PTA-registered mobile + OTP. | A | P0 | A-E05, UC-E01, UC-E06 |
| FR-E07 | Wrong or expired OTP **does not** advance to `CONTACT_VERIFIED`. Attempt counters, resend limits, cool-down (**D**). | A | P0 | UC-E06 |
| FR-E08 | After OTP success, SMS the Tracking ID to the **bound** number. | D | P0 | UC-E01 |

### 4.3 Consents and identity capture

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E09 | Capture **versioned** mandatory consents (T&Cs including charges, privacy, NADRA/BV). Refusal → cannot issue (`REJECTED` / withdrawn), not a silent skip. | A | P0 | A-E05, A-E07, UC-E18 |
| FR-E10 | Collect EMI §12.I minimum: name; father/spouse; ID type+number (CNIC, NICOP, POC, Passport, ARC, POR); mobile; residential address; **two fields not on the CNIC**. Apply Consolidated **Table-A** as applicable (purpose, SoI, FATCA/CRS, PEP declaration, occupation). | A | P0 | A-E05, A-E19, UC-E01 |
| FR-E11 | Digital/remote open: **live original CNIC** (where applicable) and **live digital photo**. Liveness/AI face-match is **B/C**, not NADRA BV. | A photo; B/C liveness | P1 | A-E05, A-E18, UC-E01 |
| FR-E12 | No anonymous or fictitious wallets. | A | P0 | A-E19 |

### 4.4 Uniqueness

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E13 | **One e-money instrument per CNIC per this EMI.** Duplicate attempt → `DUPLICATE_CNIC`, redirect to login/recovery — not a vague policy reject. | A | P0 | A-E08, UC-E05 |
| FR-E14 | Uniqueness is on **open** instruments. Closed/STR records remain for audit. Silent reopen of a closed CNIC is **off** until Legal defines reuse. | A / D reopen | P0 | A-E08 |

### 4.5 Screening and fail-closed

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E15 | **Pre-screen** customer (and associated persons) against UNSC and ATA 1997 lists **before** establishing the relationship **or** allowing payment services. | A | P1 | A-E06, A-E19, UC-E10 |
| FR-E16 | True sanctions/fraud match → `REJECTED`, no instrument, freeze as required, written decline, STR/TFS ops. **Never** `WALLET_ACTIVE`. No STP retry. | A | P1 | A-E06, UC-E10 |
| FR-E17 | PEP / high CRP → `EDD_REQUIRED`. Non-face-to-face EDD: recorded **video KYC**. Senior approval is ops-side. | A | P3 | A-E19, UC-E11 |
| FR-E18 | Optional **one inbound credit** before verification (**product flag, default off**). If credentials never verify → close instrument + **STR** (`CLOSED_UNVERIFIED`). | A | P1 | A-E07, UC-E04 |

### 4.6 NADRA identity verification

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E19 | Issue first wallet on **NADRA Verisys** (CNIC verification) when Verisys and screening pass. Set `limit_tier=VERISYS`. Selfie is not Verisys. | A | P1 | A-E10, A-E17, UC-E01 |
| FR-E20 | Raise to `limit_tier=BV` only after **NADRA biometric verification** (finger/thumb/iris, or NADRA face **if** the contract says facial BioVerisys is operational). Channel (in-app / e-Sahulat / ATM) is **D**. | A; D channel | P2 | A-E10, UC-E02 |
| FR-E21 | Eligible BV failure (disability, unclear prints, age **>60**) → stay Verisys **or** Verisys + documented alternate; **or** recorded **video KYC + Verisys** (no physical presence). Do not pretend BV succeeded. | A | P2 | A-E18, UC-E07 |
| FR-E22 | NADRA timeout/outage: stay `IDENTITY_VERIFICATION_IN_PROGRESS`. Retry with backoff. **No** silent 400k. | A | P1 | UC-E08 |
| FR-E23 | Adapter stores **vendor references**, not raw biometric templates. Do not invent NADRA API names in this SRS. | A / pack | P1 | §K, 06 architecture |

### 4.7 Limit ladder and ledger

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E24 | Payments and receipts are **separate** limit buckets. | A | P1 | A-E10 |
| FR-E25 | Commercial Verisys: monthly **load PKR 50,000**; cash-out **PKR 10,000/day**. | A | P1 | A-E10, UC-E01 |
| FR-E26 | Commercial BV: monthly load **PKR 400,000**; pilot BV **PKR 200,000**. BV cash-out from CRP. ATM cash-out always **2FA**. | A | P2 | A-E10, UC-E02 |
| FR-E27 | Ledger **rejects** over-limit postings even if the UI is wrong. Caps come from `limit_tier` × `licence_phase` × `limit_policies`. | A | P1 | UC-S03 |
| FR-E28 | Issue instrument **at par, without delay**, on receipt of funds. Redeem at par **any time, no charges**. | A | P1 | A-E12 |
| FR-E29 | No interest / return / idle “growth” on e-money. No issue at a discount. No VCs. Copy must not say deposit/savings/insurance. | A | P0 | A-E01, A-E02 |
| FR-E30 | Customer float posts to a **trust account** at an A-rated bank; no co-mingle with operating funds. | A | P1 | A-E13 |

### 4.8 Enhanced, minors, exclusions

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E31 | Enhanced up to **PKR 1,000,000** only if commercial + PSP&OD **and** all of: Annexure-J SoF; **CNIC/SIM pairing** of the opening device; robust TMS; detailed CRP. Verification of these **not outsourced**. | A | P5 | A-E11, UC-E03 |
| FR-E32 | Basic minor: opened **only** from guardian app, linked, Verisys **50k**, funded **only** from guardian wallet, guardian undertaking, TMS. Adult §14.I–III enhanced limits **do not** apply. | A | P6 | A-E10, UC-E13 |
| FR-E33 | Minor freelancer: same linkage, **400k BV**, funding guardian **or** EMI-verified income. Still not adult 1M. Digital Form-B eligibility: Legal. | A | P6 | UC-E14 |
| FR-E34 | Salary / inward remittance (up to 1.5m via AD) / utility **exclusions** apply only if SBP granted them, only to **BV holders**, **not** minors. Remittance via Authorized Dealers + EPD as §13. | A | P6 | A-E20, UC-E15, UC-E16 |

### 4.9 Cash, agents, alerts, audit

| ID | Requirement | Class | Pri | Trace |
|----|-------------|-------|-----|-------|
| FR-E35 | Agent channel: SBP-approved agents only. **Cash-in/out**. Cash-in: **BV**. Cash-out: BV or 2FA if BVS is a major challenge. **No issue-wallet route** (`AGENT_CANNOT_ISSUE`). | A | P4 | A-E14, UC-E12 |
| FR-E36 | **Cash redemption** of e-money requires NADRA BV. ATM cash-out: 2FA. | A | P4 | A-E12, UC-E12 |
| FR-E37 | **Real-time alerts for all transactions.** Channel (push/SMS/email) is **D**; existence is **A**. Not end-of-day batch as a substitute. | A | P1 | A-E09, UC-S04 |
| FR-E38 | Automated **TMS** (including 1:N / N:1 for enhanced). New product/technology ML/TF assessment **before launch**. | A | P4 | A-E15 |
| FR-E39 | Every KYC decision, limit upgrade, screening adjudication, agent cash session, and trust posting is **reconstructible**. Retention ≥ **10 years** or stricter applicable law; call recordings **1 year**. | A | P0 | A-E16 |
| FR-E40 | Customer may **withdraw** an incomplete application. Mandatory-consent refusal cannot issue. | A / D save-draft | P0 | UC-E18 |

---

## 5. Non-functional requirements

| ID | Requirement | Class | Pri |
|----|-------------|-------|-----|
| NFR-E01 | PII (CNIC, mother’s name, biometric **tokens**) encrypted at rest; masked in UI (`xxxxx-xxxxxxx-x`). | A/B | P0 |
| NFR-E02 | No KYC data stored on capture devices; realtime transfer to EMI systems (CCOF §K.iv). | A | P1 |
| NFR-E03 | No OTP values in logs. Idempotency keys on all POSTs. | A/B | P0 |
| NFR-E04 | Tracking/status endpoints: rate-limit; no ID-or-CNIC enumeration. | A | P0 |
| NFR-E05 | Cloud per BPRD 01/2023. No offshore outsourcing without SBP written approval. | A | P1 |
| NFR-E06 | Systems audit (SBP-approved panel) **before pilot** and **annually**. | A | Process |
| NFR-E07 | Security breach: notify including PSP&OD; detailed report **15 days**. Major cyber: **48 hours**. | A | Process |
| NFR-E08 | BCP/DRP drills: half-yearly first two pilot years, quarterly thereafter. | A | Process |
| NFR-E09 | Individual KYC decision path designed so complete files can finish within **2 WD** (STP where policy allows). | A | P1 |
| NFR-E10 | Ledger limit check is authoritative vs UI (defence in depth). | A | P1 |

---

## 6. States and APIs (normative pointers)

**Identity Service** is the **only** writer of KYC states (`identity_db`). Ledger reads a **replica** of `limit_tier` + `wallet_status` in `ledger_db` and enforces caps. See [07](07-database-and-erd.md).

Happy path: `INITIATED` → `CONTACT_VERIFIED` → `CONSENT_CAPTURED` → `IDENTITY_CAPTURED` → `LIVE_PHOTO_CAPTURED` → screening → NADRA → `WALLET_ACTIVE` (`VERISYS` then optional `BV` / `ENHANCED`).

Fail closed: sanctions → `REJECTED`; one-credit fail → `CLOSED_UNVERIFIED`; NADRA 503 → stay in progress.

Logical API: [09-api-specification.md](09-api-specification.md) (`POST /kyc/applications` returns `trackingId`; agent API has no issue-wallet).

---

## 7. Traceability (requirement → journey)

| FR | Primary journeys / system UC |
|----|------------------------------|
| FR-E01–E05, E08 | UJ-E01, UJ-E09, UJ-E19 |
| FR-E06–E07 | UJ-E01, UJ-E06 |
| FR-E09–E12 | UJ-E01, UJ-E18 |
| FR-E13–E14 | UJ-E05 |
| FR-E15–E18 | UJ-E04, UJ-E10, UJ-E11 |
| FR-E19–E23 | UJ-E01, UJ-E02, UJ-E07, UJ-E08 |
| FR-E24–E30 | UJ-E01–E03, UC-S03, UC-S04 |
| FR-E31 | UJ-E03 |
| FR-E32–E34 | UJ-E13–E16 |
| FR-E35–E36 | UJ-E12 |
| FR-E37–E40 | UJ-E18, UJ-E20, UC-S04 |

Clause-level mapping remains in [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md) and [Appendix A](appendices/A-regulatory-requirement-catalog.md).

---

## 8. Phased delivery vs SRS

| Phase | Must satisfy |
|-------|----------------|
| P0 | FR-E01–E03, E06–E10, E12–E14, E29, E39, NFR-E01, E03, E04 |
| P1 | FR-E04–E05, E11, E15–E19, E22, E24–E25, E27–E28, E30, E37 |
| P2 | FR-E20–E21, E26 |
| P3 | FR-E17 |
| P4 | FR-E35–E36, E38, UJ-E20 |
| P5 | FR-E31 |
| P6 | FR-E32–E34 |

Use cases that are P5/P6 stay in the catalog even if v1 flags them off — the paragraph exists in the regulations.

# 5–7. SBP EMI KYC / CDD / Wallet Onboarding Framework

> Primary EMI source: **Regulations for EMIs** (1 Apr 2019; revised **21 Jun 2023**).  
> Primary onboarding source for process: **Consolidated Customer Onboarding Framework** (BPRD Circular No. 01 of 2025) — EMIs are in scope; **limits stay in EMI §14**.  
> Primary AML: **AML/CFT/CPF Regulations for SBP-REs**.  
> Classification: **A** mandatory · **B** expectation · **C** industry practice · **D** EMI-specific.  
> Not legal advice.

Clause catalog: [appendices/A-regulatory-requirement-catalog.md](appendices/A-regulatory-requirement-catalog.md).

---

## 5. EMI Regulations — Customer Due Diligence (§12) (**A**)

Digital onboarding is the **default** (“shall make their customer on boarding process digital”) subject to AML/risk.

### 5.1 Minimum collection at issuance

| Field | Notes |
|-------|--------|
| Name | |
| Father / spouse name | |
| ID | CNIC, NICOP, POC, Passport, Alien Registration Card, **POR for Afghan refugees** |
| Mobile number | |
| Residential address | |
| Any other **two** fields **not** on CNIC | e.g. place of birth, mother’s name |
| Live original CNIC **and** live digital photo | “where applicable” — Consolidated Framework makes live photo **A** for digital/remote opening |

**Also apply Consolidated Table-A** (purpose, SoI, FATCA/CRS, PEP declaration, occupation, etc.) because EMIs are SBP REs with customer relationships. Do not under-collect vs Table-A to “match a wallet FAQ.”

### 5.2 Activation gates (**A**)

1. **Two-factor authentication** for customer verification.  
2. Verify particulars in §12(I)–(II).  
3. **Pre-screen** designated/proscribed persons **before** initiating the relationship **or** allowing use of payment services.  
4. Customer **consent** to T&Cs including charges; T&Cs available via email, website, app, IVR, etc.  
5. **One CNIC → one e-money instrument with this EMI.**  
6. **Real-time transaction alerts** for all transactions.  
7. Identify suspicion at issuance or processing → **STR to FMU**.  
8. Domestic + international **TFS**: freeze; do not serve UNSC / ATA designated or proscribed persons.

### 5.3 One unverified credit, then fail-closed (**A**)

EMI **may** allow **one** credit / fund-transfer **before** verification of credentials. If credentials are **not** verified:

- Close the e-money instrument / account  
- File **STR**

Do **not** leave an unverified wallet operable. Product copy must not look like a free anonymous prepaid.

### 5.4 EDD (**A**)

EDD for customers categorised **high risk** under SBP AML/CFT regulations and RBA guidelines. Consolidated Framework adds recorded **video KYC** for NFTF EDD.

---

## 6. Consolidated Customer Onboarding Framework (EMIs)

**Circular:** BPRD Circular No. 01 of 2025 (25 July 2025)  
**PDF:** https://bafblob.blob.core.windows.net/data/circulars/sbp/C1-Consolidated-Customer-Onboarding-Framework.pdf  

**§B scope (**A**):** Banks, DFIs, MFBs, Digital Banks **and EMIs**.

**Footnote 1 (**A**):** Limits and other instructions on e-money instruments/wallets are governed by **EMI Regulations**.

### 6.1 Digital eligibility (**A**)

Digital onboarding IDs: **CNIC / NICOP / POC / POR / ARC** (AML definitions). Passport-only without ARC is **not** on the digital allow-list.

### 6.2 Identity verification ladder (digital wallet opening) (**A**)

Same hierarchy as banks, with EMI naming:

1. **NADRA BV** (finger/thumb, iris, or facial) for CNIC/NICOP/POC/ARC/POR **before** establishing the relationship — in-app, in-branch, or other authenticated means.  
2. **Verisys alternate** for: disability / unclear prints; seniors **>60**; NRP/POC **abroad** until BV is available.  
3. Digital/remote (except specified Asaan Mobile exceptions that **do not** apply to EMIs as bank products): **live photo** of customer with valid ID.  
4. For **digital banks and EMIs without physical presence**, if BV + MSISDN pairing still fail: **recorded video KYC + NADRA Verisys**; record why BV was not met; optional **third-party reliance** on a bank with physical presence.

**Design implication:** A greenfield EMI typically has **no branches**. Budget video KYC + Verisys + (optional) partner-bank BV. Public EMIs also use **NADRA e-Sahulat** or **partner ATM BVS** as authenticated BV channels (**C/D**).

### 6.3 TAT, tracking, decline, resume (**A**)

| Control | Rule |
|---------|------|
| Individual decision TAT | **2 working days** from complete wallet-opening documents |
| Entity TAT | **5 working days** |
| Decline | **Specific reason in writing** |
| Tracking | System-generated tracking ID; web + in-app (and branches if any) |
| Resume | Incomplete application typically **≤ 30 days** (Consolidated) |
| One wallet | “EMI shall also ensure that an individual/entity can open only **one wallet** with it” (Consolidated uniqueness language — aligns with EMI §12.VII for CNIC) |

### 6.4 Security circulars cited by Consolidated §K (**A** where applicable)

- PSP&OD Circular No. 01 of 2022 — Mobile App Security Guidelines  
- BPRD Circular No. 04 of 2023 — Digital banking products security  
- PSD Circular No. 09 of 2018 — Security of Digital Payments  
- BPRD Circular No. 05 of 2017 — Enterprise Technology Governance  

---

## 7. Wallet limit ladder (EMI §14) (**A**)

Payments and receipts are **separate** limit buckets on EMI instruments.

### 7.1 Pilot vs commercial

| Verification | Pilot monthly **load** | Commercial monthly **load** | Cash-out |
|--------------|------------------------|-----------------------------|----------|
| NADRA **Verisys** (CNIC verification) | PKR **50,000** | PKR **50,000** | **PKR 10,000 / day** (commercial Verisys; pilot: 10,000/day with BV **or** 2FA) |
| NADRA **biometric** | PKR **200,000** | PKR **400,000** | Commercial: EMI sets cash-out from **risk profile**. ATM cash-out: **2FA**. Agent cash-out: BV **or** 2FA if BVS is a major challenge |

### 7.2 Enhanced wallets (commercial licence + PSP&OD approval)

Up to **PKR 1,000,000** individual instrument limits if **all** of:

1. Income proof and source of funds (**Annexure-J**)  
2. **CNIC/SIM pairing** of the device on which the instrument is opened  
3. **TMS** with robust scenarios (one-to-many, many-to-one, etc.)  
4. Detailed **customer risk profiling**  

Verification of (1)–(4) **must not be outsourced**.

### 7.3 Minors

| Product | Linkage | Monthly load | Cash-out | Funding |
|---------|---------|--------------|----------|---------|
| Basic minor | Parent/guardian wallet **only**, via **their app** | PKR **50,000** Verisys | PKR **10,000**/day | Parent/guardian wallet **only** |
| Enhanced minor (freelancer) | Same linkage | PKR **400,000** **BV** | PKR **10,000**/day | Parent/guardian **or** EMI-verified income sources |

Plus: guardian digital/written **undertaking** of liability; TMS; EMI + AML CDD on minor path; **§14.I–III enhanced adult limits do not apply** to minors; record retention per §24.II.

Consolidated digital ID list is adult CNIC-family — **confirm Legal** before remote Form-B/Juvenile minor opening.

### 7.4 Exclusions from wallet limits (apply to SBP; BV holders; **not** minors)

Fully licensed EMIs with a proven compliance track record **may apply** to exclude from limits:

1. **Salary credit** from employer via authorised FI (employer’s nominated bank) — EMI must verify employer  
2. **Inward remittances** via Authorized Dealers **up to PKR 1,500,000**  
3. **Utility bill payments**

### 7.5 Issuance, funding, redemption (§15) (**A**)

- Issue **at par**, without delay, on receipt of funds.  
- Fund via **IBFT** (any ADC) or **cash-in** at EMI locations / agents / ATMs / bank branches **subject to BV**.  
- Redeem at par **any time**, **no charges**; **cash redemption requires BV**.

---

## AML/CFT overlay (EMI §22 + AML regs) (**A**)

- Automated **TMS** to monitor for ML/TF.  
- Risk-based approach; comply with **all** SBP AML/CFT laws, guidelines, regulations.  
- **New product / technology** ML/TF risk assessment **before** launch (Reg–12 analogue).  
- Record retention: EMI §24.II — **at least 10 years** or as required by law; call-centre recordings **1 year**; CDD records after end of relationship per relevant laws. (AML regs commonly cite 5 years — **implement the stricter applicable rule; Legal to confirm**.)  
- Annual audited FS within 3 months of year-end; quarterly capital returns; trust balances; fraud/cyber reporting (**48 hours** for major cyber; Annexure F).

---

## Practical interpretation for engineering

| Event | System must |
|-------|-------------|
| Signup | Collect §12 + Table-A; 2FA; consents; tracking ID **on screen** before SMS (no mobile yet) |
| First credit optional | Flag `unverified_one_credit`; timer; if NADRA/screen fail → close + STR queue |
| Verisys pass, no BV | `WALLET_ACTIVE` + `limit_tier=VERISYS` + 50k load / 10k cash-out |
| BV pass | `limit_tier=BV` + 400k load; cash-out from CRP |
| Enhanced approved | `limit_tier=ENHANCED`; Annexure-J artefacts; SIM pairing; TMS scenarios on |
| Duplicate CNIC | Block new instrument; route to existing login |
| Sanctions true match | No services; freeze; STR/TFS ops — customer gets **written** decline |
| Agent | Cash-in/out only; never `POST /wallets` from agent channel |

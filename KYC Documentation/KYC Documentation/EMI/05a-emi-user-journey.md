# 11a. EMI customer journey (screens)

> Illustrative UX (**D**). Regulatory steps **A** where marked. Fictional persona. Not legal advice.  
> Related: [05b-emi-user-journeys-catalog.md](05b-emi-user-journeys-catalog.md), [diagrams/03-emi-kyc-spine.mmd](diagrams/03-emi-kyc-spine.mmd)

**Pack home:** [index.html](index.html)  
**Interactive explorer:** [05c-emi-interactive-journeys.html](05c-emi-interactive-journeys.html)  
**All 20 workflows (PDF):** [05c-emi-customer-journeys.pdf](05c-emi-customer-journeys.pdf)

**Persona:** Ayesha — resident CNIC, first EMI wallet, wants to pay merchants and receive IBFT.

## Happy path — Verisys wallet then BV upgrade

### Step 0 — Open wallet + Tracking ID (**A** tracking; **D** placement)

- Customer taps **Open wallet**.  
- System creates application; **shows Tracking ID in-app**.  
- **Do not SMS yet** — mobile not bound.  
- State: `INITIATED`.

### Step 1 — Mobile OTP / 2FA (**A**)

- PTA-registered mobile; OTP.  
- Fail: stay `INITIATED`; lockout **D** with cool-down.  
- Success: `CONTACT_VERIFIED`; **then** SMS Tracking ID.

### Step 2 — Consents (**A**)

- T&Cs, privacy, fee schedule, NADRA/BV purpose (EN/UR).  
- Marketing off by default (**C**).  
- Mandatory unchecked → cannot continue.

### Step 3 — Identity (**A**)

- CNIC/NICOP/POC/POR/ARC (digital allow-list).  
- EMI §12: name, father/spouse, ID, mobile, address, **two extra non-CNIC fields**, live CNIC image.  
- Consolidated Table-A: occupation, SoI, purpose, FATCA/CRS, PEP declare, addresses.  
- Uniqueness check on CNIC hash → if hit, **You already have a wallet** (UJ-E05).

### Step 4 — Live photo (**A** digital)

- Live digital photo vs ID portrait.  
- Encrypted upload; nothing stored on device (**B/C**).  
- Liveness optional anti-impersonation (**B/C**) — **not** NADRA BV.

### Step 5 — Screening (**A**)

- Customer sees **Under review** / progress. **Never** list names.  
- UNSC + ATA + PEP + watchlist.  
- Provider down: **hold**, no activate.

### Step 6 — NADRA Verisys (**A** for 50k tier)

- Activate only after §12 verification **and** pre-screen.  
- Success → `WALLET_ACTIVE` · `limit_tier=VERISYS` · monthly load **50,000** · cash-out **10,000/day**.  
- Banner: **Biometric verification increases your monthly limit** (copy **D**; limit **A**).

### Step 7 — Optional one-credit (**A** if enabled)

- Product flag. If used: `unverified_one_credit` must already be cleared by Step 6 in the recommended path.  
- **Recommended:** do **not** enable spend/receive until Verisys+screen pass (stricter than the allowed one-credit). If Legal enables it, enforce close+STR on fail.

### Step 8 — Home (**D**)

- Balance, IBAN-like / Raast proxy when live, debit card CTA.  
- Persistent **Increase limit** for BV.

## BV upgrade (UJ-E02)

1. In-app fingerprint/face BV **or** NADRA e-Sahulat / partner ATM (**D** channels).  
2. NADRA BV success → `limit_tier=BV` · **400,000**/month (commercial) or **200,000** (pilot).  
3. Cash-out limit from CRP (**A**).  
4. Fail: retry cap; video KYC / e-Sahulat (**A/C**).

## Enhanced 1M (UJ-E03) — after commercial + PSP&OD

- Upload Annexure-J SoF/income.  
- CNIC–SIM pairing on the device.  
- CRP + TMS scenarios.  
- **Do not outsource** this verification.  
- Customer waits; outcome written.

## QA (happy path)

| ID | Check |
|----|--------|
| J-E01 | Tracking ID visible before OTP |
| J-E02 | SMS only after OTP |
| J-E03 | Duplicate CNIC blocked with login copy |
| J-E04 | Verisys wallet cannot load above 50k |
| J-E05 | BV upgrades to 400k only after NADRA BV, not selfie |
| J-E06 | Sanctions hit never STP |
| J-E07 | Agent channel cannot call issue-wallet |

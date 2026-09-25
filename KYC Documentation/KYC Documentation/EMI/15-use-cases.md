# 15. Use cases — EMI wallet KYC / CDD

> Customer and system use cases traced to [14-srs.md](14-srs.md) and journeys UJ-E01–E20.  
> Customer-facing only in the main flows. Ops/STR detail: [10-aml-risk-edd-ops.md](10-aml-risk-edd-ops.md).  
> **Not legal advice.** Fictional personas. Do not invent NADRA APIs.

| Use case | Journey | Goal |
|----------|---------|------|
| [UC-E01](#uc-e01--open-verisys-wallet) | UJ-E01 | First wallet at Verisys 50k |
| [UC-E02](#uc-e02--upgrade-to-nadra-bv) | UJ-E02 | Raise to BV 400k (pilot 200k) |
| [UC-E03](#uc-e03--request-enhanced-1m) | UJ-E03 | Enhanced 1M after PSP&OD |
| [UC-E04](#uc-e04--one-credit-then-close) | UJ-E04 | Fail-closed unverified credit |
| [UC-E05](#uc-e05--block-duplicate-cnic) | UJ-E05 | One instrument per CNIC |
| [UC-E06](#uc-e06--complete-otp--2fa) | UJ-E06 | Bind mobile or stay INITIATED |
| [UC-E07](#uc-e07--handle-bv-failure) | UJ-E07 | Stay 50k or video KYC |
| [UC-E08](#uc-e08--survive-nadra-outage) | UJ-E08 | No silent 400k |
| [UC-E09](#uc-e09--track-application--tat) | UJ-E09 | Status + 2 WD notify |
| [UC-E10](#uc-e10--decline-sanctions-match) | UJ-E10 | Fail closed |
| [UC-E11](#uc-e11--complete-pep--edd) | UJ-E11 | Video KYC + ops approval |
| [UC-E12](#uc-e12--agent-cash-inout) | UJ-E12 | Cash without issuing |
| [UC-E13](#uc-e13--open-basic-minor-wallet) | UJ-E13 | Guardian-linked 50k |
| [UC-E14](#uc-e14--open-minor-freelancer-wallet) | UJ-E14 | Guardian-linked 400k BV |
| [UC-E15](#uc-e15--apply-remittance-exclusion) | UJ-E15 | AD inward up to 1.5m |
| [UC-E16](#uc-e16--apply-salary-exclusion) | UJ-E16 | Employer credit via nominated bank |
| [UC-E17](#uc-e17--open-merchant--entity-wallet) | UJ-E17 | Phase 2 entity |
| [UC-E18](#uc-e18--refuse-mandatory-consents) | UJ-E18 | No issue |
| [UC-E19](#uc-e19--resume-within-30-days) | UJ-E19 | Continue incomplete file |
| [UC-E20](#uc-e20--complete-kyc-refresh) | UJ-E20 | Ongoing CDD |
| [UC-S01](#uc-s01--show-and-lookup-tracking-id) | — | Tracking without extra PII |
| [UC-S02](#uc-s02--pre-screen-tfs) | — | Screen before services |
| [UC-S03](#uc-s03--enforce-limit-on-posting) | — | Ledger rejects over-cap |
| [UC-S04](#uc-s04--alert-every-transaction) | — | Real-time alert |

---

## Conventions

- **Main success** is the customer-visible happy path.  
- **Extensions** are numbered from the step they branch.  
- **Class** A/B/C/D as in the pack README.  
- System actors: KYC Service writes states; Ledger posts money; NADRA adapter returns **refs** only.

---

## UC-E01 — Open Verisys wallet

| | |
|--|--|
| Actor | Customer (Ayesha — resident CNIC) |
| Goal | Receive a usable e-money instrument at **PKR 50,000**/month load |
| Trigger | Taps **Open wallet** |
| Preconditions | Eligible digital ID (happy path: CNIC/SNIC). No open instrument at this EMI. `licence_phase` set. |
| Success | `WALLET_ACTIVE`, `limit_tier=VERISYS`. Cash-out **10,000**/day. Tracking ID known. |
| FR | FR-E01–E12, E13, E15–E16, E19, E24–E25, E28–E30 |
| Class | **A** EMI §12, §14.II, CCOF live photo / TAT |

**Main success**

1. Customer opens app/web and taps Open wallet.  
2. System creates application (`INITIATED`), captures channel / device hash / IP / geo if permitted.  
3. System shows **Tracking ID on screen** (no SMS).  
4. Customer enters mobile; completes OTP (**UC-E06**). State `CONTACT_VERIFIED`. System SMSes Tracking ID.  
5. Customer accepts versioned consents (**UC-E18** if refuse). `CONSENT_CAPTURED`.  
6. Customer submits §12 + Table-A identity. Uniqueness check (**UC-E05**). `IDENTITY_CAPTURED`.  
7. Customer captures live photo + live CNIC where applicable. Encrypted upload; nothing left on device. `LIVE_PHOTO_CAPTURED`.  
8. System pre-screens TFS/PEP (**UC-S02**).  
9. System starts NADRA **Verisys**.  
10. Verisys and screen clear → issue instrument at par when funded. `WALLET_ACTIVE` / `VERISYS`.  
11. Customer sees **Wallet ready — 50,000/month**. Ledger enforces caps (**UC-S03**). Alerts on postings (**UC-S04**).

**Extensions**

- 4a. OTP fail → stay `INITIATED` (UC-E06).  
- 6a. Duplicate CNIC → UC-E05; stop.  
- 8a. True match → UC-E10; stop.  
- 8b. PEP / high CRP → UC-E11.  
- 9a. NADRA down → UC-E08.  
- 9b. Product flag one-credit → UC-E04.

---

## UC-E02 — Upgrade to NADRA BV

| | |
|--|--|
| Actor | Customer with `WALLET_ACTIVE` / `VERISYS` |
| Goal | Raise monthly load to **400k** commercial or **200k** pilot |
| Trigger | Taps **Increase limit** / biometric upgrade |
| Preconditions | Verisys wallet active. Screening still clear. |
| Success | Same wallet; `limit_tier=BV`. Banner shows new load. Selfie did not do this. |
| FR | FR-E20–E21, E26–E27 |
| Class | **A** EMI §14; channel **D** |

**Main success**

1. Customer requests upgrade.  
2. System presents authenticated NADRA BV (in-app fingerprint **or** e-Sahulat / partner ATM).  
3. NADRA BV success → `limit_tier=BV`. Pilot uses 200k via `licence_phase`.  
4. Ledger applies new policy. No new CNIC instrument.

**Extensions**

- 3a. Eligible BV fail → UC-E07.  
- 3b. Outage → UC-E08.  
- 3c. Face-only camera with no NADRA face product → **not** BV; keep Verisys.

---

## UC-E03 — Request enhanced 1M

| | |
|--|--|
| Actor | Customer with `limit_tier=BV` |
| Goal | Individual instrument limit up to **PKR 1,000,000** |
| Trigger | Taps higher limit / enhanced wallet |
| Preconditions | `licence_phase=COMMERCIAL`. PSP&OD enhanced product **on**. |
| Success | `limit_tier=ENHANCED` after in-house SoF, SIM pairing, TMS, CRP. |
| FR | FR-E31 |
| Class | **A** EMI §14.III |

**Main success**

1. System checks commercial + PSP&OD flag.  
2. Customer uploads Annexure-J income / source of funds.  
3. Customer completes **CNIC/SIM pairing** on the device of this instrument.  
4. System runs detailed CRP and confirms TMS scenarios (1:N, N:1) are live.  
5. Verification of (2)–(4) is **not** sent to an outsourcer.  
6. Written outcome. Customer waits (`EDD_REQUIRED` / review) with Tracking ID visible.

**Extensions**

- 1a. Pilot or flag off → decline with reason; stay BV.  
- 5a. Incomplete SoF → `ADDITIONAL_INFORMATION_REQUIRED`.

---

## UC-E04 — One credit then close

| | |
|--|--|
| Actor | System + customer |
| Goal | Honour §12.IV if product enables it, then fail closed |
| Trigger | One inbound credit before credentials verified |
| Preconditions | Product flag `unverified_one_credit` **on** (pack default **off**) |
| Success | If still unverified: `CLOSED_UNVERIFIED` + STR. Wallet not left operable. |
| FR | FR-E18 |
| Class | **A** |

**Main success (fail closed)**

1. System allows **one** credit only, with timer.  
2. Credentials never verify in time.  
3. System closes instrument, queues **STR**, customer sees closed — not “try spending again.”

---

## UC-E05 — Block duplicate CNIC

| | |
|--|--|
| Actor | Customer (Yasmin) already holding an open instrument |
| Goal | Prevent a second wallet at this EMI |
| Trigger | Open wallet with an ID that already has an open instrument |
| Success | No new application STP. Copy: **You already have a wallet** — login/recovery. |
| FR | FR-E13–E14 |
| Class | **A** EMI §12.VII |

**Main success**

1. Identity captured or hashed at uniqueness check.  
2. System finds open wallet for CNIC hash.  
3. Return `DUPLICATE_CNIC`. Do not create a second `wallets` row.

---

## UC-E06 — Complete OTP / 2FA

| | |
|--|--|
| Actor | Customer |
| Goal | Bind a mobile to the application |
| Trigger | Enter mobile after Tracking ID shown |
| Success | `CONTACT_VERIFIED`; then SMS Tracking ID. |
| Failure | Stay `INITIATED`; remaining attempts shown; cool-down **D**. |
| FR | FR-E06–E08 |
| Class | **A** §12.II |

**Main success**

1. Start OTP. No code in logs.  
2. Customer enters code.  
3. Confirm → bind MSISDN.

**Extensions**

- 2a. Wrong/expired → retry; never skip state.  
- 2b. N fails → lockout cool-down.  
- 2c. Change number → new attempt rules.

---

## UC-E07 — Handle BV failure

| | |
|--|--|
| Actor | Customer (Bilal — unclear prints) or age **>60** / disability |
| Goal | Do not fake BV; keep a legal wallet or video KYC |
| Trigger | NADRA BV fails for an allowed reason |
| Success | Stay `VERISYS` 50k **or** complete recorded video KYC + Verisys. |
| FR | FR-E21 |
| Class | **A** CCOF §F.1 |

**Main success**

1. Record reason BV was not met.  
2. Offer stay-at-50k **or** video KYC (no branch).  
3. Do **not** apply bank debit-block as the EMI happy path.  
4. Do **not** treat selfie as BV.

---

## UC-E08 — Survive NADRA outage

| | |
|--|--|
| Actor | Any customer in NADRA call |
| Goal | Hold without lying |
| Trigger | 503 / timeout from NADRA adapter |
| Success | State stays `IDENTITY_VERIFICATION_IN_PROGRESS`. Resume ≤ 30 days. |
| FR | FR-E22 |
| Class | **A** fail-controlled |

**Main success**

1. Show “verification taking longer” + Tracking ID. No “Wallet ready.”  
2. Idempotent retry.  
3. When vendor recovers, continue UC-E01 or UC-E02.

---

## UC-E09 — Track application + TAT

| | |
|--|--|
| Actor | Customer |
| Goal | Know where the file is; be told if TAT slips |
| Trigger | Uses Tracking ID on app/web; or clock exceeds 2 WD after complete file |
| Success | Status without extra PII. Notify if individual decision > 2 WD. |
| FR | FR-E01–E04 |
| Class | **A** CCOF §I |

---

## UC-E10 — Decline sanctions match

| | |
|--|--|
| Actor | System (screening) |
| Goal | No services to designated/proscribed persons |
| Trigger | Confirmed UNSC / ATA true match |
| Success | `REJECTED`. No wallet. Written reason. STR/TFS ops. Never STP. |
| FR | FR-E15–E16 |
| Class | **A** |

---

## UC-E11 — Complete PEP / EDD

| | |
|--|--|
| Actor | Customer (Sana) + ops |
| Goal | High-risk relationship only after EDD |
| Trigger | PEP declaration or CRP HIGH |
| Success | Recorded video KYC; SoW/SoF as required; senior approval **ops-side**; then continue issuance or upgrade. |
| FR | FR-E17 |
| Class | **A** |

Customer waits with Tracking ID. Ops UI is not a customer journey.

---

## UC-E12 — Agent cash-in/out

| | |
|--|--|
| Actor | Customer + SBP-approved agent |
| Goal | Move cash against an **existing** wallet |
| Trigger | Customer at agent location |
| Success | Cash-in with **BV**. Cash-out BV or 2FA if BVS is a major challenge. ATM cash-out 2FA. Cash **redemption** BV. |
| Forbidden | Agent creates a wallet (`AGENT_CANNOT_ISSUE`). |
| FR | FR-E35–E36 |
| Class | **A** EMI §15, §17 |

---

## UC-E13 — Open basic minor wallet

| | |
|--|--|
| Actor | Guardian (from **guardian app** only) |
| Goal | Linked minor instrument, 50k Verisys |
| Trigger | Guardian starts minor wallet |
| Success | Linked to guardian wallet; funded **only** from guardian; undertaking stored; TMS on. Not adult enhanced table. |
| FR | FR-E32 |
| Class | **A** §14.IV |
| Open | Remote Form-B/Juvenile vs CCOF adult digital ID list — Legal |

---

## UC-E14 — Open minor freelancer wallet

Same linkage as UC-E13. Load **400k** after **NADRA BV**. Funding guardian **or** EMI-verified income. Still **not** adult 1M (**FR-E33**).

---

## UC-E15 — Apply remittance exclusion

| | |
|--|--|
| Actor | BV holder |
| Goal | Inward remittance via AD up to PKR **1,500,000** excluded from load cap |
| Preconditions | SBP **granted** §14.VI exclusion. AD + EPD rails live. Not a minor. |
| FR | FR-E34, A-E20 |
| Class | **A** if granted; else stay on §14 cap |

Do not advertise “any remittance, no cap” on Verisys 50k.

---

## UC-E16 — Apply salary exclusion

Employer credit via nominated bank. EMI **verifies employer**. BV holders. SBP exclusion granted. **FR-E34**.

---

## UC-E17 — Open merchant / entity wallet

| | |
|--|--|
| Actor | Authorised natural person of an entity |
| Goal | One wallet per entity at this EMI |
| Notes | Phase 2. Table-B / UBO. TAT **5 WD**. BV of persons who open/operate; Verisys for other associates. |
| FR | FR-E04 (entity TAT), A-E08 analogue for entity |
| Class | **A** when product ships |

---

## UC-E18 — Refuse mandatory consents

| | |
|--|--|
| Actor | Customer |
| Goal | Leave without an instrument if they refuse T&Cs / NADRA consent |
| Success | No `WALLET_ACTIVE`. Draft save is **D**. |
| FR | FR-E09, FR-E40 |
| Class | **A** |

---

## UC-E19 — Resume within 30 days

| | |
|--|--|
| Actor | Customer who abandoned mid-flow |
| Goal | Continue without restarting from zero |
| Success | Resume last incomplete step if ≤ 30 days. Else `EXPIRED`; new application. |
| FR | FR-E03 |
| Class | **A** CCOF §J.iii |

Tracking ID from Step 0 remains the handle even if OTP never succeeded (pack rule).

---

## UC-E20 — Complete KYC refresh

| | |
|--|--|
| Actor | Customer + scheduler |
| Goal | Ongoing CDD proportionate to CRP |
| Trigger | Periodic clock, CNIC expiry, adverse hit, fraud event, product upgrade |
| Success | Re-screen; restrict **explicitly** if overdue; BV may be re-required for high assurance. |
| FR | A-E19, FR-E15, FR-E39 |
| Class | **A** ongoing CDD; interval policy **B** |

---

## UC-S01 — Show and lookup Tracking ID

| | |
|--|--|
| Actor | KYC Service |
| Goal | CCOF tracking without leaking PII |
| Main | Mint ID at application create; show in-app; public `GET /kyc/tracking/{id}` rate-limited. SMS after OTP only. |
| FR | FR-E01–E02, E08 |
| Class | **A** exist; **D** when to SMS |

---

## UC-S02 — Pre-screen TFS

| | |
|--|--|
| Actor | Screening service |
| Goal | No payment use before list check |
| Main | Screen before `WALLET_ACTIVE` (and before the optional one credit is spent, if that flag is on). Potential hit → `SCREENING_HIT_REVIEW`. True match → UC-E10. |
| FR | FR-E15–E16 |
| Class | **A** |

---

## UC-S03 — Enforce limit on posting

| | |
|--|--|
| Actor | Ledger |
| Goal | §14 caps hold even if the app is wrong |
| Main | `POST /ledger/postings` reads `limit_tier` × `licence_phase`. Over cap → `LIMIT_EXCEEDED`. Payments vs receipts are separate buckets. |
| FR | FR-E24–E27 |
| Class | **A** |

---

## UC-S04 — Alert every transaction

| | |
|--|--|
| Actor | Notify + Ledger hook |
| Goal | Real-time alert on **all** transactions |
| Main | Fire on each posting. Channel **D**. Not a daily digest as the only control. |
| FR | FR-E37 |
| Class | **A** |

---

## Traceability matrix (use case → FR → journey)

| UC | FR (primary) | Journey | Pri |
|----|----------------|---------|-----|
| UC-E01 | FR-E01–E19, E24–E25 | UJ-E01 | P1 |
| UC-E02 | FR-E20, E26 | UJ-E02 | P2 |
| UC-E03 | FR-E31 | UJ-E03 | P5 |
| UC-E04 | FR-E18 | UJ-E04 | P1 (flag) |
| UC-E05 | FR-E13 | UJ-E05 | P0 |
| UC-E06 | FR-E06–E08 | UJ-E06 | P0 |
| UC-E07 | FR-E21 | UJ-E07 | P2 |
| UC-E08 | FR-E22 | UJ-E08 | P1 |
| UC-E09 | FR-E01–E04 | UJ-E09 | P0 |
| UC-E10 | FR-E16 | UJ-E10 | P1 |
| UC-E11 | FR-E17 | UJ-E11 | P3 |
| UC-E12 | FR-E35–E36 | UJ-E12 | P4 |
| UC-E13 | FR-E32 | UJ-E13 | P6 |
| UC-E14 | FR-E33 | UJ-E14 | P6 |
| UC-E15 | FR-E34 | UJ-E15 | P6 |
| UC-E16 | FR-E34 | UJ-E16 | P6 |
| UC-E17 | FR-E04 | UJ-E17 | P6 |
| UC-E18 | FR-E09 | UJ-E18 | P0 |
| UC-E19 | FR-E03 | UJ-E19 | P0 |
| UC-E20 | A-E19 | UJ-E20 | P4 |
| UC-S01 | FR-E01–E02 | — | P0 |
| UC-S02 | FR-E15 | — | P1 |
| UC-S03 | FR-E27 | — | P1 |
| UC-S04 | FR-E37 | — | P1 |

QA IDs J-E01–J-E07 in [05a](05a-emi-user-journey.md) exercise UC-E01, E05, E02, E10, E12. Click-through: [explorer](05c-emi-interactive-journeys.html).

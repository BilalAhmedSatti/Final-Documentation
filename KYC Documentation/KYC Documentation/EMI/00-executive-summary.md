# 1. Executive Summary — Electronic Money Institution

> **Disclaimer:** Technical and regulatory research for building an SBP-licensed **EMI** KYC/onboarding system in Pakistan. **Not legal advice.** Validate with Compliance, Legal, and SBP (PSP&OD / BPRD) before implementation.  
> This pack does **not** replace the Digital Retail Bank pack. EMIs are not banks.

## Verdict

If we build a new **Electronic Money Institution** in Pakistan today, the KYC/onboarding system must:

1. **Satisfy SBP AML/CFT/CPF Regulations** as an SBP-regulated entity (risk-based CDD, EDD, PEPs, TFS, STR/CTR, TMS, record-keeping).  
2. **Implement the Regulations for Electronic Money Institutions** (issued 1 April 2019; **revised 21 June 2023** via PSP&OD Circular No. 03 of 2023) — digital onboarding, NADRA Verisys vs biometric limit ladder, one wallet per CNIC, 2FA, real-time alerts, trust-account safeguarding, no interest on e-money.  
3. **Implement the Consolidated Customer Onboarding Framework** (BPRD Circular No. 01 of 2025) where it applies to **EMIs** — live photo, BV hierarchy for digital wallet opening, geo/IP, sanctions pre-screening, TAT (2 working days individuals), tracking ID, 30-day resume, video KYC fallback for EMIs **without physical presence**. Wallet **limits** stay in the EMI Regulations, not bank product tables.  
4. **Operate under the four-stage EMI licence path:** Initiation → In-Principle Approval → Pilot (limited live) → Commercial / Go-Live — with **pilot vs commercial load limits**.

## What “good” looks like for our EMI

| Layer | Required outcome |
|-------|------------------|
| Customer journey | Mobile-first wallet; TAT ≤ **2 working days** for an individual decision; tracking ID; resume ≤ 30 days; written decline reason |
| Identity | Collect EMI §12 minimum fields + Consolidated Table-A as applicable; 2FA; live photo for digital opening; NADRA Verisys and/or BV |
| Limit ladder | Verisys: **PKR 50,000**/month load (commercial). BV: **PKR 400,000**/month. Enhanced (SBP approval): up to **PKR 1,000,000** with SoF, CNIC–SIM pairing, TMS, CRP — **not outsourced** |
| Screening | UNSC + ATA **before** relationship or payment-service use (**A**). One unverified credit allowed then **close + STR** if credentials fail |
| Uniqueness | One e-money instrument per CNIC **per this EMI** (**A**) |
| Funds | Trust account at ‘A’-rated bank; no co-mingling; 50% cap per trustee if OEB > PKR 300 million |
| Post-onboarding | TMS (**A** for EMI); agent cash-in/out rules; KYC refresh; inward remittance only via Authorized Dealer after SBP FX approval |
| Evidence | Every **A** maps to a component, table, API, and control ([12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md)) |

## EMI cohort (working summary)

Statuses **change**. Prefer SBP press / Payment Systems Review. Cut-off **September 2026**; re-verify.

| Status (working) | Names (public) | Confidence |
|------------------|----------------|------------|
| Commercial / live (reported six as of Feb 2025 SBP statement) | NayaPay; Finja (OPay Pakistan reported); SadaPay; Akhtar Fuiou (Digitt+); E-Processing Systems (OneZapp); Wemsol (Keenu) | High for the Feb 2025 six-name list (SBP statement via press); Medium for later brand aliases |
| Pilot (reported) | HubPay; YAP Pakistan (FY25 review: pilot approvals) | Medium–High (SBP publications + press) |
| In-principle (reported) | Cerisma; Toko Lab; PaySa (industry lists — confirm SBP) | Medium |
| Exited / revoked / withdrawn (industry) | TAG Innovation; Careem Payment Solutions; Checkout; CMPECC | Medium (not a substitute for SBP register) |

**Not EMIs:** JazzCash and EasyPaisa (branchless banking / bank). Mashreq NEO / Easypaisa Bank / Raqami are **digital banks**.

Details: [01-regulatory-landscape-and-emis.md](01-regulatory-landscape-and-emis.md).

## Critical design principles

1. **Wallet ≠ bank account.** Do not copy DRB STP-to-ACTIVE deposit logic. Activation is **e-money issuance** against received funds at par, with a **verification tier** that sets load limits.  
2. **Separate A vs B vs C vs D.** In-app fingerprint BVS is how several EMIs implement NADRA BV (**C/D** channel). NADRA BV itself is **A** for the 400k ladder. Liveness/selfie is **not** a BV substitute.  
3. **No invented NADRA APIs.** Adapters only.  
4. **Fail closed on sanctions.** Fail controlled on NADRA outage (hold / Verisys / video KYC — not silent upgrade).  
5. **Agents must not open wallets.** Cash-in/out and distribution/redemption only, after SBP agent approval.  
6. **Audit everything.** Reconstruct CDD, limit upgrades, trust-account movements, and STRs.

## Open questions (close before build freeze)

- Exact Shared e-KYC onboarding for **EMIs** (CL 22 is addressed to banks; Consolidated Framework still points REs at the platform when operational).  
- NADRA product mix: Verisys vs BioVerisys finger/facial vs MSISDN pairing — contracts.  
- Whether our licence phase is **pilot** (200k BV load) or **commercial** (400k BV load).  
- Enhanced 1M wallet: PSP&OD approval package and Annexure-J evidence list.  
- Merchant / entity wallets vs individual-only in Phase 1.  
- Cross-border cards / remittance: Exchange Policy Department approval via an Authorized Dealer.

## Reading path

1. This summary  
2. [02-sbp-emi-kyc-cdd-framework.md](02-sbp-emi-kyc-cdd-framework.md)  
3. [05a-emi-user-journey.md](05a-emi-user-journey.md) + [05b-emi-user-journeys-catalog.md](05b-emi-user-journeys-catalog.md)  
4. [06-architecture-and-services.md](06-architecture-and-services.md) + [08-state-machine.md](08-state-machine.md)  
5. [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md)

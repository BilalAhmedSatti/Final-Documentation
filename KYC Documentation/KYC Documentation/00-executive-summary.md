# 1. Executive Summary

> **Disclaimer:** This document is a technical and regulatory research reference for building a Conventional Digital Retail Bank (DRB) KYC/onboarding system in Pakistan. It is **not legal advice**. Validate with Compliance, Legal, and SBP correspondence before implementation.

## Verdict

If we build a new **Conventional Digital Retail Bank** in Pakistan today, our KYC/onboarding system must:

1. **Satisfy SBP AML/CFT/CPF Regulations** (risk-based CDD, EDD, PEPs, sanctions/TFS, STR/CTR, record-keeping, ongoing monitoring).  
2. **Implement the Consolidated Customer Onboarding Framework** (BPRD Circular No. 01 of 2025, 25 July 2025) as the current consolidated account-opening rulebook for individuals and entities — including digital-only onboarding, biometric/NADRA verification hierarchy, live photo, geo/IP capture, sanctions pre-screening, TAT, tracking ID, session resume, and security controls.  
3. **Integrate (or prepare to integrate) the Shared e-KYC Platform** (BPRD Circular Letter No. 22 of 2023) on a **consent-gated, bank-held-data, DLT** model when operational — with a full local KYC path when shared data is unavailable.  
4. **Operate under the Digital Banks licensing path** (BPRD Circular No. 01 of 2022): NOC → IPA → restricted/pilot license → commercial DRB operations — with technology, data, and AML controls proportionate to pilot vs commercial phases.

## What “good” looks like for our bank

| Layer | Required outcome |
|-------|------------------|
| Customer journey | Mobile-first onboarding ≤ **2 working days** decision TAT for individuals; tracking ID; resume ≤ 30 days; clear decline reasons |
| Identity | CNIC/NICOP/POC/POR/ARC; NADRA biometric (preferred) or tiered Verisys + MSISDN pairing + OTP/callback; live photo for digital onboarding |
| Screening | UNSC + ATA proscribed lists pre-relationship; PEP treatment per AML regs; adverse media as risk control (**B/C**) |
| Risk | Documented Customer Risk Profile (CRP) model; EDD + video KYC when high risk / non-face-to-face EDD |
| Decisioning | Straight-through for low risk; case management + maker-checker for hits/high risk |
| Post-onboarding | Transaction monitoring, periodic refresh, remediation, dormancy handling |
| Architecture | KYC-owned state machine; adapters for NADRA/e-KYC; AML/PEP/sanctions services; immutable audit |
| Evidence | Every SBP **A** requirement maps to a component, table, API, and control (see [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md)) |

## Digital bank cohort (summary)

Five institutions received NOCs / IPAs under SBP’s initial DRB cohort. **Statuses are not equal** (as of research cut-off September 2026; verify before decisions):

| Institution | Working status summary | Confidence |
|-------------|------------------------|------------|
| Easypaisa Bank Limited | Commercial DRB; scheduled bank (SBP notification Jan 2025) | High (SBP primary) |
| Mashreq Bank Pakistan Limited | Restricted/pilot DRB license (SBP press Feb 2025); public NEO app onboarding | High (SBP press + bank T&Cs) |
| Raqami Islamic Digital Bank Limited | Commercial DRB / scheduled path in 2026 (Islamic — process benchmark only) | Medium–High (SBP notification reports + bank) |
| HugoBank Limited | IPA historically; later pilot-authorization reports (2026) | Medium (prefer SBP confirmation) |
| KT Bank / Buraq Bank | IPA / readiness; SECP rename reports | Medium (prefer SBP confirmation) |

Details and citations: [01-regulatory-landscape-and-digital-banks.md](01-regulatory-landscape-and-digital-banks.md).

## Critical design principles

1. **Separate A vs B vs C vs D** — never ship selfie/liveness as “SBP mandatory” unless the Consolidated Framework or AML regs require that exact control. Liveness/AI facial checks are **encouraged** (**B/C**) under security section K; biometric verification from NADRA is **A**.  
2. **No invented APIs** — NADRA, shared e-KYC, and bank vendor contracts are obtained under NDA/onboarding; this pack defines **capabilities and adapters**, not proprietary payloads.  
3. **Fail closed on sanctions hits; fail safe on BV** — use the framework’s tiered debit-block / video KYC / third-party reliance paths for digital banks without branches.  
4. **Audit everything** — KYC decisions must be reconstructible for SBP inspection and FMU reporting.

## Open questions (must close before build freeze)

- Exact Shared e-KYC participation onboarding steps with PBA/SBP at go-live date.  
- NADRA product(s): BioVerisys finger/facial, Verisys, MSISDN pairing — commercial contracts.  
- Pilot vs commercial limit regimes for our DRB phase.  
- CRP model thresholds and documentary evidence policy for low-risk self-declaration (Annex-B).  
- Whether entity onboarding is Phase 1 or Phase 2 (this pack designs individuals in depth; entities at data/requirements level).

## Reading path for implementation kickoff

1. This summary  
2. [02-sbp-kyc-cdd-framework.md](02-sbp-kyc-cdd-framework.md)  
3. [05a-kyc-user-journey.md](05a-kyc-user-journey.md) (customer screens) + [05b-kyc-user-journeys-catalog.md](05b-kyc-user-journeys-catalog.md) (all customer journeys) + [05-recommended-kyc-process.md](05-recommended-kyc-process.md)  
4. [06-architecture-and-services.md](06-architecture-and-services.md) + [08-state-machine.md](08-state-machine.md)  
5. [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md)

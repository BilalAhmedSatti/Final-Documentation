# Pakistan Electronic Money Institution (EMI) KYC / CDD Documentation Pack

**Open this pack in a browser:** [index.html](index.html) — cover, onboarding ladder, role guides, and document library. **Guided reading (Takaful-style):** [docs/index.html](docs/index.html). Each markdown note also has a matching `.html` preview (for example [02-sbp-emi-kyc-cdd-framework.html](02-sbp-emi-kyc-cdd-framework.html)).

**Journeys:** [interactive explorer](05c-emi-interactive-journeys.html) · [all 20 as PDF](05c-emi-customer-journeys.pdf)

**Audience:** Product Manager, Solution Architect, Backend Developer, Database Architect, KYC/AML Compliance Officer, QA Engineer  
**Institution model:** SBP-licensed **Electronic Money Institution** (non-bank e-money issuer)  
**Research date:** September 2026  
**Status:** Technical / regulatory research reference — **not legal advice**

This folder is **separate** from the Conventional Digital Retail Bank pack in the parent directory. Do not treat DRB deposit-account rules as EMI wallet rules.

Confirm all normative interpretations with SBP (PSP&OD and BPRD as applicable), internal Compliance, and Legal before go-live. Do not treat industry wallet FAQs as SBP mandates.

---

## How this pack differs from the digital bank pack

| Topic | Digital Retail Bank | EMI |
|-------|---------------------|-----|
| Legal nature | Bank (BCO 1962 / digital bank framework) | Non-bank issuer of **e-money** (PS&EFT Act 2007) |
| Customer product | Deposit / current / savings account | Prepaid **e-money wallet / instrument** |
| Interest on balances | Bank products may pay return | **Must not** pay interest/return or add monetary value for holding e-money |
| Lending public funds | Banking business | **Prohibited** (except permitted investment of safeguarded funds) |
| Funds location | Bank’s own books | **Trust account** at an ‘A’-rated licensed bank (Trustee) |
| Limit source | Product + AML + Consolidated Framework | **EMI Regulations §14** + Consolidated Framework for onboarding |
| One relationship | CNIC uniqueness for CIF (AML / policy) | **One e-money instrument per CNIC per EMI** (**A**) |

---

## How to use this pack

| Role | Start here | Then read |
|------|------------|-----------|
| Compliance / Legal | [00-executive-summary.md](00-executive-summary.md), [02-sbp-emi-kyc-cdd-framework.md](02-sbp-emi-kyc-cdd-framework.md) | [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md), [appendices/A-regulatory-requirement-catalog.md](appendices/A-regulatory-requirement-catalog.md) |
| Product | [00-executive-summary.md](00-executive-summary.md), [05a-emi-user-journey.md](05a-emi-user-journey.md) | [05-recommended-emi-kyc-process.md](05-recommended-emi-kyc-process.md), [04-emi-benchmarks.md](04-emi-benchmarks.md) |
| UX / QA | [05a-emi-user-journey.md](05a-emi-user-journey.md), [05b-emi-user-journeys-catalog.md](05b-emi-user-journeys-catalog.md), [05c-emi-interactive-journeys.html](05c-emi-interactive-journeys.html), [05c-emi-customer-journeys.pdf](05c-emi-customer-journeys.pdf) | [08-state-machine.md](08-state-machine.md) |
| Solution / Backend | [06-architecture-and-services.md](06-architecture-and-services.md), [08-state-machine.md](08-state-machine.md) | [09-api-specification.md](09-api-specification.md), [14-srs.md](14-srs.md), [15-use-cases.md](15-use-cases.md) |
| DBA | [07-database-and-erd.md](07-database-and-erd.md) | [diagrams/08-identity-erd.mmd](diagrams/08-identity-erd.mmd), [diagrams/08-identity-databases.mmd](diagrams/08-identity-databases.mmd) |
| Security | [11-security-fraud-audit.md](11-security-fraud-audit.md) | [06-architecture-and-services.md](06-architecture-and-services.md) |

---

## Document map

| # | Topic | File |
|---|--------|------|
| — | Pack home (open in browser) | [index.html](index.html) |
| — | Guided docs (role paths, decisions, domain) | [docs/index.html](docs/index.html) |
| 1 | Executive summary | [00-executive-summary.md](00-executive-summary.md) |
| 2–4 | Regulatory landscape & licensed EMIs | [01-regulatory-landscape-and-emis.md](01-regulatory-landscape-and-emis.md) |
| 5–7 | EMI CDD, Consolidated Framework, wallet limits | [02-sbp-emi-kyc-cdd-framework.md](02-sbp-emi-kyc-cdd-framework.md) |
| 8 | Shared e-KYC and EMI | [03-shared-ekyc-and-emi.md](03-shared-ekyc-and-emi.md) |
| 9–10 | Public EMI KYC benchmarks | [04-emi-benchmarks.md](04-emi-benchmarks.md), [appendices/B-comparative-emi-matrix.md](appendices/B-comparative-emi-matrix.md) |
| 11 | Recommended wallet KYC process | [05-recommended-emi-kyc-process.md](05-recommended-emi-kyc-process.md) |
| 11a | Customer screens (happy path + upgrade) | [05a-emi-user-journey.md](05a-emi-user-journey.md) |
| 11b | All EMI customer journeys | [05b-emi-user-journeys-catalog.md](05b-emi-user-journeys-catalog.md) |
| 11c | Interactive journey explorer (open in browser) | [05c-emi-interactive-journeys.html](05c-emi-interactive-journeys.html) |
| 11d | All 20 customer journeys as one PDF | [05c-emi-customer-journeys.pdf](05c-emi-customer-journeys.pdf) |
| 12 | Architecture | [06-architecture-and-services.md](06-architecture-and-services.md) |
| 13–14 | Identity Service data model and ERD | [07-database-and-erd.md](07-database-and-erd.md) |
| 15 | State machine | [08-state-machine.md](08-state-machine.md) |
| 16 | API specification | [09-api-specification.md](09-api-specification.md) |
| 17–21 | AML, TMS, EDD, agents, refresh | [10-aml-risk-edd-ops.md](10-aml-risk-edd-ops.md) |
| 22–24 | Security, fraud, audit | [11-security-fraud-audit.md](11-security-fraud-audit.md) |
| 25–26 | Compliance mapping | [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md) |
| 27–29 | Implementation, gaps, references | [13-implementation-gaps-references.md](13-implementation-gaps-references.md) |
| 30 | Software requirements (SRS) | [14-srs.md](14-srs.md) |
| 31 | Use cases (UC-E01–E20, UC-S01–S04) | [15-use-cases.md](15-use-cases.md) |

---

## Classification legend

| Tag | Meaning |
|-----|---------|
| **A** | Mandatory regulatory requirement (SBP / law) |
| **B** | Regulatory expectation / effective AML-KYC control |
| **C** | Industry best practice (not explicitly mandated as a specific tech) |
| **D** | EMI-specific implementation choice |

---

## Source priority

1. State Bank of Pakistan (PSP&OD EMI Regulations; BPRD Consolidated Onboarding Framework; AML/CFT/CPF Regulations)  
2. PS&EFT Act, 2007; AML Act, 2010  
3. Financial Monitoring Unit  
4. Official EMI help centres / T&Cs (public KYC signals only)  
5. Reputable industry sources (supplementary; mark confidence)

Where an EMI does not publicly disclose a control, this pack records **Not publicly disclosed**.

# Pakistan Digital Bank KYC / CDD Documentation Pack

**Audience:** Product Manager, Solution Architect, Backend Developer, Database Architect, KYC/AML Compliance Officer, QA Engineer  
**Bank model:** Conventional Digital Retail Bank (DRB)  
**Research date:** September 2026  
**Status:** Technical / regulatory research reference — **not legal advice**

Confirm all normative interpretations with SBP, internal Compliance, and Legal before go-live. Do not treat industry practices as SBP mandates.

---

## How to use this pack

| Role | Start here | Then read |
|------|------------|-----------|
| Compliance / Legal | [00-executive-summary.md](00-executive-summary.md), [02-sbp-kyc-cdd-framework.md](02-sbp-kyc-cdd-framework.md) | [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md), [appendices/A-regulatory-requirement-catalog.md](appendices/A-regulatory-requirement-catalog.md) |
| Product | [00-executive-summary.md](00-executive-summary.md), [05a-kyc-user-journey.md](05a-kyc-user-journey.md), [05b-kyc-user-journeys-catalog.md](05b-kyc-user-journeys-catalog.md) | [05-recommended-kyc-process.md](05-recommended-kyc-process.md), [04-digital-bank-kyc-benchmarks.md](04-digital-bank-kyc-benchmarks.md) |
| UX / QA (journey) | [05a-kyc-user-journey.md](05a-kyc-user-journey.md), [05b-kyc-user-journeys-catalog.md](05b-kyc-user-journeys-catalog.md), [05c-kyc-interactive-journeys.html](05c-kyc-interactive-journeys.html), [05c-kyc-customer-journeys.pdf](05c-kyc-customer-journeys.pdf) | [08-state-machine.md](08-state-machine.md), journey QA in 05a (J-01–J-12) and 05b (J-13–J-35) |
| Solution / Backend | [06-architecture-and-services.md](06-architecture-and-services.md), [08-state-machine.md](08-state-machine.md) | [09-api-specification.md](09-api-specification.md), [diagrams/](diagrams/) |
| DBA | [07-database-and-erd.md](07-database-and-erd.md), [database/README.md](database/README.md) | [database/02-data-dictionary-complete.md](database/02-data-dictionary-complete.md), [database/01-complete-ddl.sql](database/01-complete-ddl.sql), DFD/ERD in `diagrams/13–15` |
| QA | [08-state-machine.md](08-state-machine.md), [09-api-specification.md](09-api-specification.md) | [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md) |
| Security | [11-security-fraud-audit.md](11-security-fraud-audit.md) | [06-architecture-and-services.md](06-architecture-and-services.md) |

---

## Document map (sections 1–29 of the research brief)

| # | Topic | File |
|---|--------|------|
| 1 | Executive Summary | [00-executive-summary.md](00-executive-summary.md) |
| 2–4 | Regulatory landscape & digital banks | [01-regulatory-landscape-and-digital-banks.md](01-regulatory-landscape-and-digital-banks.md) |
| 5–7 | SBP KYC/CDD & digital onboarding | [02-sbp-kyc-cdd-framework.md](02-sbp-kyc-cdd-framework.md) |
| 8 | Shared e-KYC | [03-shared-ekyc-platform.md](03-shared-ekyc-platform.md) |
| 9–10 | Bank benchmarks & matrix | [04-digital-bank-kyc-benchmarks.md](04-digital-bank-kyc-benchmarks.md), [appendices/B-comparative-kyc-matrix.md](appendices/B-comparative-kyc-matrix.md) |
| 11 | Recommended KYC process | [05-recommended-kyc-process.md](05-recommended-kyc-process.md) |
| 11a | KYC user journey (screens & alternates) | [05a-kyc-user-journey.md](05a-kyc-user-journey.md) |
| 11b | KYC user journeys catalog (all customer paths) | [05b-kyc-user-journeys-catalog.md](05b-kyc-user-journeys-catalog.md) |
| 11c | Interactive journey explorer (open in browser) | [05c-kyc-interactive-journeys.html](05c-kyc-interactive-journeys.html) |
| 11d | All 38 customer journeys as one PDF | [05c-kyc-customer-journeys.pdf](05c-kyc-customer-journeys.pdf) |
| 12 | Microservice architecture | [06-architecture-and-services.md](06-architecture-and-services.md) |
| 13–14 | Database & ERD | [07-database-and-erd.md](07-database-and-erd.md) |
| 15 | State machine | [08-state-machine.md](08-state-machine.md) |
| 16 | API specification | [09-api-specification.md](09-api-specification.md), [appendices/C-api-examples.md](appendices/C-api-examples.md) |
| 17–21 | AML, risk, EDD, ops, refresh | [10-aml-risk-edd-ops.md](10-aml-risk-edd-ops.md) |
| 22–24 | Fraud, security, audit | [11-security-fraud-audit.md](11-security-fraud-audit.md) |
| 25–26 | Reporting & compliance mapping | [12-sbp-compliance-mapping.md](12-sbp-compliance-mapping.md) |
| 27–29 | Implementation, gaps, references | [13-implementation-gaps-references.md](13-implementation-gaps-references.md) |

---

## Classification legend (mandatory throughout)

| Tag | Meaning |
|-----|---------|
| **A** | Mandatory regulatory requirement (SBP / law) |
| **B** | Regulatory expectation / effective AML-KYC control |
| **C** | Industry best practice (not explicitly mandated as a specific tech) |
| **D** | Bank-specific implementation choice |

---

## Diagrams

Editable Mermaid sources are in [`diagrams/`](diagrams/). The same diagrams are embedded in the relevant section files.

---

## Source priority

1. State Bank of Pakistan (circulars, frameworks, notifications, press)  
2. Government of Pakistan / AML Act and related legislation  
3. Financial Monitoring Unit / competent authorities  
4. Official digital bank websites and T&Cs  
5. Pakistan Banks’ Association materials (where official)  
6. Reputable industry sources (supplementary only)  

Where a bank does not publicly disclose a control, this pack records **Not publicly disclosed**.

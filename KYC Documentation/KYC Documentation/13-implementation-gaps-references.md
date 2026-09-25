# 27–29. Implementation Recommendations, Gaps / Risks, References

> Not legal advice. Confirm with Compliance, Legal, SBP, NADRA vendors, and PBA shared e-KYC operators.

---

## 27. Implementation recommendations

### Phased delivery

| Phase | Scope |
|-------|-------|
| **P0 – Compliance skeleton** | Application state machine, Table-A capture, consents, OTP, tracking ID, audit log, TAT timers |
| **P1 – Identity** | NADRA BV + Verisys + MSISDN pairing adapters; live photo; face match |
| **P2 – AML gate** | Sanctions/PEP screening, risk engine v1, decisioning, debit-block accounts |
| **P3 – Exceptions** | Video KYC, case management, maker-checker, EDD, decline notices |
| **P4 – Post-onboarding** | TMS integration, refresh scheduler, remediation, dormancy reactivation |
| **P5 – Shared e-KYC** | Adapter + consent + prefetch when participation ready |
| **P6 – Entities** | Corporate onboarding / UBO (if product requires) |

### Engineering priorities

1. Treat **KYC Service** as sole state authority.  
2. Build **vendor adapters** with contract tests; never leak proprietary payloads to mobile.  
3. Implement **fail closed** for sanctions; **fail controlled** for NADRA outages (tier ladder, not silent approve).  
4. Automate compliance evidence packs for each release (mapping table statuses).  
5. Use synthetic fixtures only in non-prod; production-like masking in lower envs.

### Product priorities

1. Progress + resume UX (30 days).  
2. Clear messaging for debit-block / BV pending.  
3. Urdu + English for key legal screens (SAOF guidance).  
4. Do not under-collect vs Table-A to “match competitor FAQ.”

### Compliance priorities

1. Board-approved Digital Onboarding Policy + CRP model before pilot.  
2. Sanctions list management SOPs + calendar.  
3. Record retention + video KYC retention SOPs.  
4. Independent audit of digital onboarding within risk plan.

---

## 28. Gaps / risks / open questions

| ID | Gap / risk | Impact | Mitigation |
|----|------------|--------|------------|
| G1 | Shared e-KYC field dictionary & participation steps not public | Integration delay | Local-first path; early PBA engagement |
| G2 | NADRA facial BV operational timing | Tier design | Keep finger BV + Verisys paths |
| G3 | HugoBank / KT-Buraq status less certain on SBP primary pages | Benchmark uncertainty | Do not depend on their undocumented KYC |
| G4 | Mashreq commercial vs pilot upgrade date | Peer comparison | Track SBP notices |
| G5 | Exact AML record retention years / dormancy edge cases | Legal risk | Legal memo against latest AML text |
| G6 | Third-party reliance partner bank contract | BV fallback | Negotiate before pilot if no branches |
| G7 | MSISDN pairing data source availability | Tier b failure rate | Dual OTP/callback; ops capacity |
| G8 | Over-collecting PII vs minimization | Privacy risk | Collect Table-A; justify extras per case |
| G9 | Treating liveness as replacing BV | Compliance fail | Policy + technical enforcement |
| G10 | Silent STP on screening provider outage | Sanctions breach | Hard hold |
| G11 | Entity/UBO not in v1 | Product gap if SME launch | Explicit Phase-2 |
| G12 | Islamic product disclosures if window added later | Scope creep | Out of scope unless SBP-approved window |

### Open questions for SBP / Legal / Compliance

1. Confirm current binding text if any post–July 2025 onboarding amendments.  
2. Confirm shared e-KYC mandatory go-live date for digital banks.  
3. Confirm acceptable video KYC technical standards (resolution, liveness, recording retention).  
4. Confirm debit-block product behavior (credits allowed? bill pay?).  
5. Confirm whether scheduled-bank notification timing affects onboarding go-live.

---

## 29. References

### SBP primary

| Document | Date | URL |
|----------|------|-----|
| Licensing and Regulatory Framework for Digital Banks (BPRD Circular No. 01 of 2022) | 3 Jan 2022 | https://www.sbp.org.pk/bprd/2022/C1.htm |
| Consolidated Customer Onboarding Framework (BPRD Circular No. 01 of 2025) | 25 Jul 2025 | https://www.sbp.org.pk/bprd/2025/C1.htm |
| Consolidated Framework PDF | 2025 | https://bafblob.blob.core.windows.net/data/circulars/sbp/C1-Consolidated-Customer-Onboarding-Framework.pdf |
| AML/CFT/CPF Regulations for SBP-REs (updated) | 28 Nov 2022 | https://www.sbp.org.pk/assets/documents/laws_regulations/CL33-Annex-B.pdf |
| BPRD Circular Letter No. 33 of 2022 (AML update) | 28 Nov 2022 | https://www.sbp.org.pk/bprd/2022/CL33.htm |
| Shared e-KYC Platform (BPRD CL No. 22 of 2023) | 18 Dec 2023 | https://www.sbp.org.pk/bprd/2023/CL22.htm |
| Customers’ Digital Onboarding Framework (historical) | 2021/2022 | https://www.sbp.org.pk/bprd/2021/C2.htm |
| Easypaisa scheduled bank notification | 28 Jan 2025 | https://www.sbp.org.pk/notifications/bprd/2025/ntf1.htm |
| SBP Press index (Mashreq pilot) | 20 Feb 2025 | https://archive.sbp.org.pk/press/2025/index2.asp |
| Digital Bank Regulatory page | ongoing | https://www.sbp.org.pk/dfs/Digital-Bank-Regulatory.html |

### Related security circulars (cited by Consolidated §K)

- PSP&OD Circular No. 01 of 2022 — Mobile App Security Guidelines  
- BPRD Circular No. 04 of 2023 — Measures to Enhance Security of Digital Banking Products and Services  
- PSD Circular No. 09 of 2018 — Security of Digital Payments  
- BPRD Circular No. 05 of 2017 — Enterprise Technology Governance Framework  

### Legislation

- Anti-Money Laundering Act, 2010  
- Anti-Terrorism Act, 1997  
- United Nations Security Council Act, 1948  
- Banking Companies Ordinance, 1962  
- SBP Act, 1956  
- Payment Systems and Electronic Fund Transfers Act, 2007  

### Bank public sources (benchmarking)

- Easypaisa FAQs: https://easypaisa.com.pk/faqs/  
- Easypaisa biometric upgrade: https://easypaisa.com.pk/upgrade-easypaisa-account/  
- Mashreq NEO Pakistan: https://www.mashreq.com/en/pk/neo/  
- Mashreq NEO T&Cs (conventional/Islamic biometric packages on mashreq.com jssmedia)  
- Raqami newsroom (commercial license announcements)

### Supplementary (non-primary)

- Industry press on HugoBank pilot / KT–Buraq rename — use only with explicit “secondary source” label and SBP confirmation.

---

## Document control

| Field | Value |
|-------|-------|
| Pack version | 1.0 |
| Research cut-off | September 2026 |
| Bank model | Conventional Digital Retail Bank |
| Owner (suggested) | Compliance + Digital Architecture working group |
| Next review | On any SBP onboarding/AML circular; else quarterly |

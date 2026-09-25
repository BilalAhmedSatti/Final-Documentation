# 27–29. Implementation, gaps, references (EMI)

> Not legal advice. Confirm with Compliance, Legal, PSP&OD, NADRA vendors, trustee bank.

## 27. Implementation recommendations

| Phase | Scope |
|-------|--------|
| P0 | State machine, uniqueness, consents, OTP, tracking ID, audit |
| P1 | Verisys 50k wallet + screening + live photo |
| P2 | NADRA BV + 400k/200k by licence phase |
| P3 | Video KYC, EDD, PEP cases |
| P4 | TMS, agents, trust recon, refresh |
| P5 | Enhanced 1M after commercial + PSP&OD |
| P6 | Minors, merchants, remittance/salary exclusions |

Priorities: KYC as sole state authority; ledger enforces limits; fail closed TFS; fail controlled NADRA; never let agents issue.

## 28. Gaps / risks

| ID | Gap | Impact | Mitigation |
|----|-----|--------|------------|
| G1 | Shared e-KYC EMI participation unclear | Delay | Local-first |
| G2 | Annexure-J exact document list | Enhanced blocked | Legal extract of EMI PDF annex |
| G3 | Live EMI register not a stable HTML table | Cohort drift | Re-check SBP press/DFS |
| G4 | 10-year vs AML 5-year retention | Over/under retain | Stricter of the two |
| G5 | One-credit product vs Consolidated “verify before relationship” | Tension | Default disable one-credit |
| G6 | Minor remote opening vs digital ID allow-list | Scope | Legal |
| G7 | Trustee concentration + rating downgrade | Ops | Dual trustees before 300m |
| G8 | Treating selfie as BV | Licence risk | Policy + ledger |
| G9 | DRB copy-paste (profit, CIF, debit-block account) | Non-compliance | This pack vs parent folder |
| G10 | Interchange / unit economics | Commercial death (industry) | Not a KYC issue — board |

## 29. References

### SBP primary

| Document | Date | URL |
|----------|------|-----|
| Regulations for EMIs (revised) | 21 Jun 2023 | https://www.sbp.org.pk/assets/documents/circulars/psd/2023/C3-Enclosure-Regulations-EMIs.pdf |
| PSP&OD Circular No. 03 of 2023 | 21 Jun 2023 | https://www.sbp.org.pk/psd/2023/C3.htm |
| Consolidated Customer Onboarding Framework | 25 Jul 2025 | https://www.sbp.org.pk/bprd/2025/C1.htm |
| Consolidated Framework PDF | 2025 | https://bafblob.blob.core.windows.net/data/circulars/sbp/C1-Consolidated-Customer-Onboarding-Framework.pdf |
| Shared e-KYC (banks) | 18 Dec 2023 | https://www.sbp.org.pk/bprd/2023/CL22.htm |
| Annual Payment Systems Review FY25 | FY25 | https://www.sbp.org.pk/assets/document/publications/Annual-Payment-Systems-Review-FY25.pdf |
| FSR 2024 Appendix (EMI licensing notes) | 2024 | https://www.sbp.org.pk/assets/document/Appendix_A_and_B_FSR_2024.pdf |
| DFS / EMI pages | ongoing | https://www.sbp.org.pk/PS/EMI.htm |

### Statute

- Payment Systems and Electronic Fund Transfers Act, 2007  
- AML Act, 2010  

### Public EMI (supplementary)

- SadaPay help (limits, BVS, e-Sahulat)  
- NayaPay help (limits, Meezan ATM BVS; updated Jun 2025)  
- SBP commercial licence to Wemsol — press 24 Feb 2025 (six live EMIs named)  
- Profit (10 Dec 2025) industry mapping — **not** a regulator source

---

## Next (build)

Requirements extracted from this pack: [14-srs.md](14-srs.md) (FR-E01–E40, NFR-E01–E10) and [15-use-cases.md](15-use-cases.md) (UC-E01–E20, UC-S01–S04).

# Appendix B — Comparative KYC Matrix

> Values: **Yes** / **No** / **Not publicly disclosed** / **Required by SBP** / **Bank-specific**  
> Research cut-off: September 2026. **Do not infer undisclosed internals.**  
> **Verification status:** Re-checked against public sources (see notes below). Cells marked ✎ were corrected after verification.

| KYC Component | Easypaisa | Mashreq | Raqami | HugoBank | KT/Buraq | SBP Requirement |
|---------------|-----------|---------|--------|----------|----------|-----------------|
| CNIC verification | Yes (CNIC + issue date captured; KYC per T&Cs) | Yes (CNIC/NICOP required; SNIC scan) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP |
| NADRA verification | Yes (BVS consent in T&Cs; in-app BV for upgrade) | Yes (BVS defined as NADRA-verifiable fingerprints at opening) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP |
| Biometric verification | Yes (in-app hand scan upgrade; BVS consent) | Yes (BVS fingerprint consent at opening) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP |
| Selfie / live photo | Not publicly disclosed | ✎ SNIC **scan** disclosed; **live photo** Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (**live photo** for digital onboarding) |
| Liveness detection | Not publicly disclosed | ✎ Not publicly disclosed (do not confuse with Face ID/Touch ID **login**) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Encouraged (SBP Consolidated §K.iii) — not a named mandate |
| Face matching | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | ✎ Not a named clause; **B/C** to implement “live photo vs ID picture” |
| OTP | Yes (FAQ: OTP on register/login) | ✎ OTP defined for app access/alerts; **onboarding OTP** Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required in Verisys alternate tier (OTP or callback); otherwise common control |
| Device binding | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Bank-specific / industry practice (**C/D**) |
| PEP screening | Not publicly disclosed | Not publicly disclosed (EDD referral disclosed; PEP engine NPD) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (AML Reg–5) |
| Sanctions screening | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (Consolidated §F.4) |
| AML screening / watchlist | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (ongoing CDD / TMS) |
| Risk scoring | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (CRP model) |
| Source of income | Not publicly disclosed (FAQ minimal) | Yes (may request; disclosed on upgrade) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP when applicable (Table-A / Annex-B) |
| Source of funds | Not publicly disclosed | ✎ SoI on upgrade disclosed; discrete **SoF** field Not fully publicly disclosed (NRP T&Cs mention SoF via group KYC share) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP when applicable / PEPs |
| Occupation | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (CDD / SAOF) |
| Address verification | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | **Address collection** Required by SBP; **verification method** risk-based / bank policy |
| Manual review | Not publicly disclosed | Yes (may refer for EDD / decline discretion in T&Cs) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP for hits / high risk / exceptions |
| EDD | Not publicly disclosed | Yes (T&Cs: may refer for enhanced due diligence) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (AML + Consolidated §G) |
| KYC refresh | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (ongoing CDD) |
| Transaction monitoring | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP |
| Customer consent | Yes (T&Cs accept) | Yes (T&Cs / FATCA-CRS accept) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP / privacy / e-KYC consent |
| Audit trail | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (record-keeping / controls) |
| MSISDN / SIM ownership | Yes (T&Cs: mobile in customer’s name) | Yes (T&Cs: for some account types) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP in Verisys alternate tier (CNIC–MSISDN pairing) |
| FATCA/CRS | Not publicly disclosed | Yes (digital FATCA/CRS in onboarding T&Cs) | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (Table-A) |
| Tracking ID / status | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP (Consolidated §I) |
| Video KYC | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Required by SBP for branchless DB fallback / NFTF EDD |
| Shared e-KYC use | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Not publicly disclosed | Connect once platform operational (Consolidated §H / CL22) |

### Legend notes

- **Required by SBP** = Classification **A** unless noted as encouraged (**B/C**) or interpretive.  
- Peer **Yes** = public FAQ/T&Cs/marketing evidences the control — **not** proof that the bank’s full internal stack equals SBP completeness.  
- **Not publicly disclosed** does **not** mean “No” — banks almost certainly run sanctions/PEP/TMS; they simply do not publish the mechanism.

---

## Verification verdict (September 2026 re-check)

### Overall

| Area | Verdict |
|------|---------|
| Heavy use of **Not publicly disclosed** for Raqami / HugoBank / KT | **Valid** — little public KYC detail |
| SBP column for BV, sanctions, live photo, tracking ID, video KYC, FATCA, CRP | **Valid** against Consolidated Framework 2025 + AML regs |
| Easypaisa CNIC / OTP / T&Cs / MSISDN / biometric upgrade | **Valid** (FAQs + T&Cs + upgrade page) |
| Mashreq CNIC / BVS / FATCA / EDD / MSISDN / SoI on upgrade | **Valid** (NEO T&Cs) |
| Cells that were **too strong** before correction | See below |

### Corrections made (was overstated)

| Cell | Before | After | Why |
|------|--------|-------|-----|
| Mashreq OTP | “NPD (likely Yes)” | Onboarding OTP **NPD**; OTP exists for app access | “Likely” breaks no-inference rule. T&Cs define OTP for app use, not clearly for onboarding. |
| Mashreq liveness | “Implied in biometric packages” | **Not publicly disclosed** | BVS text = NADRA **fingerprints**. Face ID/Touch ID in T&Cs is **login**, not KYC liveness. |
| Mashreq selfie / live photo | Treated scan ≈ live photo | **SNIC scan Yes; live photo NPD** | Document scan ≠ SBP “live photo” requirement. |
| Mashreq source of funds | “Yes (may request)” | SoI yes; SoF **not fully disclosed** for resident NEO | Resident T&Cs emphasize proof of **income** on upgrade; SoF clearer in NRP pack. |
| Face matching (SBP col) | “Expected to support…” as if hard mandate | Labeled **B/C** interpretive | Framework requires live photo verified with ID picture; it does **not** name “face-matching algorithm”. |

### Confidence notes (still valid but nuanced)

1. **Easypaisa “NADRA verification / biometric”** — Public evidence is strongest for **BVS consent** and **upgrade BV**, not a published statement that every Level-0 signup completes NADRA BV before first use. Treat as **Yes with scope caveat**.  
2. **Banks showing NPD for sanctions/PEP/TMS** — Almost certainly performed (SBP **A**); matrix correctly refuses to invent their vendor/process.  
3. **Shared e-KYC “Required when operational”** — Connection expected once platform operationalized; participation timing for each DRB still needs SBP/PBA confirmation.  
4. **Mashreq T&Cs “decline without assigning reason”** — Contractual wording; SBP still requires **specific written decline reason** for REs (Consolidated §I.3). Do not read bank T&Cs as overriding SBP.

### Primary sources used for this verification

| Source | Date / type | URL |
|--------|-------------|-----|
| SBP Consolidated Customer Onboarding Framework | 25 Jul 2025 | https://www.sbp.org.pk/bprd/2025/C1.htm |
| Easypaisa FAQs | Public | https://easypaisa.com.pk/faqs/ |
| Easypaisa BB T&Cs | Public PDF | https://easypaisa.com.pk/wp-content/uploads/2022/05/BB-Account-Holder-TERMS-AND-CONDITIONS.pdf |
| Easypaisa biometric upgrade | Public | https://easypaisa.com.pk/upgrade-easypaisa-account/ |
| Mashreq NEO conventional T&Cs | Public | https://www.mashreq.com/-/jssmedia/pdfs/pakistan/neo/accounts/neo-conventional-tnc-en-ur.ashx |
| Mashreq NEO combined biometric T&Cs | Public | https://www.mashreq.com/-/jssmedia/pdfs/pakistan/neo-tnc-en-ur.ashx |
| AML/CFT/CPF Regulations | Updated 28 Nov 2022 | https://www.sbp.org.pk/assets/documents/laws_regulations/CL33-Annex-B.pdf |

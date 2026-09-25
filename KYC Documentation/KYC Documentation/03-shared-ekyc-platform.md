# 8. Shared Electronic Know Your Customer (e-KYC) Platform

> Primary sources: SBP BPRD Circular Letter No. 22 of 2023 (18 Dec 2023); SBP Financial Stability materials describing the PBA-led shared e-KYC platform.  
> Integration contracts are not public — this section describes **regulatory intent and bank architecture patterns**, not proprietary APIs.  
> Not legal advice.

## Why SBP / industry introduced it

Pakistan’s AML regime strengthened KYC/CDD over time, including allowing reliance on third-party FIs for CDD under conditions. Even so, each bank repeating full KYC created:

- Friction and delay in customer onboarding  
- Inconsistent KYC data quality across the industry  
- Higher industry cost for repeated NADRA/verification steps  
- Weak mechanisms for **timely update** of KYC when customer data changes at one bank  

SBP guided the **Pakistan Banks Association (PBA)** to develop a **shared e-KYC platform** to streamline exchange and updating of standardized KYC/CDD information.

Sources:

- Circular letter landing page: https://www.sbp.org.pk/bprd/2023/CL22.htm (18 Dec 2023)  
- FSR-style description (SBP document excerpt): shared e-KYC built on **DLT**; data remains with banks; access with **explicit customer consent**

## Problem it solves

| Problem | Shared e-KYC response |
|---------|----------------------|
| Repeated KYC for multi-banked customers | Consent-based reuse of standardized KYC attributes |
| Non-standard data models | Standardization of KYC/CDD data |
| Central honeypot of all bank KYC | **No central data lake** — DLT coordination; **KYC data resides with banks** |
| Stale KYC after life events | Industry update/propagation patterns (implementation-specific) |
| Customer rights | Explicit consent before access |

## How banks can use it (conceptual)

```text
Customer consents to share/fetch KYC
        |
        v
Bank queries shared e-KYC network (participant node)
        |
        +-- KYC available --> Prefill / verify against local CDD policy
        |
        +-- KYC unavailable --> Full local onboarding (NADRA BV, etc.)
        |
        v
Bank remains responsible for CDD quality and AML decisions
```

**Ultimate responsibility** for CDD remains with the onboarding bank (AML third-party reliance principles + bank policy). Shared e-KYC is an **efficiency and data-quality rail**, not a compliance offload.

## What information is exchanged

Official public materials emphasize **standardized KYC/CDD information**. Exact field dictionaries are expected to be defined in PBA/platform operating rules (confirm under NDA).

For architecture planning, assume categories aligned to Consolidated Framework / SAOF:

- Identity attributes (name, CNIC, DOB, etc.)  
- Contact and address attributes  
- CDD attributes (occupation, purpose — subject to consent scope)  
- Verification metadata / assurance indicators (without exporting raw biometrics)  
- Update timestamps / version markers  

**Do not assume** biometric templates are shared on the ledger. Prefer **verification references** and attribute-level KYC.

## Customer consent requirements (**A**)

- Access only with **explicit customer consent**  
- Consent must be captured, versioned, purpose-limited, and auditable  
- UX must allow refusal → fall back to full local KYC without coercive dark patterns  

Data model: `kyc_consents` with purpose `SHARED_EKYC_READ` / `SHARED_EKYC_WRITE_UPDATE`, timestamp, channel, policy version.

## How KYC information remains with banks

Per SBP/FSR description: platform uses **Distributed Ledger Technology (DLT)** such that customer KYC/CDD information **resides with the banks only**, without a central entity housing the critical customer data.

Architectural implication:

- Each participant bank holds authoritative KYC records in its own systems  
- DLT provides coordination, permissioning, integrity, and possibly pointers/proofs — **not** a single PII warehouse  
- Exact ledger object design is vendor/PBA-specific — implement via **Shared e-KYC Adapter**

## How DLT is used (what we can responsibly say)

| Aspect | Public position | Our design stance |
|--------|-----------------|-------------------|
| Purpose | Secure industry exchange/update without central PII store | Adapter + consent + audit |
| Data residency | At banks | Local `customers` / KYC tables remain SoR for our bank |
| Access control | Consent-gated | Enforce in Onboarding/KYC services before adapter calls |
| Integrity | DLT properties | Store platform reference IDs + hash of accepted KYC snapshot |

We **do not invent** smart-contract APIs or ledger schemas in this pack.

## How a digital bank should integrate

See also [diagrams/11-shared-ekyc-integration.mmd](diagrams/11-shared-ekyc-integration.mmd).

### Recommended integration pattern

1. **Feature flag** `SHARED_EKYC_ENABLED` (off until participation certified).  
2. After contact verification + consent:  
   - Call `SharedEkycAdapter.lookup(consentId, cnicHash/ref)`  
3. If profile returned:  
   - Map fields → application draft  
   - Still run **local sanctions/PEP**, **risk**, and **policy gaps** (e.g., missing live photo / BV currency rules)  
   - Decide whether NADRA BV still required under Consolidated Framework (usually **yes** for relationship establishment unless a lawful alternate path applies)  
4. If not found / error / consent denied:  
   - Continue **full local** journey  
5. On successful local KYC approval:  
   - Optionally publish/update to network **if** customer consents to contribute  

### Important compliance caution

Shared e-KYC **does not replace**:

- Sanctions pre-screening  
- CRP/EDD  
- NADRA BV rules in Consolidated Framework §F  
- Bank record-keeping obligations  

## When KYC information is unavailable

| Condition | System behavior |
|-----------|-----------------|
| Customer not on network | Full local onboarding |
| Consent refused | Full local onboarding |
| Platform outage | Fail open to local path; log incident; do not block all onboarding if local path healthy |
| Partial profile | Prefill available fields; mark gaps mandatory before submit |

## When customer information has changed

| Signal | Behavior |
|--------|----------|
| Local customer updates address/occupation | Update SoR; trigger risk re-eval; offer consent to push update to shared network |
| Inbound shared update (if supported) | Create remediation case or customer confirmation task; do not silently overwrite without controls |
| CNIC renewal | Follow expired-ID rules (obtain renewed ID within 3 months if opened on token) |

## How KYC information is updated

Policy design (confirm with PBA rules):

1. Bank SoR update → version bump on `kyc_profiles`  
2. Audit event `KYC_PROFILE_UPDATED`  
3. If consent allows contribution → adapter `publishUpdate`  
4. Periodic refresh jobs reconcile stale local KYC regardless of network  

## Impact on onboarding architecture

| Component | Change |
|-----------|--------|
| Onboarding Service | Branch: `ekyc_prefill` vs `local_full` |
| Consent Service | New consent purposes + revocation |
| KYC Service | Treat shared data as **input evidence**, not final decision |
| Identity Service | Store `ekyc_source_ref`, `ekyc_fetched_at`, field provenance |
| Audit Service | Log fetch/publish with consent ID; never log full PII in clear text sinks |
| Resilience | Circuit breaker on adapter; SLA monitoring |

## Gaps requiring confirmation

- Participant onboarding checklist (PBA/SBP)  
- Whether digital banks in pilot may join before commercial license  
- Field-level mandatory set and assurance levels  
- Conflict resolution when two banks disagree on attributes  
- Biometric / Verisys evidence sharing rules  

Until confirmed, implement **local KYC as complete path** and Shared e-KYC as **additive acceleration**.

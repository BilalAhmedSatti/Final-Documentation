# 8. Shared e-KYC and EMIs

> Primary: BPRD Circular Letter No. 22 of 2023 (18 Dec 2023); Consolidated Customer Onboarding Framework (2025).  
> Not legal advice. No proprietary shared-platform payloads in this pack.

## What is settled

- SBP directed **banks** to implement the PBA-led **Shared Electronic KYC Platform** (CL 22 addressee: **The Presidents/Chief Executives — All Banks**).  
- Public descriptions: **DLT** coordination; KYC data **stays with participating institutions**; access with **explicit customer consent**.  
- Consolidated Framework (applies to **EMIs**) tells REs that branch digital AOF interfaces should be **connected with the shared e-KYC platform once operationalised**, and that existing KYC on the platform may be reused **where available**.

## What is not settled (open with Legal / PBA)

| Question | Working position | Class |
|----------|------------------|-------|
| Is CL 22 itself binding on EMIs? | Text is to **banks**. Do not cite CL 22 alone as an EMI mandate. | Confirm |
| Must an EMI **participate** when the platform is live? | Consolidated Framework language for SBP REs **includes EMIs**. Treat participation as **likely A when operational + SBP/PBA onboarding exists** — **confirm**. | **A?** |
| Can an EMI **refuse** shared e-KYC and still open wallets? | Local NADRA + Table-A path must always work. Consent to share must **not** block local KYC (same principle as banks). | **A** local path |
| Field dictionary | Not public | Blocker |

## Architecture pattern (same as bank pack, EMI-owned data)

```text
Customer optional consent SHARED_EKYC_READ
        → adapter query (when participant)
        → prefill editable fields
        → customer confirms
        → still run live photo + NADRA Verisys/BV + sanctions
        → miss/timeout: silent continue to local capture
```

**Never** skip sanctions or NADRA because shared KYC “already exists.” The EMI remains responsible for CDD.

## Build order

1. Local-first wallet KYC (this pack).  
2. Consent versioning + adapter stub.  
3. PBA/SBP participation when EMI onboarding pack exists.

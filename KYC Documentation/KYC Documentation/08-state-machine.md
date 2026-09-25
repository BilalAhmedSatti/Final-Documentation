# 15. KYC State Machine

> Owner: **KYC Service**. All transitions emit `kyc_status_history` + audit + domain event.  
> Diagram: [diagrams/06-state-machine.mmd](diagrams/06-state-machine.mmd).

---

## States

| State | Meaning |
|-------|---------|
| `INITIATED` | Application created; tracking ID issued |
| `CONTACT_VERIFIED` | Mobile (and email if required) verified |
| `CONSENT_CAPTURED` | Mandatory consents accepted |
| `EKYC_PREFILL_APPLIED` | Optional shared e-KYC prefetch done |
| `IDENTITY_CAPTURED` | Table-A identity entered |
| `LIVE_PHOTO_CAPTURED` | Live photo uploaded |
| `IDENTITY_VERIFICATION_IN_PROGRESS` | NADRA/BV/Verisys running |
| `IDENTITY_VERIFIED` | Verification tier satisfied (may still be restricted path) |
| `VIDEO_KYC_PENDING` | Awaiting recorded video KYC |
| `PROFILE_COMPLETE` | CDD profile + tax + SoI as required |
| `SCREENING_IN_PROGRESS` | Sanctions/PEP/watchlist |
| `SCREENING_HIT_REVIEW` | Potential hit adjudication |
| `RISK_ASSESSMENT_IN_PROGRESS` | CRP scoring |
| `ADDITIONAL_INFORMATION_REQUIRED` | Customer must supply gaps |
| `MANUAL_REVIEW` | Ops queue |
| `EDD_REQUIRED` | Enhanced due diligence |
| `APPROVED` | KYC approved (may carry restriction flags) |
| `ACCOUNT_PENDING` | CIF/account provisioning |
| `ACTIVE` | Account usable per limits |
| `RESTRICTED_ACTIVE` | Open with debit block / limit restrictions |
| `REJECTED` | Terminal decline |
| `EXPIRED` | Resume window exceeded (30 days) or policy expiry |
| `WITHDRAWN` | Customer abandoned/cancelled |
| `REFRESH_DUE` | Post-active periodic refresh |
| `REMEDIATION` | Fix data quality / expired ID / BV pending |

---

## Primary happy path

```text
INITIATED
  → CONTACT_VERIFIED
  → CONSENT_CAPTURED
  → (EKYC_PREFILL_APPLIED)
  → IDENTITY_CAPTURED
  → LIVE_PHOTO_CAPTURED
  → IDENTITY_VERIFICATION_IN_PROGRESS
  → IDENTITY_VERIFIED
  → PROFILE_COMPLETE
  → SCREENING_IN_PROGRESS
  → RISK_ASSESSMENT_IN_PROGRESS
  → APPROVED
  → ACCOUNT_PENDING
  → ACTIVE
```

---

## Transition catalog (selected)

| From | To | Trigger actor | Auto/Manual | Event | Failure / retry |
|------|-----|---------------|-------------|-------|-----------------|
| INITIATED | CONTACT_VERIFIED | Customer + System | Auto on OTP success | `kyc.contact.verified` | Retry OTP; lockout after N fails |
| CONTACT_VERIFIED | CONSENT_CAPTURED | Customer | Auto | `kyc.consent.captured` | Stay until mandatory consents |
| CONSENT_CAPTURED | EKYC_PREFILL_APPLIED | System | Auto optional | `kyc.ekyc.prefetched` | On error → skip to IDENTITY_CAPTURED |
| CONSENT_CAPTURED / EKYC_* | IDENTITY_CAPTURED | Customer | Auto | `kyc.identity.captured` | Validation errors |
| IDENTITY_CAPTURED | LIVE_PHOTO_CAPTURED | Customer | Auto | `kyc.livephoto.captured` | Retry capture |
| LIVE_PHOTO_CAPTURED | IDENTITY_VERIFICATION_IN_PROGRESS | System | Auto | `kyc.verification.started` | Idempotent start |
| IDENTITY_VERIFICATION_IN_PROGRESS | IDENTITY_VERIFIED | System | Auto | `kyc.verification.completed` | Retry vendor timeouts with backoff |
| IDENTITY_VERIFICATION_IN_PROGRESS | VIDEO_KYC_PENDING | System | Auto | `kyc.videokyc.required` | Schedule ops |
| VIDEO_KYC_PENDING | IDENTITY_VERIFIED | Analyst/System | Manual+Auto | `kyc.videokyc.completed` | Re-request video |
| IDENTITY_VERIFIED | PROFILE_COMPLETE | Customer | Auto | `kyc.profile.completed` | |
| PROFILE_COMPLETE | SCREENING_IN_PROGRESS | System | Auto | `kyc.screening.started` | |
| SCREENING_IN_PROGRESS | SCREENING_HIT_REVIEW | System | Auto | `kyc.screening.hit` | |
| SCREENING_IN_PROGRESS | RISK_ASSESSMENT_IN_PROGRESS | System | Auto if clear | `kyc.screening.cleared` | |
| SCREENING_HIT_REVIEW | REJECTED | Analyst+System | Manual (sanctions true match) | `kyc.decision.rejected` | No retry activate |
| SCREENING_HIT_REVIEW | RISK_ASSESSMENT_IN_PROGRESS | Analyst | Manual false positive | `kyc.screening.adjudicated` | Maker-checker |
| RISK_ASSESSMENT_IN_PROGRESS | APPROVED | System | Auto low risk | `kyc.decision.approved` | |
| RISK_ASSESSMENT_IN_PROGRESS | ADDITIONAL_INFORMATION_REQUIRED | System | Auto | `kyc.info.required` | Customer resume |
| RISK_ASSESSMENT_IN_PROGRESS | MANUAL_REVIEW | System | Auto | `kyc.case.opened` | |
| RISK_ASSESSMENT_IN_PROGRESS | EDD_REQUIRED | System | Auto | `kyc.edd.required` | |
| ADDITIONAL_INFORMATION_REQUIRED | PROFILE_COMPLETE | Customer | Auto | `kyc.info.submitted` | Re-enter screening/risk as policy |
| MANUAL_REVIEW / EDD_REQUIRED | APPROVED / REJECTED | Analyst | Manual maker-checker | `kyc.case.resolved` | |
| APPROVED | ACCOUNT_PENDING | System | Auto | `customer.provisioning.started` | |
| ACCOUNT_PENDING | ACTIVE | System | Auto | `account.activated` | Retry core with idempotency |
| ACCOUNT_PENDING | RESTRICTED_ACTIVE | System | Auto if debit_block | `account.restricted` | |
| Any in-progress | EXPIRED | System | Auto (30d resume) | `kyc.application.expired` | Restart new application |
| ACTIVE | REFRESH_DUE | System | Auto schedule | `kyc.refresh.due` | |
| REFRESH_DUE | REMEDIATION / ACTIVE | Hybrid | Manual/Auto | `kyc.refresh.completed` | Restrict if overdue policy |

---

## Idempotency

- Every transition API accepts `Idempotency-Key`  
- State machine rejects illegal transitions with `409 CONFLICT` + current state  
- Vendor callbacks keyed by `vendor_reference` unique  

## Audit record per transition

Write `kyc_status_history` + `kyc_audit_logs` with: application_id, actor, from/to, correlation_id, reason, external refs, risk/screening snapshot hashes.

## Failure modes

| Failure | Behavior |
|---------|----------|
| NADRA timeout | Remain IN_PROGRESS; retry; after max → alternate tier or case |
| Screening provider down | Do not APPROVE; hold in SCREENING_IN_PROGRESS or safe MANUAL_REVIEW |
| Core banking down after APPROVED | Remain ACCOUNT_PENDING; compensating retry; never silent ACTIVE |
| Partial approve then sanctions list update | Re-screen; freeze if required |

---

## Restriction flags (orthogonal to state)

Stored on application/account:

- `debit_block`  
- `bv_pending`  
- `edd_in_progress`  
- `document_pending`  

State `RESTRICTED_ACTIVE` used when account exists but flags block full use.

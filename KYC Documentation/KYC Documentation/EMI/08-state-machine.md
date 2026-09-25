# 15. EMI wallet KYC state machine

> **Identity Service** is the only writer of KYC states (`identity_db`). Ledger reads a replica of `limit_tier` + `wallet_status` in `ledger_db`. Not legal advice.

## States

| State | Meaning |
|-------|---------|
| `INITIATED` | App created; Tracking ID shown |
| `CONTACT_VERIFIED` | 2FA/OTP bound |
| `CONSENT_CAPTURED` | Mandatory consents |
| `IDENTITY_CAPTURED` | §12 + Table-A |
| `LIVE_PHOTO_CAPTURED` | Digital live photo |
| `IDENTITY_VERIFICATION_IN_PROGRESS` | NADRA in flight |
| `SCREENING_IN_PROGRESS` | TFS/PEP |
| `SCREENING_HIT_REVIEW` | Potential hit |
| `WALLET_ACTIVE` | Instrument usable; see `limit_tier` |
| `EDD_REQUIRED` | High risk / PEP |
| `VIDEO_KYC_PENDING` | No-branch fallback |
| `ADDITIONAL_INFORMATION_REQUIRED` | Docs |
| `CLOSED_UNVERIFIED` | One-credit path failed + STR |
| `REJECTED` | Decline in writing |
| `EXPIRED` | Resume window exceeded |
| `WITHDRAWN` | Customer cancel |
| `REFRESH_DUE` | Ongoing CDD |

## Limit tiers (orthogonal, on the wallet)

`VERISYS` | `BV` | `ENHANCED` | `MINOR_BASIC` | `MINOR_FREELANCER`

## Transitions (happy)

```text
INITIATED → CONTACT_VERIFIED → CONSENT_CAPTURED → IDENTITY_CAPTURED
  → LIVE_PHOTO_CAPTURED → SCREENING_IN_PROGRESS → IDENTITY_VERIFICATION_IN_PROGRESS
  → WALLET_ACTIVE (VERISYS)
  → (BV success) same state, limit_tier=BV
  → (PSP&OD enhanced) limit_tier=ENHANCED
```

## Fail closed

- Sanctions confirmed → `REJECTED` (never `WALLET_ACTIVE`).  
- Duplicate CNIC → no new wallet (redirect).  
- Unverified after one credit → `CLOSED_UNVERIFIED` + STR.  
- NADRA 503 → stay `IDENTITY_VERIFICATION_IN_PROGRESS`.

## Diagram

See [diagrams/05-state-machine.mmd](diagrams/05-state-machine.mmd).

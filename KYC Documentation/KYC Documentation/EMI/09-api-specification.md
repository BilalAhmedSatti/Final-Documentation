# 16. EMI KYC API specification (logical)

> Resource-oriented capabilities on the **Identity Service** (`identity_db`) unless marked Ledger. **Not** NADRA proprietary APIs. Auth: customer session or service mTLS. Not legal advice.

## Applications

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/kyc/applications` | Open wallet application; returns `trackingId` |
| GET | `/kyc/applications/{id}` | Status, next action, `limitTier` (minimal PII) |
| GET | `/kyc/tracking/{trackingId}` | Public status; rate-limit; no enumeration |
| POST | `/kyc/applications/{id}/contact/verify/start` | OTP / 2FA start |
| POST | `/kyc/applications/{id}/contact/verify/confirm` | Bind MSISDN |
| POST | `/kyc/applications/{id}/consents` | Versioned consents |
| POST | `/kyc/applications/{id}/identity` | Table-A + §12 |
| POST | `/kyc/applications/{id}/live-photo` | Encrypted upload ticket |
| POST | `/kyc/applications/{id}/verisys` | Start Verisys (adapter) |
| POST | `/kyc/applications/{id}/biometric` | Start NADRA BV |
| POST | `/kyc/applications/{id}/video-kyc` | Book/join |
| POST | `/kyc/applications/{id}/enhanced` | Annexure-J + SIM pairing case |
| POST | `/kyc/applications/{id}/withdraw` | Customer cancel |

## Wallets (Ledger)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/wallets/me` | Balance, tier, banners |
| POST | `/wallets/me/limits/upgrade` | Start UJ-E02/E03 |
| POST | `/ledger/postings` | Internal; enforces §14 |

Agent API: cash-in/out **only**. No issue-wallet route.

## Errors

| Code | When |
|------|------|
| `DUPLICATE_CNIC` | UJ-E05 |
| `CONSENT_REQUIRED` | UJ-E18 |
| `SCREENING_HOLD` | No STP |
| `NADRA_UNAVAILABLE` | UJ-E08 |
| `LIMIT_EXCEEDED` | Ledger |
| `AGENT_CANNOT_ISSUE` | Agent misuse |

Idempotency keys on all POSTs. No OTP in logs.

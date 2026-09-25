# 16. KYC API Specification

> External clients: Mobile BFF via API Gateway. Internal services may use gRPC/events; REST shown for clarity.  
> Examples: [appendices/C-api-examples.md](appendices/C-api-examples.md).  
> **Do not invent NADRA/e-KYC proprietary payloads** — adapters translate behind these APIs.

## Cross-cutting

| Concern | Standard |
|---------|----------|
| AuthN | OAuth2 / OIDC; customer access token for applicant APIs; employee SSO + MFA for ops |
| AuthZ | Scopes: `kyc:write`, `kyc:read`, `kyc:decision`, `kyc:case:write`; RBAC for ops |
| Transport | TLS 1.2+ |
| Idempotency | Header `Idempotency-Key` on all POST mutating endpoints |
| Correlation | `X-Request-Id`, `X-Correlation-Id` |
| Validation | JSON Schema; reject unknown high-risk fields |
| Errors | RFC 7807 problem+json |
| Audit | Every mutating call → Audit Service |
| Rate limit | Per device + per CNIC hash + per IP |
| PII | CNIC masked in logs; full value only encrypted at rest |

### Error model

```json
{
  "type": "https://bank.example/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "idDocument.number is invalid",
  "instance": "/kyc/applications/...",
  "correlationId": "..."
}
```

---

## POST `/kyc/applications` — Start KYC

| Item | Detail |
|------|--------|
| Auth | Customer (pre-account) or guest session hardened |
| Body | `channel`, `productCode`, `device` metadata, optional `marketingSource` |
| Response | `201` `{ applicationId, trackingId, state, tatPolicy }` |
| Idempotency | Required |
| Validation | Supported channel/product |
| Audit | `APPLICATION_STARTED` |
| Security | Bind to device; captcha/bot score if anonymous |

---

## POST `/kyc/applications/{id}/contact/verify/start` & `/confirm`

| Item | Detail |
|------|--------|
| Purpose | Mobile/email OTP |
| Audit | `OTP_SENT`, `CONTACT_VERIFIED` |
| Security | OTP length/expiry; attempt limits; no OTP in logs |

---

## POST `/kyc/applications/{id}/consents`

| Item | Detail |
|------|--------|
| Body | Array of `{ type, version, accepted:true }` |
| Validation | All mandatory types present |
| Audit | `CONSENT_CAPTURED` |

---

## POST `/kyc/applications/{id}/identity`

| Item | Detail |
|------|--------|
| Body | Table-A identity fields (CNIC, names, DOB, issue/expiry, etc.) |
| Response | Updated application + validation warnings |
| Validation | ID checksum/format; age ≥ product min; eligible ID types |
| Audit | `IDENTITY_SUBMITTED` |
| Security | Field encryption; mask in responses where appropriate |

---

## POST `/kyc/applications/{id}/identity/verify`

| Item | Detail |
|------|--------|
| Purpose | Start NADRA BV / Verisys orchestration (adapter) |
| Body | `{ preferredMethod: "BV"|"AUTO", clientSignals? }` — **no raw proprietary vendor fields required from app** |
| Response | `{ verificationId, status, nextAction }` |
| AuthZ | `kyc:write` |
| Idempotency | Required |
| Audit | `IDENTITY_VERIFY_STARTED` |
| Errors | `422` if identity incomplete; `503` vendor down → retry guidance |

---

## POST `/kyc/applications/{id}/biometric/verify`

| Item | Detail |
|------|--------|
| Purpose | Submit biometric capture session result / trigger BV |
| Body | `{ sessionId, modality: "FINGER"|"FACE" }` + adapter handles device SDK |
| Response | `{ status, attemptsRemaining, fallbackAvailable }` |
| Audit | `BIOMETRIC_ATTEMPT` |
| Security | Short-lived session; no template storage on device |

---

## POST `/kyc/applications/{id}/live-photo`

| Item | Detail |
|------|--------|
| Body | multipart or pre-signed upload completion `{ documentId }` |
| Response | face-check status |
| Audit | `LIVE_PHOTO_UPLOADED` |

---

## POST `/kyc/applications/{id}/profile`

| Item | Detail |
|------|--------|
| Body | occupation, SoI/SoF, purpose, expected activity, addresses, tax |
| Audit | `PROFILE_SUBMITTED` |

---

## POST `/kyc/applications/{id}/screen`

| Item | Detail |
|------|--------|
| Purpose | Run sanctions/PEP/watchlist (usually system-triggered; exposed for ops replay) |
| AuthZ | System or `kyc:decision` |
| Response | `{ screeningBatchId, statuses[] }` |
| Audit | `SCREENING_EXECUTED` |
| Security | Results minimized to app; full payload encrypted |

---

## POST `/kyc/applications/{id}/risk-assessment`

| Item | Detail |
|------|--------|
| AuthZ | System / `kyc:decision` |
| Response | `{ riskRating, eddRequired, score, factors[] }` |
| Audit | `RISK_ASSESSED` |

---

## POST `/kyc/applications/{id}/decision`

| Item | Detail |
|------|--------|
| Body | `{ decision: APPROVE|REJECT|REQUEST_INFO, reasonCodes[], notes? }` |
| AuthZ | System auto or dual control for manual |
| Validation | Legal transition; maker ≠ checker for manual |
| Audit | `KYC_DECISION` |
| Side effects | CIF/account commands on approve |

---

## GET `/kyc/applications/{id}`

| Item | Detail |
|------|--------|
| AuthZ | Owner customer or ops with need-to-know |
| Response | State, trackingId, nextSteps, restrictionFlags, non-sensitive progress |
| Audit | `APPLICATION_VIEWED` (ops) |

## GET `/kyc/applications/tracking/{trackingId}`

Public-ish status endpoint with strong rate limits; minimal fields.

---

## POST `/kyc/customers/{customerId}/refresh`

| Item | Detail |
|------|--------|
| Purpose | Start periodic KYC refresh |
| AuthZ | Customer or system job / ops |
| Response | `{ refreshApplicationId, state }` |
| Audit | `KYC_REFRESH_STARTED` |

---

## Ops APIs (summary)

- `GET /kyc/cases?status=&type=`  
- `POST /kyc/cases/{id}/assign`  
- `POST /kyc/cases/{id}/actions` (maker/checker)  
- `POST /kyc/applications/{id}/video-kyc/sessions`  

---

## Security considerations (all APIs)

- Broken object level authorization tests mandatory (IDOR)  
- Step-up auth for decision endpoints  
- Replay protection via idempotency + timestamp windows  
- File uploads: type/size scanning; malware; quarantine bucket  

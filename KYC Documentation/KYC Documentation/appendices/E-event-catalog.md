# Appendix E — Domain Event Catalog

| Event | When | Payload (non-PII summary) | Consumers |
|-------|------|---------------------------|-----------|
| `onboarding.application.started` | Application created | applicationId, trackingId, channel | Notify, Audit |
| `kyc.contact.verified` | OTP success | applicationId, contactType | KYC SM |
| `kyc.consent.captured` | Consents saved | applicationId, consentTypes[] | KYC, e-KYC |
| `kyc.ekyc.prefetched` | Shared e-KYC hit/miss | applicationId, hit boolean | Onboarding |
| `kyc.identity.captured` | Identity saved | applicationId | Verify orchestrator |
| `kyc.livephoto.captured` | Photo stored | applicationId, documentId | Face check |
| `kyc.verification.started` | Vendor call started | verificationId, type | Ops metrics |
| `kyc.verification.completed` | BV/Verisys done | verificationId, status, tier | KYC SM, Risk |
| `kyc.videokyc.required` | Fallback | applicationId, caseId | Case Mgmt, Notify |
| `kyc.screening.completed` | Screens done | batchId, statuses | KYC SM |
| `kyc.screening.hit` | Potential/confirmed | screeningId, type | Case Mgmt, AML |
| `kyc.risk.assessed` | CRP done | rating, eddRequired, modelVersion | KYC SM |
| `kyc.info.required` | Gaps | applicationId, reasonCodes | Notify |
| `kyc.case.opened` | Manual/EDD | caseId, type | Ops dashboard |
| `kyc.case.resolved` | Closed | caseId, outcome | KYC SM |
| `kyc.decision.approved` | Approved | applicationId, restrictions[] | Customer, Account |
| `kyc.decision.rejected` | Rejected | applicationId, reasonCodes | Notify, Fraud |
| `customer.cif.created` | CIF | customerId, applicationId | Account |
| `account.opened` | Account | accountId, iban | Notify, TMS enroll |
| `account.debit_blocked` | Restricted | accountId | Notify, Limits |
| `kyc.application.expired` | 30d | applicationId | Cleanup/notify |
| `kyc.refresh.due` | Periodic | customerId | Notify, Onboarding |
| `kyc.refresh.completed` | Done | customerId, rating | Risk, Audit |

All events include `eventId`, `occurredAt`, `correlationId`. Consumers idempotent on `eventId`.

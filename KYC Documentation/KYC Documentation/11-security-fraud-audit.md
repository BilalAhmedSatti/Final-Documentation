# 22–24. Fraud / Duplicate Detection, Security & Privacy, Audit Logging

> Diagram: [diagrams/12-audit-event-flow.mmd](diagrams/12-audit-event-flow.mmd).  
> KYC data is highly sensitive PII — design for least privilege and inspectability.  
> Not legal advice.

---

## 22. Fraud and duplicate identity detection

### Detection scenarios & controls

| Scenario | Rule / control | Data |
|----------|----------------|------|
| Same CNIC → multiple accounts | Unique `id_number_hash` for active CIF; block or case on conflict | `customer_identities`, `identity_uniqueness_keys` |
| Same mobile → multiple identities | Unique verified mobile per active customer; alert on mismatch history | `customer_contacts` |
| Same device → many customers | Threshold on `device_bindings` in time window | `device_bindings` |
| Same biometric identity → many CNICs | Vendor biometric duplicate reports if available; case | verification attempts |
| Synthetic identity | Cross-check BV/Verisys consistency; device/IP velocity; watchlist | Risk + Fraud services |
| Duplicate onboarding attempts | Same CNIC hash open applications → resume existing or reject parallel | `kyc_applications` |
| Suspicious device change | Step-up auth; re-bind device with BV/OTP | sessions |
| SIM anomalies | MSISDN pairing fail; recent SIM swap signals if available from operator/vendor | verification |
| Identity mismatch | Name/DOB vs NADRA response codes | verifications |
| Failed biometric bursts | Lock modality; fallback tier; fraud case | attempts |
| Multiple rejects | Cool-down; permanent block on sanctions reject | decisions |

### Database controls

- Unique constraints + partial indexes for active statuses  
- `fraud_alerts` (optional) or `kyc_cases` type `DUPLICATE` / `FRAUD`  
- Never delete reject history needed for re-application rules  

---

## 23. Security and privacy requirements

| Domain | Requirement | Class |
|--------|-------------|-------|
| Encryption in transit | TLS 1.2+ end-to-end to vendors | A/B |
| Encryption at rest | DB TDE + field encryption for CNIC, mother's name, biometric tokens | A/B |
| PII protection | Need-to-know RBAC; masked UI (CNIC `xxxxx-xxxxxxx-x`) | A/B |
| Biometric data | Prefer vendor-matched tokens; minimize retention of templates; secure deletion | A/B |
| Tokenization | Account/CIF tokens in lower environments | C |
| Secrets management | Vault; rotated NADRA/API keys | A/B |
| RBAC / least privilege | Role matrix in ops section | A/B |
| Admin access | Privileged Access Management; MFA; just-in-time | B/C |
| Maker-checker | Dual control on high-impact KYC decisions | B (expectation) / policy A internally |
| API security | Gateway, OAuth, schema validation, bot protection | A (digital security circulars) |
| Rate limiting | OTP, verify, login | B/C |
| Device binding | Bind after successful KYC/login | C |
| Session security | Short-lived tokens; secure cookies; revoke on risk | B/C |
| OTP security | Single use; expiry; attempt caps; separate channel | B/C |
| No on-device KYC storage | Realtime encrypted upload (Consolidated §K) | **A** |
| Data retention | AML record-keeping periods | **A** |
| Deletion/archiving | Legal hold aware; anonymize only when lawful | A/B |
| DR | RPO/RTO for KYC + audit; tested restores | B |
| Periodic audit of digital onboarding | Within risk assessment; fix in 3 months | **A** |

Align also with: Mobile App Security Guidelines (PSP&OD 01/2022), BPRD 04/2023 digital banking security, PSD 09/2018, Enterprise Technology Governance (BPRD 05/2017).

---

## 24. Audit logging

### Mandatory fields per KYC action

| Field | Notes |
|-------|-------|
| Customer ID | When exists |
| KYC application ID | Always for onboarding |
| Actor ID / Actor type | SYSTEM/CUSTOMER/EMPLOYEE |
| Action | Enumerated |
| Previous state / New state | |
| Timestamp (UTC) | |
| IP address | Where appropriate |
| Device ID (hash) | |
| Request ID / Correlation ID | |
| Source system | |
| Decision / Reason | |
| External verification reference | NADRA/vendor |
| Screening result (status) | |
| Risk score | |
| Version | Model/policy/schema |

### Immutability

- DB role: `INSERT` only on `kyc_audit_logs`  
- Ship copies to append-only object storage with object lock / WORM  
- Hash chain optional (`prev_hash`, `payload_hash`) for tamper evidence (**C** strong control)  
- SIEM integration for alert on update/delete attempts  

### Regulatory reporting linkage

| Report | Evidence source |
|--------|-----------------|
| STR/CTR | Case + TMS + customer KYC snapshot refs |
| SBP inspection | Audit logs + status history + screening list versions |
| Internal audit | Same + access logs |

See event flow: [diagrams/12-audit-event-flow.mmd](diagrams/12-audit-event-flow.mmd).

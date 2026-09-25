# Complete KYC Data Dictionary

> **Purpose:** Column-level and table-level dictionary for the Conventional DRB KYC schema.  
> **DDL:** [01-complete-ddl.sql](../database/01-complete-ddl.sql)  
> **Diagrams:** DFD [13](../diagrams/13-kyc-dfd-context.mmd)–[14](../diagrams/14-kyc-dfd-level1.mmd), ERD [15](../diagrams/15-kyc-erd-detailed.mmd)  
> Not legal advice. Encrypt fields marked **PII/Sensitive** at rest.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| PK | Primary key |
| FK | Foreign key |
| UQ | Unique |
| IX | Indexed |
| PII | Personally identifiable / sensitive |
| AO | Append-only (no update/delete by app) |

---

## 1. `kyc_applications`

**Table purpose:** Master header for each KYC/onboarding attempt. Owns the state machine until a customer CIF is created. Holds channel, tracking ID, TAT, device/geo context, and restriction flags.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Surrogate key for the application |
| `tracking_id` | VARCHAR(32) | UQ | Customer-facing SBP tracking ID for status enquiry |
| `channel` | VARCHAR(32) | | Digital channel used (iOS/Android/Web/Kiosk) |
| `product_code` | VARCHAR(64) | | Product applied for (e.g. conventional savings) |
| `regulatory_phase` | VARCHAR(16) | | PILOT vs COMMERCIAL limit/policy regime |
| `state` | VARCHAR(64) | IX | Current KYC state machine value |
| `previous_state` | VARCHAR(64) | | Last state (denormalized for quick display) |
| `debit_block_intended` | BOOLEAN | | True when Verisys debit-block path applies |
| `bv_pending` | BOOLEAN | | Biometric verification still outstanding |
| `edd_required` | BOOLEAN | | CRP/PEP triggered enhanced due diligence |
| `ekyc_prefetch_used` | BOOLEAN | | Whether shared e-KYC prefetch was attempted/used |
| `ekyc_source_ref` | VARCHAR(128) | | Platform reference if prefetch succeeded |
| `device_id_hash` | VARCHAR(128) | IX | Hashed device identifier for fraud/binding |
| `ip_address` | INET | | Client IP captured for digital onboarding (**A**) |
| `geo_latitude` | NUMERIC(9,6) | | Geo latitude if permitted (**A**) |
| `geo_longitude` | NUMERIC(9,6) | | Geo longitude if permitted |
| `geo_accuracy_meters` | NUMERIC(10,2) | | Optional GPS accuracy |
| `app_version` | VARCHAR(32) | | Mobile/web app version for support/audit |
| `locale` | VARCHAR(16) | | UI language (en/ur) |
| `complete_documents_at` | TIMESTAMPTZ | | When application became “complete” for TAT clock |
| `tat_due_at` | TIMESTAMPTZ | IX | Deadline (individual: 2 working days) |
| `resume_expires_at` | TIMESTAMPTZ | | 30-day resume window expiry |
| `customer_id` | UUID | FK→customers | Set after CIF creation |
| `idempotency_key` | VARCHAR(64) | UQ | Prevents duplicate start requests |
| `created_at` | TIMESTAMPTZ | | Row creation time |
| `updated_at` | TIMESTAMPTZ | | Last update time |
| `created_by` | VARCHAR(64) | | Actor who created (usually SYSTEM/CUSTOMER) |
| `updated_by` | VARCHAR(64) | | Actor who last updated |
| `version` | INT | | Optimistic locking version |

---

## 2. `kyc_application_parties`

**Table purpose:** Associates natural persons to an application (primary, joint, mandate, guardian) for multi-party CDD and screening.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Party row id |
| `application_id` | UUID | FK | Parent application |
| `party_role` | VARCHAR(32) | | PRIMARY / JOINT / MANDATE / GUARDIAN |
| `sequence_no` | INT | UQ w/ role | Order among same role |
| `is_primary` | BOOLEAN | | Marks main applicant |
| `created_at` | TIMESTAMPTZ | | Created timestamp |

---

## 3. `customer_identities`

**Table purpose:** Stores identity-document CDD fields (Consolidated Table-A). CNIC and mother’s maiden name are encrypted; hash used for uniqueness/fraud.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Identity record id |
| `application_id` | UUID | FK, UQ w/ type | Owning application |
| `party_id` | UUID | FK | Optional link to application party |
| `customer_id` | UUID | FK | Set after approval; enables unique active CNIC |
| `id_type` | VARCHAR(16) | | CNIC / NICOP / POC / POR / ARC |
| `id_number_encrypted` | BYTEA | PII | Encrypted full ID number |
| `id_number_hash` | CHAR(64) | IX/UQ | SHA-256 of normalized ID for dedupe |
| `id_number_masked` | VARCHAR(32) | | Safe display form |
| `issue_date` | DATE | | ID issue date |
| `expiry_date` | DATE | | ID expiry date |
| `is_expired_with_token` | BOOLEAN | | Opened using NADRA renewal token path |
| `nadra_token_ref` | VARCHAR(128) | | Reference for renewal token/receipt |
| `full_name` | VARCHAR(200) | | Name as per ID |
| `father_spouse_name` | VARCHAR(200) | | Father/spouse name per ID |
| `mother_maiden_name_encrypted` | BYTEA | PII | Highly confidential verification field |
| `date_of_birth` | DATE | | DOB |
| `place_of_birth` | VARCHAR(100) | | Place of birth |
| `gender` | VARCHAR(32) | | Gender |
| `nationality` | VARCHAR(64) | | Primary nationality |
| `other_nationalities_json` | JSONB | | Additional nationalities |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Audit timestamps |

---

## 4. `customer_contacts`

**Table purpose:** Contact channels for OTP, alerts, and CDD contact information; supports MSISDN–CNIC pairing flags.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Contact id |
| `application_id` | UUID | FK, IX | Parent application |
| `customer_id` | UUID | FK | Post-approval link |
| `contact_type` | VARCHAR(32) | | MOBILE / EMAIL / ALTERNATE_MOBILE / EMERGENCY |
| `contact_value_encrypted` | BYTEA | PII | Encrypted contact value |
| `contact_value_hash` | CHAR(64) | UQ (active mobile) | Hash for uniqueness |
| `contact_value_masked` | VARCHAR(64) | | Masked display |
| `is_primary` | BOOLEAN | | Primary contact for OTP/alerts |
| `is_verified` | BOOLEAN | | OTP/verification completed |
| `verified_at` | TIMESTAMPTZ | | When verified |
| `msisdn_cnic_paired` | BOOLEAN | | Result of CNIC–MSISDN pairing check |
| `msisdn_pair_checked_at` | TIMESTAMPTZ | | When pairing checked |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 5. `customer_addresses`

**Table purpose:** Mailing and permanent (and optional business/employer) addresses.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Address id |
| `application_id` | UUID | FK | Parent application |
| `customer_id` | UUID | FK | Post-approval link |
| `address_type` | VARCHAR(32) | | MAILING / PERMANENT / BUSINESS / EMPLOYER |
| `line1` | VARCHAR(255) | | Address line 1 |
| `line2` | VARCHAR(255) | | Address line 2 |
| `city` | VARCHAR(100) | | City |
| `district` | VARCHAR(100) | | District |
| `province` | VARCHAR(100) | | Province |
| `postal_code` | VARCHAR(16) | | Postal code |
| `country_code` | CHAR(2) | | ISO country (default PK) |
| `same_as_id_document` | BOOLEAN | | Permanent address taken from ID |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 6. `customer_occupations_income`

**Table purpose:** Profession, employer/business, source of income/funds, expected behaviour, and Annex-B self-declaration path.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Record id |
| `application_id` | UUID | FK, UQ | One profile per application (v1) |
| `customer_id` | UUID | FK | Post-approval |
| `profession_code` | VARCHAR(64) | | Occupations enum (salaried, student, etc.) |
| `profession_detail` | VARCHAR(255) | | Free-text detail |
| `is_dnfbp` | BOOLEAN | | Designated non-financial business/profession flag |
| `employer_or_business_name` | VARCHAR(200) | | Employer or business name |
| `employer_or_business_address` | VARCHAR(500) | | Employer/business address |
| `designation` | VARCHAR(100) | | Job designation |
| `business_nature` | VARCHAR(200) | | Nature of business |
| `source_of_income` | VARCHAR(100) | | Declared SoI |
| `source_of_funds` | VARCHAR(100) | | Declared SoF |
| `fund_provider_name` | VARCHAR(200) | | For dependent/self-declaration path |
| `fund_provider_id_hash` | CHAR(64) | | Hash of fund provider ID |
| `fund_provider_relationship` | VARCHAR(64) | | Relationship to applicant |
| `self_declaration` | BOOLEAN | | Annex-B self-declaration used |
| `purpose_of_account` | VARCHAR(64) | | Purpose (savings, salary, business, etc.) |
| `expected_monthly_income` | NUMERIC(18,2) | | Declared income |
| `expected_debit_turnover` | NUMERIC(18,2) | | Expected debit turnover |
| `expected_credit_turnover` | NUMERIC(18,2) | | Expected credit turnover |
| `expected_debit_txn_count` | INT | | Expected debit txn count |
| `expected_credit_txn_count` | INT | | Expected credit txn count |
| `currency_code` | CHAR(3) | | Currency of amounts |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 7. `customer_tax_profiles`

**Table purpose:** FATCA/CRS and residency tax declarations.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Tax profile id |
| `application_id` | UUID | FK, UQ | Parent application |
| `customer_id` | UUID | FK | Post-approval |
| `residency_status` | VARCHAR(32) | | RESIDENT_PK / NRP / OTHER |
| `us_person` | BOOLEAN | | FATCA US person flag |
| `foreign_tax_resident` | BOOLEAN | | Any foreign tax residency |
| `foreign_tax_residencies_json` | JSONB | | List of countries / TINs metadata |
| `tin_encrypted` | BYTEA | PII | Encrypted TIN where collected |
| `fatca_crs_declared_at` | TIMESTAMPTZ | | Declaration timestamp |
| `declaration_version` | VARCHAR(32) | | Form/policy version |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 8. `kyc_consents`

**Table purpose:** Versioned explicit consents required for T&Cs, privacy, NADRA/BV, and optional shared e-KYC.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Consent id |
| `application_id` | UUID | FK, IX | Parent application |
| `customer_id` | UUID | FK | Post-approval |
| `consent_type` | VARCHAR(64) | | TNC / PRIVACY / KFS / BV_NADRA / EKYC_* / MARKETING |
| `policy_version` | VARCHAR(32) | | Legal text version accepted |
| `accepted` | BOOLEAN | | Must be true for mandatory types |
| `accepted_at` | TIMESTAMPTZ | | Acceptance time |
| `channel` | VARCHAR(32) | | Channel of acceptance |
| `ip_address` | INET | | IP at acceptance |
| `revoked_at` | TIMESTAMPTZ | | Revocation time if any |
| `created_at` | TIMESTAMPTZ | | Created timestamp |

---

## 9. `kyc_verifications`

**Table purpose:** One verification case per method (BV finger/face, Verisys, MSISDN pair, video KYC).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Verification case id |
| `application_id` | UUID | FK, IX | Parent application |
| `verification_type` | VARCHAR(32) | | BV_FINGER / VERISYS / MSISDN_PAIR / VIDEO_KYC / … |
| `status` | VARCHAR(32) | | PENDING / SUCCESS / FAILED / … |
| `assurance_level` | VARCHAR(32) | | Resulting assurance for risk engine |
| `vendor` | VARCHAR(64) | | Integration vendor name |
| `vendor_reference` | VARCHAR(128) | | External reference for audit |
| `fallback_reason_code` | VARCHAR(64) | | Why alternate tier used (disability, >60, etc.) |
| `started_at` | TIMESTAMPTZ | | Start time |
| `completed_at` | TIMESTAMPTZ | | Completion time |
| `created_at` | TIMESTAMPTZ | | Created timestamp |

---

## 10. `kyc_verification_attempts`

**Table purpose:** Append-oriented attempt log for retries, timeouts, and vendor responses (**AO** preferred).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Attempt id |
| `verification_id` | UUID | FK, UQ w/ no | Parent verification |
| `attempt_no` | INT | | 1..N attempt sequence |
| `result_code` | VARCHAR(64) | | Normalized domain result code |
| `result_detail` | VARCHAR(256) | | Short detail (no raw biometrics) |
| `request_id` | VARCHAR(64) | | Outbound request id |
| `correlation_id` | VARCHAR(64) | | Correlation across services |
| `http_status` | INT | | Transport status if applicable |
| `latency_ms` | INT | | Vendor latency for ops |
| `created_at` | TIMESTAMPTZ | AO | Attempt time |

---

## 11. `kyc_documents`

**Table purpose:** Metadata for encrypted objects (live photo, ID images, SoI proofs, video KYC) in object storage.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Document id |
| `application_id` | UUID | FK, IX | Parent application |
| `customer_id` | UUID | FK | Post-approval |
| `document_type` | VARCHAR(64) | | LIVE_PHOTO / CNIC_FRONT / SOI_PROOF / VIDEO_KYC / … |
| `storage_uri` | VARCHAR(512) | | Object store URI (not public URL) |
| `content_type` | VARCHAR(128) | | MIME type |
| `file_size_bytes` | BIGINT | | Size |
| `checksum_sha256` | CHAR(64) | | Integrity checksum |
| `encryption_key_ref` | VARCHAR(128) | | KMS/vault key reference |
| `retention_class` | VARCHAR(32) | | AML_CDD retention class |
| `legal_hold` | BOOLEAN | | Blocks purge when true |
| `captured_at` | TIMESTAMPTZ | | Capture time on device/session |
| `created_at` | TIMESTAMPTZ | | Stored time |

---

## 12. `face_checks`

**Table purpose:** Liveness and face-match results supporting live-photo verification (encouraged/supporting controls).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Face check id |
| `application_id` | UUID | FK | Parent application |
| `live_photo_document_id` | UUID | FK | Live photo document |
| `id_photo_document_id` | UUID | FK | ID portrait document if stored |
| `liveness_performed` | BOOLEAN | | Whether liveness ran |
| `liveness_score` | NUMERIC(6,4) | | Vendor liveness score |
| `liveness_vendor` | VARCHAR(64) | | Vendor |
| `match_score` | NUMERIC(6,4) | | Live vs ID match score |
| `match_threshold` | NUMERIC(6,4) | | Threshold used |
| `match_passed` | BOOLEAN | | Pass/fail |
| `vendor_reference` | VARCHAR(128) | | External ref |
| `status` | VARCHAR(32) | | Overall status |
| `created_at` | TIMESTAMPTZ | | Timestamp |

---

## 13. `screening_results`

**Table purpose:** Typed screening outcomes for sanctions, PEP, watchlist, adverse media — including list version and adjudication.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Screening result id |
| `application_id` | UUID | FK, IX | Parent application |
| `customer_id` | UUID | FK | Post-approval re-screens |
| `party_id` | UUID | FK | Which party was screened |
| `screening_type` | VARCHAR(32) | | SANCTIONS / PEP / WATCHLIST / ADVERSE_MEDIA |
| `provider` | VARCHAR(64) | | Screening provider |
| `status` | VARCHAR(32) | IX | CLEAR / POTENTIAL_HIT / CONFIRMED_HIT / ERROR |
| `score` | NUMERIC(5,2) | | Provider match score |
| `list_name` | VARCHAR(128) | | List screened |
| `list_version` | VARCHAR(64) | | **Critical** for audit reconstructability |
| `raw_result_ref` | VARCHAR(128) | | Pointer to encrypted raw payload |
| `adjudicated_status` | VARCHAR(32) | | FALSE_POSITIVE / TRUE_MATCH / PENDING |
| `adjudicated_by` | UUID | | Analyst user id |
| `adjudicated_at` | TIMESTAMPTZ | | Adjudication time |
| `adjudication_notes` | VARCHAR(500) | | Notes (minimize PII) |
| `created_at` | TIMESTAMPTZ | AO | Screen time |

---

## 14. `customer_risk_profiles`

**Table purpose:** Current effective customer risk rating and monitoring flags.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Profile id |
| `customer_id` | UUID | UQ active | Customer owning profile |
| `application_id` | UUID | FK | Originating application |
| `risk_rating` | VARCHAR(16) | | LOW / MEDIUM / HIGH |
| `edd_flag` | BOOLEAN | | EDD in force |
| `enhanced_monitoring` | BOOLEAN | | Post-PEP/EDD monitoring |
| `last_assessment_id` | UUID | | Latest assessment pointer |
| `effective_from` | TIMESTAMPTZ | | Validity start |
| `effective_to` | TIMESTAMPTZ | | Null = current |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 15. `customer_risk_assessments`

**Table purpose:** Immutable history of CRP model runs (score, factors, model version).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Assessment id |
| `application_id` | UUID | FK, IX | Application scored |
| `customer_id` | UUID | FK | Customer if exists |
| `model_version` | VARCHAR(32) | | CRP model version |
| `risk_rating` | VARCHAR(16) | | Output rating |
| `edd_required` | BOOLEAN | | EDD trigger |
| `score` | NUMERIC(8,4) | | Numeric score |
| `factors_json` | JSONB | | Factor contributions |
| `recommended_limits_json` | JSONB | | Suggested product limits |
| `created_at` | TIMESTAMPTZ | AO | Assessment time |

---

## 16. `kyc_rejection_reason_codes`

**Table purpose:** Catalog of reject reason codes with customer-facing messages (EN/UR).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `code` | VARCHAR(64) | PK | Stable reason code |
| `description` | VARCHAR(255) | | Internal description |
| `customer_message_en` | VARCHAR(500) | | Written decline text (EN) |
| `customer_message_ur` | VARCHAR(500) | | Written decline text (UR) |
| `is_active` | BOOLEAN | | Soft-disable flag |

---

## 17. `kyc_cases`

**Table purpose:** Operations cases for manual review, EDD, hits, duplicates, video KYC, fraud.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Case id |
| `application_id` | UUID | FK | Related application |
| `case_type` | VARCHAR(32) | IX | MANUAL_REVIEW / EDD / SANCTIONS_HIT / … |
| `status` | VARCHAR(32) | IX | OPEN / IN_PROGRESS / PENDING_CHECKER / CLOSED |
| `priority` | VARCHAR(16) | | Queue priority |
| `sla_due_at` | TIMESTAMPTZ | IX | Ops SLA (align to TAT where relevant) |
| `assigned_to` | UUID | | Analyst user id |
| `opened_by` | VARCHAR(64) | | Opener |
| `closed_at` | TIMESTAMPTZ | | Close time |
| `outcome` | VARCHAR(32) | | APPROVED / REJECTED / ESCALATED / … |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 18. `kyc_case_actions`

**Table purpose:** Maker-checker action trail on a case.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Action id |
| `case_id` | UUID | FK | Parent case |
| `action_type` | VARCHAR(32) | | ASSIGN / PROPOSE_APPROVE / CHECKER_APPROVE / … |
| `actor_id` | UUID | | Employee id |
| `actor_role` | VARCHAR(64) | | Role at time of action |
| `notes` | VARCHAR(1000) | | Action notes |
| `maker_action_id` | UUID | FK | Links checker action to maker proposal |
| `created_at` | TIMESTAMPTZ | AO | Action time |

---

## 19. `kyc_decisions`

**Table purpose:** Formal KYC decisions (STP or manual) that drive CIF/account creation or rejection.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Decision id |
| `application_id` | UUID | FK, IX | Application decided |
| `decision` | VARCHAR(32) | | APPROVE / REJECT / REQUEST_INFO |
| `decision_mode` | VARCHAR(32) | | STP / MANUAL / SYSTEM |
| `reason_codes` | VARCHAR[] | | Array of reason codes |
| `notes` | VARCHAR(1000) | | Internal notes |
| `restrictions_json` | JSONB | | Debit block / limit restrictions |
| `decided_by` | VARCHAR(64) | | Decision actor |
| `checker_id` | VARCHAR(64) | | Checker if dual control |
| `case_id` | UUID | FK | Related case if any |
| `decided_at` | TIMESTAMPTZ | | Decision timestamp |
| `created_at` | TIMESTAMPTZ | | Created timestamp |

---

## 20. `kyc_application_rejection_reasons`

**Table purpose:** Links a reject decision to one or more catalog reason codes (for written customer notice).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Link id |
| `application_id` | UUID | FK | Application |
| `decision_id` | UUID | FK | Reject decision |
| `reason_code` | VARCHAR(64) | FK | Catalog code |
| `created_at` | TIMESTAMPTZ | | Timestamp |

---

## 21. `kyc_status_history`

**Table purpose:** Append-only state transition log for audits and replay (**AO**).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | BIGSERIAL | PK | Sequence id |
| `application_id` | UUID | FK, IX | Application |
| `from_state` | VARCHAR(64) | | Prior state |
| `to_state` | VARCHAR(64) | | New state |
| `triggered_by_type` | VARCHAR(16) | | SYSTEM / CUSTOMER / EMPLOYEE |
| `triggered_by_id` | VARCHAR(64) | | Actor id |
| `reason_code` | VARCHAR(64) | | Transition reason |
| `correlation_id` | VARCHAR(64) | | Request correlation |
| `event_id` | UUID | | Domain event id |
| `created_at` | TIMESTAMPTZ | AO | Transition time |

---

## 22. `customers`

**Table purpose:** CIF master created after KYC approval; system of record for customer status.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Internal customer id |
| `cif` | VARCHAR(32) | UQ | Core banking customer number |
| `application_id` | UUID | FK, UQ | Originating KYC application |
| `full_name` | VARCHAR(200) | | Legal name |
| `status` | VARCHAR(32) | | ACTIVE / RESTRICTED / DORMANT / CLOSED |
| `kyc_status` | VARCHAR(32) | | COMPLETE / REFRESH_DUE / REMEDIATION |
| `risk_rating` | VARCHAR(16) | | Cached current rating |
| `onboarding_completed_at` | TIMESTAMPTZ | | Completion time |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 23. `accounts`

**Table purpose:** Deposit account opened after KYC; holds IBAN, status, limits, debit-block flag.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Account id |
| `customer_id` | UUID | FK, IX | Owner customer |
| `application_id` | UUID | FK | Originating application |
| `account_number` | VARCHAR(34) | UQ | Core account number |
| `iban` | VARCHAR(34) | UQ | IBAN |
| `product_code` | VARCHAR(64) | | Product |
| `currency_code` | CHAR(3) | | Currency |
| `status` | VARCHAR(32) | | PENDING / ACTIVE / RESTRICTED_ACTIVE / … |
| `debit_block` | BOOLEAN | | SBP debit-block path flag |
| `daily_debit_limit` | NUMERIC(18,2) | | Limit |
| `daily_credit_limit` | NUMERIC(18,2) | | Limit |
| `monthly_debit_limit` | NUMERIC(18,2) | | Limit |
| `activated_at` | TIMESTAMPTZ | | Activation time |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 24. `identity_uniqueness_keys`

**Table purpose:** Cross-cutting uniqueness registry for CNIC/mobile/device/biometric tokens to detect duplicates.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Key row id |
| `key_type` | VARCHAR(32) | UQ w/ hash+status | CNIC_HASH / MOBILE_HASH / DEVICE_HASH / BIOMETRIC_TOKEN |
| `key_hash` | CHAR(64) | UQ w/ type | Hash/token value |
| `customer_id` | UUID | | Linked customer if any |
| `application_id` | UUID | FK | Linked application |
| `status` | VARCHAR(32) | | ACTIVE / RELEASED / BLOCKED |
| `created_at` | TIMESTAMPTZ | | Timestamp |

---

## 25. `device_bindings`

**Table purpose:** Bind devices to applications/customers for fraud monitoring and trusted-device policy.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Binding id |
| `application_id` | UUID | FK | Application context |
| `customer_id` | UUID | FK | Customer context |
| `device_id_hash` | VARCHAR(128) | IX | Device hash |
| `platform` | VARCHAR(32) | | iOS/Android/Web |
| `first_seen_at` | TIMESTAMPTZ | | First seen |
| `last_seen_at` | TIMESTAMPTZ | | Last seen |
| `is_trusted` | BOOLEAN | | Trusted after successful KYC/login |
| `status` | VARCHAR(32) | | ACTIVE / REVOKED |

---

## 26. `fraud_alerts`

**Table purpose:** Fraud/dedupe alerts raised during onboarding; may open a KYC case.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Alert id |
| `application_id` | UUID | FK | Application |
| `customer_id` | UUID | | Customer if known |
| `alert_type` | VARCHAR(64) | | DUPLICATE_CNIC / MULTI_DEVICE / … |
| `severity` | VARCHAR(16) | | LOW / MEDIUM / HIGH / CRITICAL |
| `status` | VARCHAR(32) | | OPEN / CLOSED |
| `details_json` | JSONB | | Structured alert context |
| `case_id` | UUID | FK | Linked ops case |
| `created_at` | TIMESTAMPTZ | | Timestamp |

---

## 27. `kyc_refresh_schedules`

**Table purpose:** Periodic KYC refresh due dates by risk rating.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Schedule id |
| `customer_id` | UUID | FK | Customer |
| `risk_rating` | VARCHAR(16) | | Rating driving frequency |
| `frequency_days` | INT | | Interval in days |
| `next_due_at` | TIMESTAMPTZ | IX | Next due date |
| `last_completed_at` | TIMESTAMPTZ | | Last refresh completion |
| `last_refresh_application_id` | UUID | FK | Last refresh application |
| `status` | VARCHAR(32) | | SCHEDULED / DUE / OVERDUE / COMPLETED |
| `created_at` / `updated_at` | TIMESTAMPTZ | | Timestamps |

---

## 28. `shared_ekyc_exchanges`

**Table purpose:** Audit of shared e-KYC fetch/publish attempts (consent-gated).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Exchange id |
| `application_id` | UUID | FK | Application |
| `consent_id` | UUID | FK | Consent authorizing exchange |
| `direction` | VARCHAR(16) | | FETCH / PUBLISH |
| `status` | VARCHAR(32) | | SUCCESS / MISS / ERROR / SKIPPED |
| `platform_ref` | VARCHAR(128) | | Platform reference |
| `fields_received_json` | JSONB | | Field names/provenance (minimize raw PII) |
| `error_code` | VARCHAR(64) | | Error if any |
| `created_at` | TIMESTAMPTZ | AO | Timestamp |

---

## 29. `kyc_audit_logs`

**Table purpose:** Immutable enterprise audit of KYC actions for SBP inspection and internal audit (**AO**).

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | BIGSERIAL | PK | Sequence |
| `occurred_at` | TIMESTAMPTZ | IX w/ app | Event time |
| `application_id` | UUID | IX | Application |
| `customer_id` | UUID | IX | Customer |
| `actor_id` | VARCHAR(64) | | Who acted |
| `actor_type` | VARCHAR(16) | | SYSTEM / CUSTOMER / EMPLOYEE |
| `action` | VARCHAR(64) | | Action enum |
| `previous_state` | VARCHAR(64) | | Prior KYC state |
| `new_state` | VARCHAR(64) | | New KYC state |
| `ip_address` | INET | | Client IP where relevant |
| `device_id_hash` | VARCHAR(128) | | Device |
| `request_id` | VARCHAR(64) | | HTTP/request id |
| `correlation_id` | VARCHAR(64) | | Cross-service correlation |
| `source_system` | VARCHAR(64) | | Producing service |
| `decision` | VARCHAR(64) | | Decision if applicable |
| `reason` | VARCHAR(256) | | Reason text/code |
| `external_reference` | VARCHAR(128) | | NADRA/vendor/screening ref |
| `screening_status` | VARCHAR(32) | | Screening snapshot |
| `risk_score` | NUMERIC(8,4) | | Risk snapshot |
| `payload_hash` | CHAR(64) | | Hash of canonical payload |
| `prev_hash` | CHAR(64) | | Optional hash chain |
| `schema_version` | INT | | Audit schema version |

---

## 30. `otp_challenges`

**Table purpose:** Short-lived OTP challenges; stores **code hash only**.

| Column | Type | Keys | Purpose |
|--------|------|------|---------|
| `id` | UUID | PK | Challenge id |
| `application_id` | UUID | FK, IX | Application |
| `contact_id` | UUID | FK | Contact being verified |
| `channel` | VARCHAR(16) | | SMS / EMAIL |
| `code_hash` | CHAR(64) | | Hash of OTP (never store clear OTP) |
| `expires_at` | TIMESTAMPTZ | | Expiry |
| `attempt_count` | INT | | Failed/try count |
| `max_attempts` | INT | | Lockout threshold |
| `consumed_at` | TIMESTAMPTZ | | Success time |
| `created_at` | TIMESTAMPTZ | | Created |

---

## Retention summary

| Data class | Tables | Guidance |
|------------|--------|----------|
| CDD / KYC evidence | identities, docs, verifications, screenings, decisions | AML Reg–8 retention (confirm years with Legal) |
| Audit | `kyc_audit_logs`, `kyc_status_history` | Long-term / WORM archive |
| OTP | `otp_challenges` | Short TTL purge after consumption/expiry |
| Biometrics | prefer tokens in verifications; avoid raw templates | Minimize; legal hold only if required |

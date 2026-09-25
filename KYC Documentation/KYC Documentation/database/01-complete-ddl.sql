-- =============================================================================
-- KYC / CDD Database Schema — Conventional Digital Retail Bank (Pakistan)
-- PostgreSQL-oriented. Fictional design for implementation reference.
-- Not legal advice. Confirm retention/encryption with Compliance & Security.
-- Version: 1.0 | Research cut-off: September 2026
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. APPLICATION HEADER
-- Purpose: One row per onboarding attempt; owns KYC state machine until CIF exists.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_applications (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id                 VARCHAR(32)  NOT NULL,
  channel                     VARCHAR(32)  NOT NULL,  -- MOBILE_IOS | MOBILE_ANDROID | WEB | KIOSK
  product_code                VARCHAR(64)  NOT NULL,
  regulatory_phase            VARCHAR(16)  NOT NULL DEFAULT 'COMMERCIAL', -- PILOT | COMMERCIAL
  state                       VARCHAR(64)  NOT NULL,
  previous_state              VARCHAR(64),
  debit_block_intended        BOOLEAN      NOT NULL DEFAULT FALSE,
  bv_pending                  BOOLEAN      NOT NULL DEFAULT FALSE,
  edd_required                BOOLEAN      NOT NULL DEFAULT FALSE,
  ekyc_prefetch_used          BOOLEAN      NOT NULL DEFAULT FALSE,
  ekyc_source_ref             VARCHAR(128),
  device_id_hash              VARCHAR(128),
  ip_address                  INET,
  geo_latitude                NUMERIC(9,6),
  geo_longitude               NUMERIC(9,6),
  geo_accuracy_meters         NUMERIC(10,2),
  app_version                 VARCHAR(32),
  locale                      VARCHAR(16)  DEFAULT 'en',
  complete_documents_at       TIMESTAMPTZ,
  tat_due_at                  TIMESTAMPTZ,
  resume_expires_at           TIMESTAMPTZ,
  customer_id                 UUID,
  idempotency_key             VARCHAR(64),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by                  VARCHAR(64),
  updated_by                  VARCHAR(64),
  version                     INT          NOT NULL DEFAULT 1,
  CONSTRAINT uq_kyc_applications_tracking UNIQUE (tracking_id),
  CONSTRAINT uq_kyc_applications_idempotency UNIQUE (idempotency_key)
);

CREATE INDEX ix_kyc_applications_state ON kyc_applications (state);
CREATE INDEX ix_kyc_applications_tat ON kyc_applications (tat_due_at) WHERE state NOT IN ('APPROVED','REJECTED','EXPIRED','WITHDRAWN','ACTIVE','RESTRICTED_ACTIVE');
CREATE INDEX ix_kyc_applications_device ON kyc_applications (device_id_hash);

-- -----------------------------------------------------------------------------
-- 2. APPLICATION PARTIES (joint / mandate — v1 mainly PRIMARY)
-- Purpose: Link natural persons associated with an application.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_application_parties (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  party_role                  VARCHAR(32)  NOT NULL, -- PRIMARY | JOINT | MANDATE | GUARDIAN
  sequence_no                 INT          NOT NULL DEFAULT 1,
  is_primary                  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_app_party UNIQUE (application_id, party_role, sequence_no)
);

-- -----------------------------------------------------------------------------
-- 3. IDENTITY
-- Purpose: CNIC/NICOP/POC/POR/ARC attributes for CDD identity (Table-A).
-- -----------------------------------------------------------------------------
CREATE TABLE customer_identities (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  party_id                    UUID         REFERENCES kyc_application_parties(id),
  customer_id                 UUID,
  id_type                     VARCHAR(16)  NOT NULL, -- CNIC | NICOP | POC | POR | ARC
  id_number_encrypted         BYTEA        NOT NULL,
  id_number_hash              CHAR(64)     NOT NULL,
  id_number_masked            VARCHAR(32)  NOT NULL, -- display e.g. 35202-*******-1
  issue_date                  DATE,
  expiry_date                 DATE,
  is_expired_with_token       BOOLEAN      NOT NULL DEFAULT FALSE,
  nadra_token_ref             VARCHAR(128),
  full_name                   VARCHAR(200) NOT NULL,
  father_spouse_name          VARCHAR(200),
  mother_maiden_name_encrypted BYTEA,
  date_of_birth               DATE         NOT NULL,
  place_of_birth              VARCHAR(100),
  gender                      VARCHAR(32),
  nationality                 VARCHAR(64)  DEFAULT 'PK',
  other_nationalities_json    JSONB,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_identity_app_type UNIQUE (application_id, id_type)
);

CREATE INDEX ix_customer_identities_hash ON customer_identities (id_number_hash);
CREATE UNIQUE INDEX uq_identity_hash_active_customer
  ON customer_identities (id_number_hash)
  WHERE customer_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 4. CONTACTS
-- Purpose: Mobile, email, emergency contacts; OTP verification evidence.
-- -----------------------------------------------------------------------------
CREATE TABLE customer_contacts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  contact_type                VARCHAR(32)  NOT NULL, -- MOBILE | EMAIL | ALTERNATE_MOBILE | EMERGENCY
  contact_value_encrypted     BYTEA        NOT NULL,
  contact_value_hash          CHAR(64)     NOT NULL,
  contact_value_masked        VARCHAR(64)  NOT NULL,
  is_primary                  BOOLEAN      NOT NULL DEFAULT FALSE,
  is_verified                 BOOLEAN      NOT NULL DEFAULT FALSE,
  verified_at                 TIMESTAMPTZ,
  msisdn_cnic_paired          BOOLEAN,
  msisdn_pair_checked_at      TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_contacts_app ON customer_contacts (application_id);
CREATE UNIQUE INDEX uq_verified_mobile_active
  ON customer_contacts (contact_value_hash)
  WHERE contact_type = 'MOBILE' AND is_verified = TRUE AND customer_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 5. ADDRESSES
-- Purpose: Mailing and permanent addresses per Consolidated Framework.
-- -----------------------------------------------------------------------------
CREATE TABLE customer_addresses (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  address_type                VARCHAR(32)  NOT NULL, -- MAILING | PERMANENT | BUSINESS | EMPLOYER
  line1                       VARCHAR(255) NOT NULL,
  line2                       VARCHAR(255),
  city                        VARCHAR(100),
  district                    VARCHAR(100),
  province                    VARCHAR(100),
  postal_code                 VARCHAR(16),
  country_code                CHAR(2)      NOT NULL DEFAULT 'PK',
  same_as_id_document         BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_addresses_app ON customer_addresses (application_id);

-- -----------------------------------------------------------------------------
-- 6. OCCUPATION / INCOME / SOURCE OF FUNDS
-- Purpose: CDD profession, SoI/SoF, expected account behaviour (Annex-B).
-- -----------------------------------------------------------------------------
CREATE TABLE customer_occupations_income (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  profession_code             VARCHAR(64)  NOT NULL, -- SALARIED | SELF_EMPLOYED | STUDENT | ...
  profession_detail           VARCHAR(255),
  is_dnfbp                    BOOLEAN      NOT NULL DEFAULT FALSE,
  employer_or_business_name   VARCHAR(200),
  employer_or_business_address VARCHAR(500),
  designation                 VARCHAR(100),
  business_nature             VARCHAR(200),
  source_of_income            VARCHAR(100),
  source_of_funds             VARCHAR(100),
  fund_provider_name          VARCHAR(200),
  fund_provider_id_hash       CHAR(64),
  fund_provider_relationship  VARCHAR(64),
  self_declaration            BOOLEAN      NOT NULL DEFAULT FALSE,
  purpose_of_account          VARCHAR(64),
  expected_monthly_income     NUMERIC(18,2),
  expected_debit_turnover     NUMERIC(18,2),
  expected_credit_turnover    NUMERIC(18,2),
  expected_debit_txn_count    INT,
  expected_credit_txn_count   INT,
  currency_code               CHAR(3)      DEFAULT 'PKR',
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_occupation_app UNIQUE (application_id)
);

-- -----------------------------------------------------------------------------
-- 7. TAX / FATCA / CRS
-- Purpose: Tax residency declarations required at onboarding.
-- -----------------------------------------------------------------------------
CREATE TABLE customer_tax_profiles (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  residency_status            VARCHAR(32)  NOT NULL, -- RESIDENT_PK | NRP | OTHER
  us_person                   BOOLEAN      NOT NULL DEFAULT FALSE,
  foreign_tax_resident        BOOLEAN      NOT NULL DEFAULT FALSE,
  foreign_tax_residencies_json JSONB,
  tin_encrypted               BYTEA,
  fatca_crs_declared_at       TIMESTAMPTZ,
  declaration_version         VARCHAR(32),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_tax_app UNIQUE (application_id)
);

-- -----------------------------------------------------------------------------
-- 8. CONSENTS
-- Purpose: Versioned explicit consents (T&Cs, privacy, BV, e-KYC).
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_consents (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  consent_type                VARCHAR(64)  NOT NULL, -- TNC | PRIVACY | KFS | BV_NADRA | EKYC_READ | EKYC_WRITE | MARKETING
  policy_version              VARCHAR(32)  NOT NULL,
  accepted                    BOOLEAN      NOT NULL,
  accepted_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
  channel                     VARCHAR(32),
  ip_address                  INET,
  revoked_at                  TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_consents_app_type ON kyc_consents (application_id, consent_type);

-- -----------------------------------------------------------------------------
-- 9. VERIFICATIONS + ATTEMPTS
-- Purpose: NADRA BV / Verisys / MSISDN / Video KYC orchestration evidence.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_verifications (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  verification_type           VARCHAR(32)  NOT NULL, -- BV_FINGER | BV_FACE | BV_IRIS | VERISYS | MSISDN_PAIR | VIDEO_KYC | ORIGINAL_SEEN
  status                      VARCHAR(32)  NOT NULL, -- PENDING | IN_PROGRESS | SUCCESS | FAILED | EXPIRED
  assurance_level             VARCHAR(32),
  vendor                      VARCHAR(64),
  vendor_reference            VARCHAR(128),
  fallback_reason_code        VARCHAR(64),
  started_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  completed_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_verifications_app ON kyc_verifications (application_id, verification_type);

CREATE TABLE kyc_verification_attempts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id             UUID         NOT NULL REFERENCES kyc_verifications(id),
  attempt_no                  INT          NOT NULL,
  result_code                 VARCHAR(64),
  result_detail               VARCHAR(256),
  request_id                  VARCHAR(64),
  correlation_id              VARCHAR(64),
  http_status                 INT,
  latency_ms                  INT,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_verification_attempt UNIQUE (verification_id, attempt_no)
);

-- -----------------------------------------------------------------------------
-- 10. DOCUMENTS + FACE CHECKS
-- Purpose: Encrypted object metadata; live photo / liveness / face-match scores.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_documents (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  document_type               VARCHAR(64)  NOT NULL, -- LIVE_PHOTO | CNIC_FRONT | CNIC_BACK | SOI_PROOF | VIDEO_KYC | OTHER
  storage_uri                 VARCHAR(512) NOT NULL,
  content_type                VARCHAR(128),
  file_size_bytes             BIGINT,
  checksum_sha256             CHAR(64),
  encryption_key_ref          VARCHAR(128),
  retention_class             VARCHAR(32)  NOT NULL DEFAULT 'AML_CDD',
  legal_hold                  BOOLEAN      NOT NULL DEFAULT FALSE,
  captured_at                 TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_documents_app ON kyc_documents (application_id, document_type);

CREATE TABLE face_checks (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  live_photo_document_id      UUID         REFERENCES kyc_documents(id),
  id_photo_document_id        UUID         REFERENCES kyc_documents(id),
  liveness_performed          BOOLEAN      NOT NULL DEFAULT FALSE,
  liveness_score              NUMERIC(6,4),
  liveness_vendor             VARCHAR(64),
  match_score                 NUMERIC(6,4),
  match_threshold             NUMERIC(6,4),
  match_passed                BOOLEAN,
  vendor_reference            VARCHAR(128),
  status                      VARCHAR(32)  NOT NULL,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 11. SCREENING
-- Purpose: Sanctions / PEP / watchlist / adverse media results (typed).
-- -----------------------------------------------------------------------------
CREATE TABLE screening_results (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  party_id                    UUID         REFERENCES kyc_application_parties(id),
  screening_type              VARCHAR(32)  NOT NULL, -- SANCTIONS | PEP | WATCHLIST | ADVERSE_MEDIA
  provider                    VARCHAR(64)  NOT NULL,
  status                      VARCHAR(32)  NOT NULL, -- CLEAR | POTENTIAL_HIT | CONFIRMED_HIT | ERROR
  score                       NUMERIC(5,2),
  list_name                   VARCHAR(128),
  list_version                VARCHAR(64)  NOT NULL,
  raw_result_ref              VARCHAR(128),
  adjudicated_status          VARCHAR(32), -- FALSE_POSITIVE | TRUE_MATCH | PENDING
  adjudicated_by              UUID,
  adjudicated_at              TIMESTAMPTZ,
  adjudication_notes          VARCHAR(500),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_screening_app_type ON screening_results (application_id, screening_type);
CREATE INDEX ix_screening_status ON screening_results (status) WHERE status <> 'CLEAR';

-- -----------------------------------------------------------------------------
-- 12. RISK
-- Purpose: Current CRP snapshot + each assessment run with model version.
-- -----------------------------------------------------------------------------
CREATE TABLE customer_risk_profiles (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id                 UUID         NOT NULL,
  application_id              UUID         REFERENCES kyc_applications(id),
  risk_rating                 VARCHAR(16)  NOT NULL, -- LOW | MEDIUM | HIGH
  edd_flag                    BOOLEAN      NOT NULL DEFAULT FALSE,
  enhanced_monitoring         BOOLEAN      NOT NULL DEFAULT FALSE,
  last_assessment_id          UUID,
  effective_from              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  effective_to                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_risk_profile_active_customer
  ON customer_risk_profiles (customer_id)
  WHERE effective_to IS NULL;

CREATE TABLE customer_risk_assessments (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  customer_id                 UUID,
  model_version               VARCHAR(32)  NOT NULL,
  risk_rating                 VARCHAR(16)  NOT NULL,
  edd_required                BOOLEAN      NOT NULL DEFAULT FALSE,
  score                       NUMERIC(8,4) NOT NULL,
  factors_json                JSONB        NOT NULL,
  recommended_limits_json     JSONB,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_risk_assessments_app ON customer_risk_assessments (application_id);

-- -----------------------------------------------------------------------------
-- 13. CASES / ACTIONS / DECISIONS / REJECTION REASONS
-- Purpose: Manual review, EDD, maker-checker, final decisions.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_rejection_reason_codes (
  code                        VARCHAR(64)  PRIMARY KEY,
  description                 VARCHAR(255) NOT NULL,
  customer_message_en         VARCHAR(500),
  customer_message_ur         VARCHAR(500),
  is_active                   BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE kyc_cases (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  case_type                   VARCHAR(32)  NOT NULL, -- MANUAL_REVIEW | EDD | SANCTIONS_HIT | PEP | DUPLICATE | DOC_EXCEPTION | FRAUD | VIDEO_KYC
  status                      VARCHAR(32)  NOT NULL, -- OPEN | IN_PROGRESS | PENDING_CHECKER | CLOSED
  priority                    VARCHAR(16)  NOT NULL DEFAULT 'MEDIUM',
  sla_due_at                  TIMESTAMPTZ,
  assigned_to                 UUID,
  opened_by                   VARCHAR(64),
  closed_at                   TIMESTAMPTZ,
  outcome                     VARCHAR(32),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_kyc_cases_queue ON kyc_cases (status, case_type, sla_due_at);

CREATE TABLE kyc_case_actions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id                     UUID         NOT NULL REFERENCES kyc_cases(id),
  action_type                 VARCHAR(32)  NOT NULL, -- ASSIGN | COMMENT | REQUEST_INFO | PROPOSE_APPROVE | PROPOSE_REJECT | CHECKER_APPROVE | CHECKER_REJECT
  actor_id                    UUID         NOT NULL,
  actor_role                  VARCHAR(64)  NOT NULL,
  notes                       VARCHAR(1000),
  maker_action_id             UUID         REFERENCES kyc_case_actions(id),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE kyc_decisions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  decision                    VARCHAR(32)  NOT NULL, -- APPROVE | REJECT | REQUEST_INFO
  decision_mode               VARCHAR(32)  NOT NULL, -- STP | MANUAL | SYSTEM
  reason_codes                VARCHAR(64)[],
  notes                       VARCHAR(1000),
  restrictions_json           JSONB,
  decided_by                  VARCHAR(64)  NOT NULL,
  checker_id                  VARCHAR(64),
  case_id                     UUID         REFERENCES kyc_cases(id),
  decided_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_decisions_app ON kyc_decisions (application_id);

CREATE TABLE kyc_application_rejection_reasons (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  decision_id                 UUID         NOT NULL REFERENCES kyc_decisions(id),
  reason_code                 VARCHAR(64)  NOT NULL REFERENCES kyc_rejection_reason_codes(code),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 14. STATUS HISTORY
-- Purpose: Append-only state transitions for reconstructability.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_status_history (
  id                          BIGSERIAL PRIMARY KEY,
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  from_state                  VARCHAR(64),
  to_state                    VARCHAR(64)  NOT NULL,
  triggered_by_type           VARCHAR(16)  NOT NULL, -- SYSTEM | CUSTOMER | EMPLOYEE
  triggered_by_id             VARCHAR(64),
  reason_code                 VARCHAR(64),
  correlation_id              VARCHAR(64),
  event_id                    UUID,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_status_history_app ON kyc_status_history (application_id, created_at);

-- -----------------------------------------------------------------------------
-- 15. CUSTOMERS + ACCOUNTS (post-approval)
-- Purpose: CIF master and account product instance (may live in other DBs).
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cif                         VARCHAR(32)  NOT NULL,
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  full_name                   VARCHAR(200) NOT NULL,
  status                      VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | RESTRICTED | DORMANT | CLOSED
  kyc_status                  VARCHAR(32)  NOT NULL DEFAULT 'COMPLETE',
  risk_rating                 VARCHAR(16),
  onboarding_completed_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_customers_cif UNIQUE (cif),
  CONSTRAINT uq_customers_application UNIQUE (application_id)
);

CREATE TABLE accounts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id                 UUID         NOT NULL REFERENCES customers(id),
  application_id              UUID         REFERENCES kyc_applications(id),
  account_number              VARCHAR(34)  NOT NULL,
  iban                        VARCHAR(34)  NOT NULL,
  product_code                VARCHAR(64)  NOT NULL,
  currency_code               CHAR(3)      NOT NULL DEFAULT 'PKR',
  status                      VARCHAR(32)  NOT NULL, -- PENDING | ACTIVE | RESTRICTED_ACTIVE | FROZEN | CLOSED
  debit_block                 BOOLEAN      NOT NULL DEFAULT FALSE,
  daily_debit_limit           NUMERIC(18,2),
  daily_credit_limit          NUMERIC(18,2),
  monthly_debit_limit         NUMERIC(18,2),
  activated_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_accounts_number UNIQUE (account_number),
  CONSTRAINT uq_accounts_iban UNIQUE (iban)
);

CREATE INDEX ix_accounts_customer ON accounts (customer_id);

-- -----------------------------------------------------------------------------
-- 16. FRAUD / DEDUPE / DEVICE
-- Purpose: Duplicate identity and device abuse controls.
-- -----------------------------------------------------------------------------
CREATE TABLE identity_uniqueness_keys (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_type                    VARCHAR(32)  NOT NULL, -- CNIC_HASH | MOBILE_HASH | DEVICE_HASH | BIOMETRIC_TOKEN
  key_hash                    CHAR(64)     NOT NULL,
  customer_id                 UUID,
  application_id              UUID         REFERENCES kyc_applications(id),
  status                      VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | RELEASED | BLOCKED
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_identity_key UNIQUE (key_type, key_hash, status)
);

CREATE TABLE device_bindings (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         REFERENCES kyc_applications(id),
  customer_id                 UUID         REFERENCES customers(id),
  device_id_hash              VARCHAR(128) NOT NULL,
  platform                    VARCHAR(32),
  first_seen_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_seen_at                TIMESTAMPTZ  NOT NULL DEFAULT now(),
  is_trusted                  BOOLEAN      NOT NULL DEFAULT FALSE,
  status                      VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX ix_device_bindings_hash ON device_bindings (device_id_hash);

CREATE TABLE fraud_alerts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         REFERENCES kyc_applications(id),
  customer_id                 UUID,
  alert_type                  VARCHAR(64)  NOT NULL, -- DUPLICATE_CNIC | MULTI_DEVICE | BIOMETRIC_BURST | SIM_ANOMALY | SYNTHETIC
  severity                    VARCHAR(16)  NOT NULL,
  status                      VARCHAR(32)  NOT NULL DEFAULT 'OPEN',
  details_json                JSONB,
  case_id                     UUID         REFERENCES kyc_cases(id),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 17. REFRESH / SHARED e-KYC EXCHANGE LOG
-- Purpose: Periodic refresh schedule; optional e-KYC fetch/publish audit.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_refresh_schedules (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id                 UUID         NOT NULL REFERENCES customers(id),
  risk_rating                 VARCHAR(16)  NOT NULL,
  frequency_days              INT          NOT NULL,
  next_due_at                 TIMESTAMPTZ  NOT NULL,
  last_completed_at           TIMESTAMPTZ,
  last_refresh_application_id UUID         REFERENCES kyc_applications(id),
  status                      VARCHAR(32)  NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED | DUE | OVERDUE | COMPLETED
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_refresh_due ON kyc_refresh_schedules (next_due_at, status);

CREATE TABLE shared_ekyc_exchanges (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  consent_id                  UUID         REFERENCES kyc_consents(id),
  direction                   VARCHAR(16)  NOT NULL, -- FETCH | PUBLISH
  status                      VARCHAR(32)  NOT NULL, -- SUCCESS | MISS | ERROR | SKIPPED
  platform_ref                VARCHAR(128),
  fields_received_json        JSONB,
  error_code                  VARCHAR(64),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 18. AUDIT LOGS (APPEND-ONLY)
-- Purpose: Immutable evidence of every material KYC action.
-- -----------------------------------------------------------------------------
CREATE TABLE kyc_audit_logs (
  id                          BIGSERIAL PRIMARY KEY,
  occurred_at                 TIMESTAMPTZ  NOT NULL DEFAULT now(),
  application_id              UUID,
  customer_id                 UUID,
  actor_id                    VARCHAR(64),
  actor_type                  VARCHAR(16)  NOT NULL, -- SYSTEM | CUSTOMER | EMPLOYEE
  action                      VARCHAR(64)  NOT NULL,
  previous_state              VARCHAR(64),
  new_state                   VARCHAR(64),
  ip_address                  INET,
  device_id_hash              VARCHAR(128),
  request_id                  VARCHAR(64),
  correlation_id              VARCHAR(64),
  source_system               VARCHAR(64),
  decision                    VARCHAR(64),
  reason                      VARCHAR(256),
  external_reference          VARCHAR(128),
  screening_status            VARCHAR(32),
  risk_score                  NUMERIC(8,4),
  payload_hash                CHAR(64),
  prev_hash                   CHAR(64),
  schema_version              INT          NOT NULL DEFAULT 1
);

CREATE INDEX ix_audit_application ON kyc_audit_logs (application_id, occurred_at);
CREATE INDEX ix_audit_customer ON kyc_audit_logs (customer_id, occurred_at);

-- REVOKE UPDATE, DELETE ON kyc_audit_logs FROM app_runtime_role;
-- GRANT INSERT, SELECT ON kyc_audit_logs TO app_runtime_role;

-- -----------------------------------------------------------------------------
-- 19. OTP CHALLENGES (short-lived)
-- Purpose: Contact verification challenges; store hashes only.
-- -----------------------------------------------------------------------------
CREATE TABLE otp_challenges (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id              UUID         NOT NULL REFERENCES kyc_applications(id),
  contact_id                  UUID         REFERENCES customer_contacts(id),
  channel                     VARCHAR(16)  NOT NULL, -- SMS | EMAIL
  code_hash                   CHAR(64)     NOT NULL,
  expires_at                  TIMESTAMPTZ  NOT NULL,
  attempt_count               INT          NOT NULL DEFAULT 0,
  max_attempts                INT          NOT NULL DEFAULT 5,
  consumed_at                 TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ix_otp_app ON otp_challenges (application_id) WHERE consumed_at IS NULL;

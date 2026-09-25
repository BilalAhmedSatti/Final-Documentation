# 13–14. KYC Database Architecture & ERD

> Normalized design for Conventional DRB. Prefer fewer, clearer tables over one table per synonym.  
> **Complete pack:** [database/README.md](database/README.md) — full DDL, column-level data dictionary, DFD & ERD.  
> Diagrams: [diagrams/04-database-architecture.mmd](diagrams/04-database-architecture.mmd), [diagrams/05-kyc-erd.mmd](diagrams/05-kyc-erd.mmd), [diagrams/13-kyc-dfd-context.mmd](diagrams/13-kyc-dfd-context.mmd), [diagrams/14-kyc-dfd-level1.mmd](diagrams/14-kyc-dfd-level1.mmd), [diagrams/15-kyc-erd-detailed.mmd](diagrams/15-kyc-erd-detailed.mmd).  
> Data dictionary: [database/02-data-dictionary-complete.md](database/02-data-dictionary-complete.md).

---

## Design principles

1. **Application before customer:** Prospect data lives on `kyc_applications` until approval creates `customers`.  
2. **Append-only evidence:** verifications, screenings, audits are insert-only.  
3. **Tokenize secrets:** store biometric vendor tokens / hashes, not raw templates, where legally/technically possible.  
4. **Soft delete carefully:** prefer status + retention holds; hard delete only under approved erasure with audit.  
5. **Version CRP and consents.**  

---

## Required tables

| Table | Purpose |
|-------|---------|
| `kyc_applications` | Onboarding application header, tracking ID, state, channel, TAT |
| `kyc_application_parties` | Applicant / joint / mandate links (v1 mainly primary) |
| `customer_identities` | ID document attributes (CNIC etc.) tied to application/customer |
| `customer_contacts` | Mobile, email, emergency |
| `customer_addresses` | Mailing / permanent |
| `customer_occupations_income` | Profession, employer/business, SoI/SoF, expected turnover |
| `customer_tax_profiles` | FATCA/CRS declarations |
| `kyc_consents` | Versioned consents |
| `kyc_verifications` | Verification cases (BV, Verisys, MSISDN, video) |
| `kyc_verification_attempts` | Attempt-level detail, vendor refs, outcomes |
| `kyc_documents` | Document metadata (object store pointers) |
| `face_checks` | Live photo / liveness / face-match results (tokenized) |
| `screening_results` | Sanctions, PEP, AML watchlist, adverse media (typed) |
| `customer_risk_profiles` | Current risk rating |
| `customer_risk_assessments` | Each scoring run |
| `kyc_cases` | Manual/EDD cases |
| `kyc_case_actions` | Maker-checker actions |
| `kyc_decisions` | Final/interim decisions |
| `kyc_status_history` | State transitions |
| `kyc_rejection_reasons` | Reason codes catalog + application link |
| `customers` | CIF master post-approval |
| `accounts` (or Account Service DB) | Account, IBAN, status, limits, debit_block |
| `device_bindings` | Device ↔ customer/application |
| `identity_uniqueness_keys` | Hash keys for CNIC/mobile/device dedupe |
| `kyc_refresh_schedules` | Next refresh due |
| `kyc_audit_logs` | Immutable audit |

## Optional / Phase-2 tables

| Table | When |
|-------|------|
| `entities`, `entity_parties`, `beneficial_owners` | Entity onboarding |
| `adverse_media_results` | If not folded into `screening_results` |
| `biometric_raw_archive` | Avoid if possible; legal hold only |
| `shared_ekyc_exchanges` | Detailed fetch/publish ledger |
| `employment_history` | If split from occupations |

## Tables intentionally merged (vs brief list)

| Brief name | Merged into |
|------------|-------------|
| `customer_employment`, `customer_income`, `customer_source_of_funds` | `customer_occupations_income` |
| `biometric_verifications`, `face_verifications`, `liveness_checks` | `kyc_verifications` + `face_checks` |
| `sanctions_screenings`, `pep_screenings`, `aml_screenings` | `screening_results` (`screening_type`) |
| `kyc_profiles` | Attributes on application + `customers` + risk profile |
| `kyc_manual_reviews`, `kyc_reviews` | `kyc_cases` + `kyc_case_actions` |
| `kyc_events` | Event bus + `kyc_audit_logs` / `kyc_status_history` |

---

## Core DDL sketch (PostgreSQL-oriented)

```sql
-- kyc_applications
CREATE TABLE kyc_applications (
  id UUID PRIMARY KEY,
  tracking_id VARCHAR(32) NOT NULL UNIQUE,
  channel VARCHAR(32) NOT NULL, -- MOBILE_IOS/ANDROID/WEB
  state VARCHAR(64) NOT NULL,
  product_code VARCHAR(64),
  regulatory_phase VARCHAR(16), -- PILOT/COMMERCIAL
  device_id_hash VARCHAR(128),
  ip_address INET,
  geo_latitude NUMERIC(9,6),
  geo_longitude NUMERIC(9,6),
  ekyc_prefetch_used BOOLEAN DEFAULT FALSE,
  complete_documents_at TIMESTAMPTZ,
  tat_due_at TIMESTAMPTZ,
  customer_id UUID NULL,
  idempotency_key VARCHAR(64) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE customer_identities (
  id UUID PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES kyc_applications(id),
  customer_id UUID NULL,
  id_type VARCHAR(16) NOT NULL, -- CNIC/NICOP/POC/POR/ARC
  id_number_encrypted BYTEA NOT NULL,
  id_number_hash CHAR(64) NOT NULL, -- for uniqueness lookups
  issue_date DATE,
  expiry_date DATE,
  full_name VARCHAR(200) NOT NULL,
  father_spouse_name VARCHAR(200),
  mother_maiden_name_encrypted BYTEA,
  date_of_birth DATE NOT NULL,
  place_of_birth VARCHAR(100),
  gender VARCHAR(32),
  nationality VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, id_type)
);
CREATE UNIQUE INDEX uq_identity_hash_active ON customer_identities(id_number_hash)
  WHERE customer_id IS NOT NULL;

CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES kyc_applications(id),
  verification_type VARCHAR(32) NOT NULL, -- BV_FINGER, BV_FACE, VERISYS, MSISDN_PAIR, VIDEO_KYC
  status VARCHAR(32) NOT NULL,
  vendor VARCHAR(64),
  vendor_reference VARCHAR(128),
  assurance_level VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE kyc_verification_attempts (
  id UUID PRIMARY KEY,
  verification_id UUID NOT NULL REFERENCES kyc_verifications(id),
  attempt_no INT NOT NULL,
  result_code VARCHAR(64),
  result_detail VARCHAR(256),
  request_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(verification_id, attempt_no)
);

CREATE TABLE screening_results (
  id UUID PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES kyc_applications(id),
  customer_id UUID,
  screening_type VARCHAR(32) NOT NULL, -- SANCTIONS, PEP, WATCHLIST, ADVERSE_MEDIA
  provider VARCHAR(64),
  status VARCHAR(32) NOT NULL, -- CLEAR, POTENTIAL_HIT, CONFIRMED_HIT, ERROR
  score NUMERIC(5,2),
  list_version VARCHAR(64),
  raw_result_ref VARCHAR(128), -- pointer to encrypted blob
  adjudicated_by UUID,
  adjudicated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_screening_app_type ON screening_results(application_id, screening_type);

CREATE TABLE customer_risk_assessments (
  id UUID PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES kyc_applications(id),
  customer_id UUID,
  model_version VARCHAR(32) NOT NULL,
  risk_rating VARCHAR(16) NOT NULL, -- LOW/MEDIUM/HIGH
  edd_required BOOLEAN NOT NULL DEFAULT FALSE,
  score NUMERIC(8,4),
  factors_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kyc_cases (
  id UUID PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES kyc_applications(id),
  case_type VARCHAR(32) NOT NULL, -- MANUAL_REVIEW, EDD, SANCTIONS_HIT, DUPLICATE, DOC_EXCEPTION
  status VARCHAR(32) NOT NULL,
  sla_due_at TIMESTAMPTZ,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE kyc_status_history (
  id BIGSERIAL PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES kyc_applications(id),
  from_state VARCHAR(64),
  to_state VARCHAR(64) NOT NULL,
  triggered_by_type VARCHAR(16) NOT NULL, -- SYSTEM/USER/CUSTOMER
  triggered_by_id VARCHAR(64),
  reason_code VARCHAR(64),
  correlation_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kyc_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  application_id UUID,
  customer_id UUID,
  actor_id VARCHAR(64),
  actor_type VARCHAR(16),
  action VARCHAR(64) NOT NULL,
  previous_state VARCHAR(64),
  new_state VARCHAR(64),
  ip_address INET,
  device_id_hash VARCHAR(128),
  request_id VARCHAR(64),
  correlation_id VARCHAR(64),
  source_system VARCHAR(64),
  decision VARCHAR(64),
  reason VARCHAR(256),
  external_reference VARCHAR(128),
  screening_status VARCHAR(32),
  risk_score NUMERIC(8,4),
  payload_hash CHAR(64),
  schema_version INT NOT NULL DEFAULT 1
);
-- retain insert-only grants; no UPDATE/DELETE for app roles
```

---

## Indexes & uniqueness (fraud-relevant)

| Constraint | Purpose |
|------------|---------|
| `tracking_id` UNIQUE | Customer tracking |
| `id_number_hash` unique for active customers | One CIF per CNIC policy (configurable) |
| Unique verified mobile per active customer | SIM/identity abuse |
| Index on `device_id_hash` | Multi-account device detection |
| Index on `state`, `tat_due_at` | Ops queues |
| Index on `kyc_cases(status, sla_due_at)` | SLA |

---

## Audit fields pattern

All mutable business tables: `created_at`, `updated_at`, `created_by`, `updated_by`, `version` (optimistic locking).  
Evidence tables: `created_at` only.

## Soft deletion & retention

- Applications: `state=WITHDRAWN/EXPIRED/REJECTED` retained per record-keeping (**A**)  
- Documents: retention class + legal hold flag  
- Audit logs: no delete; archive to WORM/object lock storage  

## ERD (logical)

See Mermaid ERD in [diagrams/05-kyc-erd.mmd](diagrams/05-kyc-erd.mmd).

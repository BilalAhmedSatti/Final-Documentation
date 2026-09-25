-- =============================================================================
-- Dummy KYC sample data (FICTIONAL ONLY) — Conventional DRB Pakistan
-- Prerequisite: run 01-complete-ddl.sql first
-- Scenario: Ali Raza — low-risk STP → ACTIVE account
-- =============================================================================

BEGIN;

-- Rejection catalog (seed)
INSERT INTO kyc_rejection_reason_codes (code, description, customer_message_en, customer_message_ur)
VALUES
  ('SANCTIONS_MATCH', 'Confirmed sanctions/proscribed match', 'We are unable to open your account.', 'ہم آپ کا اکاؤنٹ نہیں کھول سکتے。'),
  ('FRAUD_SUSPECTED', 'Fraud / duplicate identity', 'We are unable to open your account.', 'ہم آپ کا اکاؤنٹ نہیں کھول سکتے。')
ON CONFLICT DO NOTHING;

-- 1. Application (final state ACTIVE for demo snapshot)
INSERT INTO kyc_applications (
  id, tracking_id, channel, product_code, regulatory_phase, state, previous_state,
  debit_block_intended, bv_pending, edd_required, ekyc_prefetch_used,
  device_id_hash, ip_address, geo_latitude, geo_longitude, app_version, locale,
  complete_documents_at, tat_due_at, resume_expires_at,
  customer_id, idempotency_key, created_by, updated_by
) VALUES (
  'aaaaaaaa-0001-4000-8000-000000000001',
  'TRK-20260912-8F2K',
  'MOBILE_ANDROID',
  'CONVENTIONAL_SAVINGS',
  'COMMERCIAL',
  'ACTIVE',
  'ACCOUNT_PENDING',
  FALSE, FALSE, FALSE, FALSE,
  'devhash_a1b2c3d4e5f67890',
  '103.255.10.20',
  31.520400, 74.358700,
  '1.0.0', 'en',
  '2026-09-12 10:18:00+05',
  '2026-09-16 18:00:00+05',
  '2026-10-12 10:05:00+05',
  '99999999-0001-4000-8000-000000000001',
  'idem-start-ali-001',
  'SYSTEM', 'SYSTEM'
);

-- 2. Party
INSERT INTO kyc_application_parties (id, application_id, party_role, sequence_no, is_primary)
VALUES (
  'bbbbbbbb-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  'PRIMARY', 1, TRUE
);

-- 3. Contacts
INSERT INTO customer_contacts (
  id, application_id, customer_id, contact_type,
  contact_value_encrypted, contact_value_hash, contact_value_masked,
  is_primary, is_verified, verified_at, msisdn_cnic_paired, msisdn_pair_checked_at
) VALUES
(
  'dddddddd-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'MOBILE',
  convert_to('+923001234567', 'UTF8'),
  repeat('a', 64),
  '0300-***4567',
  TRUE, TRUE, '2026-09-12 10:06:12+05', TRUE, '2026-09-12 10:17:00+05'
),
(
  'dddddddd-0001-4000-8000-000000000002',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'EMAIL',
  convert_to('ali.raza@example.com', 'UTF8'),
  repeat('b', 64),
  'a***@example.com',
  FALSE, TRUE, '2026-09-12 10:07:00+05', NULL, NULL
);

-- 4. OTP (consumed)
INSERT INTO otp_challenges (
  id, application_id, contact_id, channel, code_hash, expires_at, attempt_count, max_attempts, consumed_at
) VALUES (
  '22222222-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  'dddddddd-0001-4000-8000-000000000001',
  'SMS',
  repeat('c', 64),
  '2026-09-12 10:11:00+05',
  1, 5,
  '2026-09-12 10:06:12+05'
);

-- 5. Consents
INSERT INTO kyc_consents (application_id, customer_id, consent_type, policy_version, accepted, accepted_at, channel, ip_address)
VALUES
  ('aaaaaaaa-0001-4000-8000-000000000001', '99999999-0001-4000-8000-000000000001', 'TNC', 'tnc-2026.3', TRUE, '2026-09-12 10:07:30+05', 'MOBILE_ANDROID', '103.255.10.20'),
  ('aaaaaaaa-0001-4000-8000-000000000001', '99999999-0001-4000-8000-000000000001', 'PRIVACY', 'privacy-2026.1', TRUE, '2026-09-12 10:07:30+05', 'MOBILE_ANDROID', '103.255.10.20'),
  ('aaaaaaaa-0001-4000-8000-000000000001', '99999999-0001-4000-8000-000000000001', 'KFS', 'kfs-savings-1.0', TRUE, '2026-09-12 10:07:30+05', 'MOBILE_ANDROID', '103.255.10.20'),
  ('aaaaaaaa-0001-4000-8000-000000000001', '99999999-0001-4000-8000-000000000001', 'BV_NADRA', 'bv-consent-1.0', TRUE, '2026-09-12 10:07:30+05', 'MOBILE_ANDROID', '103.255.10.20'),
  ('aaaaaaaa-0001-4000-8000-000000000001', '99999999-0001-4000-8000-000000000001', 'EKYC_READ', 'ekyc-1.0', FALSE, '2026-09-12 10:07:30+05', 'MOBILE_ANDROID', '103.255.10.20');

-- 6. Identity
INSERT INTO customer_identities (
  id, application_id, party_id, customer_id, id_type,
  id_number_encrypted, id_number_hash, id_number_masked,
  issue_date, expiry_date, is_expired_with_token,
  full_name, father_spouse_name, mother_maiden_name_encrypted,
  date_of_birth, place_of_birth, gender, nationality
) VALUES (
  'cccccccc-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  'bbbbbbbb-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'CNIC',
  convert_to('3520212345671', 'UTF8'),
  repeat('d', 64),
  '35202-*******-1',
  '2019-04-15', '2029-04-15', FALSE,
  'ALI RAZA', 'AHMED RAZA', convert_to('FATIMA', 'UTF8'),
  '1992-08-20', 'LAHORE', 'M', 'PK'
);

-- 7. Addresses
INSERT INTO customer_addresses (
  id, application_id, customer_id, address_type, line1, city, district, province, country_code, same_as_id_document
) VALUES
(
  'eeeeeeee-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'PERMANENT', 'House 12, Street 4, Gulberg', 'Lahore', 'Lahore', 'Punjab', 'PK', TRUE
),
(
  'eeeeeeee-0001-4000-8000-000000000002',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'MAILING', 'Office 5, MM Alam Road', 'Lahore', 'Lahore', 'Punjab', 'PK', FALSE
);

-- 8. Occupation / income
INSERT INTO customer_occupations_income (
  id, application_id, customer_id, profession_code, profession_detail, is_dnfbp,
  employer_or_business_name, designation, source_of_income, source_of_funds,
  self_declaration, purpose_of_account,
  expected_monthly_income, expected_debit_turnover, expected_credit_turnover,
  expected_debit_txn_count, expected_credit_txn_count, currency_code
) VALUES (
  'ffffffff-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'SALARIED', 'IT professional', FALSE,
  'EXAMPLE TECH PVT LTD', 'Software Engineer', 'SALARY', 'SALARY',
  FALSE, 'SALARY_SAVINGS',
  150000.00, 80000.00, 150000.00,
  40, 5, 'PKR'
);

-- 9. Tax
INSERT INTO customer_tax_profiles (
  id, application_id, customer_id, residency_status, us_person, foreign_tax_resident,
  fatca_crs_declared_at, declaration_version
) VALUES (
  '11111111-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'RESIDENT_PK', FALSE, FALSE,
  '2026-09-12 10:12:00+05', 'fatca-crs-2026.1'
);

-- 10. Live photo document + face check
INSERT INTO kyc_documents (
  id, application_id, customer_id, document_type, storage_uri, content_type,
  file_size_bytes, checksum_sha256, encryption_key_ref, retention_class, captured_at
) VALUES (
  '44444444-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'LIVE_PHOTO',
  's3://kyc-docs/aaaaaaaa-0001/live.jpg.enc',
  'image/jpeg',
  245760,
  repeat('e', 64),
  'kms:key:kyc-doc-1',
  'AML_CDD',
  '2026-09-12 10:13:00+05'
);

INSERT INTO face_checks (
  id, application_id, live_photo_document_id, liveness_performed, liveness_score,
  liveness_vendor, match_score, match_threshold, match_passed, vendor_reference, status
) VALUES (
  '55555555-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '44444444-0001-4000-8000-000000000001',
  TRUE, 0.9700, 'FACE_VENDOR_X', 0.9100, 0.8500, TRUE, 'FACE-REQ-1001', 'PASSED'
);

-- 11. BV verification + attempt
INSERT INTO kyc_verifications (
  id, application_id, verification_type, status, assurance_level, vendor, vendor_reference,
  started_at, completed_at
) VALUES (
  '33333333-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  'BV_FINGER', 'SUCCESS', 'BV_NADRA', 'NADRA_ADAPTER', 'NADRA-BV-REQ-778899',
  '2026-09-12 10:14:00+05', '2026-09-12 10:14:02+05'
);

INSERT INTO kyc_verification_attempts (
  id, verification_id, attempt_no, result_code, result_detail, request_id, correlation_id, latency_ms
) VALUES (
  '33333333-0002-4000-8000-000000000001',
  '33333333-0001-4000-8000-000000000001',
  1, 'SUCCESS', 'Biometric match OK', 'req-bv-778899', 'corr-ali-001', 1840
);

-- 12. Screening
INSERT INTO screening_results (
  id, application_id, customer_id, party_id, screening_type, provider, status, score, list_name, list_version, raw_result_ref
) VALUES
(
  '66666666-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'bbbbbbbb-0001-4000-8000-000000000001',
  'SANCTIONS', 'LIST_PROVIDER_Y', 'CLEAR', 0, 'UNSC+ATA', 'UNSC+ATA-2026-09-12', 's3://screen/raw/san-1.enc'
),
(
  '66666666-0001-4000-8000-000000000002',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'bbbbbbbb-0001-4000-8000-000000000001',
  'PEP', 'LIST_PROVIDER_Y', 'CLEAR', 0, 'PEP_DB', 'PEP-DB-2026.09', 's3://screen/raw/pep-1.enc'
);

-- 13. Risk assessment
INSERT INTO customer_risk_assessments (
  id, application_id, customer_id, model_version, risk_rating, edd_required, score, factors_json, recommended_limits_json
) VALUES (
  '77777777-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'crp-2026.1', 'LOW', FALSE, 0.1800,
  '{"CHANNEL_DIGITAL":0.05,"BV_ASSURANCE":-0.04,"OCCUPATION_SALARIED":-0.02,"SCREENING_CLEAR":-0.03}'::jsonb,
  '{"daily_debit_limit":500000}'::jsonb
);

-- 14. Decision
INSERT INTO kyc_decisions (
  id, application_id, decision, decision_mode, reason_codes, notes, restrictions_json, decided_by, decided_at
) VALUES (
  '88888888-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  'APPROVE', 'STP', ARRAY['STP_LOW_RISK'], 'Auto-approved', '[]'::jsonb, 'SYSTEM', '2026-09-12 10:20:00+05'
);

-- 15. Status history (selected)
INSERT INTO kyc_status_history (application_id, from_state, to_state, triggered_by_type, triggered_by_id, correlation_id)
VALUES
  ('aaaaaaaa-0001-4000-8000-000000000001', NULL, 'INITIATED', 'SYSTEM', 'SYSTEM', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'INITIATED', 'CONTACT_VERIFIED', 'CUSTOMER', 'guest', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'CONTACT_VERIFIED', 'CONSENT_CAPTURED', 'CUSTOMER', 'guest', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'CONSENT_CAPTURED', 'IDENTITY_CAPTURED', 'CUSTOMER', 'guest', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'IDENTITY_CAPTURED', 'LIVE_PHOTO_CAPTURED', 'CUSTOMER', 'guest', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'LIVE_PHOTO_CAPTURED', 'IDENTITY_VERIFICATION_IN_PROGRESS', 'SYSTEM', 'SYSTEM', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'IDENTITY_VERIFICATION_IN_PROGRESS', 'IDENTITY_VERIFIED', 'SYSTEM', 'SYSTEM', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'IDENTITY_VERIFIED', 'PROFILE_COMPLETE', 'CUSTOMER', 'guest', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'PROFILE_COMPLETE', 'SCREENING_IN_PROGRESS', 'SYSTEM', 'SYSTEM', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'SCREENING_IN_PROGRESS', 'RISK_ASSESSMENT_IN_PROGRESS', 'SYSTEM', 'SYSTEM', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'RISK_ASSESSMENT_IN_PROGRESS', 'APPROVED', 'SYSTEM', 'SYSTEM', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'APPROVED', 'ACCOUNT_PENDING', 'SYSTEM', 'SYSTEM', 'corr-ali-001'),
  ('aaaaaaaa-0001-4000-8000-000000000001', 'ACCOUNT_PENDING', 'ACTIVE', 'SYSTEM', 'SYSTEM', 'corr-ali-001');

-- 16. Customer + account (post-approval)
INSERT INTO customers (
  id, cif, application_id, full_name, status, kyc_status, risk_rating, onboarding_completed_at
) VALUES (
  '99999999-0001-4000-8000-000000000001',
  'CIF0001001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  'ALI RAZA',
  'ACTIVE', 'COMPLETE', 'LOW',
  '2026-09-12 10:21:00+05'
);

INSERT INTO accounts (
  id, customer_id, application_id, account_number, iban, product_code, currency_code,
  status, debit_block, daily_debit_limit, daily_credit_limit, monthly_debit_limit, activated_at
) VALUES (
  'aaaaaaaa-0002-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  '00120034005678',
  'PK00BANK00120034005678',
  'CONVENTIONAL_SAVINGS',
  'PKR',
  'ACTIVE', FALSE, 500000.00, 1000000.00, 5000000.00,
  '2026-09-12 10:21:30+05'
);

INSERT INTO customer_risk_profiles (
  id, customer_id, application_id, risk_rating, edd_flag, enhanced_monitoring, last_assessment_id
) VALUES (
  '77777777-0002-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'aaaaaaaa-0001-4000-8000-000000000001',
  'LOW', FALSE, FALSE,
  '77777777-0001-4000-8000-000000000001'
);

INSERT INTO kyc_refresh_schedules (
  id, customer_id, risk_rating, frequency_days, next_due_at, last_completed_at, status
) VALUES (
  '77777777-0003-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'LOW', 365, '2027-09-12 00:00:00+05', '2026-09-12 10:21:00+05', 'SCHEDULED'
);

-- 17. Dedupe + device
INSERT INTO identity_uniqueness_keys (key_type, key_hash, customer_id, application_id, status)
VALUES
  ('CNIC_HASH', repeat('d', 64), '99999999-0001-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-000000000001', 'ACTIVE'),
  ('MOBILE_HASH', repeat('a', 64), '99999999-0001-4000-8000-000000000001', 'aaaaaaaa-0001-4000-8000-000000000001', 'ACTIVE');

INSERT INTO device_bindings (
  application_id, customer_id, device_id_hash, platform, is_trusted, status
) VALUES (
  'aaaaaaaa-0001-4000-8000-000000000001',
  '99999999-0001-4000-8000-000000000001',
  'devhash_a1b2c3d4e5f67890',
  'ANDROID', TRUE, 'ACTIVE'
);

-- 18. Audit samples
INSERT INTO kyc_audit_logs (
  application_id, customer_id, actor_id, actor_type, action,
  previous_state, new_state, ip_address, device_id_hash, request_id, correlation_id,
  source_system, decision, external_reference, screening_status, risk_score, payload_hash, schema_version
) VALUES
(
  'aaaaaaaa-0001-4000-8000-000000000001', NULL, 'SYSTEM', 'SYSTEM', 'APPLICATION_STARTED',
  NULL, 'INITIATED', '103.255.10.20', 'devhash_a1b2c3d4e5f67890', 'req-1', 'corr-ali-001',
  'ONBOARDING', NULL, NULL, NULL, NULL, repeat('1', 64), 1
),
(
  'aaaaaaaa-0001-4000-8000-000000000001', NULL, 'SYSTEM', 'SYSTEM', 'BIOMETRIC_ATTEMPT',
  'IDENTITY_VERIFICATION_IN_PROGRESS', 'IDENTITY_VERIFIED', '103.255.10.20', 'devhash_a1b2c3d4e5f67890', 'req-bv-778899', 'corr-ali-001',
  'NADRA_ADAPTER', NULL, 'NADRA-BV-REQ-778899', NULL, NULL, repeat('2', 64), 1
),
(
  'aaaaaaaa-0001-4000-8000-000000000001', '99999999-0001-4000-8000-000000000001', 'SYSTEM', 'SYSTEM', 'KYC_DECISION',
  'RISK_ASSESSMENT_IN_PROGRESS', 'APPROVED', '103.255.10.20', 'devhash_a1b2c3d4e5f67890', 'req-dec-1', 'corr-ali-001',
  'KYC_SERVICE', 'APPROVE', NULL, 'CLEAR', 0.1800, repeat('3', 64), 1
);

COMMIT;

-- Quick check:
-- SELECT tracking_id, state, customer_id FROM kyc_applications;
-- SELECT cif, status FROM customers;
-- SELECT iban, debit_block, status FROM accounts;
-- SELECT screening_type, status FROM screening_results;

# Appendix D — Data Dictionary (Index)

The **complete** table/column data dictionary (purpose of every table and column) lives here:

**[../database/02-data-dictionary-complete.md](../database/02-data-dictionary-complete.md)**

Supporting artifacts:

| Artifact | Path |
|----------|------|
| Full DDL | [../database/01-complete-ddl.sql](../database/01-complete-ddl.sql) |
| Database pack overview + embedded DFD/ERD | [../database/README.md](../database/README.md) |
| Context DFD | [../diagrams/13-kyc-dfd-context.mmd](../diagrams/13-kyc-dfd-context.mmd) |
| Level-1 DFD | [../diagrams/14-kyc-dfd-level1.mmd](../diagrams/14-kyc-dfd-level1.mmd) |
| Detailed ERD | [../diagrams/15-kyc-erd-detailed.mmd](../diagrams/15-kyc-erd-detailed.mmd) |

## Quick reference — core columns

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| kyc_applications | tracking_id | varchar | Unique customer-facing |
| kyc_applications | state | varchar | State machine value |
| kyc_applications | tat_due_at | timestamptz | 2 WD clock after complete docs |
| customer_identities | id_number_hash | char(64) | SHA-256 for uniqueness |
| customer_identities | id_number_encrypted | bytea | PII |
| customer_contacts | is_verified | boolean | OTP verified |
| screening_results | list_version | varchar | Audit-critical |
| customer_risk_assessments | factors_json | jsonb | CRP factor breakdown |
| accounts | debit_block | boolean | SBP debit-block path |
| kyc_audit_logs | payload_hash | char(64) | Tamper evidence |

Retention: apply AML Reg–8 periods; legal hold overrides purge jobs. See complete dictionary for full column purposes.

# Data Retention & Deletion Matrix

| Data Category | System | Retention | Basis | Disposal Method |
| ------------- | ------ | --------- | ----- | --------------- |
| Account metadata | Supabase Postgres | 3 years after last activity | Legitimate interest | Soft delete + quarterly purge job |
| KYC documents | Encrypted object storage | 5 years post offboarding | AML/KYC | Automatic expiry + vault wipe |
| Live streams | LiveKit recordings | 30 days | Creator consent | Lifecycle rule delete + hash tombstone |
| Chat transcripts | Redis Stream / S3 | 90 days | Safety review | Rotate to cold storage then delete |
| 💎 Ledger entries | Postgres | 7 years | Financial regs | Immutable ledger, archive to Glacier |
| Web analytics | Plausible / BigQuery | 14 months | Consent | Aggregated anonymization |
| Audit logs | WORM bucket | 10 years | Compliance | Immutable storage |

## Deletion Workflow
1. DSAR or automated retention job enqueues delete request to `privacy.queue`.
2. Service owners implement idempotent delete handlers with audit logging.
3. Privacy bot verifies completion and closes the request.

## Legal Hold
- Flag `legal_hold=true` prevents deletion across systems.
- Only Compliance can set/clear the flag via signed request.

# Disaster Recovery Restore Runbook

**RPO:** 5 minutes  |  **RTO:** 15 minutes

## Preconditions
- Primary region outage confirmed by synthetic monitors or provider status.
- On-call has access to Vault, backup bucket, and secondary region cloud account.
- Latest backup snapshot verified by nightly backup job.

## Recovery Steps
1. **Declare Incident:** Page DR commander, create incident ticket, update statuspage.
2. **Freeze Writes:** Enable global maintenance mode flag via Feature Ops to stop new 💎 transactions.
3. **Promote Standby DB:**
   - Run `terraform workspace select dr-secondary`.
   - Execute `terraform apply -target=module.db_failover` to point replicas to read/write.
4. **Restore Recent Changes:**
   - Fetch latest WAL archive from `s3://feelynx-backups/<date>`.
   - Apply using `pg_wal restore` to reach RPO ≤ 5 minutes.
5. **Deploy Application:**
   - Trigger Vercel Edge failover workflow `ops/failover.yml` to shift to backup region.
   - For LiveKit, execute `scripts/livekit-failover.sh` to promote passive signaling node.
6. **Validate:**
   - Run smoke tests: `/auth/health`, `/api/tip`, `/api/ledger/last`.
   - Confirm synthetic monitors green and latency within SLO.
7. **Communicate:** Post recovery summary to incident Slack and statuspage, notify compliance for audit trail.
8. **Post-Incident:** Schedule restore drill review within 24 hours. Archive logs to `/artifacts/drill-report.md`.

## Weekly Restore Test
- Tuesdays 02:00 UTC run automated restore to staging using same steps.
- Store success/failure in `artifacts/drill-report.md` and Jira ticket.
- Rotate encryption keys if failures occur twice in a row.

## Contacts
- **SRE Primary:** @pagerduty-sre
- **Database Lead:** db@feelynx.com
- **Compliance:** compliance@feelynx.com

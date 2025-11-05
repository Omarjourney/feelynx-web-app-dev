# Cost Guardrails & Budget Alerts

## Budgets
- **Edge Delivery (Vercel):** $25k/month, alert at 70%, 90%, 100%.
- **LiveKit Signaling:** $12k/month, alert at 60% (optimize), 85% (escalate).
- **Supabase/Postgres:** $18k/month, alert at 75%, 95%.
- **Observability Stack:** $8k/month, alert at 80%.

## Alerting
- Billing exports stream to BigQuery -> Looker budget dashboard.
- Cloud provider budgets integrated with Slack `#finops` via webhook.
- PagerDuty incident when overrun >10% forecast.

## Anomaly Detection
- Daily spend deltas > 2x standard deviation trigger FinOps review.
- Cost per 💎 tip tracked; alert if margin < 40% for 3 days.
- Spot `livekit-egress` anomalies by correlating with concurrency metrics.

## Remediation Playbook
1. Validate anomaly with usage metrics and deployment timelines.
2. Enable adaptive bitrate or degrade quality for long-tail viewers.
3. Throttle free trial invitations and promo codes if token spend spikes.
4. Negotiate reserved capacity or commit discounts when run rate >80% budget.
5. Document actions in `/artifacts/cost-runbook.md` for audit.

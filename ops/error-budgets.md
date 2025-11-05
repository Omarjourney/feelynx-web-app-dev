# Feelynx Error Budgets & Burn Policy

| SLO | Budget (monthly) | Fast Burn (14x) | Slow Burn (4x) | Actions |
| --- | ---------------- | --------------- | -------------- | ------- |
| Availability 99.95% | 21.6 minutes | Page on-call if >1.5 minutes lost in 1 hour | Escalate to incident commander if >4 minutes lost in 6 hours | Initiate failover, throttle new deployments, enable traffic shedding |
| API p95 Latency < 250ms | 36 minutes above threshold | Alert API lead, roll back latest changes | Open performance war-room | Enable autoscaling, profile hot paths |
| Live Signaling p95 < 300ms | 43 minutes above threshold | Notify media SRE, switch to backup LiveKit region | Engage vendor support | Shift traffic to nearest region, enable priority QoS |
| Error Rate <0.5% 5xx | 150 requests per 30k | Trigger canary freeze | Open reliability incident | Deploy hotfix, enable circuit breakers |

## Response Playbook

1. **Detect:** Synthetic monitor or OTel alert triggers.
2. **Triage:** SRE on-call uses Grafana dashboard and tracing to locate failing dependency.
3. **Stabilize:** Apply rate limits, roll back, or fail over to secondary region.
4. **Communicate:** Update incident Slack channel, post statuspage note within 15 min.
5. **Recover:** Validate SLO restored, run postmortem within 48 hours.

## Burn Down Tracking

- Track error budget spend in Grafana using the `error_budget_remaining` metric.
- Freeze deploys automatically when budget < 30% for the month.
- Require VP Eng approval to consume final 10%.

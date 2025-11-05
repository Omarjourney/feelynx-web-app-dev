import { AgentBase, AgentContext, AgentRecommendation } from '../core/agentBase';

type OpsSignals = {
  apiLatencyP99?: number;
  uptime?: number;
  failedDeploys?: number;
  openIncidents?: number;
};

export class OpsAgent extends AgentBase {
  constructor() {
    super({
      name: 'OpsAgent',
      description: 'Monitors uptime and orchestrates self-healing workflows.',
      minCooldownMs: 60_000,
    });
  }

  protected async execute(context: AgentContext): Promise<AgentRecommendation[]> {
    const signals = (context.signals?.ops ?? {}) as OpsSignals;
    const recommendations: AgentRecommendation[] = [];

    if ((signals.apiLatencyP99 ?? 0) > 750) {
      recommendations.push({
        title: 'Scale API pods',
        summary: 'Detected elevated p99 latency beyond 750ms threshold.',
        impact: 'high',
        actions: [
          'Trigger auto-scaling policy to add 2 pods',
          'Warm cache layer before re-routing traffic',
          'Evaluate slow queries in telemetry panel',
        ],
        confidence: 0.81,
      });
    }

    if ((signals.failedDeploys ?? 0) > 0 || (signals.openIncidents ?? 0) > 0) {
      recommendations.push({
        title: 'Initiate rollback & notify responders',
        summary: 'Ops agent detected failed deploy or active incident flag.',
        impact: 'high',
        actions: [
          'Rollback to previous healthy release tag',
          'Ping #self-heal channel with incident summary',
          'Attach automated diagnostics bundle',
        ],
        confidence: 0.88,
      });
    }

    if (!recommendations.length) {
      recommendations.push({
        title: 'Operational health nominal',
        summary: 'All monitored signals within thresholds – routine keep-alive logged.',
        impact: 'low',
        actions: ['Record nominal heartbeat', 'Archive metrics snapshot for trend analysis'],
        confidence: 0.6,
      });
    }

    return recommendations;
  }
}

export default OpsAgent;

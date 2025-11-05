import { AgentBase, AgentContext, AgentRecommendation } from '../core/agentBase';
import { invokeModel, selectModelProvider } from '../runtime';

type UsageTelemetry = {
  funnelDropRate?: number;
  avgSessionDuration?: number;
  uiFrictionEvents?: number;
  hotspots?: string[];
};

export class InsightAgent extends AgentBase {
  constructor() {
    super({
      name: 'InsightAgent',
      description: 'Analyzes telemetry to propose UX optimizations.',
      minCooldownMs: 5 * 60 * 1000,
    });
  }

  protected async execute(context: AgentContext): Promise<AgentRecommendation[]> {
    const telemetry = (context.signals?.usage ?? {}) as UsageTelemetry;
    const provider = selectModelProvider();
    const prompt = `Provide 3 UX improvements for Feelynx given telemetry: ${JSON.stringify(telemetry).slice(0, 400)}`;
    const synthetic = await invokeModel(provider, prompt, { max_tokens: 256 });

    const recommendations: AgentRecommendation[] = [];

    if (telemetry.funnelDropRate && telemetry.funnelDropRate > 0.35) {
      recommendations.push({
        title: 'Streamline onboarding funnel',
        summary: 'Detected elevated drop rate in creator onboarding flow.',
        impact: 'high',
        actions: [
          'Introduce progressive disclosure for profile setup fields',
          'Offer AI-guided quick start presets',
          'Add reassurance copy addressing payout timelines',
        ],
        confidence: 0.72,
      });
    }

    if ((telemetry.uiFrictionEvents ?? 0) > 120) {
      recommendations.push({
        title: 'Reduce modal stacking friction',
        summary: 'High number of rage clicks across live control modals.',
        impact: 'medium',
        actions: ['Convert modal wizard to side panel', 'Persist context between steps'],
        confidence: 0.64,
      });
    }

    if (!recommendations.length) {
      recommendations.push({
        title: 'AI synthesized insights',
        summary: synthetic || 'Telemetry within optimal bounds – monitor only.',
        impact: 'low',
        actions: ['Continue monitoring usage telemetry', 'Schedule deep dive if deviations surface'],
        confidence: 0.55,
      });
    }

    return recommendations;
  }
}

export default InsightAgent;

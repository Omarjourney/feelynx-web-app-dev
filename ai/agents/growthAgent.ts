import { AgentBase, AgentContext, AgentRecommendation } from '../core/agentBase';
import { invokeModel, selectModelProvider } from '../runtime';

type GrowthSignals = {
  engagementDelta?: number;
  retention7d?: number;
  campaignFatigue?: number;
};

export class GrowthAgent extends AgentBase {
  constructor() {
    super({
      name: 'GrowthAgent',
      description: 'Detects engagement drops and deploys revitalization loops.',
      minCooldownMs: 10 * 60 * 1000,
    });
  }

  protected async execute(context: AgentContext): Promise<AgentRecommendation[]> {
    const signals = (context.signals?.growth ?? {}) as GrowthSignals;
    const recommendations: AgentRecommendation[] = [];

    if ((signals.engagementDelta ?? 0) < -0.08) {
      recommendations.push({
        title: 'Spin up re-engagement mini-event',
        summary: 'Week-over-week engagement dipped more than 8%.',
        impact: 'high',
        actions: [
          'Schedule 24h Feelynx pulse challenge for creators',
          'Enable surprise token multipliers for top supporters',
          'Send adaptive push series spotlighting live collabs',
        ],
        confidence: 0.74,
      });
    }

    if ((signals.campaignFatigue ?? 0) > 0.6) {
      recommendations.push({
        title: 'Rotate marketing narratives',
        summary: 'Audience fatigue detected on current lifecycle campaign.',
        impact: 'medium',
        actions: [
          'Swap hero creatives to emotional resonance themed set',
          'Inject AI-personalized DMs for dormant power users',
          'Launch interactive poll to select next feature spotlight',
        ],
        confidence: 0.68,
      });
    }

    if (!recommendations.length) {
      const provider = selectModelProvider();
      const prompt = `Feelynx growth summary request with metrics ${JSON.stringify(signals).slice(0, 400)}`;
      const idea = await invokeModel(provider, prompt, { temperature: 0.7 });
      recommendations.push({
        title: 'Growth engine steady',
        summary: idea || 'Engagement momentum positive – continue automated loops.',
        impact: 'low',
        actions: ['Monitor creator activation cohorts', 'Queue aspirational story arcs for next sync'],
        confidence: 0.57,
      });
    }

    return recommendations;
  }
}

export default GrowthAgent;

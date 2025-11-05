import { AgentBase, AgentContext, AgentRecommendation } from '../core/agentBase';
import { EmotionState } from '../../src/stores/useLiveBlueprintStore';

type EmotionSignals = {
  sentimentScore?: number;
  emojiDensity?: number;
  escalationEvents?: number;
};

const emotionMap: Record<EmotionState, { threshold: number; focus: string }> = {
  Calm: { threshold: 0.75, focus: 'soothing gradients & slow UI motion' },
  Hype: { threshold: 0.6, focus: 'dynamic pulses & bright saturation' },
  Flirty: { threshold: 0.65, focus: 'soft bloom & playful copywriting' },
  Supportive: { threshold: 0.8, focus: 'gentle glow with empathetic prompts' },
  Playful: { threshold: 0.7, focus: 'bouncy interactions & animated stickers' },
};

export class EmotionAgent extends AgentBase {
  constructor() {
    super({
      name: 'EmotionAgent',
      description: 'Blends sentiment data into adaptive UI adjustments.',
      minCooldownMs: 45_000,
    });
  }

  protected async execute(context: AgentContext): Promise<AgentRecommendation[]> {
    const signals = (context.signals?.emotion ?? {}) as EmotionSignals;
    const sentiment = signals.sentimentScore ?? 0.6;
    const mood = this.chooseMood(sentiment, signals.emojiDensity ?? 0);

    const recommendation: AgentRecommendation = {
      title: `Shift experience to ${mood} mode`,
      summary: `Detected sentiment ${Math.round(sentiment * 100)} with emoji density ${Math.round(
        (signals.emojiDensity ?? 0) * 100,
      )}.`,
      impact: 'medium',
      actions: [
        `Apply ${emotionMap[mood].focus}`,
        'Record mood transition in emotion feedback API',
        'Prime voice synthesis with tuned tone curve',
      ],
      confidence: 0.69,
    };

    return [recommendation];
  }

  private chooseMood(sentiment: number, emojiDensity: number): EmotionState {
    if (emojiDensity > 0.35 && sentiment > 0.7) return 'Playful';
    if (emojiDensity > 0.25 && sentiment > 0.65) return 'Flirty';
    if (sentiment < 0.45) return 'Supportive';
    if (sentiment > 0.8) return 'Calm';
    return 'Hype';
  }
}

export default EmotionAgent;

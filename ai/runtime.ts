import { AgentBase, AgentRecommendation, AgentTelemetry } from './core/agentBase';

export type ModelProvider = 'openai' | 'ollama' | 'transformers';

export type RuntimeOptions = {
  agents: AgentBase[];
  pollIntervalMs?: number;
  onTelemetry?: (snapshot: AgentTelemetry) => void;
  onRecommendations?: (agent: string, recommendations: AgentRecommendation[]) => void;
};

export class AgentRuntime {
  private readonly agents: AgentBase[];
  private readonly pollInterval: number;
  private readonly listeners: RuntimeOptions;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(options: RuntimeOptions) {
    this.agents = options.agents;
    this.pollInterval = Math.max(30_000, options.pollIntervalMs ?? 90_000);
    this.listeners = options;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, this.pollInterval);
    void this.tick();
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async tick() {
    await Promise.all(
      this.agents.map(async (agent) => {
        this.listeners.onTelemetry?.(agent.snapshot);
        try {
          const recommendations = await agent.run();
          if (recommendations.length) {
            this.listeners.onRecommendations?.(agent.snapshot.name, recommendations);
          }
        } catch (error) {
          console.error(`[AgentRuntime] ${agent.snapshot.name} failed`, error);
        }
      }),
    );
  }
}

export const selectModelProvider = (): ModelProvider => {
  if (process.env.FEELYNX_MODEL_PROVIDER === 'ollama') return 'ollama';
  if (process.env.FEELYNX_MODEL_PROVIDER === 'transformers') return 'transformers';
  return 'openai';
};

export const invokeModel = async (
  provider: ModelProvider,
  prompt: string,
  options: Record<string, unknown> = {},
): Promise<string> => {
  if (!prompt) return '';
  if (provider === 'openai') {
    return `openai: ${prompt.slice(0, 140)}`;
  }

  if (provider === 'ollama') {
    return `ollama: ${prompt.slice(0, 140)}`;
  }

  return `transformers: ${prompt.slice(0, 140)}`;
};

export type AgentStatus = 'idle' | 'running' | 'cooldown' | 'error';

export type AgentTelemetry = {
  name: string;
  description: string;
  status: AgentStatus;
  lastRun: number | null;
  learningRate: number;
  executions: number;
  lastError?: string;
};

export type AgentContext = {
  timeframeMinutes?: number;
  signals?: Record<string, unknown>;
};

export type AgentRecommendation = {
  title: string;
  summary: string;
  impact: 'low' | 'medium' | 'high';
  actions: string[];
  confidence: number;
};

export interface AgentHooks {
  onStatusChange?: (telemetry: AgentTelemetry) => void;
  onRecommendations?: (recommendations: AgentRecommendation[]) => void;
  onError?: (error: Error, telemetry: AgentTelemetry) => void;
}

export type AgentConfig = {
  name: string;
  description: string;
  minCooldownMs?: number;
  initialLearningRate?: number;
  hooks?: AgentHooks;
};

export abstract class AgentBase {
  protected telemetry: AgentTelemetry;
  private readonly cooldownMs: number;
  private readonly hooks: AgentHooks;

  constructor(config: AgentConfig) {
    this.cooldownMs = Math.max(30_000, config.minCooldownMs ?? 120_000);
    this.telemetry = {
      name: config.name,
      description: config.description,
      status: 'idle',
      lastRun: null,
      learningRate: config.initialLearningRate ?? 0.3,
      executions: 0,
    };
    this.hooks = config.hooks ?? {};
  }

  get snapshot(): AgentTelemetry {
    return { ...this.telemetry };
  }

  /**
   * Executes the agent task if the cooldown window has elapsed.
   * Returns the recommendations produced by the agent.
   */
  async run(context: AgentContext = {}): Promise<AgentRecommendation[]> {
    const now = Date.now();
    const sinceLast = this.telemetry.lastRun ? now - this.telemetry.lastRun : Infinity;
    if (sinceLast < this.cooldownMs) {
      return [];
    }

    this.updateTelemetry({ status: 'running' });

    try {
      const recommendations = await this.execute(context);
      this.telemetry.executions += 1;
      this.telemetry.lastRun = now;
      this.adjustLearningRate(recommendations);
      this.updateTelemetry({ status: 'cooldown', lastError: undefined });
      this.hooks.onRecommendations?.(recommendations);
      return recommendations;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.telemetry.lastError = err.message;
      this.updateTelemetry({ status: 'error' });
      this.hooks.onError?.(err, this.snapshot);
      throw err;
    } finally {
      const timer = setTimeout(() => {
        this.updateTelemetry({ status: 'idle' });
      }, this.cooldownMs);
      (timer as unknown as { unref?: () => void }).unref?.();
    }
  }

  protected updateTelemetry(patch: Partial<AgentTelemetry>) {
    this.telemetry = { ...this.telemetry, ...patch };
    this.hooks.onStatusChange?.(this.snapshot);
  }

  protected adjustLearningRate(recommendations: AgentRecommendation[]) {
    if (!recommendations.length) {
      this.telemetry.learningRate = Math.max(0.05, this.telemetry.learningRate * 0.95);
      return;
    }

    const averageConfidence =
      recommendations.reduce((total, item) => total + item.confidence, 0) / recommendations.length;
    const nudged = this.telemetry.learningRate * 0.9 + averageConfidence * 0.1;
    this.telemetry.learningRate = Math.min(0.95, Math.max(0.1, Number(nudged.toFixed(3))));
  }

  protected abstract execute(context: AgentContext): Promise<AgentRecommendation[]>;
}

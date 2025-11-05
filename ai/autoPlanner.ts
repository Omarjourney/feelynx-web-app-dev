import fs from 'fs';
import path from 'path';
import { AgentRecommendation } from './core/agentBase';

export type AutoPlanItem = {
  id: string;
  title: string;
  priority: 'Now' | 'Next' | 'Later';
  rationale: string;
  confidence: number;
};

export type AutoPlan = {
  generatedAt: string;
  items: AutoPlanItem[];
};

const ROADMAP_FILE = path.resolve(process.cwd(), 'roadmap', 'auto', 'next.json');

export const synthesizePlan = (signals: Record<string, unknown>, insights: AgentRecommendation[] = []): AutoPlan => {
  const now = new Date().toISOString();
  const sentiment = Number(signals.sentimentScore ?? 0.78);
  const uptime = Number(signals.uptime ?? 0.995);

  const items: AutoPlanItem[] = [
    {
      id: `stabilize-${now}`,
      title: 'Stabilize self-healing feedback loop',
      priority: uptime < 0.99 ? 'Now' : 'Next',
      rationale: `Maintain uptime at ${(uptime * 100).toFixed(2)}% while expanding repair coverage.`,
      confidence: 0.82,
    },
    {
      id: `emotion-${now}`,
      title: 'Deepen emotional AI personalization arcs',
      priority: sentiment < 0.75 ? 'Now' : 'Next',
      rationale: `Sentiment score ${(sentiment * 100).toFixed(1)}% indicates opportunity to dial up resonance.`,
      confidence: 0.78,
    },
  ];

  insights.slice(0, 3).forEach((recommendation, index) => {
    items.push({
      id: `insight-${index}`,
      title: recommendation.title,
      priority: recommendation.impact === 'high' ? 'Now' : 'Later',
      rationale: recommendation.summary,
      confidence: recommendation.confidence,
    });
  });

  return { generatedAt: now, items };
};

export const writePlan = (plan: AutoPlan) => {
  fs.mkdirSync(path.dirname(ROADMAP_FILE), { recursive: true });
  fs.writeFileSync(ROADMAP_FILE, JSON.stringify(plan, null, 2));
  return ROADMAP_FILE;
};

export const generateAutoRoadmap = (signals: Record<string, unknown>, recommendations: AgentRecommendation[]) => {
  const plan = synthesizePlan(signals, recommendations);
  writePlan(plan);
  return plan;
};

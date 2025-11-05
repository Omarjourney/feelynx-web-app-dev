import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AutoPlan } from '../../ai/autoPlanner';

const roadmapUrl = new URL('../../roadmap/auto/next.json', import.meta.url);

type DecisionState = Record<string, 'Adopt' | 'Edit' | 'Ignore' | null>;

const priorityColors: Record<string, string> = {
  Now: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
  Next: 'bg-sky-500/10 text-sky-300 border-sky-500/40',
  Later: 'bg-purple-500/10 text-purple-300 border-purple-500/40',
};

const AutoRoadmap = () => {
  const [plan, setPlan] = useState<AutoPlan | null>(null);
  const [decisions, setDecisions] = useState<DecisionState>({});

  useEffect(() => {
    const load = async () => {
      const response = await fetch(roadmapUrl.href);
      const json = (await response.json()) as AutoPlan;
      setPlan(json);
    };
    void load();
  }, []);

  const adoptionRate = useMemo(() => {
    const values = Object.values(decisions).filter(Boolean);
    if (!values.length) return 0;
    const adopted = values.filter((value) => value === 'Adopt').length;
    return Math.round((adopted / values.length) * 100);
  }, [decisions]);

  const handleDecision = (id: string, decision: 'Adopt' | 'Edit' | 'Ignore') => {
    setDecisions((prev) => ({ ...prev, [id]: prev[id] === decision ? null : decision }));
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Auto-Roadmap Generator</h1>
        <p className="max-w-2xl text-muted-foreground">
          Weekly synthesis of platform logs, KPIs, and agent intelligence. Review, adapt, and deploy the AI-proposed sprint
          backlog.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Iteration Pulse</CardTitle>
          <CardDescription>Acceptance velocity across autonomous proposals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>AI Proposals Adopted</span>
            <span>{adoptionRate}%</span>
          </div>
          <Progress value={adoptionRate} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {plan?.items.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="h-full border-primary/30 bg-background/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge className={priorityColors[item.priority] ?? priorityColors.Later}>{item.priority}</Badge>
                </div>
                <CardDescription>Confidence {(item.confidence * 100).toFixed(1)}%</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.rationale}</p>
                <div className="flex gap-2">
                  {(['Adopt', 'Edit', 'Ignore'] as const).map((action) => (
                    <Button
                      key={action}
                      variant={decisions[item.id] === action ? 'default' : 'outline'}
                      onClick={() => handleDecision(item.id, action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AutoRoadmap;

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, Tooltip, RadialBarChart, RadialBar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgentRuntime } from '../../ai/runtime';
import InsightAgent from '../../ai/agents/insightAgent';
import OpsAgent from '../../ai/agents/opsAgent';
import GrowthAgent from '../../ai/agents/growthAgent';
import EmotionAgent from '../../ai/agents/emotionAgent';
import { useLiveBlueprintStore } from '@/stores/useLiveBlueprintStore';

type HealthMetric = {
  name: string;
  value: number;
  target: number;
};

type TimelinePoint = {
  label: string;
  tokens: number;
  sentiment: number;
};

declare global {
  interface Window {
    THREE?: any;
  }
}

const NeuralDashboard = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<HealthMetric[]>([
    { name: 'Self-Healing Success', value: 0.96, target: 0.95 },
    { name: 'AI Optimization Adoption', value: 0.72, target: 0.7 },
    { name: 'Mood Adaptation Accuracy', value: 0.88, target: 0.85 },
  ]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([
    { label: '00:00', tokens: 540, sentiment: 0.64 },
    { label: '00:10', tokens: 620, sentiment: 0.71 },
    { label: '00:20', tokens: 580, sentiment: 0.77 },
    { label: '00:30', tokens: 655, sentiment: 0.81 },
    { label: '00:40', tokens: 720, sentiment: 0.86 },
  ]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const activeMood = useLiveBlueprintStore((state) => state.emotionState);

  useEffect(() => {
    const runtime = new AgentRuntime({
      agents: [new InsightAgent(), new OpsAgent(), new GrowthAgent(), new EmotionAgent()],
      pollIntervalMs: 120_000,
      onRecommendations: (agent, next) => {
        setRecommendations((prev) =>
          [...next.map((item) => `${agent}: ${item.title}`), ...prev].slice(0, 6),
        );
        setHealth((current) =>
          current.map((metric) => {
            if (metric.name === 'Self-Healing Success' && agent === 'OpsAgent') {
              return { ...metric, value: Math.min(0.99, metric.value + 0.01) };
            }
            if (metric.name === 'AI Optimization Adoption' && agent === 'InsightAgent') {
              return { ...metric, value: Math.min(0.95, metric.value + 0.015) };
            }
            if (metric.name === 'Mood Adaptation Accuracy' && agent === 'EmotionAgent') {
              return { ...metric, value: Math.min(0.97, metric.value + 0.012) };
            }
            return metric;
          }),
        );
      },
    });
    runtime.start();
    return () => runtime.stop();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.setInterval(() => {
      setTimeline((prev) => {
        const nextLabel = new Date(Date.now()).toLocaleTimeString([], { minute: '2-digit', hour: '2-digit' });
        const last = prev[prev.length - 1];
        const tokens = Math.round((last?.tokens ?? 600) * (0.95 + Math.random() * 0.1));
        const sentiment = Math.min(0.95, Math.max(0.55, (last?.sentiment ?? 0.7) + (Math.random() - 0.5) * 0.05));
        return [...prev.slice(-7), { label: nextLabel, tokens, sentiment }];
      });
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mount = mountRef.current;
    if (!mount) return;

    let cleanup: (() => void) | undefined;

    const init = () => {
      const THREE = window.THREE;
      if (!THREE) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
      camera.position.z = 6;

      const geometry = new THREE.IcosahedronGeometry(2.3, 1);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#7c3aed'),
        emissive: new THREE.Color('#a855f7'),
        metalness: 0.25,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const ambient = new THREE.AmbientLight('#ffffff', 0.6);
      scene.add(ambient);
      const point = new THREE.PointLight('#818cf8', 4, 40);
      point.position.set(4, 4, 6);
      scene.add(point);

      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);

      let animationFrame: number;
      const renderLoop = () => {
        mesh.rotation.x += 0.003;
        mesh.rotation.y += 0.006;
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(renderLoop);
      };
      renderLoop();

      cleanup = () => {
        cancelAnimationFrame(animationFrame);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        mount.innerHTML = '';
      };
    };

    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/three@0.169.0/build/three.min.js';
      script.async = true;
      script.onload = init;
      script.onerror = () => {
        console.warn('Three.js failed to load – falling back to gradient animation.');
        if (mount) {
          mount.innerHTML = '';
          mount.style.background = 'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.45), transparent)';
        }
      };
      mount.appendChild(script);
      return () => {
        cleanup?.();
        script.remove();
      };
    }

    init();
    return () => cleanup?.();
  }, []);

  const sentimentScore = useMemo(() => {
    const latest = timeline[timeline.length - 1];
    return latest?.sentiment ?? 0.7;
  }, [timeline]);

  const radialData = useMemo(
    () =>
      health.map((metric) => ({
        name: metric.name,
        value: Number((metric.value * 100).toFixed(1)),
        fill: metric.value >= metric.target ? '#34d399' : '#f97316',
      })),
    [health],
  );

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Neural Dashboard</h1>
          <p className="max-w-2xl text-muted-foreground">
            Unified command center orchestrating Feelynx autonomy. Real-time KPIs, emotional resonance, and continuous learning
            streams blend to keep the ecosystem self-evolving.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Active Mood: {activeMood}
          </Badge>
          <Button variant="secondary">Launch Adaptive Loop</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Health Metrics</CardTitle>
            <CardDescription>Uptime, agent performance & prediction accuracy trend.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ left: 12, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ strokeDasharray: '4 2' }}
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#7c3aed" fillOpacity={1} fill="url(#colorTokens)" />
                <Area type="monotone" dataKey="sentiment" stroke="#34d399" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Confidence</CardTitle>
            <CardDescription>Radial view of autonomous KPIs.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart data={radialData} innerRadius="30%" outerRadius="100%">
                <RadialBar minAngle={15} background clockWise dataKey="value" />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Brain</CardTitle>
            <CardDescription>Token flow & sentiment map streaming live.</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              className="relative h-56 overflow-hidden rounded-xl border border-primary/20 bg-primary/5"
              animate={{ opacity: [0.8, 1, 0.85], scale: [0.98, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 8 }}
            >
              <div className="absolute inset-0" ref={mountRef} />
              <div className="absolute bottom-4 left-4 text-sm text-primary-foreground/80">
                <p className="font-semibold">Sentiment Orbit</p>
                <p className="text-xs opacity-80">Current confidence {(sentimentScore * 100).toFixed(1)}%</p>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Loop</CardTitle>
            <CardDescription>Latest model updates & retrain cadence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {health.map((metric) => (
              <motion.div
                key={metric.name}
                className="flex items-center justify-between rounded-lg bg-background/60 p-4 shadow-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-lg font-semibold text-foreground">{(metric.value * 100).toFixed(1)}%</p>
                </div>
                <Badge variant="secondary">Target {(metric.target * 100).toFixed(0)}%</Badge>
              </motion.div>
            ))}
            <Button className="w-full" variant="outline">
              View Automation Journal
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Autonomous Agent Feed</CardTitle>
          <CardDescription>Latest actions streaming from the AI core.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Awaiting first cycle. Agents will populate live once telemetry ticks in.
            </p>
          ) : (
            recommendations.map((entry) => (
              <motion.div
                key={entry}
                className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {entry}
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NeuralDashboard;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { refreshRoadmapSnapshot, roadmapSnapshot } from '../enterprise/data';

interface Initiative {
  id: string;
  focus: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  etaDays: number;
}

interface RoadmapState {
  generatedAt: string;
  initiatives: Initiative[];
}

export function AutoRoadmapPage() {
  const [state, setState] = useState<RoadmapState>(roadmapSnapshot);

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Auto-Roadmap Navigator</h1>
        <p style={{ opacity: 0.65, maxWidth: 700 }}>
          AI distills telemetry, creator sentiment, and market signals into a living 90-day execution plan.
        </p>
        <p style={{ opacity: 0.45, marginTop: '0.75rem' }}>Last generated {new Date(state.generatedAt).toLocaleString()}</p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ marginTop: '2.5rem', display: 'grid', gap: '1.25rem' }}
      >
        {state.initiatives.map((initiative, index) => (
          <motion.article
            key={initiative.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              borderRadius: '1.5rem',
              padding: '1.75rem',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{initiative.focus}</h2>
              <span
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  background: impactBadge(initiative.impact).background,
                  color: impactBadge(initiative.impact).color,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                {initiative.impact} impact
              </span>
            </div>
            <p style={{ margin: 0, opacity: 0.75 }}>{initiative.description}</p>
            <p style={{ margin: 0, opacity: 0.55 }}>ETA {initiative.etaDays} days</p>
          </motion.article>
        ))}
      </motion.section>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => setState(refreshRoadmapSnapshot())}
        style={{
          marginTop: '2.5rem',
          padding: '1rem 1.5rem',
          borderRadius: '999px',
          border: '1px solid rgba(99, 102, 241, 0.65)',
          background: 'rgba(67, 56, 202, 0.65)',
          color: '#f8fafc',
          fontWeight: 600,
        }}
      >
        Refresh AI Insights
      </motion.button>
    </div>
  );
}

function impactBadge(impact: Initiative['impact']) {
  switch (impact) {
    case 'high':
      return { background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' };
    case 'medium':
      return { background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' };
    default:
      return { background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5f5' };
  }
}

export default AutoRoadmapPage;

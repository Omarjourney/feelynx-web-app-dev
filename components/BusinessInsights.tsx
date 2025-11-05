import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import type { FC } from 'react';

type FunnelKey = 'awareness' | 'activation' | 'revenue' | 'referral';

export interface BusinessInsightsProps {
  creatorRetention: {
    current: number;
    target: number;
  };
  tokenVelocity: {
    current: number;
    previous: number;
  };
  churnProbability: {
    enterprise: number;
    consumer: number;
  };
  funnel: Record<FunnelKey, number>;
}

const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

const BusinessInsights: FC<BusinessInsightsProps> = ({ creatorRetention, tokenVelocity, churnProbability, funnel }) => {
  const retentionSeries = monthLabels.map((month, index) => ({
    month,
    retention: Number((creatorRetention.current - 0.04 + index * 0.01).toFixed(2)),
    target: creatorRetention.target,
  }));

  const velocitySeries = monthLabels.map((month, index) => ({
    month,
    enterprise: Math.round(tokenVelocity.current * (0.75 + index * 0.05)),
    consumer: Math.round(tokenVelocity.previous * (0.7 + index * 0.05)),
  }));

  const funnelSeries = (Object.keys(funnel) as FunnelKey[]).map((stage) => ({
    stage,
    rate: Number((funnel[stage] * 100).toFixed(1)),
  }));

  const churnSeries = [
    { segment: 'Enterprise', rate: Number((churnProbability.enterprise * 100).toFixed(1)) },
    { segment: 'Consumer', rate: Number((churnProbability.consumer * 100).toFixed(1)) },
  ];

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Creator Retention Trajectory</h3>
        <p style={{ margin: '0.35rem 0 1.5rem', opacity: 0.65 }}>
          Tracking enterprise health against quarterly targets for proactive success planning.
        </p>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={retentionSeries}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 8" />
              <XAxis dataKey="month" stroke="rgba(226, 232, 240, 0.75)" tickLine={false} axisLine={false} />
              <YAxis domain={[0.6, 0.95]} stroke="rgba(226, 232, 240, 0.75)" tickFormatter={(value) => `${Math.round(value * 100)}%`} />
              <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
              <Line type="monotone" dataKey="retention" stroke="#38bdf8" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="target" stroke="#f472b6" strokeWidth={2} strokeDasharray="6 8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            border: '1px solid rgba(45, 212, 191, 0.3)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Token Velocity Momentum</h3>
          <p style={{ margin: '0.35rem 0 1.5rem', opacity: 0.65 }}>
            Forecasting purchase cadence to balance liquidity and reinvestment.
          </p>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={velocitySeries}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 8" />
                <XAxis dataKey="month" stroke="rgba(226, 232, 240, 0.75)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(226, 232, 240, 0.75)" tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip formatter={(value: number) => `$${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="enterprise" stroke="#6366f1" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="consumer" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            borderRadius: '1.5rem',
            padding: '1.5rem',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Conversion Funnel Lift</h3>
          <p style={{ margin: '0.35rem 0 1.5rem', opacity: 0.65 }}>
            AI-aligned nudges amplify each step of the acquisition and monetization flow.
          </p>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={funnelSeries}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 8" />
                <XAxis dataKey="stage" stroke="rgba(226, 232, 240, 0.75)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(226, 232, 240, 0.75)" tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="rate" fill="#fbbf24" radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          border: '1px solid rgba(244, 114, 182, 0.3)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Churn Risk Signal</h3>
        <p style={{ margin: '0.35rem 0 1.5rem', opacity: 0.65 }}>
          Early alerts enable partner success teams to deliver precision interventions.
        </p>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={churnSeries}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 8" />
              <XAxis dataKey="segment" stroke="rgba(226, 232, 240, 0.75)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(226, 232, 240, 0.75)" tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="rate" fill="#f472b6" radius={[12, 12, 12, 12]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </div>
  );
};

export default BusinessInsights;

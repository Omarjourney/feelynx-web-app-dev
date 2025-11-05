import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getLedgerSnapshot, getReinvestmentPlan } from '../enterprise/data';

export function FinanceOverviewPage() {
  const ledger = useMemo(() => getLedgerSnapshot(), []);
  const reinvestment = useMemo(() => getReinvestmentPlan(ledger.totals.net), [ledger.totals.net]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', background: '#020617', color: '#f8fafc' }}>
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Global Finance Overview</h1>
        <p style={{ opacity: 0.6, maxWidth: 620 }}>
          A transparent command center for cross-region revenue, payouts, and automated reinvestment flows.
        </p>
      </motion.header>

      <section style={{ marginTop: '2rem', display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <SummaryTile label="Revenue" value={`$${ledger.totals.revenue.toLocaleString()}`} accent="#38bdf8" />
        <SummaryTile label="Payouts" value={`$${ledger.totals.payouts.toLocaleString()}`} accent="#f97316" />
        <SummaryTile label="Taxes" value={`$${ledger.totals.taxes.toLocaleString()}`} accent="#fbbf24" />
        <SummaryTile label="Net" value={`$${ledger.totals.net.toLocaleString()}`} accent="#22c55e" />
      </section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          marginTop: '3rem',
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          border: '1px solid rgba(56, 189, 248, 0.35)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Regional Performance</h2>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
          {ledger.rows.map((row) => (
            <div
              key={row.region}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr repeat(4, minmax(0, 1fr))',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '1rem',
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
              }}
            >
              <span style={{ fontWeight: 600 }}>{row.region}</span>
              <span>${row.revenue.toLocaleString()}</span>
              <span>${row.payouts.toLocaleString()}</span>
              <span>${row.taxes.toLocaleString()}</span>
              <span style={{ color: row.net >= 0 ? '#22c55e' : '#f43f5e' }}>${row.net.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          marginTop: '3rem',
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          border: '1px solid rgba(34, 197, 94, 0.35)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Reinvestment Engine</h2>
        <p style={{ opacity: 0.7 }}>
          Automatically allocating <strong>{Math.round(reinvestment.ratio * 100)}%</strong> of quarterly profit toward
          growth vectors.
        </p>
        <dl style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1.5rem' }}>
          <InfoBlock label="Creator Grants" value={`$${reinvestment.allocations.creatorGrants.toLocaleString()}`} />
          <InfoBlock label="Marketing" value={`$${reinvestment.allocations.marketing.toLocaleString()}`} />
          <InfoBlock label="Platform R&D" value={`$${reinvestment.allocations.researchAndDevelopment.toLocaleString()}`} />
        </dl>
      </motion.section>
    </div>
  );
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        border: `1px solid ${accent}55`,
      }}
    >
      <p style={{ margin: 0, fontSize: '0.75rem', letterSpacing: 1.2, opacity: 0.65, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 600 }}>{value}</p>
    </motion.div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: '1rem',
        background: 'rgba(15, 23, 42, 0.55)',
        padding: '1.25rem',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <p style={{ margin: 0, opacity: 0.65, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>{label}</p>
      <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 600 }}>{value}</p>
    </div>
  );
}

export default FinanceOverviewPage;

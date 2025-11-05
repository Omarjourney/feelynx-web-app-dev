import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { resolveTheme } from './ui';
import { calculateRevenueShare, listPartners } from './api/v1';
import BusinessInsights from '../components/BusinessInsights';

export function PartnerDashboard() {
  const partners = listPartners();
  const theme = resolveTheme('feelynx-default');
  const revenueShare = calculateRevenueShare();

  const totalRevenue = useMemo(
    () => partners.reduce((acc, partner) => acc + partner.mrr, 0),
    [partners],
  );

  return (
    <div
      style={{
        background: theme.palette.background,
        color: theme.palette.foreground,
        minHeight: '100vh',
        fontFamily: theme.typography.bodyFont,
        padding: '2rem',
      }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontFamily: theme.typography.headingFont, fontSize: '2.75rem', margin: 0 }}>
            Enterprise Control Tower
          </h1>
          <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>
            Manage every white-label instance, monitor impact, and keep the revenue engine aligned.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase' }}>
            Enterprise MRR
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>${totalRevenue.toLocaleString()}</p>
        </div>
      </motion.header>

      <section style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {partners.map((partner) => (
          <motion.article
            key={partner.id}
            style={{
              background: theme.surface.level1,
              borderRadius: '1.5rem',
              padding: '1.75rem',
              border: `1px solid ${theme.palette.primary}33`,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: theme.typography.headingFont, fontSize: '1.5rem', margin: 0 }}>
                  {partner.displayName}
                </h2>
                <p style={{ opacity: 0.6, marginTop: '0.25rem' }}>{partner.customDomain}</p>
              </div>
              <img
                src={partner.branding.logoUrl}
                alt={`${partner.displayName} logo`}
                style={{ height: '48px', width: '48px', borderRadius: '12px', objectFit: 'cover' }}
              />
            </div>

            <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', marginTop: '1.5rem', gap: '1rem' }}>
              <div>
                <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6 }}>Active Creators</dt>
                <dd style={{ fontSize: '1.25rem', margin: 0 }}>{partner.activeUsers.toLocaleString()}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6 }}>MRR</dt>
                <dd style={{ fontSize: '1.25rem', margin: 0 }}>${partner.mrr.toLocaleString()}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6 }}>Payout %</dt>
                <dd style={{ fontSize: '1.25rem', margin: 0 }}>{Math.round(partner.payoutPercentage * 100)}%</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6 }}>Revenue Share</dt>
                <dd style={{ fontSize: '1.25rem', margin: 0 }}>${revenueShare[partner.id]?.toLocaleString() ?? '0'}</dd>
              </div>
            </dl>
          </motion.article>
        ))}
      </section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: '3rem' }}>
        <BusinessInsights
          creatorRetention={{ current: 0.82, target: 0.85 }}
          tokenVelocity={{ current: 4200, previous: 3800 }}
          churnProbability={{ enterprise: 0.12, consumer: 0.18 }}
          funnel={{
            awareness: 0.78,
            activation: 0.52,
            revenue: 0.34,
            referral: 0.19,
          }}
        />
      </motion.section>
    </div>
  );
}

export default PartnerDashboard;

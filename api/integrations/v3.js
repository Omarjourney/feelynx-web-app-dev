const integrations = [
  {
    provider: 'Stripe',
    scopes: ['payments', 'subscriptions'],
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    provider: 'Twitch',
    scopes: ['streams', 'chat'],
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    provider: 'YouTube',
    scopes: ['videos', 'community'],
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    provider: 'TikTok',
    scopes: ['shorts'],
    status: 'syncing',
    lastSync: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    provider: 'Coinbase Commerce',
    scopes: ['wallets', 'settlements'],
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

function listIntegrations() {
  return integrations;
}

function syncProvider(provider) {
  const entry = integrations.find((item) => item.provider === provider);
  if (!entry) {
    throw new Error('Integration not found');
  }

  entry.lastSync = new Date().toISOString();
  entry.status = 'connected';
  return entry;
}

module.exports = {
  listIntegrations,
  syncProvider,
};

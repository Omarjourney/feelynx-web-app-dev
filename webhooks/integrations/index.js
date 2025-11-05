/* eslint-disable @typescript-eslint/no-require-imports */
const { listIntegrations } = require('../../api/integrations/v3');

function handleIntegrationWebhook(payload) {
  const integrations = listIntegrations();
  const record = integrations.find((integration) => integration.provider === payload.provider);

  if (!record) {
    return {
      status: 'ignored',
      reason: 'provider_not_registered',
    };
  }

  return {
    status: 'updated',
    provider: record.provider,
    activity: payload.event,
    processedAt: new Date().toISOString(),
  };
}

module.exports = {
  handleIntegrationWebhook,
};

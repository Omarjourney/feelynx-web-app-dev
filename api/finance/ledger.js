const regionalBuckets = new Map([
  [
    'na',
    {
      region: 'North America',
      revenue: 182000,
      payouts: 72000,
      taxes: 22000,
    },
  ],
  [
    'eu',
    {
      region: 'Europe',
      revenue: 143000,
      payouts: 58000,
      taxes: 19000,
    },
  ],
  [
    'apac',
    {
      region: 'Asia Pacific',
      revenue: 96000,
      payouts: 41000,
      taxes: 12000,
    },
  ],
]);

function listRegionalLedger() {
  const rows = Array.from(regionalBuckets.values()).map((entry) => ({
    ...entry,
    net: entry.revenue - entry.payouts - entry.taxes,
  }));

  const totals = rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      payouts: acc.payouts + row.payouts,
      taxes: acc.taxes + row.taxes,
      net: acc.net + row.net,
    }),
    { revenue: 0, payouts: 0, taxes: 0, net: 0 },
  );

  return { rows, totals };
}

module.exports = {
  listRegionalLedger,
};

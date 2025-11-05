function projectReinvestment(netIncome, strategy = { grants: 0.45, marketing: 0.35, rnd: 0.2 }) {
  const reinvestmentPool = Math.round(netIncome * 0.18);

  return {
    netIncome,
    reinvestmentPool,
    allocations: {
      creatorGrants: Math.round(reinvestmentPool * strategy.grants),
      marketing: Math.round(reinvestmentPool * strategy.marketing),
      researchAndDevelopment: Math.round(reinvestmentPool * strategy.rnd),
    },
    ratio: Number((reinvestmentPool / netIncome).toFixed(2)),
    strategy,
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  projectReinvestment,
};

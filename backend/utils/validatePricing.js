const fs = require('fs');
const path = require('path');

const MIN_PROFIT_PER_COIN = 0.0025; // 0.25¢ minimum platform profit per coin
const CREATOR_SPLIT = 0.75;

function validatePackage(pkg) {
  const creatorPayout = pkg.price * CREATOR_SPLIT;
  const platformRevenue = pkg.price - creatorPayout;
  const profitPerCoin = platformRevenue / pkg.coins;

  if (profitPerCoin < MIN_PROFIT_PER_COIN) {
    console.error(`❌ Platform profit per coin dropped below the minimum for package ${pkg.id}`);
    throw new Error(`Profit floor violation in package ${pkg.id}: $${profitPerCoin.toFixed(4)} < $${MIN_PROFIT_PER_COIN}`);
  } else {
    console.log(`✅ Package ${pkg.id} validated — profit per coin: $${profitPerCoin.toFixed(4)}`);
  }
  
  return {
    ...pkg,
    creatorPayout,
    platformRevenue,
    profitPerCoin
  };
}

function loadAndValidatePricing() {
  try {
    const pricingPath = path.join(__dirname, '../../config/pricing.json');
    const pricing = JSON.parse(fs.readFileSync(pricingPath, 'utf-8'));
    
    console.log('🔍 Validating pricing configuration on startup...\n');
    const validatedPricing = pricing.map(validatePackage);
    console.log('✅ All pricing packages validated successfully\n');
    
    return validatedPricing;
  } catch (error) {
    console.error('❌ Failed to load or validate pricing:', error.message);
    throw error;
  }
}

module.exports = {
  validatePackage,
  loadAndValidatePricing,
  MIN_PROFIT_PER_COIN,
  CREATOR_SPLIT
};
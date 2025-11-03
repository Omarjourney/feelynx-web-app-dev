// scripts/validatePricing.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIN_PROFIT_PER_COIN = 0.0025; // 0.25¢ minimum platform profit per coin
const CREATOR_SPLIT = 0.75;

try {
  // Read pricing configuration
  const pricingPath = path.join(__dirname, '../config/pricing.json');
  
  if (!fs.existsSync(pricingPath)) {
    console.error(`❌ Pricing file not found at: ${pricingPath}`);
    process.exit(1);
  }
  
  const pricing = JSON.parse(fs.readFileSync(pricingPath, 'utf-8'));

  console.log('🔍 Validating Feelynx Pricing Configuration...\n');

  let allValid = true;
  const results = [];

  pricing.forEach((pkg) => {
    const creatorPayout = pkg.price * CREATOR_SPLIT;
    const platformRevenue = pkg.price - creatorPayout;
    const profitPerCoin = platformRevenue / pkg.coins;
    
    const isValid = profitPerCoin >= MIN_PROFIT_PER_COIN;
    const status = isValid ? '✅' : '❌';
    
    console.log(`${status} Package ${pkg.id}: $${pkg.price.toFixed(2)} → ${pkg.coins} coins`);
    console.log(`   Profit per coin: $${profitPerCoin.toFixed(4)} (min: $${MIN_PROFIT_PER_COIN.toFixed(4)})`);
    console.log(`   Creator gets: $${creatorPayout.toFixed(2)} | Platform: $${platformRevenue.toFixed(2)}\n`);
    
    results.push({
      id: pkg.id,
      valid: isValid,
      profitPerCoin: profitPerCoin.toFixed(4)
    });
    
    if (!isValid) {
      allValid = false;
    }
  });

  if (allValid) {
    console.log('✅ All packages validated successfully!\n');
    process.exit(0);
  } else {
    console.error('❌ Some packages failed validation!\n');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error during validation:', error.message);
  process.exit(1);
}

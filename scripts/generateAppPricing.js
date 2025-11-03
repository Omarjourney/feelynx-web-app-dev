// scripts/generateAppPricing.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_MARKUP = 1.3; // 30% markup for app stores
const WEB_BONUS_PERCENT = 30; // display bonus for web UI

try {
  const pricingPath = path.join(__dirname, '../config/pricing.json');
  
  if (!fs.existsSync(pricingPath)) {
    console.error(`❌ pricing.json not found at: ${pricingPath}`);
    process.exit(1);
  }
  
  const pricing = JSON.parse(fs.readFileSync(pricingPath, 'utf8'));

  const appPricing = pricing.map((pkg) => ({
    ...pkg,
    app_price: +(pkg.price * APP_MARKUP).toFixed(2),
    web_bonus: `+${WEB_BONUS_PERCENT}% Bonus`,
    store: 'app',
  }));

  const outputPath = path.join(__dirname, '../config/pricingApp.json');
  fs.writeFileSync(outputPath, JSON.stringify(appPricing, null, 2));
  
  console.log('✅ pricingApp.json generated successfully with app markup + web bonus tag');
  console.log(`   Generated ${appPricing.length} app packages with 30% markup\n`);
  
  // Display sample
  console.log('📋 Sample app pricing:');
  appPricing.slice(0, 3).forEach(pkg => {
    console.log(`   Package ${pkg.id}: $${pkg.price} (web) → $${pkg.app_price} (app) | ${pkg.coins} coins | ${pkg.web_bonus}`);
  });
  
} catch (error) {
  console.error('❌ Error generating app pricing:', error.message);
  process.exit(1);
}

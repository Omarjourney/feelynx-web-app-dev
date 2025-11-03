{
  "id": 1,
  "price": 0.99,
  "coins": 75,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 2,
  "price": 4.99,
  "coins": 400,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 3,
  "price": 9.99,
  "coins": 850,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 4,
  "price": 15.99,
  "coins": 1450,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 5,
  "price": 19.99,
  "coins": 1950,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 6,
  "price": 24.99,
  "coins": 2550,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 7,
  "price": 49.99,
  "coins": 5500,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 8,
  "price": 99.99,
  "coins": 11300,
  "creator_split": 0.75,
  "platform_fee": 0.25
},
{
  "id": 9,
  "price": 149.99,
  "coins": 17000,
  "creator_split": 0.75,
  "platform_fee": 0.25
}

// Feelynx Pricing Validator
import pricing from "../config/pricing.json" assert { type: "json" };

const MIN_PROFIT_PER_COIN = 0.0025;
const CREATOR_SPLIT = 0.75;

pricing.forEach((pkg) => {
  const creatorPayout = pkg.price * CREATOR_SPLIT;
  const platformRevenue = pkg.price - creatorPayout;
  const profitPerCoin = platformRevenue / pkg.coins;
  
  const status = profitPerCoin >= MIN_PROFIT_PER_COIN ? '✅' : '❌';
  console.log(`${status} Package ${pkg.id} — profit per coin: $${profitPerCoin.toFixed(4)}`);
});

// Adjust app store pricing to cover 30% fee
export function getAppPrice(webPrice) {
  return +(webPrice * 1.3).toFixed(2);
}

// Run validation on startup or during build
import pricing from "../../config/pricing.json" assert { type: "json" };
pricing.forEach(validatePackage);

// Inside your map loop that renders each package:
<div className="package-details">
  <p className="text-sm text-gray-200">
    Creators receive ${(pkg.price * pkg.creator_split).toFixed(2)} (75%)<br />
    Feelynx margin ${(pkg.price * pkg.platform_fee).toFixed(2)} (25%) · 
    ${(pkg.price * pkg.platform_fee / pkg.coins).toFixed(3)} per coin
  </p>
</div>

{/* Add this note under the pricing grid */}
<p className="text-xs text-gray-400 mt-2 italic">
  💎 Buy on the web and get up to 30% more VibeCoins — no App Store fees.
</p>

import { getAppPrice } from "../utils/getAppPrice.js";

// In your purchase endpoint:
router.post('/purchase', async (req, res) => {
  // ...existing code...
  
  const isAppPurchase = req.body.platform === 'app' || req.headers['x-app-purchase'] === 'true';
  const finalPrice = isAppPurchase ? getAppPrice(pkg.price) : pkg.price;
  
  // ...existing code...
});

// package.json scripts section
"scripts": {
  // ...existing scripts...
  "validate:pricing": "node scripts/validatePricing.js"
}
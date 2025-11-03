import { useEffect, useState } from 'react';

interface PricingPackage {
  id: number;
  price: number;
  coins: number;
  creator_split: number;
  platform_fee: number;
}

export function PricingTable() {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/config/pricing.json')
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load pricing:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading pricing...</div>;
  }

  return (
    <div className="pricing-grid">
      {packages.map((pkg) => {
        const creatorPayout = (pkg.price * pkg.creator_split).toFixed(2);
        const platformRevenue = (pkg.price * pkg.platform_fee).toFixed(2);
        const profitPerCoin = (pkg.price * pkg.platform_fee / pkg.coins).toFixed(4);

        return (
          <div key={pkg.id} className="pricing-card">
            <h3>${pkg.price.toFixed(2)}</h3>
            <p className="coins">{pkg.coins} VibeCoins</p>
            
            <div className="breakdown">
              <p className="text-sm text-gray-200">
                Creators receive ${creatorPayout} (75%)<br />
                Feelynx margin ${platformRevenue} (25%) · 
                ${profitPerCoin} per coin
              </p>
            </div>
            
            <button className="buy-button">
              Buy Now
            </button>
          </div>
        );
      })}
      
      <p className="text-xs text-gray-400 mt-2 italic">
        💎 Buy on the web and get up to 30% more VibeCoins — no App Store fees.
      </p>
    </div>
  );
}
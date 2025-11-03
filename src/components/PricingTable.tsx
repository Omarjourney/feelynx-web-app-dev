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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/config/pricing.json')
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load pricing:', err);
        setError('Sorry, we could not load pricing information. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading pricing...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pricing-grid">
      {packages.map((pkg) => {
        const creatorPayout = (pkg.price * pkg.creator_split).toFixed(2);
        const platformRevenue = (pkg.price * pkg.platform_fee).toFixed(2);
        const profitPerCoin = (pkg.price * pkg.platform_fee / pkg.coins).toFixed(4);
        const creatorPercent = (pkg.creator_split * 100).toFixed(0);
        const platformPercent = (pkg.platform_fee * 100).toFixed(0);

        return (
          <div key={pkg.id} className="pricing-card">
            <h3>${pkg.price.toFixed(2)}</h3>
            <p className="coins">{pkg.coins} VibeCoins</p>
            
            <div className="breakdown">
              <p className="text-sm text-gray-200">
                Creators receive ${creatorPayout} ({creatorPercent}%)<br />
                Feelynx margin ${platformRevenue} ({platformPercent}%) · 
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
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
    const fetchPricing = async () => {
      const paths = ['/config/pricing.json', '/api/pricing'];
      
      for (const path of paths) {
        try {
          console.log(`[PricingTable] Fetching from: ${path}`);
          const res = await fetch(path);
          
          if (!res.ok) {
            console.warn(`[PricingTable] Failed to fetch from ${path}: ${res.status}`);
            continue;
          }
          
          const data = await res.json();
          console.log('[PricingTable] Successfully loaded pricing:', data);
          setPackages(data);
          setLoading(false);
          setError(null);
          return;
        } catch (err) {
          console.warn(`[PricingTable] Error fetching from ${path}:`, err);
        }
      }
      
      // Fallback to hardcoded pricing
      console.warn('[PricingTable] Using fallback pricing data');
      setPackages([
        { id: 1, price: 0.99, coins: 75, creator_split: 0.75, platform_fee: 0.25 },
        { id: 2, price: 4.99, coins: 400, creator_split: 0.75, platform_fee: 0.25 },
        { id: 3, price: 9.99, coins: 850, creator_split: 0.75, platform_fee: 0.25 },
        { id: 4, price: 15.99, coins: 1450, creator_split: 0.75, platform_fee: 0.25 },
        { id: 5, price: 19.99, coins: 1950, creator_split: 0.75, platform_fee: 0.25 },
        { id: 6, price: 24.99, coins: 2450, creator_split: 0.75, platform_fee: 0.25 },
        { id: 7, price: 49.99, coins: 4900, creator_split: 0.75, platform_fee: 0.25 },
        { id: 8, price: 99.99, coins: 9800, creator_split: 0.75, platform_fee: 0.25 },
        { id: 9, price: 149.99, coins: 14700, creator_split: 0.75, platform_fee: 0.25 }
      ]);
      setLoading(false);
      setError('Using default pricing');
    };
    
    fetchPricing();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading pricing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded text-yellow-400 text-sm">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const creatorPayout = (pkg.price * pkg.creator_split).toFixed(2);
          const platformRevenue = (pkg.price * pkg.platform_fee).toFixed(2);
          const profitPerCoin = (pkg.price * pkg.platform_fee / pkg.coins).toFixed(4);
          const creatorPercent = (pkg.creator_split * 100).toFixed(0);
          const platformPercent = (pkg.platform_fee * 100).toFixed(0);

          return (
            <div 
              key={pkg.id} 
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <div className="text-center mb-4">
                <h3 className="text-3xl font-bold text-white">${pkg.price.toFixed(2)}</h3>
                <p className="text-xl text-purple-400 font-semibold mt-2">
                  {pkg.coins.toLocaleString()} VibeCoins
                </p>
              </div>
              
              <div className="space-y-2 mb-4 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-400">Creators receive:</span>{' '}
                  <span className="font-semibold">${creatorPayout}</span> ({creatorPercent}%)
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">Feelynx margin:</span>{' '}
                  <span className="font-semibold">${platformRevenue}</span> ({platformPercent}%)
                </p>
                <p className="text-xs text-gray-500">
                  ${profitPerCoin} per coin
                </p>
              </div>
              
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Buy Now
              </button>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-400 mt-6 text-center italic">
        💎 Buy on the web and get up to 30% more VibeCoins — no App Store fees.
      </p>
    </div>
  );
}
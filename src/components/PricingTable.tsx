import { useQuery } from '@tanstack/react-query';
import { fetchVibeCoinPackages } from '@/data/vibecoinPackages';
import { getUserMessage } from '@/lib/errors';
import { toast } from '@/hooks/use-toast';

export function PricingTable() {
  const {
    data: packages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pricing-table'],
    queryFn: ({ signal }) => fetchVibeCoinPackages(signal),
    staleTime: 60_000,
  });

  if (error) {
    toast({
      title: 'Unable to load pricing',
      description: getUserMessage(error),
      variant: 'destructive',
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading pricing...</div>
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="p-4">
        <div className="mb-4 rounded border border-border/60 bg-background/80 p-3 text-sm text-muted-foreground">
          No pricing data available.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const creatorSplit = pkg.creatorSplit ?? 0.75;
          const platformFee = pkg.platformFee ?? 0.25;
          const creatorPayout = (pkg.price * creatorSplit).toFixed(2);
          const platformRevenue = (pkg.price * platformFee).toFixed(2);
          const profitPerCoin = ((pkg.price * platformFee) / pkg.tokens).toFixed(4);
          const creatorPercent = (creatorSplit * 100).toFixed(0);
          const platformPercent = (platformFee * 100).toFixed(0);

          return (
            <div
              key={pkg.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all"
            >
              <div className="text-center mb-4">
                <h3 className="text-3xl font-bold text-white">${pkg.price.toFixed(2)}</h3>
                <p className="text-xl text-purple-400 font-semibold mt-2">
                  {pkg.tokens.toLocaleString()} VibeCoins
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
                <p className="text-xs text-gray-500">${profitPerCoin} per coin</p>
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

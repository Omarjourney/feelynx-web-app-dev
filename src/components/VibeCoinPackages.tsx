import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentReceipt } from './PaymentReceipt';
import { request } from '@/lib/api';
import { getUserMessage } from '@/lib/errors';
import { fetchVibeCoinPackages, type VibeCoinPackage } from '@/data/vibecoinPackages';
import { toast } from '@/hooks/use-toast';

interface VibeCoinPackagesProps {
  platform?: 'web' | 'app';
  onPurchase?: (pkg: VibeCoinPackage) => void | Promise<void>;
}

export const VibeCoinPackages = ({ platform = 'web', onPurchase }: VibeCoinPackagesProps) => {
  const {
    data: packages = [],
    isLoading,
  } = useQuery({
    queryKey: ['payments-packages', platform],
    queryFn: ({ signal }) => fetchVibeCoinPackages(signal),
    staleTime: 60_000,
    onError: (error) =>
      toast({
        title: 'Unable to load pricing packages',
        description: getUserMessage(error),
        variant: 'destructive',
      }),
  });

  const [receipt, setReceipt] = useState<{ receiptUrl: string; disputeUrl: string } | null>(null);
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async (packageData: VibeCoinPackage) => {
    setPurchaseError(null);

    if (onPurchase) {
      try {
        setLoadingPackageId(packageData.id);
        await Promise.resolve(onPurchase(packageData));
        toast({ title: 'Purchase complete!' });
      } catch (error) {
        const message = getUserMessage(error);
        setPurchaseError(message);
        toast({ title: 'Purchase failed', description: message, variant: 'destructive' });
      } finally {
        setLoadingPackageId(null);
      }
      return;
    }

    try {
      setLoadingPackageId(packageData.id);
      const { paymentIntentId } = await request<{ paymentIntentId: string }>(
        '/payments/create-intent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: packageData.price,
            coins: packageData.tokens,
            currency: 'usd',
            userId: 1,
          }),
        },
      );

      const data = await request<{ receiptUrl: string; disputeUrl: string }>('/payments/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });
      setReceipt({ receiptUrl: data.receiptUrl, disputeUrl: data.disputeUrl });
      toast({ title: 'Purchase complete!', description: 'Your receipt is ready.' });
    } catch (error) {
      const message = getUserMessage(error);
      setPurchaseError(message);
      toast({ title: 'Purchase failed', description: message, variant: 'destructive' });
    } finally {
      setLoadingPackageId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading VibeCoin packages...</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-12 text-center">
          VibeCoin Packages
        </h2>
        {purchaseError ? (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {purchaseError}
          </div>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-20">
          {packages.map((pkg) => {
            const displayPrice = platform === 'app' && pkg.appPrice ? pkg.appPrice : pkg.price;

            return (
              <Card
                key={pkg.id}
                className={`relative bg-gradient-card transition-all duration-300 hover:shadow-premium ${
                  pkg.popular ? 'ring-2 ring-primary shadow-premium lg:scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 text-xs sm:text-sm">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-3 sm:pb-4 lg:pb-6">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">💎</div>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    {pkg.tokens.toLocaleString()} VibeCoins
                  </CardTitle>
                  {pkg.webBonus && platform === 'web' && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary mt-2 text-xs">
                      {pkg.webBonus} Web Bonus
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="text-center space-y-4 sm:space-y-5 lg:space-y-6">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
                    ${displayPrice.toFixed(2)}
                  </div>

                  <Button
                    className={`w-full min-h-[48px] sm:min-h-[52px] lg:min-h-[56px] text-base sm:text-lg px-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300 ${
                      pkg.popular
                        ? 'bg-gradient-primary text-primary-foreground hover:shadow-glow'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={() => handlePurchase(pkg)}
                    disabled={loadingPackageId === pkg.id}
                  >
                    {loadingPackageId === pkg.id ? 'Processing…' : 'Buy now'}
                  </Button>

                  {pkg.creatorSplit != null && pkg.platformFee != null ? (
                    <p className="text-xs text-muted-foreground">
                      Creators receive {(pkg.creatorSplit * 100).toFixed(0)}% of this purchase.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {receipt && (
          <PaymentReceipt receiptUrl={receipt.receiptUrl} disputeUrl={receipt.disputeUrl} />
        )}
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentReceipt } from './PaymentReceipt';
import { request } from '@/lib/api';
import { getUserMessage } from '@/lib/errors';

const toast = {
  success: (msg: string) => {
    if (typeof window !== 'undefined' && (window as any).toast?.success) {
      try {
        (window as any).toast.success(msg);
        return;
      } catch {
        // fallback to console if the global toast fails
      }
    }
    console.log('Toast success:', msg);
  },
  error: (msg: string) => {
    if (typeof window !== 'undefined' && (window as any).toast?.error) {
      try {
        (window as any).toast.error(msg);
        return;
      } catch {
        // fallback to console if the global toast fails
      }
    }
    console.error('Toast error:', msg);
  },
};

interface PricingPackage {
  id: number;
  price: number;
  coins: number;
  web_bonus?: string;
  app_price?: number;
  popular?: boolean;
  creator_split: number;
  platform_fee: number;
}

interface VibeCoinPackagesProps {
  /**
   * Display mode for the component.
   * - 'web'  : show web pricing
   * - 'app'  : show app pricing
   */
  platform?: 'web' | 'app';
  /**
   * Callback fired when a package is purchased.
   */
  onPurchase?: (pkg: PricingPackage) => void | Promise<void>;
}

export const VibeCoinPackages = ({ platform = 'web', onPurchase }: VibeCoinPackagesProps) => {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<{
    receiptUrl: string;
    disputeUrl: string;
  } | null>(null);
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const file = platform === 'app' ? '/config/pricingApp.json' : '/config/pricing.json';
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to load ${file}`);
        }
        const data = await response.json();
        // Mark package 7 as popular
        const packagesWithPopular = data.map((pkg: PricingPackage) => ({
          ...pkg,
          popular: pkg.id === 7,
        }));
        setPackages(packagesWithPopular);
      } catch (error) {
        console.error('Failed to load pricing:', error);
        toast.error('Failed to load pricing packages');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [platform]);

  const handlePurchase = async (packageData: PricingPackage) => {
    setPurchaseError(null);

    if (onPurchase) {
      try {
        setLoadingPackageId(packageData.id);
        await Promise.resolve(onPurchase(packageData));
        toast.success('Purchase complete!');
      } catch (error) {
        console.error('Custom purchase handler failed', error);
        const message = getUserMessage(error);
        setPurchaseError(message);
        toast.error(message);
      } finally {
        setLoadingPackageId(null);
      }
      return;
    }

    try {
      setLoadingPackageId(packageData.id);
      console.log('Purchasing:', packageData);

      const { paymentIntentId } = await request<{ paymentIntentId: string }>(
        '/payments/create-intent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: packageData.price,
            coins: packageData.coins,
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
      toast.success('Purchase complete! Your receipt is ready.');
    } catch (error) {
      console.error('Purchase failed:', error);
      const message = getUserMessage(error);
      setPurchaseError(message);
      toast.error(message);
    } finally {
      setLoadingPackageId(null);
    }
  };

  if (loading) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-20">
          {packages.map((pkg) => {
            const displayPrice = platform === 'app' && pkg.app_price ? pkg.app_price : pkg.price;

            return (
              <Card
                key={pkg.id}
                className={`relative bg-gradient-card motion-safe:transition-all motion-safe:duration-300 hover:shadow-premium ${
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
                    {pkg.coins.toLocaleString()} VibeCoins
                  </CardTitle>
                  {pkg.web_bonus && platform === 'web' && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary mt-2 text-xs">
                      {pkg.web_bonus} Web Bonus
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="text-center space-y-4 sm:space-y-5 lg:space-y-6">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
                    ${displayPrice.toFixed(2)}
                  </div>

                  <Button
                    className={`w-full min-h-[48px] sm:min-h-[52px] lg:min-h-[56px] text-base sm:text-lg px-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 motion-safe:transition-all motion-safe:duration-300 ${
                      pkg.popular
                        ? 'bg-gradient-primary text-primary-foreground hover:shadow-glow'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={() => handlePurchase(pkg)}
                    disabled={loadingPackageId === pkg.id}
                  >
                    {loadingPackageId === pkg.id ? 'Processing…' : 'Purchase Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {purchaseError && (
          <p className="mt-4 text-sm text-center text-destructive px-4" role="alert">
            {purchaseError}
          </p>
        )}
        {receipt && (
          <PaymentReceipt receiptUrl={receipt.receiptUrl} disputeUrl={receipt.disputeUrl} />
        )}
      </div>
    </div>
  );
};

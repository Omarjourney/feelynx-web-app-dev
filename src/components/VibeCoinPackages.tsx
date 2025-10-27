import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vibeCoinPackages, VibeCoinPackage } from '@/data/vibecoinPackages';
import { PaymentReceipt } from './PaymentReceipt';
import { toast } from 'sonner';
import { getUserMessage, toApiError } from '@/lib/errors';

interface VibeCoinPackagesProps {
  /**
   * Display mode for the component.
   * - 'web'  : show web coin amounts and indicate app value
   * - 'app'  : show app coin amounts and highlight web bonus
   */
  platform?: 'web' | 'app';
  /**
   * Callback fired when a package is purchased.
   */
  onPurchase?: (pkg: VibeCoinPackage) => void | Promise<void>;
}

export const VibeCoinPackages = ({ platform = 'web', onPurchase }: VibeCoinPackagesProps) => {
  const packages: VibeCoinPackage[] = vibeCoinPackages;
  const [receipt, setReceipt] = useState<{
    receiptUrl: string;
    disputeUrl: string;
  } | null>(null);
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handlePurchase = async (packageData: VibeCoinPackage) => {
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

      const response = await fetch('/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: packageData.price,
          coins: packageData.tokens,
          currency: 'usd',
          userId: 1,
        }),
      });

      if (!response.ok) throw await toApiError(response);

      const { paymentIntentId } = await response.json();

      const successRes = await fetch('/payments/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!successRes.ok) {
        throw await toApiError(successRes);
      }

      const data = await successRes.json();
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

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">VibeCoin Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative bg-gradient-card transition-all hover:shadow-premium ${
              pkg.popular ? 'ring-2 ring-primary shadow-premium scale-105' : ''
            }`}
          >
            {pkg.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1">
                Most Popular
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">💎</div>
              <CardTitle className="text-2xl font-bold">
                {(platform === 'app' ? pkg.appTokens : pkg.tokens).toLocaleString()} VibeCoins
              </CardTitle>
              {platform === 'web' ? (
                <div className="text-sm text-muted-foreground">
                  {pkg.appTokens.toLocaleString()} in app
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Get +{pkg.percentMore}% more on Feelynx.live ({pkg.tokens.toLocaleString()} total)
                </div>
              )}
              {platform === 'web' && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  +{pkg.percentMore}% on web
                </Badge>
              )}
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">${pkg.price}</div>

              <div className="text-xs text-muted-foreground">
                ${(pkg.price / pkg.tokens).toFixed(3)} per VibeCoin
              </div>

              <Button
                className={`w-full mt-4 ${
                  pkg.popular
                    ? 'bg-gradient-primary text-primary-foreground hover:shadow-glow'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                size="lg"
                onClick={() => handlePurchase(pkg)}
                disabled={loadingPackageId === pkg.id}
              >
                {loadingPackageId === pkg.id ? 'Processing…' : 'Purchase Now'}
              </Button>
              {platform === 'app' && (
                <div className="text-xs text-muted-foreground mt-2">
                  Get +{pkg.percentMore}% more VibeCoins on Feelynx.live!
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {purchaseError && (
        <p className="mt-4 text-sm text-center text-destructive" role="alert">
          {purchaseError}
        </p>
      )}
      {receipt && (
        <PaymentReceipt receiptUrl={receipt.receiptUrl} disputeUrl={receipt.disputeUrl} />
      )}
    </div>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  vibeCoinPackages,
  VibeCoinPackage,
  PLATFORM_MARGIN,
  CREATOR_SHARE,
  MIN_PLATFORM_PROFIT_PER_COIN,
} from '@/data/vibecoinPackages.ts';
import { PaymentReceipt } from './PaymentReceipt';
import { toast } from 'sonner';
import { request } from '@/lib/api';
import { getUserMessage } from '@/lib/errors';

const formatPercent = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toFixed(0);
  }

  return value.toFixed(1);
};

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

      const tokensToCredit = platform === 'app' ? packageData.appTokens : packageData.tokens;

      const { paymentIntentId } = await request<{ paymentIntentId: string }>(
        '/payments/create-intent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: packageData.price,
            coins: tokensToCredit,
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

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 text-center">VibeCoin Packages</h2>
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-3xl mx-auto">
        Every purchase instantly grants VibeCoins and pays creators 75% of the pack price. Feelynx
        keeps a transparent 25% margin (at least{' '}
        <span className="font-medium">
          ${MIN_PLATFORM_PROFIT_PER_COIN.toFixed(3)} profit per coin
        </span>
        ) to operate the platform. Creators only encounter a minimal processing fee when they cash
        out.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const displayedTokens = platform === 'app' ? pkg.appTokens : pkg.tokens;
          const platformMarginAmount = pkg.price * PLATFORM_MARGIN;
          const creatorEarnings = pkg.price * CREATOR_SHARE;
          const platformProfitPerCoin = platformMarginAmount / displayedTokens;

          if (platformProfitPerCoin < MIN_PLATFORM_PROFIT_PER_COIN) {
            console.error(
              `Platform profit per coin dropped below the minimum for package ${pkg.id}.`,
            );
          }

          return (
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
                  {displayedTokens.toLocaleString()} VibeCoins
                </CardTitle>
                {platform === 'web' ? (
                  <div className="text-sm text-muted-foreground">
                    {pkg.appTokens.toLocaleString()} in app
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Get +{formatPercent(pkg.percentMore)}% more on Feelynx.live (
                    {pkg.tokens.toLocaleString()} total)
                  </div>
                )}
                {platform === 'web' && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    +{formatPercent(pkg.percentMore)}% on web
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">${pkg.price}</div>

                <div className="text-xs text-muted-foreground">
                  ${(pkg.price / displayedTokens).toFixed(3)} per VibeCoin
                </div>

                <div className="space-y-1 text-xs text-muted-foreground/90">
                  <div>
                    Creators receive{' '}
                    <span className="font-medium">${creatorEarnings.toFixed(2)}</span> (
                    {(CREATOR_SHARE * 100).toFixed(0)}%)
                  </div>
                  <div>
                    Feelynx margin{' '}
                    <span className="font-medium">${platformMarginAmount.toFixed(2)}</span> (
                    {(PLATFORM_MARGIN * 100).toFixed(0)}%) ·{' '}
                    <span className="font-medium">${platformProfitPerCoin.toFixed(3)}</span> per
                    coin
                  </div>
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
                    Get +{formatPercent(pkg.percentMore)}% more VibeCoins on Feelynx.live!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vibeCoinPackages, VibeCoinPackage } from '@/data/vibecoinPackages';

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
  onPurchase?: (pkg: VibeCoinPackage) => void;
}

export const VibeCoinPackages = ({ platform = 'web', onPurchase }: VibeCoinPackagesProps) => {
  const packages: VibeCoinPackage[] = vibeCoinPackages;

  const handlePurchase = async (packageData: VibeCoinPackage) => {
    try {
      console.log('Purchasing:', packageData);
      
      // Create payment session (placeholder for Stripe integration)
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packageData.id,
          amount: packageData.price,
          coins: packageData.tokens,
          currency: 'usd'
        })
      });
      
      if (response.ok) {
        const { sessionUrl } = await response.json();
        // Open payment in new tab
        window.open(sessionUrl, '_blank');
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      // In a real app, show error toast
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
                onClick={() => onPurchase ? onPurchase(pkg) : handlePurchase(pkg)}
              >
                Purchase Now
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
    </div>
  );
};

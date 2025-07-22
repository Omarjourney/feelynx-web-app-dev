
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VibeCoinPackage {
  id: number;
  /** VibeCoins awarded when purchasing on the web */
  tokens: number;
  /** VibeCoins a user would receive in the mobile app */
  appTokens: number;
  /** Percentage increase of web coins compared to the app */
  percentMore: number;
  price: number;
  popular?: boolean;
}

export const VibeCoinPackages = () => {
  const packages: VibeCoinPackage[] = [
    { id: 1, tokens: 75, appTokens: 50, percentMore: 50, price: 0.99 },
    { id: 2, tokens: 400, appTokens: 275, percentMore: 45, price: 4.99 },
    { id: 3, tokens: 900, appTokens: 650, percentMore: 38, price: 9.99 },
    { id: 4, tokens: 1500, appTokens: 1100, percentMore: 36, price: 15.99 },
    { id: 5, tokens: 2000, appTokens: 1400, percentMore: 43, price: 19.99 },
    { id: 6, tokens: 2600, appTokens: 1800, percentMore: 44, price: 24.99 },
    { id: 7, tokens: 5300, appTokens: 3750, percentMore: 41, price: 49.99, popular: true },
    { id: 8, tokens: 11000, appTokens: 7800, percentMore: 41, price: 99.99 },
    { id: 9, tokens: 14624, appTokens: 10400, percentMore: 40, price: 149.99 }
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">VibeCoin Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`relative bg-gradient-card transition-all hover:shadow-premium ${
            pkg.popular ? 'ring-2 ring-primary shadow-premium scale-105' : ''
          }`}>
            {pkg.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">💎</div>
              <CardTitle className="text-2xl font-bold">
                {pkg.tokens.toLocaleString()} VibeCoins
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {pkg.appTokens.toLocaleString()} in app
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                +{pkg.percentMore}% on web
              </Badge>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                ${pkg.price}
              </div>

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
              >
                Purchase Now
              </Button>
              <div className="text-xs text-muted-foreground mt-2">
                Get +{pkg.percentMore}% more VibeCoins on Feelynx.live!
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TokenPackage {
  id: number;
  tokens: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  savings?: string;
}

export const TokenPackages = () => {
  const packages: TokenPackage[] = [
    { id: 1, tokens: 20, price: 1.99 },
    { id: 2, tokens: 50, price: 4.99 },
    { id: 3, tokens: 100, price: 9.99, bonus: 10 },
    { id: 4, tokens: 500, price: 39.99, bonus: 75, popular: true, savings: "Save 20%" },
    { id: 5, tokens: 1000, price: 74.99, bonus: 200, savings: "Save 25%" },
    { id: 6, tokens: 2500, price: 149.99, bonus: 600, savings: "Save 35%" }
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Token Packages</h2>
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
            {pkg.savings && (
              <Badge className="absolute -top-3 right-4 bg-live text-white px-3 py-1">
                {pkg.savings}
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="text-6xl mb-4">💎</div>
              <CardTitle className="text-2xl font-bold">
                {pkg.tokens.toLocaleString()} Tokens
              </CardTitle>
              {pkg.bonus && (
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  +{pkg.bonus} Bonus Tokens!
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">
                ${pkg.price}
              </div>
              
              {pkg.bonus && (
                <div className="text-sm text-muted-foreground">
                  Total: {(pkg.tokens + pkg.bonus).toLocaleString()} tokens
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                ${(pkg.price / pkg.tokens).toFixed(3)} per token
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

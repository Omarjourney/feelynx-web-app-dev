import { useEffect, useState } from 'react';
import { VibeCoinPackages } from '@/components/VibeCoinPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useHealth } from '@/lib/health';

const TokenShop = () => {
  const [coins, setCoins] = useState(500);
  const { loading, health } = useHealth();
  const paymentsEnabled = !!health?.features?.stripeConfigured;

  const handlePurchase = (pkg: { tokens: number }) => {
    if (!paymentsEnabled) {
      toast({ title: 'Payments disabled in this preview', variant: 'destructive' });
      return;
    }
    setCoins((c) => c + pkg.tokens);
    toast({ title: `Purchased ${pkg.tokens} VibeCoins` });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="bg-gradient-card text-center">
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl">💎 {coins.toLocaleString()}</div>
        </CardContent>
      </Card>
      {!loading && !paymentsEnabled && (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <CardContent className="p-4 text-sm">
            Payments are disabled in this environment. Package purchase is unavailable.
          </CardContent>
        </Card>
      )}
      <VibeCoinPackages platform="web" onPurchase={handlePurchase} />
    </div>
  );
};

export default TokenShop;

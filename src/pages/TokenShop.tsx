import { useEffect, useState } from 'react';
import { VibeCoinPackages } from '@/components/VibeCoinPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useHealth } from '@/lib/health';
import FlowBreadcrumb from '@/components/FlowBreadcrumb';

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
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <FlowBreadcrumb currentStep="plan" />
      <Card className="border border-border/60 bg-background/80 text-center backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Top up your vibe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-4xl font-semibold text-primary-foreground">
            💎 {coins.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            100 coins = $1.00 · Balance updates in real time
          </p>
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

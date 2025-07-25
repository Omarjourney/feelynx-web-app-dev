import { useState } from 'react';
import { VibeCoinPackages } from '@/components/VibeCoinPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const TokenShop = () => {
  const [coins, setCoins] = useState(500);

  const handlePurchase = (pkg: { tokens: number }) => {
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
      <VibeCoinPackages platform="web" onPurchase={handlePurchase} />
    </div>
  );
};

export default TokenShop;

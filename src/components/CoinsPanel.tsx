import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet, selectWalletBalance } from '@/stores/useWallet';
import { toast } from 'sonner';

interface CoinPackage {
  id: number;
  coins?: number;
  tokens?: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

export const CoinsPanel = () => {
  const currentCoins = useWallet(selectWalletBalance);

  const packages: CoinPackage[] = [
    { id: 1, coins: 100, price: 9.99 },
    { id: 2, coins: 250, price: 19.99, bonus: 25 },
    { id: 3, coins: 500, price: 39.99, bonus: 75, popular: true },
    { id: 4, coins: 1000, price: 74.99, bonus: 200 },
    { id: 5, coins: 2500, price: 149.99, bonus: 600 },
    { id: 6, coins: 5000, price: 279.99, bonus: 1500 },
  ];

  const recentTransactions = [
    { id: 1, type: 'purchase', amount: 500, description: 'Coin Package', date: '2 hours ago' },
    {
      id: 2,
      type: 'spent',
      amount: -150,
      description: 'Video Call with ArianaVex',
      date: '1 day ago',
    },
    { id: 3, type: 'spent', amount: -50, description: 'Tip to MilaFox', date: '2 days ago' },
    { id: 4, type: 'purchase', amount: 250, description: 'Coin Package', date: '3 days ago' },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Current Balance */}
      <Card className="bg-gradient-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">💎 {currentCoins.toLocaleString()} Coins</CardTitle>
          <p className="text-muted-foreground">Your current balance</p>
        </CardHeader>
      </Card>

      {/* Coin Packages */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Buy Coins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const normalized = pkg as CoinPackage & { tokens?: number };
            const coins = normalized.tokens ?? normalized.coins ?? 0;
            if (coins <= 0) {
              return null;
            }
            const perHundred = ((pkg.price / coins) * 100).toFixed(2);
            return (
              <Card
                key={pkg.id}
                className={`relative bg-gradient-card ${pkg.popular ? 'ring-2 ring-primary shadow-premium' : ''}`}
              >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">💎</div>
                <CardTitle className="text-2xl">{coins.toLocaleString()} Coins</CardTitle>
                {pkg.bonus && (
                  <Badge variant="secondary" className="bg-live text-white">
                    +{pkg.bonus} Bonus!
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-3xl font-bold text-primary">${pkg.price}</div>
                <div className="text-sm text-muted-foreground">
                  {pkg.bonus && <div>Total: {(coins + pkg.bonus).toLocaleString()} coins</div>}
                  <div>${perHundred} per 100 coins</div>
                </div>
                <Button
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-gradient-primary text-primary-foreground hover:shadow-glow'
                      : ''
                  }`}
                  onClick={() => {
                    toast.success('Checkout coming soon', {
                      description: 'Coin purchases are disabled in preview builds.',
                    });
                  }}
                >
                  Purchase
                </Button>
              </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`text-2xl ${transaction.type === 'purchase' ? 'text-live' : 'text-destructive'}`}
                  >
                    {transaction.type === 'purchase' ? '💎' : '💸'}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{transaction.date}</div>
                  </div>
                </div>
                <div
                  className={`font-bold ${transaction.amount > 0 ? 'text-live' : 'text-destructive'}`}
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Earning Opportunities */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Earn Free Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              📱
              <br />
              <span className="text-sm">Daily Login Bonus</span>
              <span className="text-xs text-muted-foreground">+50 coins</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              👥
              <br />
              <span className="text-sm">Refer Friends</span>
              <span className="text-xs text-muted-foreground">+200 coins per referral</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              📝
              <br />
              <span className="text-sm">Complete Profile</span>
              <span className="text-xs text-muted-foreground">+100 coins</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              ⭐<br />
              <span className="text-sm">Rate Creators</span>
              <span className="text-xs text-muted-foreground">+10 coins per rating</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

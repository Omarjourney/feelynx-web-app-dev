import { Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { VIBECOIN_TO_USD_RATE } from '@/lib/appConstants';

interface BalanceBarProps {
  coins: number;
}

export const BalanceBar = ({ coins }: BalanceBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gauge className="h-5 w-5 text-primary" aria-hidden />
          <div>
            <p className="text-sm text-white/70">Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">💎 {coins.toLocaleString()}</span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-white/80">
                ${(coins / VIBECOIN_TO_USD_RATE).toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-full bg-gradient-primary text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-glow"
          onClick={() => navigate('/token-shop')}
          aria-label="Recharge coins"
        >
          Recharge
        </Button>
      </div>
      <p className="mt-2 text-xs text-white/60">{VIBECOIN_TO_USD_RATE} coins = $1.00</p>
    </div>
  );
};

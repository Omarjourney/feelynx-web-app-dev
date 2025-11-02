import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface BalanceBarProps {
  coins: number;
  usdValue: number;
  onRecharge?: () => void;
  onWithdraw?: () => void;
}

export const BalanceBar = ({ coins, usdValue, onRecharge, onWithdraw }: BalanceBarProps) => {
  return (
    <div
      className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-4 text-sm text-foreground"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          💎
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Available balance</p>
          <p className="text-lg font-semibold text-foreground">
            {coins.toLocaleString()} VibeCoins
            <span className="ml-2 text-sm text-foreground/70">≈ ${usdValue.toFixed(2)} USD</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 min-w-[120px] rounded-full px-5"
          onClick={onRecharge}
          aria-label="Recharge VibeCoins"
        >
          Buy coins
        </Button>
        <Separator orientation="vertical" className="hidden h-8 md:block" />
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 min-w-[120px] rounded-full border border-white/10 px-5 text-foreground/70 hover:bg-white/10"
          onClick={onWithdraw}
          aria-label="Withdraw funds"
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
};

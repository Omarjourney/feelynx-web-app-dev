interface BalanceBarProps {
  coins: number;
  usdValue: number;
  onRecharge?: () => void;
  onWithdraw?: () => void;
}

export const BalanceBar = ({ coins, usdValue, onRecharge, onWithdraw }: BalanceBarProps) => {
  return (
    <section
      className="glass-card flex flex-col gap-4 rounded-3xl p-5 text-sm text-foreground md:flex-row md:items-center md:justify-between"
      role="status"
      aria-live="polite"
      aria-label="Current balance"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          💎
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/70">Available balance</p>
          <p className="text-lg font-semibold text-foreground">
            {coins.toLocaleString()} VibeCoins
            <span className="ml-2 text-sm text-foreground/70">≈ ${usdValue.toFixed(2)} USD</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRecharge}
          className="min-h-[44px] min-w-[140px] rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
          aria-label="Recharge VibeCoins"
        >
          Buy coins
        </button>
        <button
          type="button"
          onClick={onWithdraw}
          className="min-h-[44px] min-w-[140px] rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10"
          aria-label="Withdraw funds"
        >
          Withdraw
        </button>
      </div>
    </section>
  );
};

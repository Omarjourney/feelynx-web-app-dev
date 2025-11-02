interface VibeOptionProps {
  amount: string;
  price: string;
  description?: string;
}

export const VibeOption = ({ amount, price, description }: VibeOptionProps) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground">
      <div>
        <p className="font-semibold">{amount} VibeCoins</p>
        {description ? <p className="text-xs text-foreground/70">{description}</p> : null}
      </div>
      <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">{price}</span>
    </div>
  );
};

export type { VibeOptionProps };

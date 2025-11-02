interface VibeOptionProps {
  amount: string;
  price: string;
  description?: string;
}

export const VibeOption = ({ amount, price, description }: VibeOptionProps) => {
  return (
    <div
      className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground/90"
      role="listitem"
      aria-label={`${amount} VibeCoins for ${price}`}
    >
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{amount} VibeCoins</p>
        {description && <p className="text-xs text-foreground/60">{description}</p>}
      </div>
      <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">{price}</span>
    </div>
  );
};

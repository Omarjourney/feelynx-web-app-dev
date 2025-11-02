import { Button } from '@/components/ui/button';

interface VibeOptionProps {
  amount: number;
  price: string;
  bonus?: string;
  onSelect?: () => void;
}

export const VibeOption = ({ amount, price, bonus, onSelect }: VibeOptionProps) => {
  return (
    <Button
      variant="outline"
      className="glass-card flex h-auto w-full items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-4 text-left backdrop-blur-md hover:border-white/30 hover:bg-white/10"
      onClick={onSelect}
      tabIndex={0}
      aria-label={`Purchase ${amount} VibeCoins for ${price}${bonus ? ` with ${bonus} bonus` : ''}`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold text-white">💎 {amount.toLocaleString()}</span>
        {bonus && <span className="text-xs text-primary">{bonus}</span>}
      </div>
      <span className="text-base font-semibold text-white/90">{price}</span>
    </Button>
  );
};

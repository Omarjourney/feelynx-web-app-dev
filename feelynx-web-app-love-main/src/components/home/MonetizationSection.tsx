import { VibeOption } from '@/components/ui/VibeOption';
import { Tooltip } from '@/components/ui/Tooltip';

interface VibeCoinOption {
  amount: string;
  price: string;
  description?: string;
}

interface MonetizationSectionProps {
  options: VibeCoinOption[];
}

export const MonetizationSection = ({ options }: MonetizationSectionProps) => {
  return (
    <section aria-labelledby="monetization" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="monetization" className="text-2xl font-medium">
            VibeCoin marketplace
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            Load balance once and auto-convert tips, tributes, and subscriptions.
          </p>
        </div>
        <Tooltip label="LIVE with Lovense uses haptic feedback synced to VibeCoin goals in real time.">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            LIVE with Lovense
          </span>
        </Tooltip>
      </div>

      <details className="group rounded-3xl border border-white/10 bg-white/5 p-4 text-foreground" open>
        <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold">
          Buy VibeCoins 💎
          <span className="text-sm text-foreground/60 group-open:rotate-180">⌃</span>
        </summary>
        <div className="mt-4 space-y-3" role="list">
          {options.map((option) => (
            <VibeOption key={option.amount} {...option} />
          ))}
        </div>
      </details>
    </section>
  );
};

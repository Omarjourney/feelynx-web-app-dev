import { VibeOption, type VibeOptionProps } from '../ui/VibeOption';
import { Tooltip } from '../ui/Tooltip';

interface MonetizationSectionProps {
  options: VibeOptionProps[];
}

export const MonetizationSection = ({ options }: MonetizationSectionProps) => {
  return (
    <section id="monetization" aria-labelledby="monetization-heading" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="monetization-heading">VibeCoin marketplace</h2>
          <p className="text-foreground/70">
            Keep a single, transparent location for buying VibeCoins and tracking conversions to cashouts.
          </p>
        </div>
        <Tooltip label="LIVE with Lovense automations sync vibration intensity to each VibeCoin milestone.">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
            Automations
          </span>
        </Tooltip>
      </div>

      <details className="glass-card overflow-hidden rounded-3xl">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 text-lg font-semibold text-foreground">
          Buy VibeCoins 💎
          <span className="text-sm text-foreground/70">Tap to view bundles</span>
        </summary>
        <div className="space-y-3 px-6 pb-6">
          {options.map((option) => (
            <VibeOption key={option.amount} {...option} />
          ))}
        </div>
      </details>

      <details className="glass-card overflow-hidden rounded-3xl">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 text-lg font-semibold text-foreground">
          Balance FAQs
          <span className="text-sm text-foreground/70">Conversion, safety, and refunds</span>
        </summary>
        <div className="space-y-3 px-6 pb-6 text-sm text-foreground/80">
          <p>• 1 VibeCoin equals $0.01 USD when withdrawn to verified accounts.</p>
          <p>• Fans can gift VibeCoins directly or during crew goal pushes.</p>
          <p>• Refund support is available within 24 hours of purchase.</p>
        </div>
      </details>
    </section>
  );
};

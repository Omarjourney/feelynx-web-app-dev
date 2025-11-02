import { Button } from '@/components/ui/button';
import { Sparkles, Radio, Compass } from 'lucide-react';

export interface OnboardingTip {
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}

interface OnboardingTipsProps {
  tips: OnboardingTip[];
}

const icons = [Sparkles, Radio, Compass];

export const OnboardingTips = ({ tips }: OnboardingTipsProps) => {
  return (
    <section aria-labelledby="onboarding" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="onboarding" className="text-2xl font-medium">
            Onboarding essentials
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            Quick wins to publish your first show and grow your first 100 supporters.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tips.map((tip, index) => {
          const Icon = icons[index % icons.length];
          return (
            <article
              key={tip.title}
              className="glass-card flex h-full flex-col justify-between rounded-3xl p-5"
              aria-label={tip.title}
            >
              <div className="space-y-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{tip.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{tip.description}</p>
              </div>
              <Button
                type="button"
                className="mt-4 w-full rounded-full"
                onClick={tip.onClick}
                aria-label={tip.actionLabel}
              >
                {tip.actionLabel}
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

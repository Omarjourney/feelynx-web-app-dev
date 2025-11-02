export interface OnboardingTip {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}

interface OnboardingTipsProps {
  tips: OnboardingTip[];
}

export const OnboardingTips = ({ tips }: OnboardingTipsProps) => {
  return (
    <section id="onboarding" aria-labelledby="onboarding-heading" className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 id="onboarding-heading">Quick onboarding tips</h2>
        <p className="text-foreground/70">
          New to Feelynx? Start with these quick wins to launch a safe, monetized room within minutes.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3" aria-label="Onboarding steps for new creators">
        {tips.map((tip) => (
          <li key={tip.title} className="list-none">
            <article className="glass-card flex h-full flex-col gap-3 rounded-3xl p-5 text-sm text-foreground">
              <h3 className="text-lg font-semibold">{tip.title}</h3>
              <p className="text-foreground/70">{tip.description}</p>
              <button
                type="button"
                onClick={() => tip.onAction?.()}
                className="mt-auto inline-flex min-h-[44px] items-center justify-center rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
                aria-label={tip.actionLabel}
              >
                {tip.actionLabel}
              </button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};

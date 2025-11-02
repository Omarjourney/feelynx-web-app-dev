import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Radio, Compass, Lightbulb } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface OnboardingTipsProps {
  isNewUser?: boolean;
}

export const OnboardingTips = ({ isNewUser = true }: OnboardingTipsProps) => {
  if (!isNewUser) return null;

  const tips = [
    {
      icon: Radio,
      text: 'Tap "Go Live" to open the guided setup',
      tooltip:
        'The floating action button in the bottom-right corner starts your streaming journey with step-by-step guidance.',
    },
    {
      icon: Compass,
      text: 'Discover curated crews and tribes',
      tooltip:
        'Family Crews are exclusive communities where you can connect with like-minded fans and unlock special rewards.',
    },
    {
      icon: Sparkles,
      text: 'Swipe horizontally on mobile to swap streams',
      tooltip: 'Quickly browse between live streams with a simple swipe gesture on mobile devices.',
    },
    {
      icon: Lightbulb,
      text: 'PK Battles: Watch creators compete live',
      tooltip:
        'PK Battles are competitive events where two creators face off and fans can support their favorite with tips and gifts.',
    },
  ];

  return (
    <motion.section
      aria-labelledby="onboarding-section"
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="border-b border-white/10 pb-4">
        <h2 id="onboarding-section" className="text-3xl font-semibold tracking-tight text-white">
          Getting Started
        </h2>
        <p className="mt-1 text-base leading-relaxed text-white/70">
          Quick tips to help you explore Feelynx
        </p>
      </div>

      <Card className="glass-card border border-primary/30 bg-primary/10 backdrop-blur-md">
        <CardContent className="space-y-4 p-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <Tooltip key={index} content={tip.tooltip}>
                <div
                  className="flex items-start gap-3 rounded-2xl bg-background/40 p-4 transition-all hover:bg-background/60 cursor-help focus:bg-background/60 focus:ring-2 focus:ring-primary"
                  tabIndex={0}
                  role="button"
                  aria-label={tip.tooltip}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden />
                  <p className="text-sm leading-relaxed text-white">{tip.text}</p>
                </div>
              </Tooltip>
            );
          })}
        </CardContent>
      </Card>
    </motion.section>
  );
};

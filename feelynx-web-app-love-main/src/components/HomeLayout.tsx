import { ReactNode } from 'react';
import { DiscoverSection } from '@/components/home/DiscoverSection';
import { CommunitySection } from '@/components/home/CommunitySection';
import { MonetizationSection } from '@/components/home/MonetizationSection';
import { OnboardingTip, OnboardingTips } from '@/components/home/OnboardingTips';
import { CreatorCardProps } from '@/components/ui/CreatorCard';
import { BalanceBar } from '@/components/ui/BalanceBar';
import { Button } from '@/components/ui/button';

interface CrewSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category?: string;
}

interface VibeCoinOption {
  amount: string;
  price: string;
  description?: string;
}

interface BalanceSummary {
  coins: number;
  usdValue: number;
  onRecharge?: () => void;
  onWithdraw?: () => void;
}

interface HomeLayoutProps {
  creators: CreatorCardProps[];
  crews: CrewSummary[];
  vibeCoinOptions: VibeCoinOption[];
  balance: BalanceSummary;
  onboardingTips?: OnboardingTip[];
  isNewUser?: boolean;
  onSelectCreator?: (creator: CreatorCardProps) => void;
  onGoLive: () => void;
  heroSlot?: ReactNode;
}

export const HomeLayout = ({
  creators,
  crews,
  vibeCoinOptions,
  balance,
  onboardingTips = [],
  isNewUser = false,
  onSelectCreator,
  onGoLive,
  heroSlot,
}: HomeLayoutProps) => {
  return (
    <div className="relative min-h-screen bg-background/80">
      <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-32 pt-8 md:px-10">
        {heroSlot}

        <BalanceBar {...balance} />

        <div className="border-b border-white/10" aria-hidden />

        <DiscoverSection creators={creators} onSelectCreator={onSelectCreator} />

        <div className="border-b border-white/10" aria-hidden />

        <CommunitySection crews={crews} />

        <div className="border-b border-white/10" aria-hidden />

        <MonetizationSection options={vibeCoinOptions} />

        {isNewUser && onboardingTips.length > 0 && (
          <>
            <div className="border-b border-white/10" aria-hidden />
            <OnboardingTips tips={onboardingTips} />
          </>
        )}
      </main>

      <Button
        type="button"
        onClick={onGoLive}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-primary px-5 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Start a live show"
      >
        Go Live 🎥
      </Button>
    </div>
  );
};

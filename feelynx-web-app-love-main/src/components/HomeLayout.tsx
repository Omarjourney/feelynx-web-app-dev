import type { ReactNode } from 'react';
import { DiscoverSection } from './home/DiscoverSection';
import { CommunitySection } from './home/CommunitySection';
import { MonetizationSection } from './home/MonetizationSection';
import { OnboardingTip, OnboardingTips } from './home/OnboardingTips';
import { CreatorCardProps } from './ui/CreatorCard';
import { CrewCardProps } from './ui/CrewCard';
import { VibeOptionProps } from './ui/VibeOption';
import { BalanceBar } from './ui/BalanceBar';

interface HomeLayoutProps {
  creators: CreatorCardProps[];
  crews: CrewCardProps[];
  vibeCoinOptions: VibeOptionProps[];
  balance: {
    coins: number;
    usdValue: number;
    onRecharge?: () => void;
    onWithdraw?: () => void;
  };
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
    <div className="relative min-h-screen">
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-6xl flex-col space-y-12 px-6 pb-32 pt-10 md:px-10"
        aria-describedby={isNewUser && onboardingTips.length > 0 ? 'onboarding-heading' : undefined}
      >
        {heroSlot}

        <BalanceBar {...balance} />

        <hr className="border-white/10" />

        <DiscoverSection creators={creators} onSelectCreator={onSelectCreator} />

        <hr className="border-white/10" />

        <CommunitySection crews={crews} />

        <hr className="border-white/10" />

        <MonetizationSection options={vibeCoinOptions} />

        {isNewUser && onboardingTips.length > 0 ? (
          <>
            <hr className="border-white/10" />
            <OnboardingTips tips={onboardingTips} />
          </>
        ) : null}
      </main>

      <button
        type="button"
        onClick={onGoLive}
        className="fixed bottom-6 right-6 z-40 min-h-[56px] min-w-[56px] rounded-full bg-primary px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        aria-label="Start a live show"
      >
        Go Live 🎥
      </button>
    </div>
  );
};

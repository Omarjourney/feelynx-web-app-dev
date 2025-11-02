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
      <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-col space-y-12 px-6 pb-32 pt-10 md:px-10">
        {heroSlot}

        <BalanceBar {...balance} />

        <div className="border-b border-white/10" aria-hidden />

        <DiscoverSection creators={creators} onSelectCreator={onSelectCreator} />

        <div className="border-b border-white/10" aria-hidden />

        <CommunitySection crews={crews} />

        <div className="border-b border-white/10" aria-hidden />

        <MonetizationSection options={vibeCoinOptions} />

        {isNewUser && onboardingTips.length > 0 ? (
          <>
            <div className="border-b border-white/10" aria-hidden />
            <OnboardingTips tips={onboardingTips} />
          </>
        ) : null}
      </main>

      <button
        type="button"
        onClick={onGoLive}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-primary px-5 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-105"
        aria-label="Start a live show"
      >
        Go Live 🎥
      </button>
    </div>
  );
};

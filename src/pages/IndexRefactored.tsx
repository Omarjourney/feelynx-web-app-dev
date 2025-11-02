import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeLayout } from '@/components/HomeLayout';
import { DiscoverSection } from '@/components/sections/DiscoverSection';
import { CommunitySection } from '@/components/sections/CommunitySection';
import { MonetizationSection } from '@/components/sections/MonetizationSection';
import { OnboardingTips } from '@/components/sections/OnboardingTips';
import HeroLogoReveal from '../../components/brand/HeroLogoReveal';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { groups } from '@/data/groups';

const IndexRefactored = () => {
  const creators = useCreatorLive();
  const navigate = useNavigate();
  const [isNewUser] = useState(() => {
    // Check if user is new (hasn't visited before)
    const hasVisited = localStorage.getItem('feelynx.hasVisited');
    if (!hasVisited) {
      localStorage.setItem('feelynx.hasVisited', 'true');
      return true;
    }
    return false;
  });

  const handleViewProfile = (creatorId: number) => {
    const creator = creators.find((c) => c.id === creatorId);
    if (creator?.isLive) {
      navigate(`/live/${creator.username}`);
    }
  };

  return (
    <HomeLayout>
      <HeroLogoReveal />

      {/* Main sections with consistent vertical spacing */}
      <DiscoverSection creators={creators} onViewProfile={handleViewProfile} />

      <div className="border-b border-white/10 my-8" aria-hidden />

      <CommunitySection groups={groups} />

      <div className="border-b border-white/10 my-8" aria-hidden />

      <MonetizationSection />

      {isNewUser && (
        <>
          <div className="border-b border-white/10 my-8" aria-hidden />
          <OnboardingTips isNewUser={isNewUser} />
        </>
      )}
    </HomeLayout>
  );
};

export default IndexRefactored;

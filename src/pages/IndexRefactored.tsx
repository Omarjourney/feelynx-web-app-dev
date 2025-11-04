import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HomeLayout } from '@/components/HomeLayout';
import { DiscoverSection } from '@/components/sections/DiscoverSection';
import { CommunitySection } from '@/components/sections/CommunitySection';
import { MonetizationSection } from '@/components/sections/MonetizationSection';
import { OnboardingTips } from '@/components/sections/OnboardingTips';
import HeroLogoReveal from '../../components/brand/HeroLogoReveal';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { fetchGroups } from '@/data/groups';
import { toast } from '@/hooks/use-toast';
import { getUserMessage } from '@/lib/errors';

const IndexRefactored = () => {
  const creators = useCreatorLive();
  const {
    data: groups = [],
    error: groupsError,
  } = useQuery({
    queryKey: ['refactored-groups'],
    queryFn: ({ signal }) => fetchGroups(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
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

  useEffect(() => {
    if (!groupsError) return;
    toast({
      title: 'Unable to load groups',
      description: getUserMessage(groupsError),
      variant: 'destructive',
    });
  }, [groupsError]);

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

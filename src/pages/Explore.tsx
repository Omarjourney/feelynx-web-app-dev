import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  SearchFilters,

} from '@/components/SearchFilters';
import LiveStreamCard from '@/components/LiveStreamCard';

interface Creator {
  id: number;
  username: string;
  avatarUrl: string;
  viewers?: number;
  isFeatured?: boolean;
  isLive?: boolean;
}

const Explore = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) =>
    navigate(t === 'explore' ? '/explore' : `/${t}`);

    search: '',
    country: '',
    specialty: '',
    isLive: false,
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="explore" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {loading && (
            <div className="col-span-full text-center py-6">Loading...</div>
          )}
          {error && (
            <div className="col-span-full text-center text-destructive py-6">
              {error}
            </div>
          )}
          {!loading &&
            !error &&
            creators.map((c) => (
              <LiveStreamCard
                key={c.id}
                username={`@${c.username}`}
                avatarUrl={c.avatar}
                viewerCount={c.followers}
                isFeatured={c.trendingScore > 70}
                streamPreviewUrl={`https://source.unsplash.com/random/400x300?sig=${c.id}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;

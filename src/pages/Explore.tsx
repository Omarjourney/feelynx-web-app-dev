import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { SearchFilters } from '@/components/SearchFilters';
import { creators } from '@/data/creators';
import LiveStreamCard from '@/components/LiveStreamCard';

const Explore = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'explore' ? '/explore' : `/${t}`);
  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="explore" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <SearchFilters />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {creators.map((c) => (
            <LiveStreamCard
              key={c.id}
              username={c.username}
              avatarUrl={c.avatarUrl}
              viewerCount={c.viewers || 0}
              isFeatured={c.isFeatured}
              streamPreviewUrl={`https://source.unsplash.com/random/400x300?sig=${c.id}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;

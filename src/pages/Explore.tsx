import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';
import LiveStreamCard from '@/components/LiveStreamCard';
import StoryBubbles from '@/components/StoryBubbles';
import LiveStreamModal from '@/components/LiveStreamModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { creators as creatorsData } from '@/data/creators';
import type { Creator } from '@/types/creator';

const Explore = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) =>
    navigate(t === 'explore' ? '/explore' : `/${t}`);

  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: 'all',
    specialty: 'all',
    isLive: false,
    sort: 'trending',
  });
  const [tab, setTab] = useState('all');
  const [modalCreator, setModalCreator] = useState<Creator | null>(null);
  const [open, setOpen] = useState(false);

  const creators: Creator[] = creatorsData;

  const filteredCreators = creators.filter((c) => {
    if (filters.isLive && !c.isLive) return false;
    if (filters.country !== 'all' && c.country !== filters.country) return false;
    if (
      filters.specialty !== 'all' &&
      !c.specialties.includes(filters.specialty)
    )
      return false;
    if (tab === 'trending' && !c.isFeatured) return false;
    if (tab === 'new' && c.isFeatured) return false;
    return true;
  });

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleWatch = (username: string) => {
    const c = creators.find((cc) => cc.username === username);
    if (c) {
      setModalCreator(c);
      setOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="explore" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <StoryBubbles
          creators={creators.filter((c) => c.isLive)}
          onSelect={handleWatch}
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="personalized">For You</TabsTrigger>
          </TabsList>
        </Tabs>
        <SearchFilters {...filters} onChange={handleFiltersChange} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {filteredCreators.map((c) => (
            <LiveStreamCard
              key={c.id}
              username={c.username}
              avatar={c.avatar ?? ''}
              viewerCount={c.viewers || 0}
              isFeatured={c.isFeatured}
              streamPreviewUrl={`https://source.unsplash.com/random/400x300?sig=${c.id}`}
              badge={c.isFeatured ? 'VIP' : undefined}
              onWatch={() => handleWatch(c.username)}
            />
          ))}
        </div>
        <LiveStreamModal
          creator={modalCreator}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    </div>
  );
};

export default Explore;

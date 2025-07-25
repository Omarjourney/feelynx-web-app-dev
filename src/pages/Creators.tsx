import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { SearchFilters } from '@/components/SearchFilters';
import { creators } from '@/data/creators';
import { CreatorCard } from '@/components/CreatorCard';

const Creators = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'creators' ? '/creators' : `/${t}`);

  const handleView = (id: number) => {
    const c = creators.find((cc) => cc.id === id);
    if (c?.isLive) navigate(`/live/${c.username.replace('@', '')}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="creators" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <SearchFilters />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} onViewProfile={handleView} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Creators;

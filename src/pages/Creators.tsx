import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  SearchFilters,
  SearchFiltersState,
} from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';

interface Creator {
  id: number;
  username: string;
  avatarUrl: string;
  viewers?: number;
  isFeatured?: boolean;
  isLive?: boolean;
}

const Creators = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) =>
    navigate(t === 'creators' ? '/creators' : `/${t}`);

  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: 'all',
    specialty: 'all',
    isLive: false,
    sort: 'trending'
  });

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleView = (id: number) => {
    const c = creators.find((cc) => cc.id === id);
    if (c?.isLive) navigate(`/live/${c.username}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          search: filters.search,
          country: filters.country,
          specialty: filters.specialty,
          sort: filters.sort,
        });
        if (filters.isLive) params.set('isLive', '1');
        const res = await fetch(`/api/creators?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch creators');
        const data = await res.json();
        setCreators(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="creators" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <SearchFilters {...filters} onChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <CreatorCard
                key={c.id}
                creator={{
                  id: c.id,
                  name: c.username,
                  username: c.username,
                  country: 'Unknown',
                  age: 25,
                  tier: 'Premium',
                  subscribers: '1.2K',
                  isLive: c.isLive || false,
                  viewers: c.viewers,
                  toyConnected: 'Connected',
                  videoRate: 2.5,
                  voiceRate: 1.5,
                  specialties: ['Chat', 'Entertainment'],
                  earnings: '$5,000',
                  status: c.isLive ? 'Online' : 'Offline',
                  initial: c.username.charAt(0).toUpperCase(),
                  gradientColors: 'bg-gradient-to-br from-pink-500 to-purple-600',
                }}
                onViewProfile={handleView}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Creators;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  SearchFilters,
  type SearchFiltersValues,
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

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<SearchFiltersValues>({
    search: '',
    country: '',
    specialty: '',
    isLive: false,
    sort: 'trending',
  });

  const handleFiltersChange = (values: Partial<SearchFiltersValues>) => {
    setFilters((prev) => ({ ...prev, ...values }));
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
      <Navigation activeTab="explore" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <SearchFilters {...filters} onChange={handleFiltersChange} />
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-destructive">{error}</p>}
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

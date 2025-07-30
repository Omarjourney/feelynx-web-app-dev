import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  SearchFilters,
  type SearchFiltersValues,
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

  const handleView = (id: number) => {
    const c = creators.find((cc) => cc.id === id);
    if (c?.isLive) navigate(`/live/${c.username.replace('@', '')}`);
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
        <SearchFilters {...filters} onChange={handleFiltersChange} />
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-destructive">{error}</p>}
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

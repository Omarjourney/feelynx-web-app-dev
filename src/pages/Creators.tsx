import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  SearchFilters,
  SearchFiltersState,
} from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';
import type { Creator as FrontendCreator } from '@/types/creator';

interface ApiCreator {
  id: number;
  username: string;
  name: string;
  avatar: string;
  country: string;
  specialty: string;
  isLive: boolean;
  followers: number;
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

  const [creators, setCreators] = useState<FrontendCreator[]>([]);
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
          sort: filters.sort,
        });
        if (filters.country !== 'all') params.set('country', filters.country);
        if (filters.specialty !== 'all') params.set('specialty', filters.specialty);
        if (filters.isLive) params.set('isLive', '1');
        const res = await fetch(`/api/creators?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch creators');
        let data: ApiCreator[] = [];
        const contentType = res.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          try {
            data = await res.json();
          } catch (err) {
            throw new Error('Invalid creators response');
          }
        } else {
          throw new Error('Invalid creators response');
        }
        const mapped = data.map((c) => ({
          id: c.id,
          name: c.name,
          username: c.username,
          avatar: c.avatar,
          country: c.country,
          age: 25,
          tier: 'Premium',
          subscribers: c.followers.toLocaleString(),
          isLive: c.isLive,
          viewers: c.isLive ? Math.floor(Math.random() * 500) : undefined,
          toyConnected: 'Connected',
          videoRate: 2.5,
          voiceRate: 1.5,
          specialties: [c.specialty],
          earnings: '$5,000',
          status: c.isLive ? 'Online' : 'Offline',
          initial: c.username.charAt(0).toUpperCase(),
          gradientColors: 'bg-gradient-to-br from-pink-500 to-purple-600',
          isFeatured: false,
        }));
        setCreators(mapped);
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
              <CreatorCard key={c.id} creator={c} onViewProfile={handleView} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Creators;

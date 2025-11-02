import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';
import { CreatorCardSkeleton } from '@/components/Skeletons';
import { getUserMessage } from '@/lib/errors';
import type { Creator as FrontendCreator } from '@/types/creator';
import { request } from '@/lib/api';

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

const LOAD_CREATORS_ERROR_MESSAGE = "We couldn't load creators right now. Please try again later.";

const Creators = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'creators' ? '/creators' : `/${t}`);

  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: 'all',
    specialty: 'all',
    isLive: false,
    sort: 'trending',
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
        const data = await request<ApiCreator[]>(`/api/creators?${params.toString()}`);
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
        const message = getUserMessage(err);
        setError(message || LOAD_CREATORS_ERROR_MESSAGE);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div className="min-h-screen bg-background md:flex">
      <Navigation activeTab="creators" onTabChange={handleTab} />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
          <SearchFilters
            {...filters}
            onChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <CreatorCardSkeleton key={i} />
                ))}
              </>
            )}
            {error && (
              <div className="col-span-full rounded-2xl border border-border/60 bg-background/70 p-6 text-center text-destructive">
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
      </main>
    </div>
  );
};

export default Creators;

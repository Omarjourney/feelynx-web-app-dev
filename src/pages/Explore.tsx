import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  SearchFilters,
  SearchFiltersState,
} from '@/components/SearchFilters';
import LiveStreamCard from '@/components/LiveStreamCard';

const Explore = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) =>
    navigate(t === 'explore' ? '/explore' : `/${t}`);

  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: '',
    specialty: '',
    isLive: false,
    sort: 'trendingScore',
  });

  interface ApiCreator {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    followers: number;
    trendingScore: number;
  }

  const [creators, setCreators] = useState<ApiCreator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.country) params.append('country', filters.country);
    if (filters.specialty) params.append('specialty', filters.specialty);
    if (filters.isLive) params.append('isLive', 'true');
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);

    setLoading(true);
    setError(null);
    fetch(`/api/creators?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch creators');
        return r.json();
      })
      .then((data: ApiCreator[]) => setCreators(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="explore" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <SearchFilters {...filters} onChange={(v) => setFilters({ ...filters, ...v })} />
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

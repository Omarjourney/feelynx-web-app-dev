import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import {
  SearchFilters,
  SearchFiltersState,
} from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';

const Creators = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) =>
    navigate(t === 'creators' ? '/creators' : `/${t}`);

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
    country: string;
    specialty: string;
    followers: number;
    isLive: boolean;
    trendingScore: number;
  }

  interface Creator extends ApiCreator {
    name: string;
    country: string;
    specialty: string;
    age: number;
    tier: string;
    subscribers: string;
    videoRate: number;
    voiceRate: number;
    specialties: string[];
    earnings: string;
    status: string;
    initial: string;
    gradientColors: string;
    viewers?: number;
    toyConnected?: string;
  }

  const [creators, setCreators] = useState<Creator[]>([]);
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
      .then((data: ApiCreator[]) =>
        setCreators(
          data.map((c) => ({
            ...c,
            name: c.displayName,
            country: c.country,
            specialty: c.specialty,
            age: 0,
            tier: '',
            subscribers: c.followers.toString(),
            videoRate: 0,
            voiceRate: 0,
            specialties: [c.specialty],
            earnings: '',
            status: '',
            initial: c.displayName.charAt(0),
            gradientColors: 'bg-gradient-to-br from-pink-500 to-purple-600',
          }))
        )
      )
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleView = (id: number) => {
    const c = creators.find((cc) => cc.id === id);
    if (c?.isLive) navigate(`/live/${c.username}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="creators" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <SearchFilters
          {...filters}
          onChange={(v) => setFilters({ ...filters, ...v })}
        />
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

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';
import { CreatorCardSkeleton } from '@/components/Skeletons';
import { fetchCreators } from '@/data/creators';
import { getUserMessage } from '@/lib/errors';
import { toast } from '@/hooks/use-toast';

const LOAD_CREATORS_ERROR_MESSAGE = "We couldn't load creators right now. Please try again later.";

const Creators = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: 'all',
    specialty: 'all',
    isLive: false,
    sort: 'trending',
  });

  const {
    data: creators = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['creators-directory', filters],
    queryFn: ({ signal }) => fetchCreators(filters, signal),
    staleTime: 30_000,
    onError: (err) => {
      toast({
        title: 'Unable to load creators',
        description: getUserMessage(err),
        variant: 'destructive',
      });
    },
  });

  const handleView = (id: number) => {
    const creator = creators.find((c) => c.id === id);
    if (creator?.isLive) navigate(`/live/${creator.username}`);
  };

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const loading = isLoading || isFetching;
  const hasError = Boolean(error && !creators.length);

  const errorMessage = error ? getUserMessage(error) || LOAD_CREATORS_ERROR_MESSAGE : '';

  const filteredCreators = useMemo(() => creators, [creators]);

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
          <SearchFilters {...filters} onChange={handleFiltersChange} />
          {hasError ? (
            <div className="col-span-full rounded-2xl border border-border/60 bg-background/70 p-6 text-center text-destructive">
              {errorMessage}
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => <CreatorCardSkeleton key={`skeleton-${i}`} />)}
            {!loading &&
              !hasError &&
              filteredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} onViewProfile={handleView} />
              ))}
            {!loading && !hasError && !filteredCreators.length ? (
              <div className="col-span-full rounded-2xl border border-border/60 bg-background/70 p-6 text-center text-sm text-muted-foreground">
                No creators matched your filters. Try updating your search or check back later.
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Creators;

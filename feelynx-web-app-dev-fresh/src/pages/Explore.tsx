import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { creators } from '@/data/creators';
import { cn } from '@/lib/utils';

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('viewers');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'music', label: 'Music' },
    { id: 'art', label: 'Art' },
    { id: 'lifestyle', label: 'Lifestyle' },
  ];

  const filteredCreators = creators
    .filter((creator) => {
      const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || creator.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'viewers') return (b.viewers || 0) - (a.viewers || 0);
      if (sortBy === 'followers') {
        const aFollowers = parseInt(a.subscribers.replace(/[KM]/g, '')) * (a.subscribers.includes('M') ? 1000000 : 1000);
        const bFollowers = parseInt(b.subscribers.replace(/[KM]/g, '')) * (b.subscribers.includes('M') ? 1000000 : 1000);
        return bFollowers - aFollowers;
      }
      return b.id - a.id;
    });

  const liveCreators = filteredCreators.filter((c) => c.isLive);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Section */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Discover</h1>
            <p className="text-muted-foreground">
              Explore {liveCreators.length} live creators and {filteredCreators.length} total
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 pr-4"
            />
          </div>

          {/* Category Pills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'rounded-full transition-all',
                  selectedCategory === category.id && 'bg-gradient-primary shadow-glow'
                )}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">
              {[
                { id: 'viewers', label: 'Most Viewers' },
                { id: 'followers', label: 'Most Followers' },
                { id: 'newest', label: 'Newest' },
              ].map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortBy(option.id)}
                  className={cn(sortBy === option.id && 'bg-white/10')}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Live Now Section */}
        {liveCreators.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              </div>
              <h2 className="text-2xl font-bold">Live Now</h2>
              <Badge variant="secondary" className="ml-2">
                {liveCreators.length}
              </Badge>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {liveCreators.map((creator) => (
                <Card
                  key={creator.id}
                  className="group cursor-pointer overflow-hidden border-white/10 bg-gradient-card backdrop-blur-xl transition-all hover:scale-105 hover:border-white/20 hover:shadow-glow"
                  onClick={() => navigate(`/live/${creator.username}`)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Live Badge */}
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      LIVE
                    </div>

                    {/* Viewer Count */}
                    {creator.viewers && (
                      <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <TrendingUp className="mr-1 inline h-3 w-3" />
                        {creator.viewers.toLocaleString()}
                      </div>
                    )}

                    {/* Creator Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="mb-1 text-lg font-bold text-white">{creator.name}</h3>
                      <p className="text-sm text-white/80">@{creator.username}</p>
                      {creator.category && (
                        <Badge variant="secondary" className="mt-2">
                          {creator.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Creators Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">All Creators</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCreators.map((creator) => (
              <Card
                key={creator.id}
                className="group cursor-pointer overflow-hidden border-white/10 bg-gradient-card backdrop-blur-xl transition-all hover:scale-105 hover:border-white/20 hover:shadow-glow"
                onClick={() => navigate(`/live/${creator.username}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {creator.isLive && (
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      LIVE
                    </div>
                  )}

                  {!creator.isLive && (
                    <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      OFFLINE
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="mb-1 text-lg font-bold text-white">{creator.name}</h3>
                    <p className="text-sm text-white/80">@{creator.username}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {creator.category && (
                        <Badge variant="secondary" className="text-xs">
                          {creator.category}
                        </Badge>
                      )}
                      <span className="text-xs text-white/60">{creator.subscribers} followers</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredCreators.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No creators found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;

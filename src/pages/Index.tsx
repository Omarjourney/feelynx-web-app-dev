import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';
import { LiveStream } from '@/components/LiveStream';
import { CoinsPanel } from '@/components/CoinsPanel';
import { VibeCoinPackages } from '@/components/VibeCoinPackages';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const creators = useCreatorLive();
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null);
  const [isInLiveStream, setIsInLiveStream] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: 'all',
    specialty: 'all',
    isLive: false,
    sort: 'trendingScore'
  });

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleViewProfile = (creatorId: number) => {
    const creator = creators.find((c) => c.id === creatorId);
    if (creator?.isLive) {
      setSelectedCreator(creatorId);
      setIsInLiveStream(true);
    }
  };

  const handleBackFromStream = () => {
    setIsInLiveStream(false);
    setSelectedCreator(null);
  };

  if (isInLiveStream && selectedCreator) {
    const creator = creators.find((c) => c.id === selectedCreator);
    return (
      <div className="min-h-screen bg-background">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <LiveStream
          creatorName={creator?.name || ''}
          viewers={creator?.viewers || 0}
          onBack={handleBackFromStream}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <HeroSection />

            {/* Search and Filters */}
            <div className="container mx-auto px-4">
              <SearchFilters {...filters} onChange={handleFiltersChange} />
            </div>

            {/* Live Creators */}
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6">🔴 Live Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creators
                  .filter((c) => c.isLive)
                  .map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onViewProfile={handleViewProfile}
                    />
                  ))}
              </div>
            </div>

            {/* All Creators */}
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6">Featured Creators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'creators':
        return (
          <div className="container mx-auto px-4 space-y-8">
            <SearchFilters {...filters} onChange={handleFiltersChange} />
            <h2 className="text-3xl font-bold">All Creators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} onViewProfile={handleViewProfile} />
              ))}
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Premium Content Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold mb-2">Exclusive Photos & Videos</h3>
                  <p className="text-muted-foreground mb-4">
                    Access premium content from your favorite creators with token purchases
                  </p>
                  <Button className="bg-gradient-primary text-primary-foreground">
                    Browse Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'calls':
        return (
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Private Video Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📹</div>
                  <h3 className="text-xl font-semibold mb-2">One-on-One Sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    Book private video calls with creators for personalized experiences
                  </p>
                  <Button className="bg-gradient-primary text-primary-foreground">
                    Schedule Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'groups':
        return (
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Private Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">Exclusive Communities</h3>
                  <p className="text-muted-foreground mb-4">
                    Join private groups for exclusive content and direct creator interaction
                  </p>
                  <Button className="bg-gradient-primary text-primary-foreground">
                    Explore Groups
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'coins':
        return (
          <div className="container mx-auto px-4">
            <VibeCoinPackages platform="web" />
          </div>
        );

      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>{renderContent()}</main>
    </div>
  );
};

export default Index;

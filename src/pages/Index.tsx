import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { CreatorCard } from "@/components/CreatorCard";
import { LiveStream } from "@/components/LiveStream";
import { CoinsPanel } from "@/components/CoinsPanel";
import { creators } from "@/data/creators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null);
  const [isInLiveStream, setIsInLiveStream] = useState(false);

  const handleViewProfile = (creatorId: number) => {
    const creator = creators.find(c => c.id === creatorId);
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
    const creator = creators.find(c => c.id === selectedCreator);
    return (
      <div className="min-h-screen bg-background">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <LiveStream 
          creatorName={creator?.name || ""} 
          viewers={creator?.viewers || 0}
          onBack={handleBackFromStream}
        />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "explore":
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-card p-8 rounded-lg text-center">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Welcome to Feelynx
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Premium adult entertainment platform with interactive experiences
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  🔴 {creators.filter(c => c.isLive).length} Live Now
                </Badge>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  ⭐ {creators.length} Featured Creators
                </Badge>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  🎮 Interactive Toys
                </Badge>
              </div>
            </div>

            {/* Live Creators */}
            <div>
              <h2 className="text-2xl font-bold mb-4">🔴 Live Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creators.filter(c => c.isLive).map((creator) => (
                  <CreatorCard 
                    key={creator.id} 
                    creator={creator} 
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            </div>

            {/* All Creators */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Featured Creators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      case "creators":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">All Creators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator) => (
                <CreatorCard 
                  key={creator.id} 
                  creator={creator} 
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          </div>
        );

      case "content":
        return (
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>Premium Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold mb-2">Premium Content Library</h3>
                <p className="text-muted-foreground mb-4">
                  Access exclusive photos, videos, and custom content from your favorite creators
                </p>
                <Button className="bg-gradient-primary text-primary-foreground">
                  Browse Content
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "calls":
        return (
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>Video Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📹</div>
                <h3 className="text-xl font-semibold mb-2">Private Video Calls</h3>
                <p className="text-muted-foreground mb-4">
                  Book private video calls with creators for personalized experiences
                </p>
                <Button className="bg-gradient-primary text-primary-foreground">
                  Schedule Call
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "coins":
        return <CoinsPanel />;

      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;

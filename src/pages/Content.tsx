import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import ContentCard from '@/components/ContentCard';
import { posts } from '@/data/posts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Content = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'content' ? '/content' : `/${t}`);

  const renderGrid = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {posts.map((p) => (
        <ContentCard key={p.id} {...p} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="content" onTabChange={handleTab} />
      <div className="container mx-auto space-y-6 p-4">
        <Tabs defaultValue="forYou" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="forYou">For You</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
            <TabsTrigger value="top">Top Sellers</TabsTrigger>
            <TabsTrigger value="purchased">My Purchases</TabsTrigger>
          </TabsList>
          <TabsContent value="forYou">{renderGrid()}</TabsContent>
          <TabsContent value="trending">{renderGrid()}</TabsContent>
          <TabsContent value="recent">{renderGrid()}</TabsContent>
          <TabsContent value="top">{renderGrid()}</TabsContent>
          <TabsContent value="purchased">{renderGrid()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Content;

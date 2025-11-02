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
    <div className="min-h-screen bg-background md:flex">
      <Navigation activeTab="content" onTabChange={handleTab} />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
          <Tabs defaultValue="forYou" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto rounded-full bg-background/80 p-1">
              <TabsTrigger value="forYou" className="rounded-full px-4 py-2 text-sm">
                For You
              </TabsTrigger>
              <TabsTrigger value="trending" className="rounded-full px-4 py-2 text-sm">
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="rounded-full px-4 py-2 text-sm">
                Recently Added
              </TabsTrigger>
              <TabsTrigger value="top" className="rounded-full px-4 py-2 text-sm">
                Top Sellers
              </TabsTrigger>
              <TabsTrigger value="purchased" className="rounded-full px-4 py-2 text-sm">
                My Purchases
              </TabsTrigger>
            </TabsList>
            <TabsContent value="forYou">{renderGrid()}</TabsContent>
            <TabsContent value="trending">{renderGrid()}</TabsContent>
            <TabsContent value="recent">{renderGrid()}</TabsContent>
            <TabsContent value="top">{renderGrid()}</TabsContent>
            <TabsContent value="purchased">{renderGrid()}</TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Content;

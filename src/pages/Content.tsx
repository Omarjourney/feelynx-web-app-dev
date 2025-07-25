import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { PostCard } from '@/components/PostCard';
import { posts } from '@/data/posts';

const Content = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'content' ? '/content' : `/${t}`);
  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="content" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Content;

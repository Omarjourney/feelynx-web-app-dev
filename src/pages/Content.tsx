import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import SubscriptionPost from '@/components/SubscriptionPost';
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
            <SubscriptionPost
              key={p.id}
              avatarUrl={`https://source.unsplash.com/random/100x100?sig=${p.id}`}
              contentUrl={p.src}
              isLocked={Boolean(p.locked)}
              caption={p.username}
              price={p.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Content;

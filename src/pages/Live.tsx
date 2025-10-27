import { useParams, useNavigate } from 'react-router-dom';
import { creators } from '@/data/creators';
import { LiveStream } from '@/components/live';
import { Navigation } from '@/components/Navigation';

const Live = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const creator = creators.find((c) => c.username === username);
  const handleTab = (t: string) => navigate(`/${t}`);

  if (!creator) return <div className="p-4">Creator not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="explore" onTabChange={handleTab} />
      <LiveStream
        creatorName={creator.name}
        viewers={creator.viewers || 0}
        onBack={() => navigate(-1)}
      />
    </div>
  );
};

export default Live;

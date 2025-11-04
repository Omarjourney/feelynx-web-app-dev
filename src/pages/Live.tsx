import { useParams, useNavigate } from 'react-router-dom';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { LiveStream } from '@/components/live';

const Live = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const creators = useCreatorLive();
  const creator = creators.find((c) => c.username === username);

  if (!creator) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border/60 bg-background/80 p-6 text-center text-sm text-muted-foreground">
          We couldn't find that creator. They may have gone offline.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <LiveStream
          creatorName={creator.name}
          viewers={creator.viewers || 0}
          onBack={() => navigate(-1)}
        />
      </main>
    </div>
  );
};

export default Live;

import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { creators } from '@/data/creators';
import { CallCard } from '@/components/CallCard';
import { usePresence } from '@/lib/presence';

const Calls = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'calls' ? '/calls' : `/${t}`);
  const presence = usePresence();
  const available = creators.filter((c) => presence[c.username] === 'available');
  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="calls" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Available Now</h2>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No one is available right now. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {available.map((c) => (
                <CallCard key={c.id} creator={c} status={presence[c.username]} />
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">All Creators</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {creators.map((c) => (
              <CallCard key={c.id} creator={c} status={presence[c.username]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calls;

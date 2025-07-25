import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { creators } from '@/data/creators';
import { CallCard } from '@/components/CallCard';

const Calls = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'calls' ? '/calls' : `/${t}`);
  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="calls" onTabChange={handleTab} />
      <div className="container mx-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {creators.map((c) => (
          <CallCard key={c.id} creator={c} />
        ))}
      </div>
    </div>
  );
};

export default Calls;

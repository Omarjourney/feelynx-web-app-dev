import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { groups } from '@/data/groups';
import { GroupCard } from '@/components/GroupCard';

const Groups = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'groups' ? '/groups' : `/${t}`);
  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="groups" onTabChange={handleTab} />
      <div className="container mx-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} />
        ))}
      </div>
    </div>
  );
};

export default Groups;

import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { groups } from '@/data/groups';
import { GroupCard } from '@/components/GroupCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Groups = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'groups' ? '/groups' : `/${t}`);
  const goCreate = () => navigate('/groups');
  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab="groups" onTabChange={handleTab} />
      <div className="container mx-auto p-4 space-y-6">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl">Groups</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-muted-foreground max-w-2xl">
              Join private communities for exclusive posts, member-only chat, audio rooms, and events.
              Upgrade tiers for perks and early access.
            </p>
            <div className="space-x-2">
              <Button onClick={() => navigate('/shop')}>Buy Membership</Button>
              <Button variant="secondary" onClick={goCreate}>Create Group</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="explore">
          <TabsList className="mb-4">
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="mine">My Groups</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;

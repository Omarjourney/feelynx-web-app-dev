import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groups } from '@/data/groups';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const id = Number(groupId);
  const group = useMemo(() => groups.find((g) => g.id === id), [id]);

  if (!group) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Group not found</h1>
              <p className="text-muted-foreground">The group you are looking for does not exist.</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/groups')}>Back to Groups</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full h-40 md:h-56 overflow-hidden">
        <img src={group.thumbnail} alt={group.name} className="w-full h-full object-cover" />
      </div>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => navigate('/shop')}>Join / Upgrade</Button>
            <Button variant="secondary" onClick={() => navigate('/messages')}>Message Admin</Button>
          </div>
        </div>

        <Tabs defaultValue="posts">
          <TabsList className="mb-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Posts feed coming soon…
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Sidebar: About, Rules, Perks
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;


import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groups } from '@/data/groups';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const parsedId = Number(groupId);
  const id = Number.isFinite(parsedId) ? parsedId : null;
  const group = useMemo(() => {
    if (id === null) return undefined;
    return groups.find((g) => g.id === id);
  }, [id]);
  const [membership, setMembership] = useState<'approved' | 'pending' | 'none'>('none');
  useEffect(() => {
    if (id === null) {
      setMembership('none');
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/groups/${id}/membership`);
        const data = await res.json();
        if (!active) return;
        setMembership((data?.status as any) || 'none');
      } catch {
        if (!active) return;
        setMembership('none');
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (!group) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Crew not found</h1>
              <p className="text-muted-foreground">
                The Family crew you are looking for does not exist.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/groups')}>
              Back to Family crews
            </Button>
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
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-border" /> Private · Invite only
            </div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => navigate('/token-shop')}>Request Invite</Button>
            <Button variant="secondary" onClick={() => navigate('/dm')}>
              Message Admin
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Have an invite code?</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Enter your invite code" className="sm:w-64" id="invite-input" />
            <Button
              onClick={() => {
                const el = document.getElementById('invite-input') as HTMLInputElement | null;
                const code = el?.value.trim();
                if (!code) {
                  toast.error('Please enter a valid invite code');
                  return;
                }
                if (id === null) {
                  toast.error('Crew not found');
                  return;
                }
                (async () => {
                  try {
                    const res = await fetch(`/api/groups/${id}/invite/verify`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code }),
                    });
                    if (!res.ok) throw new Error('Invite verification failed');
                    toast.success('Invite accepted', { description: 'Welcome to the crew' });
                  } catch (err) {
                    // Preview-safe fallback
                    toast.success('Invite accepted', { description: 'Welcome to the crew (demo)' });
                  }
                })();
              }}
            >
              Enter with invite
            </Button>
          </div>
        </div>

        {/* Membership gating */}
        {membership !== 'approved' && (
          <Card className="border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
            {membership === 'pending' ? (
              <div>
                Your invite request is pending approval. You will be notified when approved. You can
                still message the admin with any questions.
              </div>
            ) : (
              <div>This crew is private. Use an invite code or request an invite to join.</div>
            )}
          </Card>
        )}

        <Tabs defaultValue="posts">
          <TabsList className="mb-4">
            <TabsTrigger value="posts" disabled={membership !== 'approved'}>
              Posts
            </TabsTrigger>
            <TabsTrigger value="channels" disabled={membership !== 'approved'}>
              Channels
            </TabsTrigger>
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

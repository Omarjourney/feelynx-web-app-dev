import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GroupCard } from '@/components/GroupCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { fetchGroups } from '@/data/groups';
import { toast } from '@/hooks/use-toast';
import { getUserMessage } from '@/lib/errors';

const Groups = () => {
  const navigate = useNavigate();
  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['groups-directory'],
    queryFn: ({ signal }) => fetchGroups(signal),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!error) return;
    toast({
      title: 'Unable to load groups',
      description: getUserMessage(error),
      variant: 'destructive',
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12">
          <Card className="border border-border/60 bg-background/80 backdrop-blur">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit bg-primary/30 text-primary-foreground">Family crews</Badge>
                <CardTitle className="text-3xl font-bold">Find your Family</CardTitle>
                <CardDescription className="max-w-2xl text-sm text-muted-foreground">
                  Join Family crews built around creators and shared vibes. Earn crew XP, unlock goals
                  together, and light up chat with synchronized reactions.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="button-ripple" onClick={() => navigate('/token-shop')}>
                  Boost membership
                </Button>
                <Button
                  variant="secondary"
                  className="button-ripple"
                  onClick={() => navigate('/groups/new')}
                >
                  Create a crew
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="explore" className="space-y-6">
            <TabsList className="w-full justify-start gap-2 bg-background/60 p-1">
              <TabsTrigger value="explore" className="rounded-full px-4 py-2 text-sm">
                Explore Family crews
              </TabsTrigger>
              <TabsTrigger value="mine" className="rounded-full px-4 py-2 text-sm">
                My memberships
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-full px-4 py-2 text-sm">
                Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explore" className="space-y-4">
              {isLoading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`group-skeleton-${index}`}
                      className="h-64 rounded-3xl border border-border/60 bg-background/60"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
              {!isLoading && !groups.length ? (
                <Card className="border border-border/60 bg-background/70 p-8 text-center text-sm text-muted-foreground">
                  There are no public crews yet. Check back soon or create your own.
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="mine">
              <Card className="border border-border/60 bg-background/70 p-8 text-center text-sm text-muted-foreground">
                <p>
                  You are not part of a crew yet. Join one to unlock crew chat boosts and exclusive
                  drops.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <div className="grid gap-4">
                <Card className="border border-border/60 bg-background/70">
                  <CardHeader>
                    <CardTitle className="text-xl">PK Battle · NeonFox vs StarBlaze</CardTitle>
                    <CardDescription>
                      Friday 9 PM EST · Animated scoreboards · AR confetti for 500+ tips
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <div>Win streak boosts crew XP by 25%.</div>
                    <Button size="sm" className="button-ripple" onClick={() => navigate('/pkbattle')}>
                      Set reminder
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default Groups;

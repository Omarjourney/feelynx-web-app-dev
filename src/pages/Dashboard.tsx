import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchCreators } from '@/data/creators';
import { request } from '@/lib/api';
import { getUserMessage } from '@/lib/errors';
import { useWallet, selectWalletBalance, selectWalletLoading } from '@/stores/useWallet';
import { toast } from '@/hooks/use-toast';

interface ProfileResponse {
  name?: string;
  username?: string;
  avatar?: string;
  tier?: string;
}

const Dashboard = () => {
  const walletBalance = useWallet(selectWalletBalance);
  const walletLoading = useWallet(selectWalletLoading);
  const fetchWallet = useWallet((state) => state.fetch);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const {
    data: profile,
    error: profileError,
  } = useQuery<ProfileResponse>({
    queryKey: ['dashboard-profile'],
    queryFn: () => request<ProfileResponse>('/api/users/me'),
    staleTime: 60_000,
    retry: 0,
  });

  const {
    data: favoriteCreators = [],
    error: favoritesError,
  } = useQuery({
    queryKey: ['dashboard-favorites'],
    queryFn: ({ signal }) => fetchCreators({ isLive: true }, signal).then((list) => list.slice(0, 3)),
    staleTime: 30_000,
  });

  const {
    data: recommendedCreators = [],
    error: recommendedError,
  } = useQuery({
    queryKey: ['dashboard-recommendations'],
    queryFn: ({ signal }) => fetchCreators({ sort: 'trending' }, signal).then((list) => list.slice(0, 3)),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (profileError) {
      toast({
        title: 'Unable to load your profile',
        description: getUserMessage(profileError),
        variant: 'destructive',
      });
    }
  }, [profileError]);

  useEffect(() => {
    if (favoritesError) {
      toast({
        title: 'Unable to load favorites',
        description: getUserMessage(favoritesError),
        variant: 'destructive',
      });
    }
  }, [favoritesError]);

  useEffect(() => {
    if (recommendedError) {
      toast({
        title: 'Unable to load recommendations',
        description: getUserMessage(recommendedError),
        variant: 'destructive',
      });
    }
  }, [recommendedError]);

  const userName = profile?.name ?? 'Guest';
  const usernameHandle = profile?.username ? `@${profile.username}` : '@guest';
  const avatarUrl = profile?.avatar;
  const tier = profile?.tier ?? 'Member';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="bg-gradient-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{userName}</p>
              <p className="text-sm text-muted-foreground">{usernameHandle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">{tier}</p>
            <p className="text-2xl font-bold">
              {walletLoading ? '…' : `${walletBalance.toLocaleString()} 💎`}
            </p>
            <Button variant="outline" size="sm" className="mt-1" onClick={() => fetchWallet()}>
              Refresh Wallet
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Watched a live stream • 2h ago</li>
            <li>Favorited a creator</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Favorite Creators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {favoriteCreators.map((creator) => (
              <div key={creator.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback>{creator.initial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{creator.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {creator.isLive ? 'Live now' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
            {!favoriteCreators.length && (
              <p className="col-span-full text-sm text-muted-foreground">
                No favorites yet. Explore creators to add them here.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips & Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Tipped a creator 50 💎 • Yesterday</li>
            <li>Unlocked premium content • 3d ago</li>
          </ul>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchWallet()}>
            Buy Tokens
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Creators You Might Like</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {recommendedCreators.map((creator) => (
              <div key={creator.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback>{creator.initial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{creator.name}</p>
                  <p className="text-xs text-muted-foreground">{creator.tier ?? 'Creator'}</p>
                </div>
              </div>
            ))}
            {!recommendedCreators.length && (
              <p className="col-span-full text-sm text-muted-foreground">
                No recommendations available right now.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>🏆 Watched 10 streams</li>
            <li>🔥 5-day watch streak</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>New message in your inbox</li>
            <li>Your tokens expire in 7 days</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account &amp; Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your profile, privacy, and security settings.
          </p>
          <Button variant="outline" size="sm">
            Go to Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Help &amp; Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Visit our help center or contact support.
          </p>
          <Button variant="outline" size="sm">
            Get Help
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

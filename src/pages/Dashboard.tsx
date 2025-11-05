import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Leaderboard from '@/components/Leaderboard';
import ReferralCenter from '@/components/ReferralCenter';
import { fetchCreators } from '@/data/creators';
import { request } from '@/lib/api';
import { getUserMessage } from '@/lib/errors';
import { useWallet, selectWalletBalance, selectWalletLoading } from '@/stores/useWallet';
import { toast } from '@/hooks/use-toast';
import CreatorAIHub from '@/components/CreatorAIHub';
import FanVibeFeed from '@/components/FanVibeFeed';
import AIHealthMonitor from '@/components/AIHealthMonitor';
import LocaleSwitcher from '@/components/LocaleSwitcher';

type HighlightsResponse = Record<string, HighlightRecord[]>;

interface HighlightRecord {
  id: string;
  streamId: string;
  title: string;
  start: number;
  end: number;
  duration: number;
  clipUrl: string;
  previewImage: string;
  generatedAt: string;
  shareCounts: Record<string, number>;
  engagementPeak: number;
}

interface ProfileResponse {
  name?: string;
  username?: string;
  avatar?: string;
  tier?: string;
}

type SharePlatform = 'tiktok' | 'instagram' | 'x';

const SHARE_ENDPOINT: Record<SharePlatform, (clip: HighlightRecord) => string> = {
  tiktok: (clip) => `https://www.tiktok.com/upload?video=${encodeURIComponent(clip.clipUrl)}`,
  instagram: (clip) => `intent://share?video=${encodeURIComponent(clip.clipUrl)}`,
  x: (clip) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(clip.title)}&url=${encodeURIComponent(clip.clipUrl)}`,
};

const PLATFORM_LABELS: Record<SharePlatform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  x: 'X',
};

const Dashboard = () => {
  const queryClient = useQueryClient();
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

  const { data: highlightsData } = useQuery<HighlightsResponse>({
    queryKey: ['highlights', 'dashboard'],
    queryFn: () => request<HighlightsResponse>('/api/highlights'),
    staleTime: 30_000,
  });

  const highlightList = useMemo(() => {
    if (!highlightsData) return [] as HighlightRecord[];
    return Object.values(highlightsData).flat();
  }, [highlightsData]);

  const heroHighlight = highlightList[0];

  const shareHighlight = useMutation({
    mutationFn: async ({ highlight, platform }: { highlight: HighlightRecord; platform: SharePlatform }) => {
      return request<{ shareCounts: Record<string, number> }>(
        `/api/highlights/${highlight.streamId}/${highlight.id}/share`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform }),
        },
      );
    },
    onSuccess: (payload, { highlight }) => {
      queryClient.setQueryData<HighlightsResponse>(['highlights', 'dashboard'], (prev) => {
        if (!prev) return prev;
        const next: HighlightsResponse = { ...prev };
        const list = next[highlight.streamId]?.map((item) =>
          item.id === highlight.id ? { ...item, shareCounts: payload.shareCounts } : item,
        );
        if (list) {
          next[highlight.streamId] = list;
        }
        return next;
      });
    },
  });

  const handleShare = (platform: SharePlatform) => {
    if (!heroHighlight) {
      toast({
        title: 'No highlight available',
        description: 'Go live to generate your first viral clip.',
      });
      return;
    }
    const url = SHARE_ENDPOINT[platform](heroHighlight);
    window.open(url, '_blank', 'noopener');
    shareHighlight.mutate({ highlight: heroHighlight, platform });
  };

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

      <Card className="border-primary/20 bg-background/80 backdrop-blur">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              Viral Clip Launcher
              <span className="text-sm font-normal text-muted-foreground">
                {heroHighlight ? 'Your top moment is ready to share.' : 'Go live to auto-generate highlights.'}
              </span>
            </CardTitle>
          </div>
          {heroHighlight && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {Object.values(heroHighlight.shareCounts).reduce((acc, value) => acc + value, 0)} total shares ·{' '}
                {heroHighlight.duration}s window
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Spark a growth ripple by pushing your hottest 20s clip to every network. Each share fuels the leaderboard.
            </p>
            {heroHighlight && (
              <p className="text-xs text-muted-foreground">
                Generated {new Date(heroHighlight.generatedAt).toLocaleString()} · Engagement score{' '}
                {Math.round(heroHighlight.engagementPeak)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SHARE_ENDPOINT) as SharePlatform[]).map((platform) => (
              <Button
                key={platform}
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => handleShare(platform)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {PLATFORM_LABELS[platform]}
              </Button>
            ))}
          </div>
        </CardContent>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Leaderboard />
        <ReferralCenter />
      </div>

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

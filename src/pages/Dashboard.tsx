import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UNSPLASH_RANDOM_BASE_URL } from '@/config';
import { creators } from '@/data/creators';

const Dashboard = () => {
  const user = {
    name: 'Jane Doe',
    username: 'janed',
    avatar: `${UNSPLASH_RANDOM_BASE_URL}100x100?woman`,
    tier: 'Premium',
    tokens: 120,
  };

  const favoriteCreators = creators.slice(0, 3);
  const recommendedCreators = creators.slice(3, 6);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Quick Overview */}
      <Card className="bg-gradient-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">{user.tier} Fan</p>
            <p className="text-2xl font-bold">{user.tokens} 💎</p>
            <Button variant="outline" size="sm" className="mt-1">
              Add Tokens
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* My Activity */}
      <Card>
        <CardHeader>
          <CardTitle>My Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              Watched <span className="font-medium">Aria Vex</span>'s stream • 2h ago
            </li>
            <li>
              Favorited <span className="font-medium">Mila Fox</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Favorite Creators */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Creators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favoriteCreators.map((c) => (
              <div key={c.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={c.avatar} alt={c.name} />
                  <AvatarFallback>{c.initial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.isLive ? 'Live now' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips & Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>Tips & Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Tipped Aria Vex 50 💎 • Yesterday</li>
            <li>Unlocked premium video from Mila Fox • 3d ago</li>
          </ul>
          <Button variant="outline" size="sm" className="mt-4">
            Buy Tokens
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Creators You Might Like</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendedCreators.map((c) => (
              <div key={c.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={c.avatar} alt={c.name} />
                  <AvatarFallback>{c.initial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.tier}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Milestones */}
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

      {/* Notifications & Inbox */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>New message from <span className="font-medium">Luna Star</span></li>
            <li>Your tokens expire in 7 days</li>
          </ul>
        </CardContent>
      </Card>

      {/* Account & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account & Security</CardTitle>
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

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
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


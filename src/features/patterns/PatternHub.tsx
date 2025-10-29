import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Play, Share2, MoreHorizontal, Menu, Home, Radio, Compass } from 'lucide-react';
import ControlRemote from '@/features/remote/ControlRemote';

type Pattern = {
  id: string;
  name: string;
  creator: { name: string; avatar: string };
  durationSec: number;
  tags: string[];
  mine?: boolean;
};

const demoPatterns: Pattern[] = [
  {
    id: 'p1',
    name: 'Pulse Wave',
    creator: { name: 'Luna Star', avatar: 'https://source.unsplash.com/random/48x48?face' },
    durationSec: 45,
    tags: ['pulse', 'medium'],
  },
  {
    id: 'p2',
    name: 'Slow Build',
    creator: { name: 'You', avatar: 'https://source.unsplash.com/random/48x48?woman' },
    durationSec: 90,
    tags: ['build', 'gentle'],
    mine: true,
  },
  {
    id: 'p3',
    name: 'Staccato',
    creator: { name: 'Kai Nova', avatar: 'https://source.unsplash.com/random/48x48?man' },
    durationSec: 30,
    tags: ['fast'],
  },
];

export default function PatternHub() {
  const [openMenu, setOpenMenu] = useState(false);
  const [bottomTab, setBottomTab] = useState<'home' | 'long' | 'discover'>('home');
  const [tab, setTab] = useState<'forYou' | 'trending' | 'mine'>('forYou');
  const [patterns, setPatterns] = useState<Pattern[]>(demoPatterns);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    if (tab === 'mine') return patterns.filter((p) => p.mine);
    if (tab === 'trending') return patterns.slice().reverse();
    return patterns;
  }, [patterns, tab]);

  const create = () => {
    const name = newName.trim() || 'New Pattern';
    const id = `p${Date.now()}`;
    setPatterns([
      {
        id,
        name,
        creator: { name: 'You', avatar: 'https://source.unsplash.com/random/48x48?portrait' },
        durationSec: 60,
        tags: ['custom'],
        mine: true,
      },
      ...patterns,
    ]);
    setNewName('');
    setCreating(false);
  };

  const rename = (id: string) => {
    const name = prompt('Rename pattern:', patterns.find((p) => p.id === id)?.name || '');
    if (!name) return;
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const remove = (id: string) => {
    if (!confirm('Delete this pattern?')) return;
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  const share = (id: string, anonymous = false) => {
    const p = patterns.find((x) => x.id === id);
    if (!p) return;
    const name = anonymous ? 'Someone' : p.creator.name;
    navigator.clipboard?.writeText(`${name} shared a pattern: ${p.name}`);
    alert(anonymous ? 'Shared anonymously (link copied).' : 'Shared (link copied).');
  };

  return (
    <div className="min-h-screen bg-background text-foreground md:max-w-sm md:mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Quick Access</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 grid gap-2 text-sm">
                {[
                  'Patterns',
                  'Roulette',
                  'Gallery',
                  'Sound',
                  'Speed',
                  'Alarm',
                  'Interactive Video',
                  'Wish List',
                  'Gift',
                ].map((item) => (
                  <Button key={item} variant="ghost" className="justify-start">
                    {item}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="text-base font-semibold">Patterns</div>
        </div>
        {bottomTab === 'home' && (
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="bg-gradient-primary text-primary-foreground"
          >
            New
          </Button>
        )}
      </div>

      {/* Content */}
      <main className="px-4 py-3 pb-24 space-y-3">
        {bottomTab === 'home' && (
          <>
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="forYou">For You</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="mine">My Patterns</TabsTrigger>
              </TabsList>
              <TabsContent value="forYou" className="space-y-3" />
              <TabsContent value="trending" className="space-y-3" />
              <TabsContent value="mine" className="space-y-3" />
            </Tabs>

            <div className="space-y-3">
              {filtered.map((p) => (
                <Card key={p.id} className="bg-gradient-card">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.creator.avatar} alt={p.creator.name} />
                        <AvatarFallback>{p.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium leading-tight">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.creator.name} • {p.durationSec}s
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="icon" onClick={() => alert('Play pattern')}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" onClick={() => share(p.id)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => share(p.id, true)}>
                            Share anonymously
                          </DropdownMenuItem>
                          {p.mine && (
                            <>
                              <DropdownMenuItem onClick={() => rename(p.id)}>
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => remove(p.id)}>
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {p.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-secondary/60">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {bottomTab === 'long' && (
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Long Distance Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Pair a device and start a consent session to allow remote control.
                </p>
                {/* Slimmed mobile Control UI */}
                <ControlRemote />
              </CardContent>
            </Card>
          </div>
        )}

        {bottomTab === 'discover' && (
          <div className="space-y-3">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle>Discover Patterns</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Browse curated packs and creators. Coming next: filters for duration, intensity,
                tags.
              </CardContent>
            </Card>
            {patterns.map((p) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.creator.avatar} alt={p.creator.name} />
                      <AvatarFallback>{p.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{p.name}</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => alert('Play pattern')}>
                      <Play className="h-4 w-4 mr-1" /> Play
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => share(p.id)}>
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create pattern sheet */}
      <Sheet open={creating} onOpenChange={setCreating}>
        <SheetContent side="bottom" className="max-h-[60vh]">
          <SheetHeader>
            <SheetTitle>New Pattern</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Pattern name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={create} className="flex-1">
                Create
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can edit steps and intensity later. Share anonymously from the card menu.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom sub-navigation (within the hub) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <ul className="grid grid-cols-3">
          {(
            [
              { id: 'home', label: 'Home', icon: Home },
              { id: 'long', label: 'Long Distance', icon: Radio },
              { id: 'discover', label: 'Discover', icon: Compass },
            ] as const
          ).map((t) => {
            const active = bottomTab === t.id;
            const Icon = t.icon;
            return (
              <li key={t.id}>
                <button
                  className={cn(
                    'flex h-14 w-full flex-col items-center justify-center text-xs',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => setBottomTab(t.id)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={cn('h-5 w-5 mb-0.5', active && 'text-primary')} />
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="h-2" />
      </nav>
    </div>
  );
}

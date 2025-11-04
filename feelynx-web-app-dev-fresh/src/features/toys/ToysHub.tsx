import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Play,
  Share2,
  MoreHorizontal,
  Menu,
  Home,
  Radio,
  Compass,
  Plus,
  Bluetooth,
} from 'lucide-react';
import ControlRemote from '@/features/remote/ControlRemote';
import { isBluetoothSupported, isSecureContextSupported } from '@/lib/bluetooth';

type Pattern = {
  id: string;
  name: string;
  creator: { name: string; avatar: string };
  durationSec: number;
  tags: string[];
  mine?: boolean;
};

type Toy = {
  id: string;
  name: string;
  brand: 'Lovense' | 'Demo';
  status: 'paired' | 'disconnected';
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

export default function ToysHub() {
  const [openMenu, setOpenMenu] = useState(false);
  const { search } = useLocation();
  const navigate = useNavigate();
  const [bottomTab, setBottomTab] = useState<'home' | 'long' | 'discover'>('home');
  const [tab, setTab] = useState<'forYou' | 'trending' | 'mine'>('forYou');
  const [patterns, setPatterns] = useState<Pattern[]>(demoPatterns);

  // Toys state
  const [toys, setToys] = useState<Toy[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [toyName, setToyName] = useState('');
  const [toyBrand, setToyBrand] = useState<'Lovense' | 'Demo'>('Lovense');
  const [btReady, setBtReady] = useState({ supported: true, secure: true });

  useEffect(() => {
    setBtReady({ supported: isBluetoothSupported(), secure: isSecureContextSupported() });
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'mine') return patterns.filter((p) => p.mine);
    if (tab === 'trending') return patterns.slice().reverse();
    return patterns;
  }, [patterns, tab]);

  const createPattern = (name: string) => {
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
  };

  const renamePattern = (id: string) => {
    const name = prompt('Rename pattern:', patterns.find((p) => p.id === id)?.name || '');
    if (!name) return;
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const deletePattern = (id: string) => {
    if (!confirm('Delete this pattern?')) return;
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  const sharePattern = (id: string, anonymous = false) => {
    const p = patterns.find((x) => x.id === id);
    if (!p) return;
    const name = anonymous ? 'Someone' : p.creator.name;
    navigator.clipboard?.writeText(`${name} shared a pattern: ${p.name}`);
    alert(anonymous ? 'Shared anonymously (link copied).' : 'Shared (link copied).');
  };

  const addToy = async () => {
    const id = `t${Date.now()}`;
    if (toyBrand === 'Lovense') {
      if (!btReady.supported || !btReady.secure) {
        alert('Bluetooth not available. Switch to HTTPS and use a supported browser.');
      }
      // We do not pair here (pairing is in Long Distance). This registers the toy in the list.
      setToys([
        { id, name: toyName || 'Lovense', brand: 'Lovense', status: 'disconnected' },
        ...toys,
      ]);
    } else {
      setToys([{ id, name: toyName || 'Demo Toy', brand: 'Demo', status: 'paired' }, ...toys]);
    }
    setToyName('');
    setToyBrand('Lovense');
    setAddOpen(false);
  };

  // Sync ?tab with internal state
  useEffect(() => {
    const qs = new URLSearchParams(search);
    const t = qs.get('tab');
    if (t === 'home' || t === 'long' || t === 'discover') setBottomTab(t);
  }, [search]);

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
                  'Toys',
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
          <div className="text-base font-semibold">Toys</div>
        </div>
        {bottomTab === 'home' && (
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-gradient-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Toy
          </Button>
        )}
      </div>

      {/* Content */}
      <main className="px-4 py-3 pb-24 space-y-3">
        {bottomTab === 'home' && (
          <>
            {/* My Toys */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">My Toys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {toys.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No toys added yet. Tap Add Toy to get started.
                  </div>
                )}
                {toys.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-sm border rounded p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Bluetooth
                        className={cn(
                          'h-4 w-4',
                          t.status === 'paired' ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <div>
                        <div className="font-medium leading-tight">{t.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.brand} • {t.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/toys?tab=long')}
                      >
                        Control
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setToys((prev) => prev.filter((x) => x.id !== t.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Patterns */}
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
                      <Button variant="secondary" size="icon" onClick={() => sharePattern(p.id)}>
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
                          <DropdownMenuItem onClick={() => sharePattern(p.id, true)}>
                            Share anonymously
                          </DropdownMenuItem>
                          {p.mine && (
                            <>
                              <DropdownMenuItem onClick={() => renamePattern(p.id)}>
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deletePattern(p.id)}>
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
                    <Button size="sm" variant="outline" onClick={() => sharePattern(p.id)}>
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Toy sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="bottom" className="max-h-[70vh]">
          <SheetHeader>
            <SheetTitle>Add Toy</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Name (optional)"
              value={toyName}
              onChange={(e) => setToyName(e.target.value)}
            />
            <div>
              <div className="text-xs text-muted-foreground mb-1">Brand</div>
              <Select value={toyBrand} onValueChange={(v) => setToyBrand(v as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lovense">Lovense</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                </SelectContent>
              </Select>
              {!btReady.supported || !btReady.secure ? (
                <div className="mt-2 text-xs text-amber-500">
                  Bluetooth requires HTTPS and a supported browser (Chrome desktop recommended).
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button onClick={addToy} className="flex-1">
                Save
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom sub-navigation */}
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
                  onClick={() => {
                    setBottomTab(t.id);
                    const qs = new URLSearchParams(search);
                    qs.set('tab', t.id);
                    navigate({ search: qs.toString() }, { replace: true });
                  }}
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

import { useEffect, useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ControlRemote from '@/features/remote/ControlRemote';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPrivacy = () => {
  const [profilePublic, setProfilePublic] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [retention, setRetention] = useState(30);
  const [handle, setHandle] = useState<string>(
    () => localStorage.getItem('feelynx:handle') || localStorage.getItem('ivibes:handle') || '',
  );
  const [available, setAvailable] = useState<boolean>(
    () =>
      (localStorage.getItem('feelynx:available') || localStorage.getItem('ivibes:available')) ===
      '1',
  );
  const { user } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [themePref, setThemePref] = useState<'system' | 'light' | 'dark' | 'auto'>(() => {
    const mode = localStorage.getItem('feelynx:themeMode') || localStorage.getItem('ivibes:themeMode');
    if (mode === 'auto') return 'auto';
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' || stored === 'system'
      ? (stored as any)
      : 'system';
  });
  const defaultTab = useMemo(
    () => new URLSearchParams(location.search).get('tab') || 'general',
    [],
  );

  useEffect(() => {
    localStorage.setItem('feelynx:handle', handle);
    localStorage.removeItem('ivibes:handle');
  }, [handle]);

  useEffect(() => {
    // Sync UI with active theme changes from elsewhere
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      setThemePref(theme);
    }
  }, [theme]);

  const saveAvailability = async (next: boolean) => {
    setAvailable(next);
    localStorage.setItem('feelynx:available', next ? '1' : '0');
    localStorage.removeItem('ivibes:available');
    if (!handle) return;
    try {
      await fetch(`/presence/${encodeURIComponent(handle)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next ? 'available' : 'offline' }),
      });
    } catch {
      // ignore in previews
    }
  };

  const saveTheme = (next: 'system' | 'light' | 'dark' | 'auto') => {
    setThemePref(next);
    // When selecting 'auto', record mode and set current theme based on local time.
    if (next === 'auto') {
      localStorage.setItem('feelynx:themeMode', 'auto');
      localStorage.removeItem('ivibes:themeMode');
      const hours = new Date().getHours();
      const preferred = hours >= 7 && hours < 19 ? 'light' : 'dark';
      setTheme(preferred);
      localStorage.setItem('theme', preferred);
    } else {
      // Clear auto mode and set explicit theme
      localStorage.removeItem('feelynx:themeMode');
      localStorage.removeItem('ivibes:themeMode');
      setTheme(next);
      // Global key used for early paint before React mounts
      localStorage.setItem('theme', next);
    }
    // Per-user preference override if authenticated
    const uid = user?.id || user?.email;
    if (uid) {
      localStorage.setItem(`feelynx:theme:${uid}`, next);
      localStorage.removeItem(`ivibes:theme:${uid}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Public Profile</span>
            <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
          </div>
          <div className="grid gap-2">
            <div className="text-sm">Theme</div>
            <div className="flex gap-2">
              <Button
                variant={themePref === 'auto' ? 'default' : 'outline'}
                onClick={() => saveTheme('auto')}
              >
                Automatic (day/night)
              </Button>
              <Button
                variant={themePref === 'system' ? 'default' : 'outline'}
                onClick={() => saveTheme('system')}
              >
                System ({systemTheme || 'auto'})
              </Button>
              <Button
                variant={themePref === 'light' ? 'default' : 'outline'}
                onClick={() => saveTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={themePref === 'dark' ? 'default' : 'outline'}
                onClick={() => saveTheme('dark')}
              >
                Dark
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm">Public Handle</div>
            <input
              className="border p-2 rounded"
              placeholder="your_handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">Available for requests</span>
              <Switch checked={available} onCheckedChange={saveAvailability} />
            </div>
          </div>
          <div className="space-x-4">
            <Button variant="outline">Download My Data</Button>
            <Button variant="destructive">Delete My Data</Button>
          </div>
        </TabsContent>
        <TabsContent value="privacy" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Allow Direct Messages</span>
            <Switch checked={allowDMs} onCheckedChange={setAllowDMs} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Data Retention (days)</span>
            <input
              type="number"
              className="border p-1 rounded w-20"
              value={retention}
              onChange={(e) => setRetention(Number(e.target.value))}
            />
          </div>
        </TabsContent>
        <TabsContent value="devices" className="pt-4">
          <div className="max-w-3xl">
            <ControlRemote />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPrivacy;

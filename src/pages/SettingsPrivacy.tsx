import { useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ControlRemote from '@/features/remote/ControlRemote';

const SettingsPrivacy = () => {
  const [profilePublic, setProfilePublic] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [retention, setRetention] = useState(30);
  const defaultTab = useMemo(
    () => new URLSearchParams(location.search).get('tab') || 'general',
    [],
  );

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

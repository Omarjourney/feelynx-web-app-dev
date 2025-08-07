import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const SettingsPrivacy = () => {
  const [profilePublic, setProfilePublic] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [retention, setRetention] = useState(30);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm">Public Profile</span>
        <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
      </div>
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
      <div className="space-x-4">
        <Button variant="outline">Download My Data</Button>
        <Button variant="destructive">Delete My Data</Button>
      </div>
    </div>
  );
};

export default SettingsPrivacy;

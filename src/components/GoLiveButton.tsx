import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { requestMediaPermissions } from '@/lib/mediaPermissions';
import { ApiError, isApiError, request } from '@/lib/api';

const GoLiveButton = () => {
  const [open, setOpen] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(true);
  const [category, setCategory] = useState('chat');
  const [mediaError, setMediaError] = useState('');

  const handleStart = async () => {
    try {
      // Get media permissions first
      if (mediaEnabled) {
        await requestMediaPermissions();
      }
      setMediaError('');

      // Create a live room for the creator
      const roomName = `live_creator_${Date.now()}`;

      // Create room first
      await request('/livekit/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          emptyTimeout: 300, // 5 minutes
          maxParticipants: 1000,
        }),
      });

      // Get token for creator
      await request('/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName, identity: `creator_${Date.now()}` }),
      });

      // Update creator status to live
      await request('/creators/creator_username/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLive: true }),
      });

      setOpen(false);
      // Navigate to live streaming interface with room info
      window.location.href = `/live-creator?room=${roomName}`;
    } catch (error) {
      console.error('Failed to start stream:', error);
      const apiError: ApiError | undefined = isApiError(error)
        ? error
        : undefined;
      setMediaError(apiError?.message ?? (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed z-40 rounded-full bg-gradient-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 animate-pulse safe-fab-offset"
        >
          Go Live
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Stream</DialogTitle>
          <DialogDescription>Set up your live session</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="stream-title" className="block text-sm font-medium">
              Stream Title
            </label>
            <Input id="stream-title" placeholder="My awesome stream" />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Just Chatting</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="media" checked={mediaEnabled} onCheckedChange={setMediaEnabled} />
            <label htmlFor="media" className="text-sm">
              Enable Camera &amp; Mic
            </label>
          </div>
          {mediaError && <p className="text-sm text-destructive">{mediaError}</p>}
          <Button
            className="w-full bg-gradient-primary text-primary-foreground"
            onClick={handleStart}
          >
            Start Stream
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoLiveButton;

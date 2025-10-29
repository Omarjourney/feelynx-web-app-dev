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
import { toast } from 'sonner';
import {
  createLivekitRoom,
  requestCreatorToken,
  updateCreatorLiveStatus,
} from '@/lib/livekit/host';

const GoLiveButton = () => {
  const [open, setOpen] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(true);
  const [category, setCategory] = useState('chat');
  const [mediaError, setMediaError] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const STREAM_ERROR_MESSAGE = "We couldn't start your stream. Please try again.";

  const handleStart = async () => {
    if (isStarting) return;

    setIsStarting(true);

    try {
      if (mediaEnabled) {
        await requestMediaPermissions();
      }
      setMediaError('');

      const roomName = `live_creator_${Date.now()}`;

      await createLivekitRoom({ name: roomName });
      await requestCreatorToken(roomName, `creator_${Date.now()}`);
      await updateCreatorLiveStatus('creator_username', true);

      toast.success('Stream is ready! Redirecting to your live room.');
      setOpen(false);
      window.location.href = `/live-creator?room=${roomName}`;
    } catch (error) {
      console.error('Failed to start stream:', error);
      const message = error instanceof Error ? error.message : String(error);
      setMediaError(message);
      toast.error(message);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed z-40 rounded-full bg-gradient-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 animate-pulse safe-fab-offset">
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
            disabled={isStarting}
          >
            {isStarting ? 'Preparing…' : 'Start Stream'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoLiveButton;

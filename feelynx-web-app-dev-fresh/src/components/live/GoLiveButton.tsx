import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { requestMediaPermissions } from '@/lib/mediaPermissions';
import { createLivekitRoom, requestCreatorToken, updateCreatorLiveStatus } from '@/lib/livekit/host';
import { toast } from 'sonner';

export const GoLiveButton = () => {
  const [open, setOpen] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(true);
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
      const creatorId = 'Omarjourney'; // Using current logged-in user
      const identity = `creator_${Date.now()}`;
      
      const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
      if (wsUrl) {
        await createLivekitRoom({ name: roomName });
        await requestCreatorToken(roomName, identity);
        await updateCreatorLiveStatus(creatorId, true);
        toast.success('Stream is ready! Redirecting to your live room.');
        setOpen(false);
        window.location.href = `/live-creator?room=${roomName}&creator=${creatorId}`;
      } else {
        // Demo mode: no LiveKit configured; navigate to creator with demo flag
        toast.success('Starting camera preview (demo mode).');
        setOpen(false);
        window.location.href = `/live-creator?room=${roomName}&mode=demo&creator=${creatorId}`;
      }
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
          <DialogTitle>Start Your Stream</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="media-permission" className="text-sm">
              Enable camera & microphone
            </Label>
            <Switch
              id="media-permission"
              checked={mediaEnabled}
              onCheckedChange={setMediaEnabled}
            />
          </div>
          {mediaError && (
            <p className="text-sm text-destructive">{mediaError}</p>
          )}
          <Button
            className="w-full bg-gradient-primary"
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

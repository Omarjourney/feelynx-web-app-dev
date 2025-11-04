import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Room,
  RoomEvent,
  Track,
  createLocalTracks,
  type LocalTrack,
} from 'livekit-client';
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
import { toast } from '@/hooks/use-toast';
import {
  createLivekitRoom,
  requestCreatorToken,
  updateCreatorLiveStatus,
} from '@/lib/livekit/host';
import { useAuth } from '@/contexts/AuthContext';

const GoLiveButton = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(true);
  const [category, setCategory] = useState('chat');
  const [mediaError, setMediaError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const previewTracksRef = useRef<LocalTrack[]>([]);
  const roomRef = useRef<Room | null>(null);

  const STREAM_ERROR_MESSAGE = "We couldn't start your stream. Please try again.";

  const stopPreview = useCallback(() => {
    previewTracksRef.current.forEach((track) => {
      track.stop();
      track.detach();
    });
    previewTracksRef.current = [];
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
  }, []);

  useEffect(() => {
    return () => {
      stopPreview();
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [stopPreview]);

  useEffect(() => {
    if (!open || !mediaEnabled) {
      stopPreview();
      return;
    }

    let cancelled = false;

    const startPreview = async () => {
      try {
        await requestMediaPermissions();
        const tracks = await createLocalTracks({ audio: true, video: true });
        if (cancelled) {
          tracks.forEach((track) => track.stop());
          return;
        }

        previewTracksRef.current = tracks;
        const videoTrack = tracks.find((track) => track.kind === Track.Kind.Video);
        if (videoTrack && localVideoRef.current) {
          videoTrack.attach(localVideoRef.current);
          setIsVideoReady(true);
        }
        setMediaError('');
      } catch (error) {
        const description =
          error instanceof Error ? error.message : 'Unable to access camera or microphone.';
        setMediaError(description);
        toast({
          title: 'Camera access failed',
          description,
          variant: 'destructive',
        });
      }
    };

    startPreview();

    return () => {
      cancelled = true;
      stopPreview();
    };
  }, [mediaEnabled, open, stopPreview]);

  const handleStart = async () => {
    if (isStarting) return;

    setIsStarting(true);

    try {
      if (mediaEnabled) {
        await requestMediaPermissions();
      }
      setMediaError('');

      const qsRoom = searchParams.get('room');
      const roomName = qsRoom && qsRoom.trim().length > 0 ? qsRoom : `live_creator_${Date.now()}`;
      const identity = user?.id ?? `creator_${Date.now()}`;
      const creatorUsername =
        (user?.user_metadata as { username?: string } | undefined)?.username ??
        user?.email ??
        'creator';
      const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
      const isDemo = searchParams.get('mode') === 'demo' || !wsUrl;

      if (!isDemo && wsUrl) {
        await createLivekitRoom({ name: roomName });
        const token = await requestCreatorToken(roomName, identity);
        const room = new Room();
        roomRef.current = room;
        room.once(RoomEvent.Disconnected, () => {
          roomRef.current = null;
        });

        const localTracks = mediaEnabled
          ? previewTracksRef.current.length > 0
            ? previewTracksRef.current
            : await createLocalTracks({ audio: true, video: true })
          : [];

        if (localTracks.length > 0 && previewTracksRef.current.length === 0) {
          previewTracksRef.current = localTracks;
          const videoTrack = localTracks.find((track) => track.kind === Track.Kind.Video);
          if (videoTrack && localVideoRef.current) {
            videoTrack.attach(localVideoRef.current);
            setIsVideoReady(true);
          }
        }

        await room.connect(wsUrl, token);
        await Promise.all(
          localTracks.map(async (track) => {
            await room.localParticipant.publishTrack(track);
          }),
        );

        room.disconnect();
        await updateCreatorLiveStatus(creatorUsername, true);
        toast({
          title: 'Stream is ready!',
          description: 'Redirecting to your live room.',
        });
        setOpen(false);
        stopPreview();
        navigate(`/live-creator?room=${encodeURIComponent(roomName)}`);
      } else {
        toast({
          title: 'Starting camera preview (demo mode).',
          description: 'Join your live room to continue.',
        });
        setOpen(false);
        stopPreview();
        const demoSuffix = roomName ? `?room=${encodeURIComponent(roomName)}` : '';
        navigate(`/live-creator${demoSuffix}${demoSuffix ? '&' : '?'}mode=demo`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : STREAM_ERROR_MESSAGE;
      setMediaError(message);
      toast({ title: 'Failed to start stream', description: message, variant: 'destructive' });
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
          {mediaEnabled && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview</p>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <video
                  ref={localVideoRef}
                  className="h-full w-full object-cover"
                  muted
                  autoPlay
                  playsInline
                  aria-label="Camera preview"
                />
                {!isVideoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-muted-foreground">
                    Checking camera…
                  </div>
                )}
              </div>
            </div>
          )}
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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  RoomEvent,
  Track,
  createLocalTracks,
} from 'livekit-client';

import FlowBreadcrumb from '@/components/FlowBreadcrumb';
import LiveChatDock from '@/components/live/LiveChatDock';
import LiveControls from '@/components/live/LiveControls';
import LiveEarningsTicker from '@/components/live/LiveEarningsTicker';
import LiveReactions from '@/components/live/LiveReactions';
import LiveViewerBadge from '@/components/live/LiveViewerBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveRoom } from '@/hooks/useLiveRoom';
import { toast } from '@/hooks/use-toast';
import {
  createLivekitRoom,
  requestCreatorToken,
  updateCreatorLiveStatus,
} from '@/lib/livekit/host';
import { getUserMessage } from '@/lib/errors';
import { requestMediaPermissions } from '@/lib/mediaPermissions';
import { useLiveStore } from '@/state/liveStore';

const gradientBackground = 'bg-[radial-gradient(circle_at_top,_rgba(128,0,255,0.28),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_55%),linear-gradient(145deg,_#0a0118,_#030617_60%,_#02010a)]';

const DEFAULT_ROOM = 'default_room';

const LiveCreator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const roomName = searchParams.get('room') ?? DEFAULT_ROOM;
  const [isBusy, setIsBusy] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const {
    isLive,
    viewerCount,
    peakViewers,
    tokenEarnings,
    startTime,
    messages,
    error,
    setLive,
    reset,
  } = useLiveStore((state) => ({
    isLive: state.isLive,
    viewerCount: state.viewerCount,
    peakViewers: state.peakViewers,
    tokenEarnings: state.tokenEarnings,
    startTime: state.startTime,
    messages: state.messages,
    error: state.error,
    setLive: state.setLive,
    reset: state.reset,
  }));

  const { connectionState, sendChatMessage, sendReaction, close, isConnected } = useLiveRoom(roomName, {
    enabled: isLive,
  });

  const roomRef = useRef<Room | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);
  const videoTrackRef = useRef<LocalVideoTrack | null>(null);

  const identity = useMemo(() => user?.id ?? `creator_${Date.now()}`, [user?.id]);
  const creatorUsername = useMemo(() => {
    const meta = user?.user_metadata as { username?: string } | undefined;
    return meta?.username ?? user?.email ?? 'Creator';
  }, [user?.email, user?.user_metadata]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Live connection issue',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error]);

  const cleanupTracks = useCallback(() => {
    audioTrackRef.current?.stop();
    audioTrackRef.current = null;
    videoTrackRef.current?.stop();
    videoTrackRef.current = null;
    const videoEl = videoElementRef.current;
    if (videoEl) {
      const mediaStream = videoEl.srcObject as MediaStream | null;
      mediaStream?.getTracks().forEach((track) => track.stop());
      videoEl.srcObject = null;
    }
  }, []);

  const detachRoom = useCallback(() => {
    const room = roomRef.current;
    if (room) {
      room.removeAllListeners();
      room.disconnect();
      roomRef.current = null;
    }
    cleanupTracks();
  }, [cleanupTracks]);

  const handleLivekitParticipants = useCallback((room: Room) => {
    const updateCount = () => {
      const remoteParticipants = room.remoteParticipants.size;
      useLiveStore.getState().setViewerCount(remoteParticipants + 1);
    };
    room.on(RoomEvent.ParticipantConnected, updateCount);
    room.on(RoomEvent.ParticipantDisconnected, updateCount);
    updateCount();
  }, []);

  const startLiveStream = useCallback(async () => {
    if (isBusy || isLive) return;
    setIsBusy(true);
    try {
      await requestMediaPermissions();
      setIsVideoReady(false);
      setMicEnabled(true);
      setCameraEnabled(true);

      const localTracks = await createLocalTracks({ audio: true, video: true });
      const videoTrack = localTracks.find((track) => track.kind === Track.Kind.Video) as
        | LocalVideoTrack
        | undefined;
      const audioTrack = localTracks.find((track) => track.kind === Track.Kind.Audio) as
        | LocalAudioTrack
        | undefined;
      if (videoTrack) {
        videoTrackRef.current = videoTrack;
      }
      if (audioTrack) {
        audioTrackRef.current = audioTrack;
      }

      const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
      const demoMode = searchParams.get('mode') === 'demo' || !wsUrl;

      if (demoMode) {
        const tracks = await createLocalTracks({ audio: true, video: true });
        const videoTrack = tracks.find((track): track is LocalVideoTrack => track.kind === Track.Kind.Video) ?? null;
        const audioTrack = tracks.find((track): track is LocalAudioTrack => track.kind === Track.Kind.Audio) ?? null;
        audioTrackRef.current = audioTrack ?? null;
        videoTrackRef.current = videoTrack ?? null;
        if (videoTrack && videoElementRef.current) {
          videoTrack.attach(videoElementRef.current);
          setIsVideoReady(true);
        }
        setLive(true, Date.now());
        toast({
          title: 'Demo preview active',
          description: 'LiveKit is not configured. Running in local preview mode.',
        });
        return;
      }

      await createLivekitRoom({ name: roomName });
      const token = await requestCreatorToken(roomName, identity);
      const room = new Room();
      await room.connect(wsUrl, token);
      const localTracks = await createLocalTracks({ audio: true, video: true });

      for (const track of localTracks) {
        await room.localParticipant.publishTrack(track);
      }

      const videoTrack = localTracks.find((track): track is LocalVideoTrack => track.kind === Track.Kind.Video) ?? null;
      const audioTrack = localTracks.find((track): track is LocalAudioTrack => track.kind === Track.Kind.Audio) ?? null;
      videoTrackRef.current = videoTrack;
      audioTrackRef.current = audioTrack;

      if (videoTrack && videoElementRef.current) {
        videoTrack.attach(videoElementRef.current);
        setIsVideoReady(true);
      }

      handleLivekitParticipants(room);

      roomRef.current = room;
      setLive(true, Date.now());
      await updateCreatorLiveStatus(creatorUsername, true);
      toast({
        title: 'You are live',
        description: 'Feelynx viewers can now join your stream.',
      });
    } catch (err) {
      const message = getUserMessage(err);
      toast({
        title: 'Stream failed to start',
        description: message,
        variant: 'destructive',
      });
      detachRoom();
      reset();
    } finally {
      setIsBusy(false);
    }
  }, [
    creatorUsername,
    detachRoom,
    handleLivekitParticipants,
    identity,
    isBusy,
    isLive,
    reset,
    roomName,
    searchParams,
    setLive,
  ]);

  const endStream = useCallback(async () => {
    if (isBusy || !isLive) {
      if (!isLive) {
        reset();
      }
      return;
    }
    setIsBusy(true);
    try {
      close();
      detachRoom();
      if (isLive) {
        await updateCreatorLiveStatus(creatorUsername, false);
      }
    } catch (err) {
      toast({
        title: 'Unable to end stream',
        description: getUserMessage(err),
        variant: 'destructive',
      });
    } finally {
      reset();
      setIsVideoReady(false);
      setMicEnabled(true);
      setCameraEnabled(true);
      setIsBusy(false);
    }
  }, [close, creatorUsername, detachRoom, isBusy, isLive, reset]);

  useEffect(() => {
    return () => {
      void endStream();
    };
  }, [endStream]);

  const toggleMic = () => {
    const track = audioTrackRef.current;
    if (!track) return;
    if (track.isMuted) {
      track.unmute().catch(() => undefined);
      setMicEnabled(true);
    } else {
      track.mute().catch(() => undefined);
      setMicEnabled(false);
    }
  };

  const toggleCamera = () => {
    const track = videoTrackRef.current;
    if (!track) return;
    if (track.isMuted) {
      track.unmute().catch(() => undefined);
      setCameraEnabled(true);
    } else {
      track.mute().catch(() => undefined);
      setCameraEnabled(false);
    }
  };

  const handleSendMessage = useCallback(
    async (input: Parameters<typeof sendChatMessage>[0]) => {
      await sendChatMessage(input);
    },
    [sendChatMessage],
  );

  return (
    <div className={`min-h-screen ${gradientBackground} text-white`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-16 pt-12 lg:px-8">
        <FlowBreadcrumb currentStep="go-live" />
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}
            className="w-fit rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10">
            ← Back to Home
          </Button>
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Feelynx Live Studio</p>
            <h1 className="text-3xl font-semibold tracking-tight">Creator Live Dashboard</h1>
            <p className="text-sm text-white/60">Stage-ready controls, non-intrusive chat, and live VibeCoins.</p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => navigate('/settings/live')}
              className="rounded-full border-white/20 bg-white/10 px-6 py-2 text-sm text-white/80 hover:bg-white/20"
            >
              Stream Settings
            </Button>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <section className="space-y-5">
            <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-black/40 shadow-[0_0_40px_rgba(118,35,250,0.45)] backdrop-blur-2xl">
              <div className="relative aspect-video">
                <video
                  ref={videoElementRef}
                  className="h-full w-full rounded-[32px] object-cover"
                  autoPlay
                  muted
                  playsInline
                  aria-label="Creator live preview"
                />
                {!isLive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center">
                    <span className="text-6xl opacity-40">🎬</span>
                    <p className="mt-4 max-w-xs text-sm text-white/70">Click “Go Live” to start your show. Chat, tokens, and reactions wake up automatically.</p>
                  </div>
                )}
                {isLive && !isVideoReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/40 border-t-transparent" aria-hidden />
                    <p className="mt-4 text-sm text-white/70">Connecting your vibe…</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/10" aria-hidden />
                <div className="absolute right-6 top-6 z-20">
                  <LiveViewerBadge isLive={isLive} viewerCount={viewerCount} />
                </div>
              </div>
            </div>
            <LiveEarningsTicker tokenEarnings={tokenEarnings} startTime={startTime} peakViewers={peakViewers} />
            <LiveReactions onSend={sendReaction} disabled={!isLive || !isConnected} />
            <LiveControls
              isLive={isLive}
              isBusy={isBusy}
              onStart={startLiveStream}
              onEnd={endStream}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              micEnabled={micEnabled}
              cameraEnabled={cameraEnabled}
            />
          </section>
          <LiveChatDock
            messages={messages}
            onSend={handleSendMessage}
            isLive={isLive}
            connectionState={connectionState}
            currentUserId={identity}
          />
        </main>
      </div>
    </div>
  );
}

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

import LiveChatDock from '@/components/live/LiveChatDock';
import LiveControls from '@/components/live/LiveControls';
import LiveEarningsTicker from '@/components/live/LiveEarningsTicker';
import LiveReactions from '@/components/live/LiveReactions';
import LiveViewerBadge from '@/components/live/LiveViewerBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useLiveRoom } from '@/hooks/useLiveRoom';
import { useLiveStore } from '@/state/liveStore';
import { getUserMessage } from '@/lib/errors';
import { isApiError } from '@/lib/api';
import { requestMediaPermissions } from '@/lib/mediaPermissions';
import {
  createLivekitRoom,
  requestCreatorToken,
  updateCreatorLiveStatus,
} from '@/lib/livekit/host';

const GRADIENT_CLASSES = 'bg-[radial-gradient(circle_at_top,_rgba(146,87,255,0.35)_0%,_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,227,255,0.18)_0%,_transparent_60%)]';

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

export default function LiveCreator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roomName = searchParams.get('room') || 'default_room';
  const fallbackIdentityRef = useRef(`creator_${Date.now()}`);
  const fallbackUsernameRef = useRef(`creator_${Date.now()}`);
  const identity = user?.id ?? fallbackIdentityRef.current;
  const creatorUsername =
    (user?.user_metadata as { username?: string } | undefined)?.username ??
    user?.email ??
    fallbackUsernameRef.current;

  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const videoTrackRef = useRef<LocalVideoTrack | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);

  const isLive = useLiveStore((state) => state.isLive);
  const setLive = useLiveStore((state) => state.setLive);
  const resetLive = useLiveStore((state) => state.reset);
  const setViewerCount = useLiveStore((state) => state.setViewerCount);

  const { connectionState, sendChatMessage, sendReaction, setTyping } = useLiveRoom({
    roomId: roomName,
    enabled: isLive,
  });

  const connectionLabel = useMemo(() => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting…';
      case 'open':
        return 'Live updates on';
      case 'error':
        return 'Live updates offline';
      default:
        return 'Standby';
    }
  }, [connectionState]);

  const attachVideoTrack = useCallback((track: LocalVideoTrack | null) => {
    if (!track || !localVideoRef.current) return;
    track.attach(localVideoRef.current);
    setIsVideoReady(true);
  }, []);

  const detachVideoTrack = useCallback(() => {
    const track = videoTrackRef.current;
    if (track) {
      track.detach();
      track.stop();
      videoTrackRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setIsVideoReady(false);
  }, []);

  const stopAudioTrack = useCallback(() => {
    const track = audioTrackRef.current;
    if (track) {
      track.stop();
      audioTrackRef.current = null;
    }
  }, []);

  const cleanupTracks = useCallback(() => {
    detachVideoTrack();
    stopAudioTrack();
  }, [detachVideoTrack, stopAudioTrack]);

  const teardownRoom = useCallback(async (opts: { silent?: boolean } = {}) => {
    const { silent } = opts;
    const room = roomRef.current;
    if (room) {
      room.off(RoomEvent.ParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected);
      room.disconnect();
      roomRef.current = null;
    }
    cleanupTracks();
    if (!silent) {
      try {
        await updateCreatorLiveStatus(creatorUsername, false);
      } catch (error) {
        if (!isAbortError(error)) {
          toast({
            title: 'Unable to update status',
            description: getUserMessage(error),
            variant: 'destructive',
          });
        }
      }
    }
  }, [cleanupTracks, creatorUsername]);

  const startLiveStream = useCallback(async () => {
    if (isConnecting || isLive) return;
    setIsConnecting(true);
    const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL as string | undefined;
    const demoMode = searchParams.get('mode') === 'demo' || !wsUrl;
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

      if (demoMode) {
        attachVideoTrack(videoTrack ?? null);
        setViewerCount(1);
        setLive(true);
        toast({
          title: 'Preview started',
          description: 'LiveKit not configured. Running in local preview mode.',
        });
        return;
      }

      await createLivekitRoom({ name: roomName });
      const token = await requestCreatorToken(roomName, identity);
      const room = new Room();
      roomRef.current = room;
      await room.connect(wsUrl, token);

      for (const track of localTracks) {
        await room.localParticipant.publishTrack(track);
      }

      attachVideoTrack(videoTrack ?? null);

      const updateParticipants = () => {
        const remoteCount = room.remoteParticipants.size;
        setViewerCount(Math.max(1, remoteCount + 1));
      };
      room.on(RoomEvent.ParticipantConnected, updateParticipants);
      room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      updateParticipants();

      setLive(true);
      await updateCreatorLiveStatus(creatorUsername, true);
      toast({
        title: 'You are live! 💜',
        description: 'Fans can now join the room.',
      });
    } catch (error) {
      await teardownRoom({ silent: true });
      resetLive();
      const apiError = isApiError(error) ? error : undefined;
      let description = getUserMessage(error);
      let action: { label: string; onClick: () => void } | undefined;
      const message = apiError?.message ?? (error instanceof Error ? error.message : '');
      if (message) {
        const normalized = message.toLowerCase();
        if (normalized.includes('token') || normalized.includes('permission')) {
          description = 'LiveKit token rejected. Please refresh and try again.';
        } else if (normalized.includes('cors')) {
          description = 'WebSocket blocked by CORS. Verify server settings.';
        } else if (
          normalized.includes('network') ||
          normalized.includes('fetch') ||
          normalized.includes('unreachable') ||
          normalized.includes('failed to connect')
        ) {
          description = 'Network error. Check your connection and retry.';
          action = {
            label: 'Retry',
            onClick: () => {
              void startLiveStream();
            },
          };
        }
      }
      toast({
        title: 'Stream failed to start',
        description,
        action,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [
    attachVideoTrack,
    creatorUsername,
    identity,
    isConnecting,
    isLive,
    resetLive,
    roomName,
    searchParams,
    setLive,
    setViewerCount,
    teardownRoom,
  ]);

  const endStream = useCallback(
    async ({ silent }: { silent?: boolean } = {}) => {
      await teardownRoom({ silent });
      resetLive();
      setViewerCount(0);
      setMicEnabled(true);
      setCameraEnabled(true);
      if (!silent) {
        toast({
          title: 'Stream ended',
          description: 'You are now offline.',
        });
        navigate('/');
      }
    },
    [navigate, resetLive, setViewerCount, teardownRoom],
  );

  useEffect(() => {
    return () => {
      void endStream({ silent: true });
    };
  }, [endStream]);

  const toggleMic = useCallback(async () => {
    const next = !micEnabled;
    setMicEnabled(next);
    const room = roomRef.current;
    try {
      if (room) {
        await room.localParticipant.setMicrophoneEnabled(next);
      } else if (audioTrackRef.current) {
        audioTrackRef.current.mediaStreamTrack.enabled = next;
      }
    } catch (error) {
      setMicEnabled(!next);
      toast({
        title: 'Microphone toggle failed',
        description: getUserMessage(error),
        variant: 'destructive',
      });
    }
  }, [micEnabled]);

  const toggleCamera = useCallback(async () => {
    const next = !cameraEnabled;
    setCameraEnabled(next);
    const room = roomRef.current;
    try {
      if (room) {
        await room.localParticipant.setCameraEnabled(next);
      } else if (videoTrackRef.current) {
        videoTrackRef.current.mediaStreamTrack.enabled = next;
      }
      if (!next) {
        detachVideoTrack();
      } else {
        attachVideoTrack(videoTrackRef.current);
      }
    } catch (error) {
      setCameraEnabled(!next);
      toast({
        title: 'Camera toggle failed',
        description: getUserMessage(error),
        variant: 'destructive',
      });
    }
  }, [attachVideoTrack, cameraEnabled, detachVideoTrack]);

  return (
    <div className={`min-h-screen ${GRADIENT_CLASSES} bg-[#0b021c] pb-24 pt-16 text-white`}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 px-4 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full border border-white/10 bg-white/5 px-4 text-white/80 hover:bg-white/10">
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Creator Control Room</h1>
              <p className="text-sm text-white/60">Manage your live session with real-time chat, reactions, and VibeCoins.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 uppercase tracking-wide">{connectionLabel}</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 uppercase tracking-wide">Room: {roomName}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-2xl shadow-black/60">
              <div className="relative aspect-video">
                <video
                  ref={localVideoRef}
                  className="h-full w-full rounded-3xl object-cover"
                  autoPlay
                  muted
                  playsInline
                  aria-label="Live stream preview"
                />
                <div ref={overlayRef} className="pointer-events-none absolute inset-0" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute right-6 top-6 z-20">
                  <LiveViewerBadge />
                </div>
                {!isVideoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center gap-3 text-center text-white/80">
                      <span className="text-5xl">📹</span>
                      <p className="text-sm uppercase tracking-widest">{isLive ? 'Preparing stream…' : 'Go live to start broadcasting'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <LiveEarningsTicker />
            <LiveReactions onReact={sendReaction} container={overlayRef.current} disabled={!isLive} />
            <LiveControls
              isLive={isLive}
              isConnecting={isConnecting}
              micEnabled={micEnabled}
              cameraEnabled={cameraEnabled}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onGoLive={() => void startLiveStream()}
              onEndStream={() => void endStream()}
            />
          </div>

          <div className="hidden lg:block">
            <LiveChatDock
              currentUserId={identity}
              onSendMessage={sendChatMessage}
              onTyping={setTyping}
              isLive={isLive}
              variant="desktop"
            />
          </div>
        </div>

        <div className="lg:hidden">
          <LiveChatDock
            currentUserId={identity}
            onSendMessage={sendChatMessage}
            onTyping={setTyping}
            isLive={isLive}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  );
}

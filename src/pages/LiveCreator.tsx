import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Room, RoomEvent, Track, createLocalTracks } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { requestMediaPermissions } from '@/lib/mediaPermissions';
import { toast } from 'sonner';
import { getUserMessage, toApiError } from '@/lib/errors';

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isHighlight?: boolean;
}

const LiveCreator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const roomName = searchParams.get('room') || 'default_room';

  useEffect(() => {
    return () => {
      endStream();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startLiveStream = async () => {
    try {
      await requestMediaPermissions();
      setIsVideoReady(false);

      // Get token for creator
      const { token } = await request<{ token: string }>('/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName, identity: `creator_${Date.now()}` }),
      });
      if (!tokenRes.ok) throw await toApiError(tokenRes);

      const { token } = await tokenRes.json();

      const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
      if (!wsUrl) {
        throw new Error('LiveKit WebSocket URL is not configured');
      }
      const room = new Room();
      await room.connect(wsUrl, token);

      // Publish local tracks
      const localTracks = await createLocalTracks({ audio: true, video: true });

      // Publish each track individually
      for (const track of localTracks) {
        await room.localParticipant.publishTrack(track);
      }

      const videoTrack = localTracks.find((t) => t.kind === Track.Kind.Video);
      if (videoTrack && localVideoRef.current) {
        videoTrack.attach(localVideoRef.current);
        setIsVideoReady(true);
      }

      const updateParticipants = () => setViewers(room.remoteParticipants.size);
      room.on(RoomEvent.ParticipantConnected, updateParticipants);
      room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      updateParticipants();

      roomRef.current = room;
      setIsLive(true);
      toast.success('You are now live!', {
        description: 'Viewers can now join your stream.',
      });
    } catch (error) {
      console.error('Failed to start live stream:', error);
      let description = getUserMessage(error);
      let action: { label: string; onClick: () => void } | undefined;

      const baseMessage = apiError?.message ?? (error instanceof Error ? error.message : '');
      if (baseMessage) {
        const msg = baseMessage.toLowerCase();

        if (msg.includes('token') || msg.includes('permission') || msg.includes('401')) {
          description = 'LiveKit token rejected. Please refresh and try again.';
        } else if (msg.includes('cors')) {
          description = 'WebSocket blocked by CORS. Verify server CORS settings.';
        } else if (
          msg.includes('network') ||
          msg.includes('fetch') ||
          msg.includes('unreachable') ||
          msg.includes('failed to connect')
        ) {
          description = 'Server unreachable. Please check your connection and try again.';
          action = {
            label: 'Retry',
            onClick: () => startLiveStream(),
          };
        }
      }

      setMediaError(description);
      toast.error('Stream failed to start', {
        description,
        action,
      });
    }
  };

  const endStream = async () => {
    const activeRoom = roomRef.current;
    if (activeRoom) {
      activeRoom.disconnect();
      roomRef.current = null;
    }

    // Update creator status to offline
    try {
      const res = await fetch('/creators/creator_username/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLive: false }),
      });
      if (!res.ok) {
        throw await toApiError(res);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(getUserMessage(error));
    }

    setIsLive(false);
    setIsVideoReady(false);
    toast.success('Stream ended', {
      description: 'You are now offline.',
    });
    navigate('/');
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      username: 'Creator',
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHighlight: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatMessage('');
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/')}>
          ← Back to Home
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <div className="flex items-center gap-2 justify-center">
            <Badge className={isLive ? 'bg-live text-white animate-pulse' : 'bg-muted'}>
              {isLive ? `🔴 LIVE • ${viewers} viewers` : '⚫ Offline'}
            </Badge>
            <Badge className="bg-gradient-primary text-primary-foreground">
              💎 ${earnings.toFixed(2)} earned
            </Badge>
          </div>
        </div>
        <Button
          variant={isLive ? 'destructive' : 'outline'}
          onClick={isLive ? endStream : startLiveStream}
        >
          {isLive ? 'End Stream' : 'Start Stream'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Video Preview */}
        <Card className="lg:col-span-3 bg-gradient-card">
          <CardHeader>
            <CardTitle>Your Stream Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                aria-label="Local live stream preview"
              />
              {isLive && !isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-white">Loading video...</p>
                </div>
              )}
              {!isLive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center space-y-4">
                    <div className="text-6xl opacity-50">📹</div>
                    <p className="text-white">Click "Start Stream" to go live</p>
                  </div>
                </div>
              )}

              {/* Stream Controls */}
              {isLive && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">
                      🎤 Mute
                    </Button>
                    <Button variant="secondary" size="sm">
                      📹 Camera Off
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm">
                      📱 Mobile View
                    </Button>
                    <Button variant="secondary" size="sm">
                      🎛️ Settings
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-lg">Live Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg text-sm ${
                      msg.isHighlight
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    <div className="font-medium">{msg.username}</div>
                    <div className="opacity-90">{msg.message}</div>
                    <div className="text-xs opacity-70">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex space-x-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Chat with viewers..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="sm">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Stream Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">{viewers}</div>
              <div className="text-sm text-muted-foreground">Current Viewers</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">${earnings.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Session Earnings</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">{messages.length}</div>
              <div className="text-sm text-muted-foreground">Chat Messages</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {isLive ? '🟢 LIVE' : '🔴 OFFLINE'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveCreator;

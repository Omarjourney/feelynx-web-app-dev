import { useState, useRef, useEffect } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import TipModal from './TipModal';
import ParticipantsList from './ParticipantsList';

interface LiveStreamProps {
  creatorName: string;
  viewers: number;
  onBack: () => void;
}

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isHighlight?: boolean;
}

export const LiveStream = ({ creatorName, viewers, onBack }: LiveStreamProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      username: 'User123',
      message: 'Amazing show! 🔥',
      timestamp: '2:34 PM',
      isHighlight: true,
    },
    {
      id: 2,
      username: 'VIPMember',
      message: 'Love the setup!',
      timestamp: '2:35 PM',
    },
    {
      id: 3,
      username: 'RegularFan',
      message: 'Can you do that thing again?',
      timestamp: '2:36 PM',
    },
  ]);

  const [tipOpen, setTipOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<any>(null);
  const participantIdRef = useRef<string>(`viewer_${Date.now()}`);
  const roomName = `live_${creatorName.toLowerCase().replace(/\s+/g, '_')}`;

  const handleConnect = async () => {
    try {
      const tokenRes = await fetch(`/livekit/token?room=${roomName}&identity=${participantIdRef.current}`);
      if (!tokenRes.ok) throw new Error('Failed to get token');
      const { token } = await tokenRes.json();

      const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
      const room = new Room();
      await room.connect(wsUrl, token);
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          track.attach(videoRef.current);
        }
      });

      setIsConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        const identity = participantIdRef.current;
        fetch(`/rooms/${roomName}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'viewer', identity })
        }).catch(() => {});
        roomRef.current.disconnect();
      }
    };
  }, [roomName]);

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      username: 'You',
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatMessage('');
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{creatorName}</h1>
          <Badge className="bg-live text-white animate-pulse">
            🔴 LIVE • {viewers.toLocaleString()} viewers
          </Badge>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Video Stream */}
        <Card className="lg:col-span-3 bg-gradient-card">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {!isConnected ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-glow/10">
                  <div className="text-center space-y-4">
                    <div className="text-6xl opacity-50">📹</div>
                    <Button
                      onClick={handleConnect}
                      className="bg-gradient-primary text-primary-foreground hover:shadow-glow"
                    >
                      Connect to Live Stream
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Click to join the live video stream
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Stream Controls */}
              {isConnected && (
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
                    <Button variant="secondary" size="sm" onClick={() => setTipOpen(true)}>
                      💝 Tip
                    </Button>
                    <Button variant="secondary" size="sm">
                      🎮 Control Toy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="bg-gradient-card h-fit">
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
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="sm">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="bg-gradient-card h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <ParticipantsList room={roomName} />
          </CardContent>
        </Card>
      </div>

      {/* Interactive Controls */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Interactive Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20" onClick={() => setTipOpen(true)}>
              💝
              <br />
              Tip 50💎
            </Button>
            <Button variant="outline" className="h-20">
              🌹
              <br />
              Send Rose
            </Button>
            <Button variant="outline" className="h-20">
              🎮
              <br />
              Control Toy
            </Button>
            <Button variant="outline" className="h-20">
              ⭐<br />
              Super Like
            </Button>
          </div>
        </CardContent>
      </Card>
      <TipModal
        isVisible={tipOpen}
        onClose={() => setTipOpen(false)}
        onSubmit={(amt) => console.log('tip', amt)}
      />
    </div>
  );
};

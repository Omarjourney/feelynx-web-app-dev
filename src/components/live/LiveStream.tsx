import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  connectToLivekitRoom,
  disconnectFromRoom,
  notifyRoomLeave,
  type Room,
} from '@/lib/livekit/client';
import LiveStreamHeader from './LiveStreamHeader';
import LiveVideoPanel from './LiveVideoPanel';
import LiveChatPanel, { ChatMessage } from './LiveChatPanel';
import LiveInteractiveControls from './LiveInteractiveControls';
import ParticipantsPanel from './ParticipantsPanel';
import TipModal from './TipModal';

interface LiveStreamProps {
  creatorName: string;
  viewers: number;
  onBack: () => void;
}

const initialMessages: ChatMessage[] = [
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
];

const LiveStream = ({ creatorName, viewers, onBack }: LiveStreamProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [tipOpen, setTipOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const participantIdRef = useRef<string>(`viewer_${Date.now()}`);

  const roomName = `live_${creatorName.toLowerCase().replace(/\s+/g, '_')}`;

  const handleConnect = async () => {
    if (isConnected) return;

    try {
      const room = await connectToLivekitRoom({
        roomName,
        identity: participantIdRef.current,
        videoElement: videoRef.current,
      });
      roomRef.current = room;
      setIsConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  useEffect(() => {
    return () => {
      const room = roomRef.current;
      if (room) {
        notifyRoomLeave(roomName, participantIdRef.current).catch(() => {});
        disconnectFromRoom(room);
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

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChatMessage(event.target.value);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <LiveStreamHeader creatorName={creatorName} viewers={viewers} onBack={onBack} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <LiveVideoPanel
          isConnected={isConnected}
          onConnect={handleConnect}
          onOpenTip={() => setTipOpen(true)}
          videoRef={videoRef}
        />
        <LiveChatPanel
          messages={messages}
          messageDraft={chatMessage}
          onChange={handleMessageChange}
          onSend={sendMessage}
        />
        <ParticipantsPanel room={roomName} />
      </div>

      <LiveInteractiveControls onOpenTip={() => setTipOpen(true)} />

      <TipModal
        isVisible={tipOpen}
        onClose={() => setTipOpen(false)}
        onSubmit={(amount) => console.log('tip', amount)}
      />
    </div>
  );
};

export default LiveStream;

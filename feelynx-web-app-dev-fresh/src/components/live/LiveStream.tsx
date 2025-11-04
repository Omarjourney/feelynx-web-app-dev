import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
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
import ReactiveMascot, { MascotMood } from '@/components/ReactiveMascot';

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
  const [coinBalance, setCoinBalance] = useState(1280);
  const [milestoneProgress, setMilestoneProgress] = useState(3200);
  const milestoneGoal = 5000;
  const [viewerLevel] = useState(12);
  const [xpProgress, setXpProgress] = useState(0.68);
  const [dailyStreak] = useState(6);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [reactions, setReactions] = useState<Array<{ id: number; icon: string; color: string }>>(
    [],
  );
  const [thanksMessage, setThanksMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const participantIdRef = useRef<string>(`viewer_${Date.now()}`);

  const roomName = `live_${creatorName.toLowerCase().replace(/\s+/g, '_')}`;

  const topFans = useMemo(
    () => [
      { name: 'StarBlaze', amount: 1520 },
      { name: 'GalaxyWolf', amount: 980 },
      { name: 'Luminous88', amount: 760 },
    ],
    [],
  );

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
      setMascotMood('joined');
      setTimeout(() => setMascotMood('idle'), 4000);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  useEffect(() => {
    const idAtMount = participantIdRef.current;
    return () => {
      const room = roomRef.current;
      if (room) {
        notifyRoomLeave(roomName, idAtMount).catch(() => {});
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
    setXpProgress((prev) => Math.min(0.99, prev + 0.02));
  };

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChatMessage(event.target.value);
  };

  const handleQuickTip = (amount: number) => {
    setCoinBalance((prev) => Math.max(0, prev - amount));
    setMilestoneProgress((prev) => Math.min(milestoneGoal, prev + amount));
    setThanksMessage(`Thank you for the ${amount}💎 tip!`);
    setMascotMood('tipped');
    setTimeout(() => setThanksMessage(null), 3000);
    setTimeout(() => setMascotMood('idle'), 4000);
  };

  const handleReaction = (icon: string, color: string) => {
    const id = Date.now();
    setReactions((prev) => [...prev, { id, icon, color }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((reaction) => reaction.id !== id));
    }, 2400);
    setMascotMood('hype');
    setTimeout(() => setMascotMood('idle'), 4000);
  };

  const handleInviteGuest = () => {
    setMascotMood('guest');
    setTimeout(() => setMascotMood('idle'), 4000);
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
          coinBalance={coinBalance}
          milestoneProgress={milestoneProgress}
          milestoneGoal={milestoneGoal}
          reactions={reactions}
          topFans={topFans}
          thanksMessage={thanksMessage}
          toyConnected={true}
        />
        <LiveChatPanel
          messages={messages}
          messageDraft={chatMessage}
          onChange={handleMessageChange}
          onSend={sendMessage}
          onQuickTip={handleQuickTip}
          coinBalance={coinBalance}
        />
        <ParticipantsPanel room={roomName} />
      </div>

      <div className="flex justify-center">
        <ReactiveMascot mood={mascotMood} />
      </div>

      <LiveInteractiveControls
        onOpenTip={() => setTipOpen(true)}
        onQuickTip={handleQuickTip}
        onReaction={handleReaction}
        onInviteGuest={handleInviteGuest}
        viewerLevel={viewerLevel}
        xpProgress={xpProgress}
        dailyStreak={dailyStreak}
      />

      <TipModal
        isVisible={tipOpen}
        onClose={() => setTipOpen(false)}
        onSubmit={(amount) => handleQuickTip(amount)}
      />
    </div>
  );
};

export default LiveStream;

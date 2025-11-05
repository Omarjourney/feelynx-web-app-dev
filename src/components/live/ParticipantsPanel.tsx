import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoomParticipants } from '@/lib/livekit/participants';
import ParticipantsList from './ParticipantsList';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import type { EmotionTone } from '@/hooks/useEmotionUI';

interface ParticipantsPanelProps {
  room: string;
  tone?: EmotionTone;
  glassStyles?: CSSProperties;
  quietMode?: boolean;
}

const toneAccent: Record<EmotionTone, string> = {
  warm: 'border-pink-400/25 shadow-[0_0_60px_rgba(255,120,190,0.22)]',
  violet: 'border-violet-400/25 shadow-[0_0_60px_rgba(168,132,255,0.2)]',
  cool: 'border-sky-400/25 shadow-[0_0_60px_rgba(82,145,255,0.2)]',
};

const ParticipantsPanel = ({ room, tone = 'violet', glassStyles, quietMode }: ParticipantsPanelProps) => {
  const { hosts, viewers, error } = useRoomParticipants(room);

  return (
    <Card
      className={cn(
        'h-fit rounded-card border shadow-base transition-shadow duration-500 backdrop-blur-md',
        toneAccent[tone],
        quietMode ? 'opacity-80' : 'opacity-100',
      )}
      style={glassStyles}
    >
      <CardHeader>
        <CardTitle className="text-lg">Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <ParticipantsList hosts={hosts} viewers={viewers} error={error} />
      </CardContent>
    </Card>
  );
};

export default ParticipantsPanel;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoomParticipants } from '@/lib/livekit/participants';
import ParticipantsList from './ParticipantsList';

interface ParticipantsPanelProps {
  room: string;
}

const ParticipantsPanel = ({ room }: ParticipantsPanelProps) => {
  const { hosts, viewers, error } = useRoomParticipants(room);

  return (
    <Card className="h-fit border border-white/10 rounded-card shadow-base hover:shadow-elevated transition-shadow duration-300 bg-neutral-900/60 backdrop-blur-md">
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

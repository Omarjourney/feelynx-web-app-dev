import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoomParticipants } from '@/lib/livekit/participants';
import ParticipantsList from './ParticipantsList';

interface ParticipantsPanelProps {
  room: string;
}

const ParticipantsPanel = ({ room }: ParticipantsPanelProps) => {
  const { hosts, viewers, error } = useRoomParticipants(room);

  return (
    <Card className="bg-gradient-card h-fit">
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

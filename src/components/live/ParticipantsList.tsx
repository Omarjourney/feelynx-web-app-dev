import { Badge } from '@/components/ui/badge';
import type { Participant } from '@/lib/livekit/participants';

interface ParticipantsListProps {
  hosts: Participant[];
  viewers: Participant[];
  error?: string | null;
}

const ParticipantsList = ({ hosts, viewers, error }: ParticipantsListProps) => {
  if (error) {
    return <div className="text-sm text-muted-foreground">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Hosts ({hosts.length})</h3>
        <ul className="text-sm list-disc list-inside">
          {hosts.map((participant) => (
            <li key={participant.name}>
              {participant.name}
              {participant.badge && (
                <Badge className="ml-1 bg-gradient-primary text-primary-foreground">
                  {participant.badge}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Viewers ({viewers.length})</h3>
        <ul className="text-sm list-disc list-inside max-h-32 overflow-y-auto">
          {viewers.map((participant) => (
            <li key={participant.name}>
              {participant.name}
              {participant.badge && (
                <Badge className="ml-1 bg-gradient-primary text-primary-foreground">
                  {participant.badge}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ParticipantsList;

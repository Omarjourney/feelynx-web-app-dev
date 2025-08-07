import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Participant {
  name: string;
  badge?: string;
}

interface ParticipantsResponse {
  hosts: (string | Participant)[];
  viewers: (string | Participant)[];
}

interface ParticipantsListProps {
  room: string;
}

export const ParticipantsList = ({ room }: ParticipantsListProps) => {
  const [hosts, setHosts] = useState<(string | Participant)[]>([]);
  const [viewers, setViewers] = useState<(string | Participant)[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
    };
    load();
    const ws = new WebSocket(`ws://${window.location.host}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'roomParticipants' && data.room === room) {
          setHosts(data.hosts);
          setViewers(data.viewers);
        }
      } catch (err) {
        console.error('Failed to parse participants update', err);
      }
    };
    return () => ws.close();
  }, [room]);

  if (error) {
    return <div className="text-sm text-muted-foreground">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Hosts ({hosts.length})</h3>
        <ul className="text-sm list-disc list-inside">
          {hosts.map((h) => {
            const value = typeof h === 'string' ? { name: h } : h;
            return (
              <li key={value.name}>
                {value.name}
                {value.badge && (
                  <Badge className="ml-1 bg-gradient-primary text-primary-foreground">
                    {value.badge}
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Viewers ({viewers.length})</h3>
        <ul className="text-sm list-disc list-inside max-h-32 overflow-y-auto">
          {viewers.map((v) => {
            const value = typeof v === 'string' ? { name: v } : v;
            return (
              <li key={value.name}>
                {value.name}
                {value.badge && (
                  <Badge className="ml-1 bg-gradient-primary text-primary-foreground">
                    {value.badge}
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ParticipantsList;

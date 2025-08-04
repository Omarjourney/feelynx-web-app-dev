import { useEffect, useState } from 'react';

interface ParticipantsResponse {
  hosts: string[];
  viewers: string[];
}

interface ParticipantsListProps {
  room: string;
}

export const ParticipantsList = ({ room }: ParticipantsListProps) => {
  const [hosts, setHosts] = useState<string[]>([]);
  const [viewers, setViewers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/rooms/${room}/participants`);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data: ParticipantsResponse = await res.json();
        setHosts(data.hosts);
        setViewers(data.viewers);
      } catch (err) {
        console.error('Failed to load participants', err);
        setError('Unable to load participants');
      }
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
          {hosts.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Viewers ({viewers.length})</h3>
        <ul className="text-sm list-disc list-inside max-h-32 overflow-y-auto">
          {viewers.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ParticipantsList;

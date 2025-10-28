import { useEffect, useState } from 'react';

export interface Participant {
  name: string;
  badge?: string;
}

export interface ParticipantsSnapshot {
  hosts: Participant[];
  viewers: Participant[];
}

interface ParticipantsMessage {
  type: string;
  room: string;
  hosts?: (string | Participant)[];
  viewers?: (string | Participant)[];
}

const normaliseParticipant = (value: string | Participant): Participant =>
  typeof value === 'string' ? { name: value } : value;

export const subscribeToRoomParticipants = (
  room: string,
  onUpdate: (snapshot: ParticipantsSnapshot) => void,
  onError?: (error: Error) => void,
) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const ws = new WebSocket(`ws://${window.location.host}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as ParticipantsMessage;
      if (data.type === 'roomParticipants' && data.room === room) {
        onUpdate({
          hosts: (data.hosts ?? []).map(normaliseParticipant),
          viewers: (data.viewers ?? []).map(normaliseParticipant),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error : new Error('Failed to parse participants update');
      onError?.(message);
    }
  };

  ws.onerror = () => {
    onError?.(new Error('Participants WebSocket connection failed'));
  };

  return () => ws.close();
};

export const useRoomParticipants = (room: string) => {
  const [snapshot, setSnapshot] = useState<ParticipantsSnapshot>({ hosts: [], viewers: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const unsubscribe = subscribeToRoomParticipants(
      room,
      (value) => setSnapshot(value),
      (err) => setError(err.message),
    );

    return () => {
      unsubscribe();
    };
  }, [room]);

  return { ...snapshot, error };
};

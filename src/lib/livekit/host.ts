import { requestLivekitToken } from './client';

interface CreateRoomOptions {
  name: string;
  emptyTimeout?: number;
  maxParticipants?: number;
}

export const createLivekitRoom = async ({
  name,
  emptyTimeout = 300,
  maxParticipants = 1000,
}: CreateRoomOptions) => {
  const response = await fetch('/livekit/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, emptyTimeout, maxParticipants }),
  });

  if (!response.ok) {
    throw new Error('Failed to create LiveKit room');
  }

  return response.json().catch(() => ({}));
};

export const requestCreatorToken = async (room: string, identity: string) =>
  requestLivekitToken({ room, identity, role: 'host' });

export const updateCreatorLiveStatus = async (creatorId: string, isLive: boolean) => {
  const response = await fetch(`/creators/${creatorId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isLive }),
  });

  if (!response.ok) {
    throw new Error('Failed to update creator live status');
  }
};

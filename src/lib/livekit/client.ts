import { Room, RoomEvent, Track } from 'livekit-client';

type ParticipantRole = 'viewer' | 'host';

interface TokenRequest {
  room: string;
  identity: string;
  role?: ParticipantRole;
}

export interface ConnectToRoomOptions {
  roomName: string;
  identity: string;
  videoElement?: HTMLVideoElement | null;
}

export const requestLivekitToken = async ({ room, identity, role = 'viewer' }: TokenRequest) => {
  const response = await fetch('/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room, identity, role }),
  });

  if (!response.ok) {
    throw new Error('Failed to obtain LiveKit access token');
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error('LiveKit token response did not include a token');
  }

  return data.token;
};

export const connectToLivekitRoom = async ({
  roomName,
  identity,
  videoElement,
}: ConnectToRoomOptions) => {
  const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
  if (!wsUrl) {
    throw new Error('LiveKit WebSocket URL is not configured');
  }

  const token = await requestLivekitToken({ room: roomName, identity });
  const room = new Room();
  await room.connect(wsUrl, token);

  if (videoElement) {
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Video) {
        track.attach(videoElement);
      }
    });
  }

  return room;
};

export const disconnectFromRoom = (room: Room | null | undefined) => {
  if (room) {
    room.disconnect();
  }
};

export const notifyRoomLeave = async (
  roomName: string,
  identity: string,
  role: ParticipantRole = 'viewer',
) => {
  try {
    await fetch(`/rooms/${roomName}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, identity }),
    });
  } catch (error) {
    console.error('Failed to notify LiveKit room leave', error);
  }
};

export type { Room };

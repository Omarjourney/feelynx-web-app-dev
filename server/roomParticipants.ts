export interface RoomParticipants {
  hosts: Set<string>;
  viewers: Set<string>;
}

export const roomParticipants: Record<string, RoomParticipants> = {};

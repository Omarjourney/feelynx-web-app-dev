import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionSyncState {
  sessionToken: string | null;
  deviceId: string;
  lastSyncedAt: number | null;
  preferences: Record<string, unknown>;
  setSessionToken: (token: string | null) => void;
  setPreferences: (preferences: Record<string, unknown>) => void;
  markSynced: () => void;
}

const createDeviceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `device-${Math.random().toString(36).slice(2)}`;
};

export const useSessionSyncStore = create<SessionSyncState>()(
  persist(
    (set, get) => ({
      sessionToken: null,
      deviceId: createDeviceId(),
      lastSyncedAt: null,
      preferences: {},
      setSessionToken: (token) => set({ sessionToken: token }),
      setPreferences: (preferences) => set({ preferences: { ...get().preferences, ...preferences } }),
      markSynced: () => set({ lastSyncedAt: Date.now() }),
    }),
    {
      name: 'feelynx:session-sync',
      version: 1,
    },
  ),
);

export const selectSessionToken = (state: SessionSyncState) => state.sessionToken;
export const selectSessionPreferences = (state: SessionSyncState) => state.preferences;
export const selectDeviceId = (state: SessionSyncState) => state.deviceId;


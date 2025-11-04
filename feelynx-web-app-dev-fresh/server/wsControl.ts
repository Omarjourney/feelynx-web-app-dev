import type { WebSocket } from 'ws';

type SessionId = string;

const sessionSubscribers = new Map<SessionId, Set<WebSocket>>();

export function subscribe(ws: WebSocket, sessionId: SessionId) {
  let set = sessionSubscribers.get(sessionId);
  if (!set) {
    set = new Set();
    sessionSubscribers.set(sessionId, set);
  }
  set.add(ws);
}

export function unsubscribe(ws: WebSocket, sessionId: SessionId) {
  const set = sessionSubscribers.get(sessionId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) sessionSubscribers.delete(sessionId);
}

export function publishCommand(sessionId: SessionId, intensity: number) {
  const set = sessionSubscribers.get(sessionId);
  if (!set) return;
  const payload = JSON.stringify({ type: 'controlCommand', sessionId, intensity });
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

export function publishEnd(sessionId: SessionId) {
  const set = sessionSubscribers.get(sessionId);
  if (!set) return;
  const payload = JSON.stringify({ type: 'controlEnded', sessionId });
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

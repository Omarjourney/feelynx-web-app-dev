const sessionSubscribers = new Map();
export function subscribe(ws, sessionId) {
  let set = sessionSubscribers.get(sessionId);
  if (!set) {
    set = new Set();
    sessionSubscribers.set(sessionId, set);
  }
  set.add(ws);
}
export function unsubscribe(ws, sessionId) {
  const set = sessionSubscribers.get(sessionId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) sessionSubscribers.delete(sessionId);
}
export function publishCommand(sessionId, intensity) {
  const set = sessionSubscribers.get(sessionId);
  if (!set) return;
  const payload = JSON.stringify({ type: 'controlCommand', sessionId, intensity });
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}
export function publishEnd(sessionId) {
  const set = sessionSubscribers.get(sessionId);
  if (!set) return;
  const payload = JSON.stringify({ type: 'controlEnded', sessionId });
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

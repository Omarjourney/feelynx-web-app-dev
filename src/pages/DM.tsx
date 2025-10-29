import { useCallback, useEffect, useMemo, useState } from 'react';
import useEncryption from '@/hooks/useEncryption';
import { toast } from 'sonner';
import { getUserMessage, toApiError } from '@/lib/errors';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  cipher_text: string;
  nonce: string;
  read_at: string | null;
  burn_after_reading: boolean;
  created_at: string;
  text?: string;
}

interface ThreadSummary {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at?: string;
}

const DM = () => {
  const { user } = useAuth();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [input, setInput] = useState('');
  const [burn, setBurn] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => new Uint8Array(32), []); // demo key
  const { encrypt, decrypt, ready } = useEncryption(key);

  const decryptMessages = useCallback(
    (data: Message[]) =>
      data.map((message) => ({
        ...message,
        text: ready ? decrypt(message.cipher_text, message.nonce) : '',
      })),
    [decrypt, ready],
  );

  const fetchMessages = useCallback(
    async (tid: string) => {
      setLoadingMessages(true);
      try {
        const headers: Record<string, string> = {};
        try {
          const jwt = localStorage.getItem('token');
          if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
        } catch {
          // ignore storage access errors
        }
        const res = await fetch(`/dm/threads/${tid}/messages`, { headers });
        if (!res.ok) {
          throw await toApiError(res);
        }

        const data: Message[] = await res.json();
        setMessages(decryptMessages(data));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch messages', err);
        const message = getUserMessage(err);
        setError(message);
        toast.error(message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [decryptMessages],
  );

  const createThread = useCallback(
    async (recipient: string) => {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        try {
          const jwt = localStorage.getItem('token');
          if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
        } catch {
          // ignore storage access errors
        }
        const res = await fetch('/dm/threads', {
          method: 'POST',
          headers,
          body: JSON.stringify({ recipientId: recipient }),
        });
        if (!res.ok) {
          throw await toApiError(res);
        }

        const data = await res.json();
        setThreadId(data.id);
        await fetchMessages(data.id);
        setError(null);
      } catch (err) {
        console.error('Failed to create thread', err);
        const message = getUserMessage(err);
        setError(message);
        toast.error(message);
      }
    },
    [fetchMessages],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const thread = params.get('thread');
    const recipient = params.get('to');
    setThreadId(thread);
    setRecipientId(recipient);

    // Load thread list (best effort without auth)
    (async () => {
      try {
        const headers: Record<string, string> = {};
        const jwt = localStorage.getItem('token');
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
        const res = await fetch('/dm/threads', { headers });
        if (res.ok) {
          const list = (await res.json()) as ThreadSummary[];
          setThreads(Array.isArray(list) ? list : []);
        }
      } catch {
        setThreads([]);
      }
    })();

    if (thread) {
      fetchMessages(thread);
    } else if (recipient) {
      createThread(recipient);
    }
  }, [createThread, fetchMessages]);

  useEffect(() => {
    if (threadId && ready) {
      fetchMessages(threadId);
    }
  }, [threadId, ready, fetchMessages]);

  const send = useCallback(async () => {
    if (!threadId || !recipientId || !input.trim() || !ready || sending) return;

    setSending(true);

    try {
      const { cipher, nonce } = encrypt(input);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      try {
        const jwt = localStorage.getItem('token');
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      } catch {
        // ignore storage access errors
      }
      const res = await fetch(`/dm/threads/${threadId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cipher_text: cipher,
          nonce,
          recipientId,
          burnAfterReading: burn,
        }),
      });

      if (!res.ok) {
        throw await toApiError(res);
      }

      setInput('');
      setBurn(false);
      toast.success('Message sent');
      await fetchMessages(threadId);
    } catch (err) {
      console.error('Failed to send message', err);
      const message = getUserMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  }, [burn, encrypt, fetchMessages, input, ready, recipientId, sending, threadId]);

  const markRead = useCallback(
    async (id: string) => {
      try {
        const headers: Record<string, string> = {};
        try {
          const jwt = localStorage.getItem('token');
          if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
        } catch {
          // ignore storage access errors
        }
        const res = await fetch(`/dm/messages/${id}/read`, { method: 'POST', headers });
        if (!res.ok) {
          throw await toApiError(res);
        }

        if (threadId) {
          await fetchMessages(threadId);
        }
      } catch (err) {
        console.error('Failed to mark message as read', err);
        toast.error(getUserMessage(err));
      }
    },
    [fetchMessages, threadId],
  );

  // Inbox + messages layout
  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-center justify-between gap-2">
            <span>{error}</span>
            {threadId && (
              <button
                type="button"
                className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground"
                onClick={() => fetchMessages(threadId)}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          <div className="flex gap-2">
            <input
              className="border flex-1 p-2"
              placeholder="Start new chat with… (recipient id)"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const v = (e.target as HTMLInputElement).value;
                  if (v) {
                    await createThread(v);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              className="border px-3"
              onClick={() => {
                const el = document.querySelector<HTMLInputElement>(
                  'input[placeholder^="Start new chat"]',
                );
                if (el && el.value.trim()) {
                  createThread(el.value.trim());
                  el.value = '';
                }
              }}
            >
              New
            </button>
          </div>
          <div className="border rounded">
            {threads.map((t) => (
              <button
                key={t.id}
                className={`w-full text-left p-2 border-b last:border-b-0 ${threadId === t.id ? 'bg-secondary' : ''}`}
                onClick={() => {
                  setThreadId(t.id);
                  fetchMessages(t.id);
                }}
              >
                <div className="text-sm font-medium truncate">Thread {t.id}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {t.user1_id} ↔ {t.user2_id}
                </div>
              </button>
            ))}
            {threads.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground">No threads</div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <div className="space-y-2">
            {loadingMessages && <p className="text-sm text-muted-foreground">Loading messages…</p>}
            {messages.map((m) => {
              const meId = (user as any)?.id ?? 'me';
              const isMine = String(m.sender_id) === String(meId);
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow ' +
                      (isMine
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-green-600 text-white rounded-bl-md')
                    }
                  >
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    <div className="mt-1 flex items-center gap-2 opacity-80 text-[11px]">
                      <span>
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!isMine && m.burn_after_reading && <span>🔥</span>}
                      {isMine && (m.read_at ? <span>Read</span> : <span>Sent</span>)}
                      {!isMine && !m.read_at && (
                        <button
                          className="underline decoration-white/40"
                          onClick={() => markRead(m.id)}
                          disabled={sending}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {!loadingMessages && messages.length === 0 && (
              <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="border flex-1 p-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
            />
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={burn} onChange={(e) => setBurn(e.target.checked)} />
              Burn
            </label>
            <button className="border px-4" onClick={send} disabled={!ready || sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DM;

import { useCallback, useEffect, useMemo, useState } from 'react';
import useEncryption from '@/hooks/useEncryption';
import { toast } from 'sonner';
import { getUserMessage, toApiError } from '@/lib/errors';

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

const DM = () => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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
        const res = await fetch(`/dm/threads/${tid}/messages`);
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
        const res = await fetch('/dm/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`/dm/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`/dm/messages/${id}/read`, { method: 'POST' });
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

      <div className="space-y-2">
        {loadingMessages && <p className="text-sm text-muted-foreground">Loading messages…</p>}
        {messages.map((m) => (
          <div key={m.id} className="border p-2 rounded">
            <div>{m.text}</div>
            <div className="text-xs text-gray-500 flex gap-2">
              <span>
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {m.read_at ? (
                <span>Read</span>
              ) : (
                <button onClick={() => markRead(m.id)} disabled={sending}>
                  Mark read
                </button>
              )}
              {m.burn_after_reading && <span>🔥</span>}
            </div>
          </div>
        ))}
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
  );
};

export default DM;

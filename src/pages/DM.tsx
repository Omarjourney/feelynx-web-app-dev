import { useEffect, useState } from 'react';
import useEncryption from '@/hooks/useEncryption';

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

  const key = new Uint8Array(32); // demo key
  const { encrypt, decrypt, ready } = useEncryption(key);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const thread = params.get('thread');
    const recipient = params.get('to');
    setThreadId(thread);
    setRecipientId(recipient);
    if (!thread && recipient) {
      createThread(recipient);
    } else if (thread) {
      fetchMessages(thread);
    }
  }, [ready]);

  const createThread = async (recipient: string) => {
    const res = await fetch('/dm/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: recipient }),
    });
    const data = await res.json();
    setThreadId(data.id);
    fetchMessages(data.id);
  };

  const fetchMessages = async (tid: string) => {
    const res = await fetch(`/dm/threads/${tid}/messages`);
    const data: Message[] = await res.json();
    const decrypted = data.map((m) => ({
      ...m,
      text: ready ? decrypt(m.cipher_text, m.nonce) : '',
    }));
    setMessages(decrypted);
  };

  const send = async () => {
    if (!threadId || !recipientId) return;
    const { cipher, nonce } = encrypt(input);
    await fetch(`/dm/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cipher_text: cipher,
        nonce,
        recipientId,
        burnAfterReading: burn,
      }),
    });
    setInput('');
    setBurn(false);
    fetchMessages(threadId);
  };

  const markRead = async (id: string) => {
    await fetch(`/dm/messages/${id}/read`, { method: 'POST' });
    if (threadId) {
      fetchMessages(threadId);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="border p-2 rounded">
            <div>{m.text}</div>
            <div className="text-xs text-gray-500 flex gap-2">
              <span>{new Date(m.created_at).toLocaleTimeString()}</span>
              {m.read_at ? (
                <span>Read</span>
              ) : (
                <button onClick={() => markRead(m.id)}>Mark read</button>
              )}
              {m.burn_after_reading && <span>🔥</span>}
            </div>
          </div>
        ))}
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
        <button className="border px-4" onClick={send} disabled={!ready}>
          Send
        </button>
      </div>
    </div>
  );
};

export default DM;

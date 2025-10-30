import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getServerWsUrl } from '@/lib/ws';

type Ring = { from: string; mode?: 'video' | 'audio'; rate?: number } | null;

export default function IncomingCall() {
  const [ring, setRing] = useState<Ring>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(String(ev.data));
        if (msg?.type === 'ring') {
          const myHandle =
            localStorage.getItem('feelynx:handle') || localStorage.getItem('ivibes:handle') || '';
          if (myHandle && msg.to === myHandle) {
            setRing({ from: msg.from, mode: msg.mode, rate: msg.rate });
            setOpen(true);
          }
        }
      } catch {
        // ignore malformed
      }
    };
    const ws = new WebSocket(getServerWsUrl());
    ws.addEventListener('message', handle);
    return () => ws.close();
  }, []);

  if (!ring) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Incoming {ring.mode ?? 'video'} call</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            From: <b>{ring.from}</b>
          </div>
          {typeof ring.rate === 'number' && <div>Rate: {ring.rate}💎/min</div>}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => {
                setOpen(false);
                const qs = new URLSearchParams();
                if (ring?.from) qs.set('from', ring.from);
                if (ring?.mode) qs.set('mode', ring.mode);
                if (typeof ring?.rate === 'number') qs.set('rate', String(ring.rate));
                window.location.href = `/call-room?${qs.toString()}`;
              }}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                setRing(null);
              }}
            >
              Decline
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

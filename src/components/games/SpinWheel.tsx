import { useEffect, useState } from 'react';
import { Room, RoomEvent, DataPacket_Kind } from 'livekit-client';
import { Button } from '@/components/ui/button';

interface SpinWheelProps {
  room: Room;
  segments: string[];
}

// Simple spin wheel overlay that syncs state via LiveKit data messages
const SpinWheel = ({ room, segments }: SpinWheelProps) => {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const handler = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === 'spin') {
          setCurrent(msg.segment as string);
        }
      } catch {
        // ignore invalid messages
      }
    };
    room.on(RoomEvent.DataReceived, handler);
    return () => {
      room.off(RoomEvent.DataReceived, handler);
    };
  }, [room]);

  const spin = () => {
    const segment = segments[Math.floor(Math.random() * segments.length)];
    setCurrent(segment);
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: 'spin', segment }));
    room.localParticipant.publishData(data, { reliable: true });
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <div className="p-4 bg-white/80 rounded">{current || 'Ready to spin'}</div>
      <Button className="mt-4 pointer-events-auto" onClick={spin}>
        Spin
      </Button>
    </div>
  );
};

export default SpinWheel;

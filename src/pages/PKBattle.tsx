import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Room, RoomEvent, Track } from 'livekit-client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ApiError, isApiError, request } from '@/lib/api';

const PKBattle = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const [timeLeft, setTimeLeft] = useState(60);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!battleId) return;
    const es = new EventSource(`/pk-battles/${battleId}/stream`);
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setScoreA(data.scoreA ?? data.score_a ?? 0);
        setScoreB(data.scoreB ?? data.score_b ?? 0);
      } catch (error) {
        console.error('Failed to parse PK battle scores', error);
      }
    };
    return () => es.close();
  }, [battleId]);

  useEffect(() => {
    const connect = async () => {
      if (!battleId) return;
      try {
        const { token } = await request<{ token: string }>('/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room: `pk_battle_${battleId}`,
            identity: `viewer_${Date.now()}`,
          }),
        });
        const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
        if (!wsUrl) {
          throw new Error('LiveKit WebSocket URL is not configured');
        }
        const room = new Room();
        roomRef.current = room;
        await room.connect(wsUrl, token);
        let first = true;
        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === Track.Kind.Video) {
            if (first && videoARef.current) {
              track.attach(videoARef.current);
              first = false;
            } else if (videoBRef.current) {
              track.attach(videoBRef.current);
            }
          }
        });
        room.on(RoomEvent.DataReceived, (payload) => {
          try {
            const msg = JSON.parse(new TextDecoder().decode(payload));
            if (msg.timeLeft !== undefined) setTimeLeft(msg.timeLeft);
          } catch (error) {
            console.error('Failed to parse PK battle timer update', error);
          }
        });
      } catch (error) {
        const apiError: ApiError | undefined = isApiError(error) ? error : undefined;
        console.error('LiveKit connect failed', error);
        if (apiError) {
          console.debug('API error details:', apiError);
        }
      }
    };
    connect();
    return () => {
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [battleId]);

  const total = scoreA + scoreB || 1;
  let winner: string | null = null;
  if (timeLeft === 0) {
    winner = scoreA === scoreB ? 'Tie' : scoreA > scoreB ? 'Creator A wins!' : 'Creator B wins!';
  }

  const updateScore = (a: number, b: number) => {
    if (!battleId) return;
    request(`/pk-battles/${battleId}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoreA: a, scoreB: b }),
    }).catch((error) => {
      const apiError: ApiError | undefined = isApiError(error) ? error : undefined;
      console.error('Failed to update PK battle score', error);
      if (apiError) {
        console.debug('API error details:', apiError);
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-4">
        <video
          ref={videoARef}
          className="w-1/2 bg-black"
          autoPlay
          playsInline
          aria-label="Creator A live feed"
        >
          <track kind="captions" label="Creator A captions" srcLang="en" src="data:," default />
        </video>
        <video
          ref={videoBRef}
          className="w-1/2 bg-black"
          autoPlay
          playsInline
          aria-label="Creator B live feed"
        >
          <track kind="captions" label="Creator B captions" srcLang="en" src="data:," default />
        </video>
      </div>
      <div className="flex space-x-4 items-center">
        <div className="flex-1">
          <Progress value={(scoreA / total) * 100} />
          <div className="text-center">{scoreA} pts</div>
        </div>
        <div className="flex-1">
          <Progress value={(scoreB / total) * 100} />
          <div className="text-center">{scoreB} pts</div>
        </div>
      </div>
      <div className="text-center text-2xl font-bold">{timeLeft}s</div>
      {winner && <div className="text-center text-xl font-bold">{winner}</div>}
      <div className="flex justify-center space-x-4">
        <Button onClick={() => updateScore(scoreA + 1, scoreB)}>Gift A</Button>
        <Button onClick={() => updateScore(scoreA, scoreB + 1)}>Gift B</Button>
      </div>
    </div>
  );
};

export default PKBattle;

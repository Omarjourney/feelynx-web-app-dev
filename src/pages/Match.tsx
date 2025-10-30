import { useCallback, useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Room } from 'livekit-client';
import { toast } from 'sonner';
import { getUserMessage, toApiError } from '@/lib/errors';
import FeelynxLogo from '@/components/brand/FeelynxLogo';
import { BRAND } from '@/config';

interface Creator {
  id: number;
  email: string;
}

const Match = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [index, setIndex] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const roomRef = useRef<Room | null>(null);

  const current = creators[index];

  const loadNext = useCallback(async () => {
    if (isFetching || !hasMore) return;

    setIsFetching(true);
    try {
      const res = await fetch(`/match/next?userId=1`);
      if (!res.ok) {
        throw await toApiError(res);
      }
      const data = await res.json();

      if (data.creator) {
        setCreators((prev) => [...prev, data.creator]);
        setError(null);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load next match', err);
      const message = getUserMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsFetching(false);
    }
  }, [hasMore, isFetching]);

  useEffect(() => {
    loadNext();
    return () => {
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [loadNext]);

  const notify = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification('You have a new match!');
        });
      } else {
        new Notification('You have a new match!');
      }
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (!current || isSwiping) return;
    setIsSwiping(true);

    try {
      const res = await fetch('/match/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, targetId: current.id, liked }),
      });
      if (!res.ok) {
        throw await toApiError(res);
      }

      const data = await res.json();
      if (data.token) {
        notify();
        toast.success("It's a match! Connecting you now.");
        const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
        if (!wsUrl) {
          throw new Error('LiveKit WebSocket URL is not configured');
        }
        const newRoom = new Room();
        await newRoom.connect(wsUrl, data.token);
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        await newRoom.localParticipant.setCameraEnabled(true);
        roomRef.current?.disconnect();
        roomRef.current = newRoom;
      } else if (liked) {
        toast.success("Interest noted! We'll let you know if it's a match.");
      }

      setIndex((i) => i + 1);
      await loadNext();
      setError(null);
    } catch (err) {
      console.error('Failed to process swipe', err);
      const message = getUserMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsSwiping(false);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe(false),
    onSwipedRight: () => handleSwipe(true),
    trackMouse: true,
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
      {error && (
        <div className="max-w-sm rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <div className="flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground"
              onClick={() => loadNext()}
              disabled={isFetching}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {current ? (
        <button
          type="button"
          {...handlers}
          className="w-80 h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-md text-lg"
          onClick={() => alert(current.email)}
          aria-label={`Open profile for ${current.email}`}
          disabled={isSwiping}
        >
          <span>{current.email}</span>
        </button>
      ) : hasMore ? (
        <p>{isFetching ? 'Loading next creator…' : 'Finding creators for you…'}</p>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          {BRAND.v2Wordmark ? (
            <FeelynxLogo
              size={180}
              glow={false}
              tagline="No more creators right now"
              theme="light"
            />
          ) : (
            <p>No more creators right now</p>
          )}
          <p className="text-sm text-muted-foreground">Refresh soon to catch new matches.</p>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-muted px-4 py-2"
          onClick={() => handleSwipe(false)}
          disabled={!current || isSwiping}
        >
          Pass
        </button>
        <button
          type="button"
          className="rounded bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => handleSwipe(true)}
          disabled={!current || isSwiping}
        >
          {isSwiping ? 'Matching…' : 'Like'}
        </button>
      </div>
    </div>
  );
};

export default Match;

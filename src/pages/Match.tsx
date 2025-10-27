import { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Room } from 'livekit-client';
import { ApiError, isApiError, request } from '@/lib/api';

interface Creator {
  id: number;
  email: string;
}

const Match = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [index, setIndex] = useState(0);
  const [room, setRoom] = useState<Room | null>(null);

  const current = creators[index];

  const loadNext = async () => {
    try {
      const data = await request<{ creator?: Creator }>(`/match/next?userId=1`);
      if (data.creator) {
        setCreators((prev) => [...prev, data.creator]);
      }
    } catch (error) {
      const apiError: ApiError | undefined = isApiError(error)
        ? error
        : undefined;
      console.error('Failed to load next match', error);
      if (apiError) {
        console.debug('API error details:', apiError);
      }
    }
  };

  useEffect(() => {
    loadNext();
    return () => {
      room?.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!current) return;
    try {
      const data = await request<{ token?: string }>('/match/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, targetId: current.id, liked }),
      });
      if (data.token) {
        notify();
        const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;
        const newRoom = new Room();
        await newRoom.connect(wsUrl, data.token);
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        await newRoom.localParticipant.setCameraEnabled(true);
        setRoom(newRoom);
      }
    } catch (error) {
      const apiError: ApiError | undefined = isApiError(error)
        ? error
        : undefined;
      console.error('Failed to submit swipe', error);
      if (apiError) {
        console.debug('API error details:', apiError);
      }
    } finally {
      setIndex((i) => i + 1);
      loadNext();
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe(false),
    onSwipedRight: () => handleSwipe(true),
  });

  return (
    <div className="flex h-full items-center justify-center">
      {current ? (
        <button
          type="button"
          {...handlers}
          className="w-80 h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-md text-lg"
          onClick={() => alert(current.email)}
          aria-label={`Open profile for ${current.email}`}
        >
          <span>{current.email}</span>
        </button>
      ) : (
        <p>No more creators</p>
      )}
    </div>
  );
};

export default Match;

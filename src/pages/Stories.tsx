import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Story {
  id: string;
  media_url: string;
  visibility: 'public' | 'subscribers' | 'tier';
}

const DISPLAY_TIME = 5000;

const Stories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    fetch('/stories')
      .then((r) => r.json())
      .then((data) => setStories(data))
      .catch(() => setStories([]));
  }, []);

  useEffect(() => {
    if (!stories.length) return;
    setProgress(0);
    timerRef.current && clearTimeout(timerRef.current);
    intervalRef.current && clearInterval(intervalRef.current);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setProgress(((Date.now() - start) / DISPLAY_TIME) * 100);
    }, 50);
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % stories.length);
    }, DISPLAY_TIME);
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [index, stories]);

  const handleSwipe = (deltaY: number) => {
    if (Math.abs(deltaY) < 50) return;
    setIndex((i) =>
      deltaY > 0 ? (i + 1) % stories.length : (i - 1 + stories.length) % stories.length
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = startY.current - e.changedTouches[0].clientY;
    handleSwipe(delta);
    startY.current = null;
  };

  if (!stories.length) return <div className="flex items-center justify-center h-screen">No stories</div>;

  const story = stories[index];

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black text-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img src={story.media_url} alt="story" className="h-full w-full object-cover" />
      {story.visibility !== 'public' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Lock className="w-16 h-16" />
        </div>
      )}
      <Progress value={progress} className="absolute top-0 left-0 w-full" />
    </div>
  );
};

export default Stories;

import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ApiError, isApiError, request } from '@/lib/api';
import FeelynxLogo from '@/components/brand/FeelynxLogo';
import { BRAND } from '@/config';

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
    const loadStories = async () => {
      try {
        const data = await request<Story[]>('/stories');
        setStories(data);
      } catch (error) {
        const apiError: ApiError | undefined = isApiError(error) ? error : undefined;
        console.error('Failed to load stories', error);
        if (apiError) {
          console.debug('API error details:', apiError);
        }
        setStories([]);
      }
    };
    loadStories();
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
      deltaY > 0 ? (i + 1) % stories.length : (i - 1 + stories.length) % stories.length,
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

  if (!stories.length)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#0B0720]/90 px-4 text-center text-foreground">
        {BRAND.v2Wordmark ? (
          <FeelynxLogo size={240} glow tagline="No stories yet. Check back soon." />
        ) : (
          <p className="text-lg font-semibold">No stories yet. Check back soon.</p>
        )}
      </div>
    );

  const story = stories[index];

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black text-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
  <img src={story.media_url} alt="story" className="h-full w-full object-cover" loading="eager" decoding="async" />
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
